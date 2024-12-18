import { ChipProps, Chip } from '@mui/material'
import { User } from '../hooks/use-bill'
import FaceIcon from '@mui/icons-material/Face'

interface PersonChipProps {
  user: User
}

const PersonChip = (props: PersonChipProps & ChipProps) => {
  return <Chip size='small' icon={<FaceIcon />} label={props.user.name} variant='outlined' {...props} />
}

export default PersonChip
