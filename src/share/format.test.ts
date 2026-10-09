import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { MAX_ITEMS, MAX_TEXT_LENGTH } from '../bill/limits'
import type { BillData } from '../bill/types'
import { ShareError } from './codec'
import { CURRENT_VERSION, parseBill, serializeBill } from './format'

const sample: BillData = {
  users: [
    { id: 'u1', name: 'Ann' },
    { id: 'u2', name: 'Ben' },
  ],
  items: [
    { id: 'i1', name: 'Chicken Rice', pricePerUnit: new BigNumber('4.50'), quantity: new BigNumber(2) },
    { id: 'i2', name: 'Kopi', pricePerUnit: new BigNumber('1.20'), quantity: new BigNumber(1) },
  ],
  payer: 'u2',
  serviceTax: { enable: true, percentage: new BigNumber(10) },
  gstTax: { enable: false, percentage: new BigNumber(9) },
  discount: new BigNumber('2.50'),
  userItems: [
    { userId: 'u2', itemId: 'i1' },
    { userId: 'u1', itemId: 'i1' },
    { userId: 'u1', itemId: 'i2' },
  ],
}

const v1 = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    v: 1,
    users: ['Ann'],
    items: [{ name: 'Kopi', price: '1.2', quantity: '1', users: [0] }],
    payer: 0,
    serviceTax: { enable: true, percentage: '10' },
    gstTax: { enable: true, percentage: '9' },
    ...overrides,
  })

describe('serializeBill', () => {
  it('writes the version 2 shape, referencing users by index', () => {
    expect(JSON.parse(serializeBill(sample))).toEqual({
      v: 2,
      users: ['Ann', 'Ben'],
      items: [
        { name: 'Chicken Rice', price: '4.5', quantity: '2', users: [0, 1] },
        { name: 'Kopi', price: '1.2', quantity: '1', users: [0] },
      ],
      payer: 1,
      serviceTax: { enable: true, percentage: '10' },
      gstTax: { enable: false, percentage: '9' },
      discount: '2.5',
    })
  })
})

describe('parseBill', () => {
  it('round-trips a bill, assigning fresh ids', () => {
    const parsed = parseBill(serializeBill(sample))
    expect(parsed.users.map(user => user.name)).toEqual(['Ann', 'Ben'])
    expect(parsed.users[0].id).not.toBe('u1')
    expect(parsed.payer).toBe(parsed.users[1].id)
    expect(parsed.gstTax.enable).toBe(false)
    expect(parsed.discount.toFixed()).toBe('2.5')
    // Serializing again drops the ids, so equal output means the same bill
    expect(serializeBill(parsed)).toBe(serializeBill(sample))
  })

  it('accepts a bill with nobody chosen as payer', () => {
    expect(parseBill(v1({ payer: null })).payer).toBeUndefined()
  })

  it('opens a version 1 link, which has no discount', () => {
    expect(parseBill(v1()).discount.toFixed()).toBe('0')
  })

  it('asks the user to refresh for a newer version', () => {
    expect(() => parseBill(v1({ v: CURRENT_VERSION + 1 }))).toThrow(/newer version/)
  })

  it.each([
    ['malformed JSON', '{'],
    ['a non-object', '[]'],
    ['a missing version', v1({ v: undefined })],
    ['a payer index out of range', v1({ payer: 1 })],
    ['a contributor index out of range', v1({ items: [{ name: 'Kopi', price: '1', quantity: '1', users: [3] }] })],
    ['an overlong name', v1({ users: ['a'.repeat(MAX_TEXT_LENGTH + 1)] })],
    ['a non-numeric price', v1({ items: [{ name: 'Kopi', price: 'abc', quantity: '1', users: [] }] })],
    ['a negative price', v1({ items: [{ name: 'Kopi', price: '-1', quantity: '1', users: [] }] })],
    ['a negative discount', v1({ v: 2, discount: '-1' })],
    ['a version 2 bill without a discount', v1({ v: 2 })],
    ['a tax above 100%', v1({ gstTax: { enable: true, percentage: '101' } })],
    ['too many items', v1({ items: Array.from({ length: MAX_ITEMS + 1 }, () => ({ name: 'Kopi', price: '1', quantity: '1', users: [] })) })],
  ])('rejects %s', (_, json) => {
    expect(() => parseBill(json)).toThrow(ShareError)
  })
})
