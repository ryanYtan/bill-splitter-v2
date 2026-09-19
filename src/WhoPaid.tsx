import { BillData, BillMethods } from './hooks/use-bill'
import SectionContainer from './components/Section/SectionContainer'
import Section from './components/Section/Section'
import { Stack, Typography } from '@mui/material'
import PersonChip from './components/PersonChip'
import FlexBox from './components/FlexBox'

interface WhoPaidProps {
  data: BillData
  methods: BillMethods
  readOnly?: boolean
}

const WhoPaid = (props: WhoPaidProps) => {
  const { data, methods, readOnly } = props

  const setWhoPaid = (userId: string) => {
    if (data.payer === userId) {
      methods.setPayer(undefined)
    } else {
      methods.setPayer(userId)
    }
  }

  if (data.users.length === 0 || (readOnly && !data.payer)) {
    return null
  }

  return (
    <SectionContainer>
      <Section sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography sx={{ fontWeight: 'bold' }}>{readOnly ? 'Paid by' : 'Select the person who paid for the bill'}</Typography>
          <FlexBox sx={{ gap: 0.5, justifyContent: 'center' }}>
            {data.users.map(user => (
              <PersonChip key={user.id} variant='filled' user={user} onClick={readOnly ? undefined : () => setWhoPaid(user.id)} color={user.id === data.payer ? 'primary' : 'default'} />
            ))}
          </FlexBox>
        </Stack>
      </Section>
    </SectionContainer>
  )
}

export default WhoPaid
