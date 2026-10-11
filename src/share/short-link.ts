import { ShareError } from './codec'

// Short links are kept by the `lambda/links` function, served from the same origin as the app
const LINKS_URL = `${import.meta.env.BASE_URL}api/links`

export const EXPIRED_LINK_MESSAGE = 'This share link has expired or does not exist.'
export const UNREACHABLE_MESSAGE = 'Could not load this bill. Check your connection and try again.'

const sha256Hex = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

/** Stores a share token on the server and returns the short id it can be fetched with. Rejects if it could not be stored. */
export const createShortLink = async (token: string): Promise<string> => {
  const response = await fetch(LINKS_URL, {
    method: 'POST',
    // CloudFront signs requests to the function, which for a request with a body needs the payload hash from the client
    headers: { 'content-type': 'text/plain', 'x-amz-content-sha256': await sha256Hex(token) },
    body: token,
  })
  if (!response.ok) {
    throw new Error(`Could not create short link (${response.status})`)
  }
  const body: unknown = await response.json()
  const id = typeof body === 'object' && body !== null ? (body as { id?: unknown }).id : undefined
  if (typeof id !== 'string' || !id) {
    throw new Error('Could not create short link (unexpected response)')
  }
  return id
}

/** Fetches the share token stored under a short id. Throws ShareError with a message for the user if it can't be loaded. */
export const fetchShareToken = async (id: string): Promise<string> => {
  let response: Response
  try {
    response = await fetch(`${LINKS_URL}/${encodeURIComponent(id)}`)
  } catch {
    throw new ShareError(UNREACHABLE_MESSAGE)
  }
  if (response.status === 404) {
    throw new ShareError(EXPIRED_LINK_MESSAGE)
  }
  if (!response.ok) {
    throw new ShareError(UNREACHABLE_MESSAGE)
  }
  // The token is untrusted like any other; decoding and parseBill validate it
  const body: unknown = await response.json().catch(() => undefined)
  const token = typeof body === 'object' && body !== null ? (body as { token?: unknown }).token : undefined
  if (typeof token !== 'string') {
    throw new ShareError(UNREACHABLE_MESSAGE)
  }
  return token
}
