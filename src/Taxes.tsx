import { Checkbox, InputAdornment, TextField, Typography } from '@mui/material'
import { BillData, BillMethods, TaxSetting } from './hooks/use-bill'
import { NumericFormat } from 'react-number-format'
import FlexBox from './components/FlexBox'
import SectionContainer from './components/Section/SectionContainer'
import Section from './components/Section/Section'
import { parseDiscount, parsePercentage } from './bill/validate'
import { MAX_PRICE } from './bill/limits'
import BigNumber from 'bignumber.js'

interface TaxRowProps {
  label: string
  tax: TaxSetting
  readOnly?: boolean
  onChange: (patch: Partial<TaxSetting>) => void
}

const TaxRow = (props: TaxRowProps) => {
  return (
    <Section sx={{ py: 1, px: 2 }}>
      <FlexBox sx={{ justifyContent: 'space-between' }}>
        <FlexBox>
          <Typography sx={{ fontWeight: 'bold' }}>APPLY</Typography>
          <NumericFormat
            isAllowed={values => {
              const { formattedValue, floatValue } = values
              return formattedValue === '' || (floatValue !== undefined && 0 <= floatValue && floatValue <= 100)
            }}
            decimalScale={2}
            allowLeadingZeros={false}
            value={props.tax.percentage.toNumber()}
            onChange={e => props.onChange({ percentage: parsePercentage(e.target.value) })}
            customInput={TextField}
            variant='standard'
            slotProps={{
              input: {
                endAdornment: <InputAdornment position='end'>%</InputAdornment>,
                readOnly: props.readOnly,
              },
            }}
            sx={{
              width: 50,
            }}
          />
          <Typography sx={{ fontWeight: 'bold' }}>{props.label}</Typography>
        </FlexBox>
        <FlexBox sx={{ justifyContent: 'flex-end' }}>
          <Checkbox checked={props.tax.enable} disabled={props.readOnly} onChange={e => props.onChange({ enable: e.target.checked })} />
        </FlexBox>
      </FlexBox>
    </Section>
  )
}

interface DiscountRowProps {
  discount: BigNumber
  readOnly?: boolean
  onChange: (amount: BigNumber) => void
}

const DiscountRow = (props: DiscountRowProps) => {
  return (
    <Section sx={{ py: 1, px: 2 }}>
      <FlexBox>
        <Typography sx={{ fontWeight: 'bold' }}>APPLY</Typography>
        <NumericFormat
          isAllowed={values => {
            const { formattedValue, floatValue } = values
            return formattedValue === '' || (floatValue !== undefined && 0 <= floatValue && floatValue <= MAX_PRICE)
          }}
          decimalScale={2}
          allowNegative={false}
          allowLeadingZeros={false}
          value={props.discount.toNumber()}
          onChange={e => props.onChange(parseDiscount(e.target.value))}
          customInput={TextField}
          variant='standard'
          slotProps={{
            input: {
              startAdornment: <InputAdornment position='start'>$</InputAdornment>,
              readOnly: props.readOnly,
            },
            htmlInput: { inputMode: 'decimal', 'aria-label': 'Discount amount' },
          }}
          sx={{
            width: 90,
          }}
        />
        <Typography sx={{ fontWeight: 'bold' }}>DISCOUNT</Typography>
      </FlexBox>
    </Section>
  )
}

interface TaxesProps {
  data: BillData
  methods: BillMethods
  readOnly?: boolean
}

const Taxes = ({ data, methods, readOnly }: TaxesProps) => {
  return (
    <SectionContainer>
      <DiscountRow discount={data.discount} readOnly={readOnly} onChange={methods.setDiscount} />
      <TaxRow label='SERVICE CHARGE' tax={data.serviceTax} readOnly={readOnly} onChange={patch => methods.setTax('serviceTax', patch)} />
      <TaxRow label='GST' tax={data.gstTax} readOnly={readOnly} onChange={patch => methods.setTax('gstTax', patch)} />
    </SectionContainer>
  )
}

export default Taxes
