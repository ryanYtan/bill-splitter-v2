import { Box, BoxProps, Typography } from '@mui/material'
import { formatMoney } from '../bill/money'
import { Item } from '../hooks/use-bill'

const ItemSummary = ({ item, ...rest }: { item: Item } & BoxProps) => {
  return (
    <Box {...rest}>
      <Typography noWrap sx={{ fontWeight: 'bold' }}>
        {item.name}
      </Typography>
      <Typography variant='subtitle2'>{formatMoney(item.pricePerUnit)} EA</Typography>
      <Typography variant='subtitle2'>QTY: {item.quantity.toFixed()}</Typography>
    </Box>
  )
}

export default ItemSummary
