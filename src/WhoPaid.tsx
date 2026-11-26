import { Panel, Section } from '@anmitsu/ui'
import { Stack } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { BillData, BillMethods } from './hooks/use-bill'
import PersonChip from './components/PersonChip'

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

  // A read-only bill names the payer in the summary below
  if (data.users.length === 0 || readOnly) {
    return null
  }

  return (
    <Section title='Who paid?' description='Pick the person who paid. The summary below then shows what everyone owes them.'>
      <Panel>
        <Stack direction='row' useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {data.users.map(user => {
            const paid = user.id === data.payer
            return <PersonChip key={user.id} user={user} variant={paid ? 'filled' : 'outlined'} color={paid ? 'primary' : 'default'} icon={paid ? <CheckIcon /> : undefined} aria-pressed={paid} onClick={() => setWhoPaid(user.id)} />
          })}
        </Stack>
      </Panel>
    </Section>
  )
}

export default WhoPaid
