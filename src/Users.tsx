import { Alert, Chip, IconButton, InputAdornment, Snackbar, Stack, TextField, Tooltip } from '@mui/material'
import { BillData, BillMethods } from './hooks/use-bill'
import { useState } from 'react'
import { useToastPlacement } from './hooks/use-toast-placement'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import { randomNames } from './constants/constants'
import PersonChip from './components/PersonChip'
import FlexBox from './components/FlexBox'
import SectionContainer from './components/Section/SectionContainer'
import Section from './components/Section/Section'

const Users = ({ data, methods, readOnly }: { data: BillData; methods: BillMethods; readOnly?: boolean }) => {
  if (readOnly && data.users.length === 0) {
    return null
  }

  return (
    <SectionContainer>
      <Section sx={{ p: 2 }}>
        <Stack spacing={1}>
          <FlexBox sx={{ gap: 0.5 }}>
            {data.users.length === 0 ? (
              <>
                <Chip
                  size='small'
                  label='Use the input below to add names'
                  sx={{
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                />
                <Chip
                  size='small'
                  label='(or click the icon on the right for random names)'
                  sx={{
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                />
              </>
            ) : (
              data.users.map(user => <PersonChip key={user.id} user={user} onDelete={readOnly ? undefined : () => methods.removeUser(user.id)} />)
            )}
          </FlexBox>
          {!readOnly && <UserInput data={data} methods={methods} />}
        </Stack>
      </Section>
    </SectionContainer>
  )
}

const UserInput = (props: { data: BillData; methods: BillMethods }) => {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const { snackbarProps, contentSx } = useToastPlacement()

  const addRandomUser = () => {
    const takenNames = new Set(props.data.users.map(user => user.name))
    const availableNames = randomNames.filter(name => !takenNames.has(name))
    if (availableNames.length > 0) {
      props.methods.addUser(availableNames[Math.floor(Math.random() * availableNames.length)])
    }
  }

  // A real form so the mobile keyboard's action key submits (a bare keydown handler is not reliably fired by soft keyboards,
  // and with more inputs below the key would otherwise be "Next" and just move focus).
  const addTypedUser = () => {
    const name = value.trim()
    if (!name) {
      return
    }
    if (name.length > 20) {
      setOpen(true)
      return
    }
    props.methods.addUser(name)
    setValue('')
  }

  return (
    <>
      <form
        onSubmit={e => {
          e.preventDefault()
          addTypedUser()
        }}
      >
        <TextField
          fullWidth
          size='small'
          placeholder='Enter names (RETURN to add name)'
          value={value}
          onChange={e => setValue(e.target.value)}
          slotProps={{
            htmlInput: { enterKeyHint: 'enter' },
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title='Add random name'>
                    <IconButton size='small' onClick={() => addRandomUser()}>
                      <ShuffleIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />
      </form>
      <Snackbar open={open} onClose={() => setOpen(false)} autoHideDuration={5000} {...snackbarProps}>
        <Alert severity='error' sx={contentSx}>
          Please enter a name of 20 characters or fewer
        </Alert>
      </Snackbar>
    </>
  )
}

export default Users
