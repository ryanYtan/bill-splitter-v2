import { Box, BoxProps } from '@mui/material'

interface SectionProps {
  children?: React.ReactNode
}

const Section = (props: SectionProps & BoxProps) => {
  const { children, ...rest } = props

  return <Box {...rest}>{children}</Box>
}

export default Section
