import { Button, Divider, IconButton, Typography } from '@mui/material'
import { BillData, BillMethods } from './hooks/use-bill'
import { useState } from 'react'
import Section from './components/Section/Section'
import ItemForm from './components/ItemForm'
import DeleteIcon from '@mui/icons-material/Delete'
import UserItemSelector from './UserItemSelector'
import PersonChip from './components/PersonChip'
import SectionContainer from './components/Section/SectionContainer'
import FlexBox from './components/FlexBox'
import ReceiptScanner from './components/ReceiptScanner'
import ItemSummary from './components/ItemSummary'
import SectionDialog from './components/SectionDialog'

const Items = ({ data, methods, readOnly }: { data: BillData; methods: BillMethods; readOnly?: boolean }) => {
  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(false)
  }

  return (
    <>
      <SectionContainer>
        {data.items.length === 0 && (
          <Section sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>{readOnly ? 'This bill has no items' : 'Click ADD ITEM below to add items to this bill'}</Typography>
          </Section>
        )}
        {data.items.map(item => (
          <Section key={item.id} sx={{ p: 2 }}>
            <FlexBox>
              {!readOnly && (
                <FlexBox sx={{ width: 50 }}>
                  <IconButton onClick={() => methods.removeItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </FlexBox>
              )}
              <ItemSummary item={item} sx={{ width: 200 }} />
              <FlexBox sx={{ flex: 1, gap: 0.5 }}>
                {data.users
                  .filter(u => methods.itemHasContributor(u.id, item.id))
                  .map(user => (
                    <PersonChip key={user.id} variant='filled' color='primary' user={user} onDelete={readOnly ? undefined : () => methods.removeUserItem(user.id, item.id)} />
                  ))}
                {!readOnly && <UserItemSelector data={data} methods={methods} item={item} />}
              </FlexBox>
            </FlexBox>
          </Section>
        ))}
        {!readOnly && (
          <Section>
            <FlexBox sx={{ gap: 0, flexWrap: 'nowrap' }}>
              <Button fullWidth onClick={() => setOpen(true)} sx={{ borderRadius: theme => `0px 0px 0px ${theme.shape.borderRadius}px` }}>
                Add Item
              </Button>
              <Divider orientation='vertical' flexItem />
              <ReceiptScanner data={data} methods={methods} />
            </FlexBox>
          </Section>
        )}
      </SectionContainer>
      {!readOnly && (
        <SectionDialog open={open} onClose={onClose}>
          <ItemForm data={data} methods={methods} onSubmit={onClose} />
        </SectionDialog>
      )}
    </>
  )
}

export default Items
