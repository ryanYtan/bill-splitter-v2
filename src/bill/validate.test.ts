import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { MAX_ENTRY_QUANTITY, MAX_ITEMS, MAX_TEXT_LENGTH, MAX_USER_NAME_LENGTH, MAX_USERS } from './limits'
import { parsePercentage, sanitizePercentage, validateItemFields, validateNewItem, validateUserName } from './validate'

const newItem = (overrides: { name?: string; price?: number | string; quantity?: number } = {}) => ({
  name: overrides.name ?? 'Chicken Rice',
  pricePerUnit: new BigNumber(overrides.price ?? '4.50'),
  quantity: new BigNumber(overrides.quantity ?? 1),
})

describe('validateUserName', () => {
  it('accepts a name at the length limit', () => {
    expect(validateUserName('a'.repeat(MAX_USER_NAME_LENGTH), [])).toBeUndefined()
  })

  it('rejects empty and overlong names', () => {
    expect(validateUserName('', [])).toBeDefined()
    expect(validateUserName('a'.repeat(MAX_USER_NAME_LENGTH + 1), [])).toBeDefined()
  })

  it('rejects a name once the bill is full', () => {
    const users = Array.from({ length: MAX_USERS }, (_, i) => ({ id: `${i}`, name: `${i}` }))
    expect(validateUserName('Ann', users)).toBeDefined()
    expect(validateUserName('Ann', users.slice(1))).toBeUndefined()
  })
})

describe('validateItemFields', () => {
  it('accepts a normal item', () => {
    expect(validateItemFields(newItem())).toBeUndefined()
    expect(validateItemFields(newItem({ name: 'a'.repeat(MAX_TEXT_LENGTH), quantity: MAX_ENTRY_QUANTITY }))).toBeUndefined()
  })

  it('rejects a missing or overlong name', () => {
    expect(validateItemFields(newItem({ name: '' }))).toBe('Name is required')
    expect(validateItemFields(newItem({ name: 'a'.repeat(MAX_TEXT_LENGTH + 1) }))).toBeDefined()
  })

  it('rejects a missing, zero, negative or huge price', () => {
    expect(validateItemFields(newItem({ price: NaN }))).toBe('Price is required')
    expect(validateItemFields(newItem({ price: 0 }))).toBe('Price is required')
    expect(validateItemFields(newItem({ price: -1 }))).toBe('Price is required')
    expect(validateItemFields(newItem({ price: '1000000000.01' }))).toBeDefined()
  })

  it('rejects a cleared, fractional or out-of-range quantity', () => {
    expect(validateItemFields(newItem({ quantity: NaN }))).toBe('Quantity must be at least 1')
    expect(validateItemFields(newItem({ quantity: 0 }))).toBe('Quantity must be at least 1')
    expect(validateItemFields(newItem({ quantity: 1.5 }))).toBe('Quantity must be at least 1')
    expect(validateItemFields(newItem({ quantity: MAX_ENTRY_QUANTITY + 1 }))).toBeDefined()
  })
})

describe('validateNewItem', () => {
  it('rejects a duplicate name', () => {
    const existing = [{ id: '1', ...newItem() }]
    expect(validateNewItem(newItem(), existing)).toBe('Item already exists')
    expect(validateNewItem(newItem({ name: 'Kopi' }), existing)).toBeUndefined()
  })

  it('rejects an item once the bill is full', () => {
    const items = Array.from({ length: MAX_ITEMS }, (_, i) => ({ id: `${i}`, ...newItem({ name: `${i}` }) }))
    expect(validateNewItem(newItem(), items)).toBeDefined()
  })
})

describe('sanitizePercentage', () => {
  it('keeps a valid percentage', () => {
    expect(sanitizePercentage(new BigNumber('9.5')).toFixed()).toBe('9.5')
  })

  it('treats NaN as 0 and clamps to 0-100', () => {
    expect(sanitizePercentage(new BigNumber(NaN)).toFixed()).toBe('0')
    expect(sanitizePercentage(new BigNumber(-5)).toFixed()).toBe('0')
    expect(sanitizePercentage(new BigNumber(250)).toFixed()).toBe('100')
  })
})

describe('parsePercentage', () => {
  it('parses what the user typed, including partial input', () => {
    expect(parsePercentage('9.5').toFixed()).toBe('9.5')
    expect(parsePercentage('5.').toFixed()).toBe('5')
  })

  it('treats a cleared or unparseable field as 0', () => {
    expect(parsePercentage('').toFixed()).toBe('0')
    expect(parsePercentage('.').toFixed()).toBe('0')
  })
})
