import BigNumber from 'bignumber.js'
import type { BillData, TaxSetting } from './types'

export type BillTotals = {
  subtotal: BigNumber
  // The discount actually applied, which is never more than the subtotal
  discount: BigNumber
  serviceCharge: BigNumber
  gst: BigNumber
  total: BigNumber
  // Each user's share of the total (including their portion of the discount, service charge and GST), keyed by user id
  shares: Map<string, BigNumber>
}

const ZERO = new BigNumber(0)

const roundUp = (amount: BigNumber) => amount.decimalPlaces(2, BigNumber.ROUND_UP)

const applyTax = (tax: TaxSetting, base: BigNumber) => (tax.enable ? roundUp(base.multipliedBy(tax.percentage.dividedBy(100))) : ZERO)

/**
 * Computes every amount shown for a bill. Order: subtotal -> discount (a fixed amount, capped at the
 * subtotal) -> service charge (on the discounted subtotal) -> GST (on discounted subtotal + service
 * charge), each taxed amount rounded up to 2 dp. Each item is split equally among its contributors,
 * and the discount, service charge and GST are allocated in proportion to a user's share of the
 * subtotal. Shares are rounded up per user, so they may not sum exactly to the total.
 */
export const computeBill = (data: BillData): BillTotals => {
  const itemTotals = new Map(data.items.map(item => [item.id, item.pricePerUnit.multipliedBy(item.quantity)]))

  let subtotal = ZERO
  for (const itemTotal of itemTotals.values()) {
    subtotal = subtotal.plus(itemTotal)
  }
  const discount = BigNumber.max(ZERO, BigNumber.min(data.discount, subtotal))
  const discounted = subtotal.minus(discount)
  const serviceCharge = applyTax(data.serviceTax, discounted)
  const gst = applyTax(data.gstTax, discounted.plus(serviceCharge))
  const total = roundUp(discounted.plus(serviceCharge).plus(gst))

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
    // Multiply before dividing: a fully discounted bill must come to exactly zero, not a sliver that rounds up to a cent
    shares.set(user.id, roundUp(share.multipliedBy(discounted.plus(serviceCharge).plus(gst)).dividedBy(subtotal)))
  }

  return { subtotal, discount, serviceCharge, gst, total, shares }
}
