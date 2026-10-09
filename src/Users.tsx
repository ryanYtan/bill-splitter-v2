import { Chip, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material'
import { BillData, BillMethods } from './hooks/use-bill'
import { useState } from 'react'
import Toast from './components/Toast'
import { validateUserName } from './bill/validate'
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
  // The message is kept while the toast fades out, so only `open` is cleared on close
  const [error, setError] = useState({ open: false, message: '' })

  // Returns whether the name was accepted
  const addUser = (name: string): boolean => {
    const message = validateUserName(name, props.data.users)
    if (message) {
      setError({ open: true, message })
      return false
    }
    props.methods.addUser(name)
    return true
  }

  const addRandomUser = () => {
    const takenNames = new Set(props.data.users.map(user => user.name))
    const availableNames = randomNames.filter(name => !takenNames.has(name))
    if (availableNames.length > 0) {
      addUser(availableNames[Math.floor(Math.random() * availableNames.length)])
    }
  }

  // A real form so the mobile keyboard's action key submits (a bare keydown handler is not reliably fired by soft keyboards,
  // and with more inputs below the key would otherwise be "Next" and just move focus).
  const addTypedUser = () => {
    const name = value.trim()
    if (!name) {
      return
    }
    if (addUser(name)) {
      setValue('')
    }
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
      <Toast open={error.open} onClose={() => setError(prev => ({ ...prev, open: false }))} autoHideDuration={5000} severity='error'>
        {error.message}
      </Toast>
    </>
  )
}

export default Users
