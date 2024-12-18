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

const Items = ({ data, methods }: { data: BillData; methods: BillMethods }) => {
  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(false)
  }

  return (
    <>
      <SectionContainer>
        {data.items.length === 0 && (
          <Section sx={{ p: 2 }}>
            <Typography fontWeight='bold' sx={{ textAlign: 'center' }}>
              Click ADD ITEM below to add items to this bill
            </Typography>
          </Section>
        )}
        {data.items.map(item => (
          <Section sx={{ p: 2 }}>
            <FlexBox>
              <FlexBox sx={{ width: 50 }}>
                <IconButton onClick={() => methods.removeItem(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </FlexBox>
              <Box sx={{ width: 200 }}>
                <Typography fontWeight='bold' noWrap>
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
                    <PersonChip variant='filled' color='primary' user={user} onDelete={() => methods.removeUserItem(user.id, item.id)} />
                  ))}
                <UserItemSelector data={data} methods={methods} item={item} />
              </FlexBox>
            </FlexBox>
          </Section>
        ))}
        <Section>
          <Button fullWidth onClick={() => setOpen(true)} sx={{ borderRadius: theme => `0px 0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px` }}>
            Add Item
          </Button>
        </Section>
      </SectionContainer>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
        <SectionContainer>
          <Section sx={{ p: 2 }}>
            <ItemForm data={data} methods={methods} onSubmit={onClose} />
          </Section>
        </SectionContainer>
      </Dialog>
    </>
  )
}

export default Items
