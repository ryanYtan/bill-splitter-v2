import { BillData, BillMethods } from './hooks/use-bill.ts'
import SectionContainer from './components/Section/SectionContainer.tsx'
import Section from './components/Section/Section.tsx'
import { Box, Stack, Typography } from '@mui/material'
import FlexBox from './components/FlexBox.tsx'

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
            <Typography fontSize={14} fontWeight='bold'>
              BILL SUMMARY
            </Typography>
            <Typography fontWeight={400} variant='subtitle2'>
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
                <Typography>
                  <strong>{user.name}</strong> paid for everyone. (<strong>{user.name}</strong>'s share is ${methods.computeUserShare(user.id).toFixed(2)})
                </Typography>
              ) : (
                <Typography>
                  <strong>{user.name}</strong> owes <strong>{paidByName}</strong> ${methods.computeUserShare(user.id).toFixed(2)}
                </Typography>
              )
            )}
          </Box>
          <Box>
            <FlexBox>
              <Box sx={{ width: 120 }}>
                <Typography fontWeight='bold'>SUBTOTAL:</Typography>
              </Box>
              <Typography>${methods.computeSubtotal().toFixed(2)}</Typography>
            </FlexBox>
            <FlexBox>
              <Box sx={{ width: 120 }}>
                <Typography fontWeight='bold'>SERVICE CHARGE:</Typography>
              </Box>
              <Typography>${methods.computeServiceTax().toFixed(2)}</Typography>
            </FlexBox>
            <FlexBox>
              <Box sx={{ width: 120 }}>
                <Typography fontWeight='bold'>GST:</Typography>
              </Box>
              <Typography>${methods.computeGstTax().toFixed(2)}</Typography>
            </FlexBox>
            <FlexBox>
              <Box sx={{ width: 120 }}>
                <Typography fontWeight='bold'>TOTAL:</Typography>
              </Box>
              <Typography>${methods.computeTotal().toFixed(2)}</Typography>
            </FlexBox>
          </Box>
        </Stack>
      </Section>
    </SectionContainer>
  )
}

export default Report
