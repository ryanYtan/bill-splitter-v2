import { IconButton, InputAdornment, TextField } from '@mui/material'
import { FieldRow, FormDialog } from '@anmitsu/ui'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useState } from 'react'
import DecimalField from './DecimalField'
import { typedAmount } from '../bill/decimal-text'
import { BillData, BillMethods } from '../hooks/use-bill'
import BigNumber from 'bignumber.js'
import { MAX_ENTRY_QUANTITY } from '../bill/limits'
import { validateNewItem } from '../bill/validate'

interface ItemFormProps {
  data: BillData
  methods: BillMethods
  onClose: () => void
}

/** The "Add item" dialog. Rendered only while open, so every opening starts with empty fields. */
const ItemForm = (props: ItemFormProps) => {
  const [name, setName] = useState('')
  // As typed (no thousands separators), so a half-typed '12.' is kept
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState(1)

  const onSubmit = async () => {
    const item = { name, pricePerUnit: price === '' ? new BigNumber(NaN) : typedAmount(price), quantity: new BigNumber(quantity) }
    const error = validateNewItem(item, props.data.items)
    if (error) {
      // FormDialog shows the message and keeps the dialog open
      throw new Error(error)
    }
    props.methods.addItem(item)
  }

  const step = (by: number) => setQuantity(q => Math.min(MAX_ENTRY_QUANTITY, Math.max(1, (Number.isNaN(q) ? 0 : q) + by)))

  return (
    <FormDialog title='Add an item' submitLabel='Add item' busyLabel='Adding…' maxWidth='xs' onClose={props.onClose} onSubmit={onSubmit}>
      <TextField autoFocus label='Name' placeholder='e.g. Chicken rice' value={name} onChange={e => setName(e.target.value)} />
      <FieldRow inline>
        {/* No fixedDecimalScale: padding to '.00' while typing puts the caret before the point on phone keyboards */}
        <DecimalField
          allowLeadingZeros={false}
          allowNegative={false}
          thousandSeparator
          decimalScale={2}
          label='Price (each)'
          placeholder='0.00'
          slotProps={{
            htmlInput: { inputMode: 'decimal' },
            input: { startAdornment: <InputAdornment position='start'>$</InputAdornment> },
          }}
          onChange={setPrice}
        />
        <TextField
          label='Quantity'
          value={Number.isNaN(quantity) ? '' : quantity}
          onChange={e => setQuantity(Number.parseInt(e.target.value))}
          slotProps={{
            htmlInput: { inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'center' } },
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <IconButton size='small' edge='start' aria-label='One fewer' disabled={quantity <= 1} onClick={() => step(-1)}>
                    <RemoveIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton size='small' edge='end' aria-label='One more' disabled={quantity >= MAX_ENTRY_QUANTITY} onClick={() => step(1)}>
                    <AddIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </FieldRow>
    </FormDialog>
  )
}

export default ItemForm
