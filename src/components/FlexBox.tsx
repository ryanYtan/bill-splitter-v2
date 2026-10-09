import { Box, BoxProps } from '@mui/material'

const FlexBox = ({ sx, ...rest }: BoxProps) => {
  return (
    <Box
      {...rest}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        ...sx,
      }}
    />
  )
}

export default FlexBox
