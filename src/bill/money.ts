import BigNumber from 'bignumber.js'

/** Formats an amount for display, e.g. "$1,234.50", or "-$5.00" for a negative amount. */
export const formatMoney = (amount: BigNumber): string => `${amount.isNegative() ? '-' : ''}$${amount.abs().toFormat(2)}`
