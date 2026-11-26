import { Box, BoxProps, Typography } from '@mui/material'
import { formatMoney } from '../bill/money'
import { Item } from '../hooks/use-bill'

/** An item's name, with its unit price and quantity below. */
const ItemSummary = ({ item, sx, ...rest }: { item: Item } & BoxProps) => {
  return (
    <Box {...rest} sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Typography noWrap sx={{ fontWeight: 500 }}>
        {item.name}
      </Typography>
      <Typography variant='body2' color='textSecondary' sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatMoney(item.pricePerUnit)} × {item.quantity.toFixed()}
      </Typography>
    </Box>
  )
}

export default ItemSummary
