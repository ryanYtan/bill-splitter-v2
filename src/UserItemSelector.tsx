import { Alert, Box, Chip, Dialog, Stack, Typography } from '@mui/material'
import { BillData, BillMethods, Item, User } from './hooks/use-bill'
import { useState } from 'react'
import Section from './components/Section/Section'
import AddIcon from '@mui/icons-material/Add'
import PersonChip from './components/PersonChip'
import SectionContainer from './components/Section/SectionContainer'
import FlexBox from './components/FlexBox'
import { NumericFormat } from 'react-number-format'

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
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs'>
        <SectionContainer>
          <Section sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Typography fontWeight='bold' noWrap>
                  {props.item.name}
                </Typography>
                <Typography variant='subtitle2'>
                  <NumericFormat value={props.item.pricePerUnit.toNumber()} displayType='text' thousandSeparator prefix='$' decimalScale={2} fixedDecimalScale /> EA
                </Typography>
                <Typography variant='subtitle2'>QTY: {props.item.quantity.toNumber()}</Typography>
              </Box>
              {props.data.users.length === 0 ? (
                <Alert severity='info'>
                  <Typography>No contributors found. Add a person above to start adding contributors to this item.</Typography>
                </Alert>
              ) : (
                <Typography>Select the users who contributed to this item below. Cost is split evenly among all contributors.</Typography>
              )}
              <FlexBox sx={{ gap: 0.5 }}>
                {props.data.users.map(user => (
                  <PersonChip variant='filled' color={props.methods.itemHasContributor(user.id, props.item.id) ? 'primary' : 'default'} user={user} onClick={() => togglePersonToItem(user)} />
                ))}
              </FlexBox>
            </Stack>
          </Section>
        </SectionContainer>
      </Dialog>
    </>
  )
}

export default UserItemSelector
