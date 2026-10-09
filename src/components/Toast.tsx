import { Alert, AlertColor, Snackbar, SnackbarProps, useMediaQuery, useTheme } from '@mui/material'

interface ToastProps extends Pick<SnackbarProps, 'open' | 'onClose' | 'autoHideDuration' | 'action'> {
  // Shows the message as a coloured alert. Without it the toast is a plain snackbar, which is the only form that shows `action`.
  severity?: AlertColor
  children?: React.ReactNode
}

const Toast = ({ severity, action, children, ...rest }: ToastProps) => {
  // On mobile the on-screen keyboard covers the bottom edge, so toasts go full-width at the top instead.
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'))
  const snackbarProps: Partial<SnackbarProps> = {
    anchorOrigin: { vertical: isMobile ? 'top' : 'bottom', horizontal: isMobile ? 'center' : 'left' },
    sx: isMobile ? { left: 0, right: 0, top: 0, '&&': { margin: 0 } } : undefined,
  }
  const contentSx = isMobile ? { width: '100%', minWidth: 0, borderRadius: 0, flexGrow: 1 } : undefined

  if (severity) {
    return (
      <Snackbar {...rest} {...snackbarProps}>
        <Alert severity={severity} sx={contentSx}>
          {children}
        </Alert>
      </Snackbar>
    )
  }
  return <Snackbar {...rest} {...snackbarProps} slotProps={{ content: { sx: contentSx } }} message={children} action={action} />
}

export default Toast
