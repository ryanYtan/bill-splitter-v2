import { Dialog, DialogProps } from '@mui/material'
import Section from './Section/Section'
import SectionContainer from './Section/SectionContainer'

const SectionDialog = ({ children, ...rest }: Pick<DialogProps, 'open' | 'onClose' | 'children'>) => {
  return (
    <Dialog {...rest} fullWidth maxWidth='xs'>
      <SectionContainer>
        <Section sx={{ p: 2 }}>{children}</Section>
      </SectionContainer>
    </Dialog>
  )
}

export default SectionDialog
