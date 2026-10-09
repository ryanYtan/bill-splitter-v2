import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { formatMoney } from './money'

describe('formatMoney', () => {
  it('shows two decimal places with thousands separators', () => {
    expect(formatMoney(new BigNumber(0))).toBe('$0.00')
    expect(formatMoney(new BigNumber('4.5'))).toBe('$4.50')
    expect(formatMoney(new BigNumber('1234567.891'))).toBe('$1,234,567.89')
  })

  it('puts the minus sign of a negative amount before the dollar sign', () => {
    expect(formatMoney(new BigNumber('-5'))).toBe('-$5.00')
  })
})
