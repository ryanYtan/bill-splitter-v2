import { Stack } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { User } from '../hooks/use-bill'
import PersonChip from './PersonChip'

interface PeoplePickerProps {
  users: User[]
  isChosen: (user: User) => boolean
  onToggle: (user: User) => void
  /** Ticks everyone, or clears them all when everyone is already ticked. Offered when there are two or more people. */
  onToggleEveryone?: (choose: boolean) => void
}

/** Toggle chips for picking who had an item. */
const PeoplePicker = ({ users, isChosen, onToggle, onToggleEveryone }: PeoplePickerProps) => {
  const everyone = users.length > 0 && users.every(isChosen)
  return (
    <Stack direction='row' useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
      {users.map(user => {
        const chosen = isChosen(user)
        return <PersonChip key={user.id} color={chosen ? 'primary' : 'default'} variant={chosen ? 'filled' : 'outlined'} icon={chosen ? <CheckIcon /> : undefined} aria-pressed={chosen} user={user} onClick={() => onToggle(user)} />
      })}
      {onToggleEveryone && users.length > 1 && <PersonChip user={{ id: '', name: everyone ? 'Nobody' : 'Everyone' }} variant='outlined' sx={{ borderStyle: 'dashed' }} onClick={() => onToggleEveryone(!everyone)} />}
    </Stack>
  )
}

export default PeoplePicker
