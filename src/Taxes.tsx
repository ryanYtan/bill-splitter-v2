import { Checkbox, InputAdornment, TextField, Typography } from '@mui/material'
import { BillData, BillMethods, TaxSetting } from './hooks/use-bill'
import { NumericFormat } from 'react-number-format'
import FlexBox from './components/FlexBox'
import SectionContainer from './components/Section/SectionContainer'
import Section from './components/Section/Section'
import { parsePercentage } from './bill/validate'

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

interface TaxesProps {
  data: BillData
  methods: BillMethods
  readOnly?: boolean
}

const Taxes = ({ data, methods, readOnly }: TaxesProps) => {
  return (
    <SectionContainer>
      <TaxRow label='SERVICE CHARGE' tax={data.serviceTax} readOnly={readOnly} onChange={patch => methods.setTax('serviceTax', patch)} />
      <TaxRow label='GST' tax={data.gstTax} readOnly={readOnly} onChange={patch => methods.setTax('gstTax', patch)} />
    </SectionContainer>
  )
}

export default Taxes
