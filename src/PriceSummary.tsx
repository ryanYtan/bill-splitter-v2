import { Box, Stack, Tooltip, Typography } from '@mui/material'
import { Panel, Section } from '@anmitsu/ui'
import { BillData, BillMethods } from './hooks/use-bill'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { formatMoney } from './bill/money'
import { getTotalRows, TotalRow } from './components/total-rows'

const PriceRow = ({ row, total }: { row: TotalRow; total?: boolean }) => {
  return (
    <Stack direction='row' spacing={1} sx={{ alignItems: 'center', px: 2, py: total ? 1.5 : 0.75, ...(total && { borderTop: 1, borderColor: 'divider', bgcolor: 'primary.tint' }) }}>
      <Typography sx={{ fontWeight: total ? 600 : undefined, fontSize: total ? 16 : undefined }}>{row.label}</Typography>
      <Tooltip title={row.tooltip} enterTouchDelay={0}>
        <InfoOutlinedIcon aria-label={row.tooltip} sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Tooltip>
      <Box sx={{ flexGrow: 1 }} />
      <Typography sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: total ? 600 : undefined, fontSize: total ? 18 : undefined }}>{formatMoney(row.amount)}</Typography>
    </Stack>
  )
}

interface PriceSummaryProps {
  data: BillData
  methods: BillMethods
}

const PriceSummary = ({ data, methods }: PriceSummaryProps) => {
  const rows = getTotalRows(data, methods)
  return (
    <Section title='Total'>
      <Panel flush>
        <Box sx={{ pt: 0.75 }}>
          {rows.map((row, i) => (
            <PriceRow key={row.label} row={row} total={i === rows.length - 1} />
          ))}
        </Box>
      </Panel>
    </Section>
  )
}

export default PriceSummary
