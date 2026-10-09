import BigNumber from 'bignumber.js'
import { BillData, BillMethods } from '../hooks/use-bill'

export type TotalRow = {
  label: string
  tooltip: string
  amount: BigNumber
}

/** The rows of the price breakdown, in display order. Disabled taxes and a zero discount are left out. */
export const getTotalRows = (data: BillData, methods: BillMethods): TotalRow[] => {
  const discount = methods.computeDiscount()
  const hasDiscount = discount.isGreaterThan(0)
  const base = hasDiscount ? 'subtotal after the discount' : 'subtotal'
  return [
    { label: 'SUBTOTAL:', tooltip: 'Computed as the total of all items before any discount or taxes', amount: methods.computeSubtotal() },
    ...(hasDiscount ? [{ label: 'DISCOUNT:', tooltip: 'Taken off the subtotal before service charge and GST', amount: discount.negated() }] : []),
    ...(data.serviceTax.enable ? [{ label: 'SERVICE CHARGE:', tooltip: `Computed as ${data.serviceTax.percentage}% of the ${base}`, amount: methods.computeServiceTax() }] : []),
    ...(data.gstTax.enable ? [{ label: 'GST:', tooltip: `Computed as ${data.gstTax.percentage}% of the sum of the ${base} and service charge`, amount: methods.computeGstTax() }] : []),
    { label: 'TOTAL:', tooltip: `Computed as the sum of the ${base}, service charge, and GST`, amount: methods.computeTotal() },
  ]
}
