import BigNumber from 'bignumber.js'

/** Formats an amount for display, e.g. "$1,234.50". */
export const formatMoney = (amount: BigNumber): string => `$${amount.toFormat(2)}`
