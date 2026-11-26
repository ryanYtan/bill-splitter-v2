import { Alert, Button, Chip, Stack, Typography } from '@mui/material'
import { BillData, BillMethods, Item, User } from './hooks/use-bill'
import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import PeoplePicker from './components/PeoplePicker'
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

  const chooseEveryone = (choose: boolean) => {
    for (const user of props.data.users) {
      if (choose) {
        props.methods.addUserItem(user.id, props.item.id)
      } else {
        props.methods.removeUserItem(user.id, props.item.id)
      }
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
              <PeoplePicker users={props.data.users} isChosen={user => props.methods.itemHasContributor(user.id, props.item.id)} onToggle={togglePersonToItem} onToggleEveryone={chooseEveryone} />
            </>
          )}
        </Stack>
      </SectionDialog>
    </>
  )
}

export default UserItemSelector
