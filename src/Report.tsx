import { BillData, BillMethods } from './hooks/use-bill'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { ListRow, Panel, Rows, Section, Stat, Stats } from '@anmitsu/ui'
import { formatMoney } from './bill/money'

interface ReportProps {
  data: BillData
  methods: BillMethods
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const Report = (props: ReportProps) => {
  const { data, methods } = props

  const totalContributors = new Set(data.userItems.map(ui => ui.userId)).size
  const totalItems = data.items.length
  const paidByName = data.payer ? data.users.find(user => user.id === data.payer)?.name : undefined

  if (!paidByName) {
    return null
  }

  return (
    <Section title='Summary' description='Shares may be a cent or two off the total because each one is rounded.'>
      <Stack spacing={1.5}>
        <Stats>
          <Stat label='Total' note={`${count(totalItems, 'item', 'items')}, split between ${count(totalContributors, 'person', 'people')}`}>
            {formatMoney(methods.computeTotal())}
          </Stat>
          <Stat label='Paid by'>{paidByName}</Stat>
        </Stats>
        <Panel flush>
          <Rows>
            {data.users.map(user => {
              const paid = data.payer === user.id
              return (
                <ListRow key={user.id}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{user.name}</Typography>
                      {paid && <Chip label='Paid' color='success' />}
                    </Stack>
                    <Typography variant='body2' color='textSecondary'>
                      {paid ? 'Their own share' : `Owes ${paidByName}`}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: paid ? 'text.secondary' : undefined }}>{formatMoney(methods.computeUserShare(user.id))}</Typography>
                </ListRow>
              )
            })}
          </Rows>
        </Panel>
      </Stack>
    </Section>
  )
}

export default Report
