import { Box, Button, Dialog, IconButton, Typography } from '@mui/material'
import { BillData, BillMethods } from './hooks/use-bill'
import { useState } from 'react'
import Section from './components/Section/Section'
import ItemForm from './components/ItemForm'
import { NumericFormat } from 'react-number-format'
import DeleteIcon from '@mui/icons-material/Delete'
import UserItemSelector from './UserItemSelector'
import PersonChip from './components/PersonChip'
import SectionContainer from './components/Section/SectionContainer'
import FlexBox from './components/FlexBox'
import ReceiptScanner from './components/ReceiptScanner'

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
              <Box sx={{ width: 200 }}>
                <Typography noWrap sx={{ fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
                <Typography variant='subtitle2'>
                  <NumericFormat value={item.pricePerUnit.toNumber()} displayType='text' thousandSeparator prefix='$' decimalScale={2} fixedDecimalScale /> EA
                </Typography>
                <Typography variant='subtitle2'>QTY: {item.quantity.toNumber()}</Typography>
              </Box>
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
            <FlexBox>
              <Button fullWidth onClick={() => setOpen(true)} sx={{ borderRadius: theme => `0px 0px 0px ${theme.shape.borderRadius}px` }}>
                Add Item
              </Button>
              <ReceiptScanner data={data} methods={methods} />
            </FlexBox>
          </Section>
        )}
      </SectionContainer>
      {!readOnly && (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
          <SectionContainer>
            <Section sx={{ p: 2 }}>
              <ItemForm data={data} methods={methods} onSubmit={onClose} />
            </Section>
          </SectionContainer>
        </Dialog>
      )}
    </>
  )
}

export default Items
