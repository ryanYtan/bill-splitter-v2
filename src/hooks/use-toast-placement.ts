import { SnackbarProps, useMediaQuery, useTheme } from '@mui/material'

// On mobile the on-screen keyboard covers the bottom edge, so toasts go full-width at the top instead.
export const useToastPlacement = () => {
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'))
  const snackbarProps: Partial<SnackbarProps> = {
    anchorOrigin: { vertical: isMobile ? 'top' : 'bottom', horizontal: isMobile ? 'center' : 'left' },
    sx: isMobile ? { left: 0, right: 0, top: 0, '&&': { margin: 0 } } : undefined,
  }
  const contentSx = isMobile ? { width: '100%', minWidth: 0, borderRadius: 0, flexGrow: 1 } : undefined
  return { snackbarProps, contentSx }
}
