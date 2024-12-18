import React from 'react'
import { Box, BoxProps } from '@mui/material'

const FlexBox = (props: BoxProps & { children?: React.ReactNode }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        ...props.sx,
      }}
    >
      {props.children}
    </Box>
  )
}

export default FlexBox
