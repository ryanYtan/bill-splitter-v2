import { useEffect, useState } from 'react'
import type { BillData } from './use-bill'
import { decompressFromBase64Url, INVALID_LINK_MESSAGE, ShareError } from '../share/codec'
import { parseBill } from '../share/format'
import { fetchShareToken } from '../share/short-link'

export type SharedBillState = { status: 'none' } | { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: BillData }

// A shared bill is shown no sooner than this, so the loading skeleton does not just flash by
const MIN_LOAD_MS = 1000

type Outcome = { status: 'error'; message: string } | { status: 'ready'; data: BillData }

/**
 * Decodes the bill a share link points to: either the `?share=` token itself, or the `?s=` short id the
 * token is stored under on the server. Pass null for both when the page was not opened from a share link.
 */
const useSharedBill = (token: string | null, shortId: string | null): SharedBillState => {
  const [result, setResult] = useState<{ key: string; outcome: Outcome }>()
  // A link carrying the whole bill needs no network, so it wins if both are present
  const key = token !== null ? `share:${token}` : shortId !== null ? `s:${shortId}` : null

  useEffect(() => {
    if (key === null) {
      return
    }
    let cancelled = false
    const loadToken = token !== null ? Promise.resolve(token) : fetchShareToken(shortId!)
    const load = loadToken
      .then(decompressFromBase64Url)
      .then((json): Outcome => ({ status: 'ready', data: parseBill(json) }))
      .catch((e): Outcome => ({ status: 'error', message: e instanceof ShareError ? e.message : INVALID_LINK_MESSAGE }))
    // The delay runs alongside the load rather than after it, so a slow request is not made slower
    const minimumWait = new Promise<void>(resolve => setTimeout(resolve, MIN_LOAD_MS))
    Promise.all([load, minimumWait])
      .then(([outcome]) => outcome)
      .then(outcome => {
        if (!cancelled) {
          setResult({ key, outcome })
        }
      })
    return () => {
      cancelled = true
    }
  }, [key, token, shortId])

  if (key === null) {
    return { status: 'none' }
  }
  return result?.key === key ? result.outcome : { status: 'loading' }
}

export default useSharedBill
