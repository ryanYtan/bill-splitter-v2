import BigNumber from 'bignumber.js'
import { BillData, BillMethods } from '../hooks/use-bill'

export type TotalRow = {
  label: string
  tooltip: string
  amount: BigNumber
}

/** The rows of the price breakdown, in display order. Disabled taxes are left out. */
export const getTotalRows = (data: BillData, methods: BillMethods): TotalRow[] => [
  { label: 'SUBTOTAL:', tooltip: 'Computed as the total of all items before any taxes', amount: methods.computeSubtotal() },
  ...(data.serviceTax.enable ? [{ label: 'SERVICE CHARGE:', tooltip: `Computed as ${data.serviceTax.percentage}% of the subtotal`, amount: methods.computeServiceTax() }] : []),
  ...(data.gstTax.enable ? [{ label: 'GST:', tooltip: `Computed as ${data.gstTax.percentage}% of the sum of the subtotal and service charge`, amount: methods.computeGstTax() }] : []),
  { label: 'TOTAL:', tooltip: 'Computed as the sum of the subtotal, service charge, and GST', amount: methods.computeTotal() },
]
