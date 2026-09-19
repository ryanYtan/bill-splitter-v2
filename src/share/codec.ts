export class ShareError extends Error {}

export const INVALID_LINK_MESSAGE = 'This share link is invalid or corrupted.'

// Guards against decompression bombs in untrusted links
const MAX_DECOMPRESSED_BYTES = 1_000_000

const pipe = async (input: Uint8Array<ArrayBuffer>, transform: CompressionStream | DecompressionStream, maxBytes: number): Promise<Uint8Array<ArrayBuffer>> => {
  const reader = new Blob([input]).stream().pipeThrough(transform).getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    total += value.length
    if (total > maxBytes) {
      await reader.cancel()
      throw new ShareError(INVALID_LINK_MESSAGE)
    }
    chunks.push(value)
  }
  const output = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }
  return output
}

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Accepts both the URL-safe and the standard base64 alphabets ('+' may arrive as a space after query string decoding)
const fromBase64Url = (token: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(token.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

/** Deflate-compresses text and encodes it as unpadded URL-safe base64. */
export const compressToBase64Url = async (text: string): Promise<string> => {
  const compressed = await pipe(new TextEncoder().encode(text), new CompressionStream('deflate-raw'), Infinity)
  return toBase64Url(compressed)
}

/** Inverse of compressToBase64Url. Throws ShareError if the token is not valid. */
export const decompressFromBase64Url = async (token: string): Promise<string> => {
  try {
    const decompressed = await pipe(fromBase64Url(token), new DecompressionStream('deflate-raw'), MAX_DECOMPRESSED_BYTES)
    return new TextDecoder('utf-8', { fatal: true }).decode(decompressed)
  } catch (e) {
    throw e instanceof ShareError ? e : new ShareError(INVALID_LINK_MESSAGE)
  }
}
