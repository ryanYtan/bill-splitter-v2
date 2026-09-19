import BigNumber from 'bignumber.js'
import { v4 as uuidv4 } from 'uuid'
import type { BillData, Item, TaxSetting, User, UserItem } from '../hooks/use-bill'
import { INVALID_LINK_MESSAGE, ShareError } from './codec'

/**
 * Versioned, serialized form of a bill. This is what gets compressed into a share link, so links
 * created by older versions of the app must stay readable.
 *
 * To change the format:
 *  1. bump CURRENT_VERSION and describe the new shape (keep the old type around for reference),
 *  2. add `migrations[<old version>]` that upgrades an old bill to the next version,
 *  3. update serializeBill and toBillData to the new shape.
 */
export const CURRENT_VERSION = 1

type SharedTaxV1 = { enable: boolean; percentage: string }

type SharedBillV1 = {
  v: 1
  users: string[]
  // `users` are indices into the top-level `users` array (who contributed to the item). Amounts are decimal strings.
  items: { name: string; price: string; quantity: string; users: number[] }[]
  // Index into `users`, or null if nobody has been chosen
  payer: number | null
  serviceTax: SharedTaxV1
  gstTax: SharedTaxV1
}

type RawBill = Record<string, unknown>

// migrations[n] upgrades a version n bill to version n + 1. No migrations exist yet.
const migrations: Record<number, (bill: RawBill) => RawBill> = {}

const NEWER_VERSION_MESSAGE = 'This bill was created with a newer version of Bill Splitter. Try refreshing the page.'

const MAX_USERS = 200
export const MAX_ITEMS = 500
export const MAX_TEXT_LENGTH = 200
const MAX_PRICE = 1e9
const MAX_QUANTITY = 1e6

export const serializeBill = (data: BillData): string => {
  const userIndexes = new Map(data.users.map((user, index) => [user.id, index]))
  const bill: SharedBillV1 = {
    v: 1,
    users: data.users.map(user => user.name),
    items: data.items.map(item => ({
      name: item.name,
      price: item.pricePerUnit.toFixed(),
      quantity: item.quantity.toFixed(),
      users: data.userItems
        .filter(ui => ui.itemId === item.id)
        .map(ui => userIndexes.get(ui.userId))
        .filter((index): index is number => index !== undefined)
        .sort((a, b) => a - b),
    })),
    payer: (data.payer === undefined ? undefined : userIndexes.get(data.payer)) ?? null,
    serviceTax: serializeTax(data.serviceTax),
    gstTax: serializeTax(data.gstTax),
  }
  return JSON.stringify(bill)
}

const serializeTax = (tax: TaxSetting): SharedTaxV1 => ({ enable: tax.enable, percentage: tax.percentage.toFixed() })

/** Parses and validates serialized bill JSON of any supported version. Throws ShareError if it can't be used. */
export const parseBill = (json: string): BillData => {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw invalid()
  }
  return toBillData(migrateToCurrent(raw))
}

const invalid = () => new ShareError(INVALID_LINK_MESSAGE)

const isRecord = (value: unknown): value is RawBill => typeof value === 'object' && value !== null && !Array.isArray(value)

const migrateToCurrent = (raw: unknown): RawBill => {
  if (!isRecord(raw) || typeof raw.v !== 'number' || !Number.isInteger(raw.v) || raw.v < 1) {
    throw invalid()
  }
  if (raw.v > CURRENT_VERSION) {
    throw new ShareError(NEWER_VERSION_MESSAGE)
  }
  let bill = raw
  for (let version = raw.v; version < CURRENT_VERSION; version++) {
    const migrate = migrations[version]
    if (!migrate) {
      throw invalid()
    }
    bill = { ...migrate(bill), v: version + 1 }
  }
  return bill
}

const asRecord = (value: unknown): RawBill => {
  if (!isRecord(value)) {
    throw invalid()
  }
  return value
}

const asArray = (value: unknown, maxLength: number): unknown[] => {
  if (!Array.isArray(value) || value.length > maxLength) {
    throw invalid()
  }
  return value
}

const asString = (value: unknown): string => {
  if (typeof value !== 'string' || value.length > MAX_TEXT_LENGTH) {
    throw invalid()
  }
  return value
}

const asAmount = (value: unknown, min: number, max: number): BigNumber => {
  const amount = new BigNumber(asString(value))
  if (!amount.isFinite() || amount.lt(min) || amount.gt(max)) {
    throw invalid()
  }
  return amount
}

const asIndex = (value: unknown, length: number): number => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value >= length) {
    throw invalid()
  }
  return value
}

const asTax = (value: unknown): TaxSetting => {
  const tax = asRecord(value)
  if (typeof tax.enable !== 'boolean') {
    throw invalid()
  }
  return { enable: tax.enable, percentage: asAmount(tax.percentage, 0, 100) }
}

// Validates a bill in the CURRENT_VERSION shape and converts it into app state (assigning fresh ids)
const toBillData = (bill: RawBill): BillData => {
  const users: User[] = asArray(bill.users, MAX_USERS).map(name => ({ id: uuidv4(), name: asString(name) }))
  const items: Item[] = []
  const userItems: UserItem[] = []
  for (const rawItem of asArray(bill.items, MAX_ITEMS)) {
    const item = asRecord(rawItem)
    const id = uuidv4()
    items.push({ id, name: asString(item.name), pricePerUnit: asAmount(item.price, 0, MAX_PRICE), quantity: asAmount(item.quantity, 0, MAX_QUANTITY) })
    for (const index of new Set(asArray(item.users, MAX_USERS).map(i => asIndex(i, users.length)))) {
      userItems.push({ userId: users[index].id, itemId: id })
    }
  }
  const payer = bill.payer === null ? undefined : users[asIndex(bill.payer, users.length)].id
  return { users, items, payer, serviceTax: asTax(bill.serviceTax), gstTax: asTax(bill.gstTax), userItems }
}
