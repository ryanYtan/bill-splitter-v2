import { TextField, TextFieldProps } from '@mui/material'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import { shownText } from '../bill/decimal-text'

type DecimalFieldProps = Omit<NumericFormatProps<TextFieldProps>, 'value' | 'defaultValue' | 'onChange' | 'onValueChange' | 'customInput' | 'valueIsNumericString'> & {
  /** The stored amount. Left out, the field is uncontrolled and simply reports what is typed. */
  value?: BigNumber
  /** The typed number without formatting (no thousands separators), possibly partial such as '8.' or ''. */
  onChange: (text: string) => void
  /** Starts empty rather than showing 0. */
  emptyWhenZero?: boolean
}

/**
 * A number field that keeps the text as typed. Feeding the parsed number back as the value instead loses a trailing
 * point ('8.' becomes '8', so 8.5 comes out as 85) and turns a cleared field into '0', which on phone keyboards then
 * leaves the caret in front of what is typed next.
 */
const DecimalField = ({ value, onChange, emptyWhenZero, ...rest }: DecimalFieldProps) => {
  const [typed, setTyped] = useState(() => (value === undefined || (emptyWhenZero && value.isZero()) ? '' : value.toFixed()))
  return (
    <NumericFormat
      {...rest}
      customInput={TextField}
      valueIsNumericString
      value={value === undefined ? typed : shownText(typed, value)}
      onValueChange={(values, { source }) => {
        // 'prop' changes are this component re-rendering with a new value, not the user typing
        if (source === 'event') {
          setTyped(values.value)
          onChange(values.value)
        }
      }}
    />
  )
}

export default DecimalField
