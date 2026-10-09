import { describe, expect, it } from 'vitest'
import { compressToBase64Url, decompressFromBase64Url, ShareError } from './codec'

describe('share codec', () => {
  it('round-trips text, including non-ASCII', async () => {
    const text = JSON.stringify({ users: ['Ann', '小明', 'Zoë 🍜'] })
    expect(await decompressFromBase64Url(await compressToBase64Url(text))).toBe(text)
  })

  it('produces an unpadded URL-safe token', async () => {
    // Enough varied input that the standard alphabet would almost certainly contain '+' or '/'
    const text = Array.from({ length: 500 }, (_, i) => (i * 7919).toString(36)).join('')
    expect(await compressToBase64Url(text)).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('accepts standard base64, with "+" turned into a space by query string decoding', async () => {
    const text = Array.from({ length: 500 }, (_, i) => (i * 7919).toString(36)).join('')
    const token = await compressToBase64Url(text)
    const standard = token.replace(/-/g, '+').replace(/_/g, '/')
    expect(await decompressFromBase64Url(standard)).toBe(text)
    expect(await decompressFromBase64Url(standard.replace(/\+/g, ' '))).toBe(text)
  })

  it('rejects tokens that are not valid compressed data', async () => {
    await expect(decompressFromBase64Url('!!!')).rejects.toThrow(ShareError)
    await expect(decompressFromBase64Url('aGVsbG8gd29ybGQ')).rejects.toThrow(ShareError)
  })

  it('rejects data that decompresses to more than 1 MB', async () => {
    const bomb = await compressToBase64Url('a'.repeat(1_000_001))
    await expect(decompressFromBase64Url(bomb)).rejects.toThrow(ShareError)
  })
})
