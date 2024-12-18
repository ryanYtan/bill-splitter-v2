import { Alert, Chip, IconButton, InputAdornment, Snackbar, Stack, TextField, Tooltip } from '@mui/material'
import { BillData, BillMethods } from './hooks/use-bill'
import { useState } from 'react'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import { randomNames } from './constants/constants'
import PersonChip from './components/PersonChip'
import FlexBox from './components/FlexBox'
import SectionContainer from './components/Section/SectionContainer'
import Section from './components/Section/Section'

const Users = ({ data, methods }: { data: BillData; methods: BillMethods }) => {
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
              data.users.map(user => <PersonChip user={user} onDelete={() => methods.removeUser(user.id)} />)
            )}
          </FlexBox>
          <UserInput data={data} methods={methods} />
        </Stack>
      </Section>
    </SectionContainer>
  )
}

const UserInput = (props: { data: BillData; methods: BillMethods }) => {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  const generateRandomName = (): string => {
    const generatedNames = new Set<string>()
    while (true) {
      const r = randomNames[Math.floor(Math.random() * randomNames.length)]
      if (!props.data.users.find(user => user.name === r)) {
        return r
      }
      generatedNames.add(r)
      if (generatedNames.size === randomNames.length) {
        break
      }
    }
    return ''
  }

  const addRandomUser = () => {
    const randomName = generateRandomName()
    if (randomName !== '') {
      props.methods.addUser(randomName)
    }
  }

  return (
    <>
      <TextField
        fullWidth
        size='small'
        placeholder='Enter names (RETURN to add name)'
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !!value) {
            e.preventDefault()
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
        }}
        slotProps={{
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
      <Snackbar open={open} onClose={() => setOpen(false)} autoHideDuration={5000}>
        <Alert severity='error'>Please enter a name less than 20 characters</Alert>
      </Snackbar>
    </>
  )
}

export default Users
