import { Tooltip, Typography } from '@mui/material'
import FlexBox from './components/FlexBox'
import Section from './components/Section/Section'
import SectionContainer from './components/Section/SectionContainer'
import { BillData, BillMethods } from './hooks/use-bill'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import BigNumber from 'bignumber.js'

interface PriceRowProps {
  label: string
  tooltip: string
  amount: BigNumber
}

const PriceRow = (props: PriceRowProps) => {
  return (
    <Section sx={{ px: 2, py: 1 }}>
      <FlexBox sx={{ justifyContent: 'flex-end' }}>
        <Tooltip title={props.tooltip}>
          <InfoOutlinedIcon fontSize='small' />
        </Tooltip>
        <Typography sx={{ fontWeight: 'bold' }}>{props.label}</Typography>
        <FlexBox sx={{ justifyContent: 'flex-end', width: 80 }}>
          <Typography>${props.amount.toFixed(2)}</Typography>
        </FlexBox>
      </FlexBox>
    </Section>
  )
}

interface PriceSummaryProps {
  data: BillData
  methods: BillMethods
}

const PriceSummary = ({ data, methods }: PriceSummaryProps) => {
  return (
    <SectionContainer>
      <PriceRow label='SUBTOTAL:' tooltip='Computed as the total of all items before any taxes' amount={methods.computeSubtotal()} />
      {data.serviceTax.enable && <PriceRow label='SERVICE CHARGE:' tooltip={`Computed as ${data.serviceTax.percentage}% of the subtotal`} amount={methods.computeServiceTax()} />}
      {data.gstTax.enable && <PriceRow label='GST:' tooltip={`Computed as ${data.gstTax.percentage}% of the sum of the subtotal and service charge`} amount={methods.computeGstTax()} />}
      <PriceRow label='TOTAL:' tooltip='Computed as the sum of the subtotal, service charge, and GST' amount={methods.computeTotal()} />
    </SectionContainer>
  )
}

export default PriceSummary
