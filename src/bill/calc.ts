import BigNumber from 'bignumber.js'
import type { BillData, TaxSetting } from './types'

export type BillTotals = {
  subtotal: BigNumber
  serviceCharge: BigNumber
  gst: BigNumber
  total: BigNumber
  // Each user's share of the total (including their portion of service charge and GST), keyed by user id
  shares: Map<string, BigNumber>
}

const ZERO = new BigNumber(0)

const roundUp = (amount: BigNumber) => amount.decimalPlaces(2, BigNumber.ROUND_UP)

const applyTax = (tax: TaxSetting, base: BigNumber) => (tax.enable ? roundUp(base.multipliedBy(tax.percentage.dividedBy(100))) : ZERO)

/**
 * Computes every amount shown for a bill. Order: subtotal -> service charge (on subtotal) -> GST (on
 * subtotal + service charge), each taxed amount rounded up to 2 dp. Each item is split equally among
 * its contributors, and service charge and GST are allocated in proportion to a user's share of the
 * subtotal. Shares are rounded up per user, so they may not sum exactly to the total.
 */
export const computeBill = (data: BillData): BillTotals => {
  const itemTotals = new Map(data.items.map(item => [item.id, item.pricePerUnit.multipliedBy(item.quantity)]))

  let subtotal = ZERO
  for (const itemTotal of itemTotals.values()) {
    subtotal = subtotal.plus(itemTotal)
  }
  const serviceCharge = applyTax(data.serviceTax, subtotal)
  const gst = applyTax(data.gstTax, subtotal.plus(serviceCharge))
  const total = roundUp(subtotal.plus(serviceCharge).plus(gst))

  const contributorCounts = new Map<string, number>()
  for (const ui of data.userItems) {
    contributorCounts.set(ui.itemId, (contributorCounts.get(ui.itemId) ?? 0) + 1)
  }
  const preTaxShares = new Map<string, BigNumber>()
  for (const ui of data.userItems) {
    const itemTotal = itemTotals.get(ui.itemId)
    if (!itemTotal) {
      continue
    }
    const shareForItem = itemTotal.dividedBy(contributorCounts.get(ui.itemId)!)
    preTaxShares.set(ui.userId, (preTaxShares.get(ui.userId) ?? ZERO).plus(shareForItem))
  }

  const shares = new Map<string, BigNumber>()
  for (const user of data.users) {
    const share = preTaxShares.get(user.id) ?? ZERO
    if (subtotal.isZero()) {
      shares.set(user.id, ZERO)
      continue
    }
    const proportion = share.dividedBy(subtotal) // a number between 0 and 1
    shares.set(user.id, roundUp(share.plus(proportion.multipliedBy(serviceCharge)).plus(proportion.multipliedBy(gst))))
  }

  return { subtotal, serviceCharge, gst, total, shares }
}
