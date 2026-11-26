import BigNumber from 'bignumber.js'

/** The number a field's text stands for while it is being typed: '' and '.' count as zero, unparseable text as NaN. */
export const typedAmount = (text: string): BigNumber => {
  if (text === '' || text === '.') {
    return new BigNumber(0)
  }
  try {
    return new BigNumber(text)
  } catch {
    // bignumber.js 11 throws on non-numeric strings
    return new BigNumber(NaN)
  }
}

/**
 * What a number field shows: the text as typed while it still stands for the stored value, so partial input such as
 * '8.' or '0.0' (or a cleared field) survives a re-render; the stored value otherwise, as when it was clamped.
 */
export const shownText = (typed: string, value: BigNumber): string => (typedAmount(typed).isEqualTo(value) ? typed : value.toFixed())
