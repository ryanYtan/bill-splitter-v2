import { BillData, BillMethods } from './hooks/use-bill.ts'
import SectionContainer from './components/Section/SectionContainer.tsx'
import Section from './components/Section/Section.tsx'
import { Stack, Typography } from '@mui/material'
import PersonChip from './components/PersonChip.tsx'
import FlexBox from './components/FlexBox.tsx'

interface WhoPaidProps {
  data: BillData
  methods: BillMethods
}

const WhoPaid = (props: WhoPaidProps) => {
  const { data, methods } = props

  const setWhoPaid = (userId: string) => {
    if (data.payer === userId) {
      methods.setPayer(undefined)
    } else {
      methods.setPayer(userId)
    }
  }

  if (data.users.length === 0) {
    return null
  }

  return (
    <SectionContainer>
      <Section sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography fontWeight='bold'>Select the person who paid for the bill</Typography>
          <FlexBox sx={{ gap: 0.5, justifyContent: 'center' }}>
            {data.users.map(user => (
              <PersonChip variant='filled' user={user} onClick={() => setWhoPaid(user.id)} color={user.id === data.payer ? 'primary' : 'default'} />
            ))}
          </FlexBox>
        </Stack>
      </Section>
    </SectionContainer>
  )
}

export default WhoPaid
