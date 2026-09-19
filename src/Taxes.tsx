import { Checkbox, InputAdornment, TextField, Typography } from '@mui/material'
import { BillData, BillMethods } from './hooks/use-bill'
import { NumericFormat } from 'react-number-format'
import FlexBox from './components/FlexBox'
import SectionContainer from './components/Section/SectionContainer'
import Section from './components/Section/Section'
import BigNumber from 'bignumber.js'

interface TaxRowProps {
  label: string
  percentage: BigNumber
  enabled: boolean
  readOnly?: boolean
  onPercentageChange: (percentage: BigNumber) => void
  onEnabledChange: (enabled: boolean) => void
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
              return formattedValue === '' || (!!floatValue && 0 <= floatValue && floatValue <= 100)
            }}
            decimalScale={2}
            allowLeadingZeros={false}
            value={props.percentage.toNumber()}
            onChange={e => props.onPercentageChange(new BigNumber(e.target.value))}
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
          <Checkbox checked={props.enabled} disabled={props.readOnly} onChange={e => props.onEnabledChange(e.target.checked)} />
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
      <TaxRow label='SERVICE CHARGE' percentage={data.serviceTax.percentage} enabled={data.serviceTax.enable} readOnly={readOnly} onPercentageChange={methods.setServiceTax} onEnabledChange={methods.setServiceTaxEnabled} />
      <TaxRow label='GST' percentage={data.gstTax.percentage} enabled={data.gstTax.enable} readOnly={readOnly} onPercentageChange={methods.setGstTax} onEnabledChange={methods.setGstTaxEnabled} />
    </SectionContainer>
  )
}

export default Taxes
