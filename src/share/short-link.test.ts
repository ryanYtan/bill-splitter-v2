import { afterEach, describe, expect, it, vi } from 'vitest'
import { ShareError } from './codec'
import { createShortLink, EXPIRED_LINK_MESSAGE, fetchShareToken, UNREACHABLE_MESSAGE } from './short-link'

const stubFetch = (respond: (url: string, init?: RequestInit) => Response | Promise<Response>) => {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => respond(url, init))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createShortLink', () => {
  it('posts the token with its SHA-256 and returns the id', async () => {
    const fetchMock = stubFetch(() => json({ id: 'abc123' }))
    expect(await createShortLink('abc')).toBe('abc123')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(/api\/links$/)
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('abc')
    expect((init?.headers as Record<string, string>)['x-amz-content-sha256']).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })

  it.each([
    ['an error status', () => json({ error: 'too large' }, 413)],
    ['a response without an id', () => json({})],
  ])('rejects on %s', async (_, respond) => {
    stubFetch(respond)
    await expect(createShortLink('abc')).rejects.toThrow()
  })
})

describe('fetchShareToken', () => {
  it('returns the stored token', async () => {
    const fetchMock = stubFetch(() => json({ token: 'abc' }))
    expect(await fetchShareToken('abc123')).toBe('abc')
    expect(fetchMock.mock.calls[0][0]).toMatch(/api\/links\/abc123$/)
  })

  it('reports a missing link as expired', async () => {
    stubFetch(() => json({ error: 'gone' }, 404))
    await expect(fetchShareToken('abc123')).rejects.toThrow(new ShareError(EXPIRED_LINK_MESSAGE))
  })

  it.each([
    ['a network failure', () => Promise.reject(new TypeError('offline'))],
    ['a server error', () => json({}, 500)],
    ['a response without a token', () => json({})],
    ['a response that is not JSON', () => new Response('<html>')],
  ])('reports %s as unreachable', async (_, respond) => {
    stubFetch(respond)
    await expect(fetchShareToken('abc123')).rejects.toThrow(new ShareError(UNREACHABLE_MESSAGE))
  })
})
