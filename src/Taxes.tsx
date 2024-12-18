import { Checkbox, InputAdornment, TextField, Typography } from '@mui/material'
import { BillData, BillMethods } from './hooks/use-bill'
import { NumericFormat } from 'react-number-format'
import FlexBox from './components/FlexBox'
import SectionContainer from './components/Section/SectionContainer'
import Section from './components/Section/Section'
import BigNumber from 'bignumber.js'

interface TaxesProps {
  data: BillData
  methods: BillMethods
}

const Taxes = (props: TaxesProps) => {
  return (
    <SectionContainer>
      <Section sx={{ py: 1, px: 2 }}>
        <FlexBox sx={{ justifyContent: 'space-between' }}>
          <FlexBox>
            <Typography fontWeight='bold'>APPLY</Typography>
            <NumericFormat
              isAllowed={values => {
                const { formattedValue, floatValue } = values
                return formattedValue === '' || (!!floatValue && 0 <= floatValue && floatValue <= 100)
              }}
              decimalScale={2}
              allowLeadingZeros={false}
              value={props.data.serviceTax.percentage.toNumber()}
              onChange={e => props.methods.setServiceTax(new BigNumber(e.target.value))}
              customInput={TextField}
              variant='standard'
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position='end'>%</InputAdornment>,
                },
              }}
              sx={{
                width: 50,
              }}
            />
            <Typography fontWeight='bold'>SERVICE CHARGE</Typography>
          </FlexBox>
          <FlexBox sx={{ justifyContent: 'flex-end' }}>
            <Checkbox checked={props.data.serviceTax.enable} onChange={e => props.methods.setServiceTaxEnabled(e.target.checked)} />
          </FlexBox>
        </FlexBox>
      </Section>
      <Section sx={{ py: 1, px: 2 }}>
        <FlexBox sx={{ justifyContent: 'space-between' }}>
          <FlexBox>
            <Typography fontWeight='bold'>APPLY</Typography>
            <NumericFormat
              isAllowed={values => {
                const { formattedValue, floatValue } = values
                return formattedValue === '' || (!!floatValue && 0 <= floatValue && floatValue <= 100)
              }}
              decimalScale={2}
              allowLeadingZeros={false}
              value={props.data.gstTax.percentage.toNumber()}
              onChange={e => props.methods.setGstTax(new BigNumber(e.target.value))}
              customInput={TextField}
              variant='standard'
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position='end'>%</InputAdornment>,
                },
              }}
              sx={{
                width: 50,
              }}
            />
            <Typography fontWeight='bold'>GST</Typography>
          </FlexBox>
          <FlexBox sx={{ justifyContent: 'flex-end' }}>
            <Checkbox checked={props.data.gstTax.enable} onChange={e => props.methods.setGstTaxEnabled(e.target.checked)} />
          </FlexBox>
        </FlexBox>
      </Section>
    </SectionContainer>
  )
}

export default Taxes
