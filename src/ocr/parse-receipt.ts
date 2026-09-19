import BigNumber from 'bignumber.js'
import { Item } from '../hooks/use-bill'

export type ParsedItem = Omit<Item, 'id'>

const MAX_QUANTITY = 30

// Lines that are part of a receipt but are not purchasable items.
const NON_ITEM = /\b(sub\s*-?\s*total|total|gst|tax|svc|service|charge|change|cash|visa|master(card)?|nets|amex|amount|rounding|balance|tender|receipt|invoice|table|date|time|thank|server|cashier|qty|payment|discount)\b/i

// Last money-looking token on the line, e.g. "9.80", "$1,234.50", "S$ 4,90".
const PRICE = /(?:S?\$\s*)?(\d{1,3}(?:,\d{3})+|\d{1,6})[.,](\d{2})\s*(?:SGD)?\s*[A-Za-z]?\s*$/

const LEADING_QTY = /^(\d{1,2})\s*[xX*]?\s+(?=\S)/
const TRAILING_QTY = /\s+(\d{1,2})\s*[xX]\s*$/

const cleanName = (raw: string): string =>
  raw
    .replace(/[.·_\-–—=*#|]{2,}/g, ' ')
    .replace(/[^\p{L}\p{N}\s&'()/+.,%-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.,\-/+]+|[\s.,\-/+]+$/g, '')

export const parseReceiptText = (text: string): ParsedItem[] => {
  const merged = new Map<string, ParsedItem>()

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || NON_ITEM.test(line)) continue

    const priceMatch = PRICE.exec(line)
    if (!priceMatch) continue

    const lineTotal = new BigNumber(`${priceMatch[1].replace(/,/g, '')}.${priceMatch[2]}`)
    if (!lineTotal.isGreaterThan(0)) continue

    let rest = line.slice(0, priceMatch.index)
    let quantity = 1
    const leading = LEADING_QTY.exec(rest)
    const trailing = TRAILING_QTY.exec(rest)
    if (leading) {
      quantity = Number.parseInt(leading[1])
      rest = rest.slice(leading[0].length)
    } else if (trailing) {
      quantity = Number.parseInt(trailing[1])
      rest = rest.slice(0, trailing.index)
    }

    const name = cleanName(rest)
    if (name.length < 2 || !/\p{L}/u.test(name)) continue

    // Receipt prices are line totals. Only split into per-unit when it divides exactly to cents,
    // otherwise keep quantity 1 at the line total so the bill total stays correct.
    let pricePerUnit = lineTotal
    if (quantity > 1 && quantity <= MAX_QUANTITY) {
      const each = lineTotal.dividedBy(quantity)
      if (each.decimalPlaces()! <= 2 && each.isGreaterThan(0)) {
        pricePerUnit = each
      } else {
        quantity = 1
      }
    } else {
      quantity = 1
    }

    const key = `${name.toLowerCase()}|${pricePerUnit.toFixed(2)}`
    const existing = merged.get(key)
    if (existing) {
      const total = existing.quantity.plus(quantity)
      if (total.isLessThanOrEqualTo(MAX_QUANTITY)) {
        existing.quantity = total
        continue
      }
    }
    merged.set(existing ? `${key}|${merged.size}` : key, { name, pricePerUnit, quantity: new BigNumber(quantity) })
  }

  return [...merged.values()]
}
