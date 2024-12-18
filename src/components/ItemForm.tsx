import { Box, Button, Stack, TextField, Typography, InputAdornment, Alert, Slider } from '@mui/material'
import { useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { BillData, BillMethods } from '../hooks/use-bill'
import FlexBox from './FlexBox'
import Grid from '@mui/material/Grid2'
import BigNumber from 'bignumber.js'

interface ItemFormProps {
  data: BillData
  methods: BillMethods
  onSubmit: () => void
}

const ItemForm = (props: ItemFormProps) => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>()
  const [quantity, setQuantity] = useState(1)
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = () => {
    if (!name) {
      setErrorMessage('Name is required')
      return
    }
    if (!price) {
      setErrorMessage('Price is required')
      return
    }
    if (quantity < 1) {
      setErrorMessage('Quantity must be at least 1')
      return
    }
    if (props.data.items.some(item => item.name === name)) {
      setErrorMessage('Item already exists')
      return
    }
    props.methods.addItem({ name, pricePerUnit: new BigNumber(price), quantity: new BigNumber(quantity) })
    setErrorMessage('')
    setName('')
    setPrice(undefined)
    setQuantity(1)
    props.onSubmit()
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant='h3'>Add an Item</Typography>
        </Box>
        <Box>
          <Typography variant='subtitle2'>Item Name</Typography>
          <TextField autoFocus size='small' fullWidth onChange={e => setName(e.target.value)} />
        </Box>
        <Box>
          <Typography variant='subtitle2'>Price (per unit)</Typography>
          <NumericFormat
            allowLeadingZeros={false}
            allowNegative={false}
            thousandSeparator
            decimalScale={2}
            fixedDecimalScale
            customInput={TextField}
            size='small'
            fullWidth
            slotProps={{
              input: {
                inputProps: {
                  inputMode: 'numeric',
                },
                startAdornment: <InputAdornment position='start'>$</InputAdornment>,
              },
            }}
            value={price}
            onChange={e => setPrice(Number.parseFloat(e.target.value.replace(',', '')))}
          />
        </Box>
        <Box>
          <Typography variant='subtitle2'>Quantity</Typography>
          <Box sx={{ px: 1 }}>
            <Grid container columnSpacing={2}>
              <Grid size={10}>
                <Slider min={1} max={30} step={1} shiftStep={10} marks valueLabelDisplay='auto' value={quantity} onChange={(_, value) => setQuantity(value as number)} />
              </Grid>
              <Grid size='grow'>
                <TextField
                  size='small'
                  fullWidth
                  variant='standard'
                  value={quantity}
                  onChange={e => setQuantity(Number.parseInt(e.target.value))}
                  slotProps={{
                    input: {
                      inputProps: {
                        type: 'number',
                        step: 1,
                        min: 1,
                        max: 30,
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
        {errorMessage && (
          <Alert severity='error'>
            <Typography>{errorMessage}</Typography>
          </Alert>
        )}
        <FlexBox sx={{ justifyContent: 'flex-end' }}>
          <Button variant='contained' type='submit'>
            Add Item
          </Button>
        </FlexBox>
      </Stack>
    </form>
  )
}

export default ItemForm
