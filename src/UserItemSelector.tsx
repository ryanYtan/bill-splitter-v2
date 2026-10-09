import { Alert, Chip, Stack, Typography } from '@mui/material'
import { BillData, BillMethods, Item, User } from './hooks/use-bill'
import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import PersonChip from './components/PersonChip'
import ItemSummary from './components/ItemSummary'
import SectionDialog from './components/SectionDialog'
import FlexBox from './components/FlexBox'

interface UserItemSelectorProps {
  data: BillData
  methods: BillMethods
  item: Item
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

  return (
    <>
      <Chip size='small' label='Add Contributor' icon={<AddIcon />} onClick={() => setOpen(true)} />
      <SectionDialog open={open} onClose={() => setOpen(false)}>
        <Stack spacing={2}>
          <ItemSummary item={props.item} />
          {props.data.users.length === 0 ? (
            <Alert severity='info'>
              <Typography>No contributors found. Add a person above to start adding contributors to this item.</Typography>
            </Alert>
          ) : (
            <Typography>Select the users who contributed to this item below. Cost is split evenly among all contributors.</Typography>
          )}
          <FlexBox sx={{ gap: 0.5 }}>
            {props.data.users.map(user => (
              <PersonChip key={user.id} variant='filled' color={props.methods.itemHasContributor(user.id, props.item.id) ? 'primary' : 'default'} user={user} onClick={() => togglePersonToItem(user)} />
            ))}
          </FlexBox>
        </Stack>
      </SectionDialog>
    </>
  )
}

export default UserItemSelector
