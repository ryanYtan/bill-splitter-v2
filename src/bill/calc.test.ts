import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { computeBill } from './calc'
import type { BillData } from './types'

const tax = (percentage: number, enable = true) => ({ enable, percentage: new BigNumber(percentage) })
const item = (id: string, price: string, quantity = 1) => ({ id, name: id, pricePerUnit: new BigNumber(price), quantity: new BigNumber(quantity) })
const user = (id: string) => ({ id, name: id })

const bill = (overrides: Partial<BillData> = {}): BillData => ({
  users: [user('u1'), user('u2'), user('u3')],
  items: [item('a', '10.00'), item('b', '5.50', 2)],
  payer: undefined,
  serviceTax: tax(10),
  gstTax: tax(9),
  userItems: [
    { userId: 'u1', itemId: 'a' },
    { userId: 'u2', itemId: 'a' },
    { userId: 'u1', itemId: 'b' },
  ],
  ...overrides,
})

const fixed = (amount: BigNumber | undefined) => amount?.toFixed(2)

describe('computeBill', () => {
  it('applies service charge on the subtotal and GST on subtotal + service charge', () => {
    const totals = computeBill(bill())
    expect(fixed(totals.subtotal)).toBe('21.00')
    expect(fixed(totals.serviceCharge)).toBe('2.10')
    expect(fixed(totals.gst)).toBe('2.08') // 9% of 23.10 = 2.079, rounded up
    expect(fixed(totals.total)).toBe('25.18')
  })

  it('rounds each taxed amount up to the next cent', () => {
    const totals = computeBill(bill({ items: [item('a', '0.01')], userItems: [] }))
    expect(fixed(totals.serviceCharge)).toBe('0.01')
    expect(fixed(totals.gst)).toBe('0.01')
    expect(fixed(totals.total)).toBe('0.03')
  })

  it('skips disabled taxes', () => {
    const totals = computeBill(bill({ serviceTax: tax(10, false), gstTax: tax(9, false) }))
    expect(fixed(totals.serviceCharge)).toBe('0.00')
    expect(fixed(totals.gst)).toBe('0.00')
    expect(fixed(totals.total)).toBe('21.00')
  })

  it('charges GST on the subtotal alone when service charge is disabled', () => {
    expect(fixed(computeBill(bill({ serviceTax: tax(10, false) })).gst)).toBe('1.89')
  })

  it('splits items equally among contributors and allocates taxes proportionally', () => {
    const { shares } = computeBill(bill())
    expect(fixed(shares.get('u1'))).toBe('19.19') // 16 + 16/21 of (2.10 + 2.08), rounded up
    expect(fixed(shares.get('u2'))).toBe('6.00') // 5 + 5/21 of (2.10 + 2.08), rounded up
    expect(fixed(shares.get('u3'))).toBe('0.00')
  })

  it('ignores contributions to items that no longer exist', () => {
    const { shares } = computeBill(bill({ userItems: [{ userId: 'u1', itemId: 'gone' }] }))
    expect(fixed(shares.get('u1'))).toBe('0.00')
  })

  it('returns zeros for an empty bill', () => {
    const totals = computeBill(bill({ items: [], userItems: [] }))
    expect(fixed(totals.total)).toBe('0.00')
    expect(fixed(totals.shares.get('u1'))).toBe('0.00')
  })
})
