import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { shownText, typedAmount } from './decimal-text'

describe('typedAmount', () => {
  it('reads partial input', () => {
    expect(typedAmount('8.').toFixed()).toBe('8')
    expect(typedAmount('.5').toFixed()).toBe('0.5')
    expect(typedAmount('0.0').toFixed()).toBe('0')
  })

  it('counts an empty field or a lone point as zero', () => {
    expect(typedAmount('').toFixed()).toBe('0')
    expect(typedAmount('.').toFixed()).toBe('0')
  })

  it('gives NaN for text that is not a number, without throwing', () => {
    expect(typedAmount('abc').isNaN()).toBe(true)
  })
})

describe('shownText', () => {
  it('keeps the text as typed while it matches the stored value', () => {
    expect(shownText('8.', new BigNumber(8))).toBe('8.')
    expect(shownText('2.50', new BigNumber('2.5'))).toBe('2.50')
    expect(shownText('', new BigNumber(0))).toBe('')
  })

  it('shows the stored value when it differs, such as after clamping', () => {
    expect(shownText('150', new BigNumber(100))).toBe('100')
    expect(shownText('', new BigNumber(9))).toBe('9')
  })
})
