import { Alert, Button, Chip, Stack, Typography } from '@mui/material'
import { BillData, BillMethods, Item, User } from './hooks/use-bill'
import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import PersonChip from './components/PersonChip'
import ItemSummary from './components/ItemSummary'
import SectionDialog from './components/SectionDialog'

interface UserItemSelectorProps {
  data: BillData
  methods: BillMethods
  item: Item
  /** Nobody has been picked for the item yet, so it isn't in anyone's share. */
  empty: boolean
}

const UserItemSelector = (props: UserItemSelectorProps) => {
  const [open, setOpen] = useState(false)

  const togglePersonToItem = (user: User) => {
    if (props.methods.itemHasContributor(user.id, props.item.id)) {
      props.methods.removeUserItem(user.id, props.item.id)
    } else {
      props.methods.addUserItem(user.id, props.item.id)
    }
  }

  const close = () => setOpen(false)

  return (
    <>
      <Chip label={props.empty ? 'Who had this?' : 'Change people'} icon={props.empty ? <AddIcon /> : <PeopleOutlinedIcon />} variant='outlined' color={props.empty ? 'warning' : 'default'} onClick={() => setOpen(true)} />
      <SectionDialog
        open={open}
        onClose={close}
        title='Who had this?'
        actions={
          <Button variant='contained' onClick={close}>
            Done
          </Button>
        }
      >
        <Stack spacing={2}>
          <ItemSummary item={props.item} />
          {props.data.users.length === 0 ? (
            <Alert severity='info'>Add the people sharing the bill first, under People.</Alert>
          ) : (
            <>
              <Typography variant='body2' color='textSecondary'>
                Pick everyone who shared it. Its cost is split evenly between them.
              </Typography>
              <Stack direction='row' useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {props.data.users.map(user => {
                  const chosen = props.methods.itemHasContributor(user.id, props.item.id)
                  return <PersonChip key={user.id} color={chosen ? 'primary' : 'default'} variant={chosen ? 'filled' : 'outlined'} icon={chosen ? <CheckIcon /> : undefined} aria-pressed={chosen} user={user} onClick={() => togglePersonToItem(user)} />
                })}
              </Stack>
            </>
          )}
        </Stack>
      </SectionDialog>
    </>
  )
}

export default UserItemSelector
