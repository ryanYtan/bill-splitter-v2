import { Divider, Paper } from '@mui/material'
import { Children } from 'react'

interface SectionContainerProps {
  children?: React.ReactNode
}

const SectionContainer = (props: SectionContainerProps) => {
  return (
    <Paper>
      {Children.map(props.children, (child, i) => (
        <>
          {i > 0 && child != null && <Divider />}
          {child}
        </>
      ))}
    </Paper>
  )
}

export default SectionContainer
