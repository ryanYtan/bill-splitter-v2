import { describe, expect, it } from 'vitest'
import { parseReceiptText } from './parse-receipt'

const parse = (text: string) => parseReceiptText(text).map(item => [item.name, item.pricePerUnit.toFixed(2), item.quantity.toNumber()])

describe('parseReceiptText', () => {
  it('reads item lines and skips totals, taxes and payment lines', () => {
    const text = ['KOPITIAM PTE LTD', 'Chicken Rice      4.50', 'Kopi O   $1.20', 'SUBTOTAL 5.70', 'SVC CHG 10% 0.57', 'GST 9% 0.57', 'TOTAL 6.84', 'VISA 6.84'].join('\n')
    expect(parse(text)).toEqual([
      ['Chicken Rice', '4.50', 1],
      ['Kopi O', '1.20', 1],
    ])
  })

  it('treats the price as a line total and splits it per unit', () => {
    expect(parse('2 Chicken Rice 9.00')).toEqual([['Chicken Rice', '4.50', 2]])
    expect(parse('Teh Tarik 3x 4.50')).toEqual([['Teh Tarik', '1.50', 3]])
  })

  it('keeps quantity 1 at the line total when it does not divide to whole cents', () => {
    expect(parse('3 Kopi 10.00')).toEqual([['Kopi', '10.00', 1]])
  })

  it('merges repeated lines into one item', () => {
    expect(parse('Teh 1.50\nTEH 1.50\nTeh 1.80')).toEqual([
      ['Teh', '1.50', 2],
      ['Teh', '1.80', 1],
    ])
  })

  it('handles thousands separators and ignores lines without a name or price', () => {
    expect(parse('Wagyu Platter $1,234.50\n12.00\nJust some text\nFree Water 0.00')).toEqual([['Wagyu Platter', '1234.50', 1]])
  })
})
