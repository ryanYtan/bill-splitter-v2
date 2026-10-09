import { BillData, BillMethods } from './hooks/use-bill'
import SectionContainer from './components/Section/SectionContainer'
import Section from './components/Section/Section'
import { Box, Stack, Typography } from '@mui/material'
import FlexBox from './components/FlexBox'
import { formatMoney } from './bill/money'
import { getTotalRows } from './components/total-rows'

interface ReportProps {
  data: BillData
  methods: BillMethods
}

const Report = (props: ReportProps) => {
  const { data, methods } = props

  const totalContributors = new Set(data.userItems.map(ui => ui.userId)).size
  const totalItems = data.items.length
  const paidByName = data.payer ? data.users.find(user => user.id === data.payer)?.name : undefined

  if (!paidByName) {
    return null
  }

  return (
    <SectionContainer>
      <Section sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 'bold' }}>BILL SUMMARY</Typography>
            <Typography variant='subtitle2' sx={{ fontWeight: 400 }}>
              <em>Actual shares may be off by 1-2 cents due to rounding errors</em>
            </Typography>
          </Box>
          <Box>
            <Typography>
              <strong>Total Contributors:</strong> {totalContributors}
            </Typography>
            <Typography>
              <strong>Total Items:</strong> {totalItems}
            </Typography>
            <Typography>
              <strong>Paid By:</strong> {paidByName}
            </Typography>
          </Box>
          <Box>
            {data.users.map(user =>
              data.payer === user.id ? (
                <Typography key={user.id}>
                  <strong>{user.name}</strong> paid for everyone. (<strong>{user.name}</strong>'s share is {formatMoney(methods.computeUserShare(user.id))})
                </Typography>
              ) : (
                <Typography key={user.id}>
                  <strong>{user.name}</strong> owes <strong>{paidByName}</strong> {formatMoney(methods.computeUserShare(user.id))}
                </Typography>
              )
            )}
          </Box>
          <Box>
            {getTotalRows(data, methods).map(({ label, amount }) => (
              <FlexBox key={label}>
                <Box sx={{ width: 120 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>{label}</Typography>
                </Box>
                <Typography>{formatMoney(amount)}</Typography>
              </FlexBox>
            ))}
          </Box>
        </Stack>
      </Section>
    </SectionContainer>
  )
}

export default Report
