import { Tooltip, Typography } from '@mui/material'
import FlexBox from './components/FlexBox'
import Section from './components/Section/Section'
import SectionContainer from './components/Section/SectionContainer'
import { BillData, BillMethods } from './hooks/use-bill'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

interface PriceSummaryProps {
  data: BillData
  methods: BillMethods
}

const PriceSummary = (props: PriceSummaryProps) => {
  const { data, methods } = props

  return (
    <SectionContainer>
      <Section sx={{ px: 2, py: 1 }}>
        <FlexBox sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title='Computed as the total of all items before any taxes'>
            <InfoOutlinedIcon fontSize='small' />
          </Tooltip>
          <Typography fontWeight='bold'>SUBTOTAL:</Typography>
          <FlexBox sx={{ justifyContent: 'flex-end', width: 80 }}>
            <Typography>${methods.computeSubtotal().toFixed(2)}</Typography>
          </FlexBox>
        </FlexBox>
      </Section>
      {data.serviceTax.enable && (
        <Section sx={{ px: 2, py: 1 }}>
          <FlexBox sx={{ justifyContent: 'flex-end' }}>
            <Tooltip title={`Computed as ${data.serviceTax.percentage}% of the subtotal`}>
              <InfoOutlinedIcon fontSize='small' />
            </Tooltip>
            <Typography fontWeight='bold'>SERVICE CHARGE:</Typography>
            <FlexBox sx={{ justifyContent: 'flex-end', width: 80 }}>
              <Typography>${methods.computeServiceTax().toFixed(2)}</Typography>
            </FlexBox>
          </FlexBox>
        </Section>
      )}
      {data.gstTax.enable && (
        <Section sx={{ px: 2, py: 1 }}>
          <FlexBox sx={{ justifyContent: 'flex-end' }}>
            <Tooltip title={`Computed as ${data.gstTax.percentage}% of the sum of the subtotal and service charge`}>
              <InfoOutlinedIcon fontSize='small' />
            </Tooltip>
            <Typography fontWeight='bold'>GST:</Typography>
            <FlexBox sx={{ justifyContent: 'flex-end', width: 80 }}>
              <Typography>${methods.computeGstTax().toFixed(2)}</Typography>
            </FlexBox>
          </FlexBox>
        </Section>
      )}
      <Section sx={{ px: 2, py: 1 }}>
        <FlexBox sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title={`Computed as the sum of the subtotal, service charge, and GST`}>
            <InfoOutlinedIcon fontSize='small' />
          </Tooltip>
          <Typography fontWeight='bold'>TOTAL:</Typography>
          <FlexBox sx={{ justifyContent: 'flex-end', width: 80 }}>
            <Typography>${methods.computeTotal().toFixed(2)}</Typography>
          </FlexBox>
        </FlexBox>
      </Section>
    </SectionContainer>
  )
}

export default PriceSummary
