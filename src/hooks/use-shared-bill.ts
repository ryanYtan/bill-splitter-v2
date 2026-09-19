import { useEffect, useState } from 'react'
import type { BillData } from './use-bill'
import { decompressFromBase64Url, INVALID_LINK_MESSAGE, ShareError } from '../share/codec'
import { parseBill } from '../share/format'

export type SharedBillState = { status: 'none' } | { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: BillData }

type Outcome = { status: 'error'; message: string } | { status: 'ready'; data: BillData }

/** Decodes the bill in a `?share=` token. Pass null when the page was not opened from a share link. */
const useSharedBill = (token: string | null): SharedBillState => {
  const [result, setResult] = useState<{ token: string; outcome: Outcome }>()

  useEffect(() => {
    if (token === null) {
      return
    }
    let cancelled = false
    decompressFromBase64Url(token)
      .then((json): Outcome => ({ status: 'ready', data: parseBill(json) }))
      .catch((e): Outcome => ({ status: 'error', message: e instanceof ShareError ? e.message : INVALID_LINK_MESSAGE }))
      .then(outcome => {
        if (!cancelled) {
          setResult({ token, outcome })
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (token === null) {
    return { status: 'none' }
  }
  return result?.token === token ? result.outcome : { status: 'loading' }
}

export default useSharedBill
