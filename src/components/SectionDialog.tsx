import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface SectionDialogProps {
  open: boolean
  title: React.ReactNode
  /** Left out, the dialog can't be dismissed (and has no close button), such as while a scan runs. */
  onClose?: () => void
  /** Buttons along the bottom. */
  actions?: React.ReactNode
  children?: React.ReactNode
}

/** The standard dialog: a title with a close button, the content, and optional buttons below. Forms use `FormDialog` from @anmitsu/ui instead. */
const SectionDialog = ({ open, title, onClose, actions, children }: SectionDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <span style={{ flexGrow: 1, minWidth: 0 }}>{title}</span>
        {onClose && (
          <IconButton size='small' aria-label='Close' onClick={onClose} sx={{ mr: -0.5 }}>
            <CloseIcon fontSize='small' />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ pb: actions ? 1 : 3 }}>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  )
}

export default SectionDialog
