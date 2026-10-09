import { Tooltip, Typography } from '@mui/material'
import FlexBox from './components/FlexBox'
import Section from './components/Section/Section'
import SectionContainer from './components/Section/SectionContainer'
import { BillData, BillMethods } from './hooks/use-bill'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { formatMoney } from './bill/money'
import { getTotalRows, TotalRow } from './components/total-rows'

const PriceRow = (props: TotalRow) => {
  return (
    <Section sx={{ px: 2, py: 1 }}>
      <FlexBox sx={{ justifyContent: 'flex-end' }}>
        <Tooltip title={props.tooltip}>
          <InfoOutlinedIcon fontSize='small' />
        </Tooltip>
        <Typography sx={{ fontWeight: 'bold' }}>{props.label}</Typography>
        <FlexBox sx={{ justifyContent: 'flex-end', width: 80 }}>
          <Typography>{formatMoney(props.amount)}</Typography>
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
      {getTotalRows(data, methods).map(row => (
        <PriceRow key={row.label} {...row} />
      ))}
    </SectionContainer>
  )
}

export default PriceSummary
