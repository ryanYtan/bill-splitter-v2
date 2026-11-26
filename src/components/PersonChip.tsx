import { ChipProps, Chip } from '@mui/material'
import { User } from '../hooks/use-bill'

interface PersonChipProps {
  user: User
}

/** A person's name as a tag. `color='primary'` marks them as chosen (eating an item, the payer). */
const PersonChip = ({ user, ...rest }: PersonChipProps & ChipProps) => {
  return <Chip label={user.name} {...rest} />
}

export default PersonChip
