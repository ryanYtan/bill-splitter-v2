import BigNumber from 'bignumber.js'
import { MAX_ENTRY_QUANTITY, MAX_ITEMS, MAX_PRICE, MAX_TEXT_LENGTH, MAX_USER_NAME_LENGTH, MAX_USERS } from './limits'
import type { Item, NewItem, User } from './types'

// The validators return a message to show the user, or undefined when the input is acceptable.

/** Checks a name about to be added as a user. */
export const validateUserName = (name: string, users: User[]): string | undefined => {
  if (!name) {
    return 'Name is required'
  }
  if (name.length > MAX_USER_NAME_LENGTH) {
    return `Please enter a name of ${MAX_USER_NAME_LENGTH} characters or fewer`
  }
  if (users.length >= MAX_USERS) {
    return `A bill can have at most ${MAX_USERS} people`
  }
  return undefined
}

/** Checks an item's own fields, independent of the bill it is being added to. */
export const validateItemFields = (item: NewItem): string | undefined => {
  if (!item.name) {
    return 'Name is required'
  }
  if (item.name.length > MAX_TEXT_LENGTH) {
    return `Name must be ${MAX_TEXT_LENGTH} characters or fewer`
  }
  if (!item.pricePerUnit.isFinite() || !item.pricePerUnit.isGreaterThan(0)) {
    return 'Price is required'
  }
  if (item.pricePerUnit.isGreaterThan(MAX_PRICE)) {
    return 'Price is too large'
  }
  if (!item.quantity.isInteger() || item.quantity.isLessThan(1)) {
    return 'Quantity must be at least 1'
  }
  if (item.quantity.isGreaterThan(MAX_ENTRY_QUANTITY)) {
    return `Quantity must be at most ${MAX_ENTRY_QUANTITY}`
  }
  return undefined
}

/** Checks an item about to be added by hand to a bill that already has `items`. */
export const validateNewItem = (item: NewItem, items: Item[]): string | undefined => {
  if (items.length >= MAX_ITEMS) {
    return `A bill can have at most ${MAX_ITEMS} items`
  }
  const fieldError = validateItemFields(item)
  if (fieldError) {
    return fieldError
  }
  if (items.some(existing => existing.name === item.name)) {
    return 'Item already exists'
  }
  return undefined
}

/** Coerces a tax percentage into the 0-100 range; an empty or unparseable input counts as 0. */
export const sanitizePercentage = (percentage: BigNumber): BigNumber => {
  if (!percentage.isFinite()) {
    return new BigNumber(0)
  }
  return BigNumber.max(0, BigNumber.min(100, percentage))
}

/** Parses a tax percentage as typed by the user. bignumber.js throws on text that is not a number (such as a cleared field). */
export const parsePercentage = (text: string): BigNumber => {
  try {
    return sanitizePercentage(new BigNumber(text))
  } catch {
    return new BigNumber(0)
  }
}
