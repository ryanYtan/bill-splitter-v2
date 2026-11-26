import { IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { Panel, Section } from '@anmitsu/ui'
import { BillData, BillMethods } from './hooks/use-bill'
import { useState } from 'react'
import Toast from './components/Toast'
import { validateUserName } from './bill/validate'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import { randomNames } from './constants/constants'
import PersonChip from './components/PersonChip'

const Users = ({ data, methods, readOnly }: { data: BillData; methods: BillMethods; readOnly?: boolean }) => {
  if (readOnly && data.users.length === 0) {
    return null
  }

  return (
    <Section title='People' description={readOnly ? undefined : 'Everyone sharing the bill.'}>
      <Panel>
        <Stack spacing={data.users.length > 0 && !readOnly ? 2 : 0}>
          {data.users.length > 0 && (
            <Stack direction='row' useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {data.users.map(user => (
                <PersonChip key={user.id} user={user} onDelete={readOnly ? undefined : () => methods.removeUser(user.id)} />
              ))}
            </Stack>
          )}
          {!readOnly && <UserInput data={data} methods={methods} />}
        </Stack>
      </Panel>
    </Section>
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
          label='Add a person'
          placeholder='Type a name and press Enter'
          value={value}
          onChange={e => setValue(e.target.value)}
          slotProps={{
            htmlInput: { enterKeyHint: 'enter' },
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title='Add a random name'>
                    <IconButton size='small' edge='end' aria-label='Add a random name' onClick={() => addRandomUser()}>
                      <ShuffleIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />
        {props.data.users.length === 0 && (
          <Typography variant='caption' color='textSecondary' component='p' sx={{ mt: 0.75 }}>
            No names handy? The shuffle button picks one for you.
          </Typography>
        )}
      </form>
      <Toast open={error.open} onClose={() => setError(prev => ({ ...prev, open: false }))} autoHideDuration={5000} severity='error'>
        {error.message}
      </Toast>
    </>
  )
}

export default Users
