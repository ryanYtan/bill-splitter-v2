import { Alert, IconButton, InputAdornment, Snackbar, Stack, TextField, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useEffect, useState } from 'react'
import { BillData } from './hooks/use-bill'
import { useToastPlacement } from './hooks/use-toast-placement'
import Section from './components/Section/Section'
import SectionContainer from './components/Section/SectionContainer'
import { compressToBase64Url } from './share/codec'
import { serializeBill } from './share/format'

const buildShareUrl = (token: string): string => {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('share', token)
  return url.toString()
}

const Share = ({ data }: { data: BillData }) => {
  const [link, setLink] = useState('')
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' }>()
  const { snackbarProps, contentSx } = useToastPlacement()

  // `data` is a new object on every render, so key the effect on the serialized bill instead
  const json = serializeBill(data)

  useEffect(() => {
    let cancelled = false
    compressToBase64Url(json).then(token => {
      if (!cancelled) {
        setLink(buildShareUrl(token))
      }
    })
    return () => {
      cancelled = true
    }
  }, [json])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setSnackbar({ message: 'Link copied to clipboard', severity: 'success' })
    } catch {
      setSnackbar({ message: 'Could not copy automatically. Please copy the link manually.', severity: 'error' })
    }
  }

  return (
    <SectionContainer>
      <Section sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 'bold' }}>Share this bill</Typography>
          <Typography variant='subtitle2'>Anyone with this link can view (but not edit) the bill as it is right now.</Typography>
          <TextField
            fullWidth
            size='small'
            value={link}
            onFocus={e => e.target.select()}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton size='small' aria-label='Copy link' disabled={!link} onClick={copy}>
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Section>
      <Snackbar open={!!snackbar} onClose={() => setSnackbar(undefined)} autoHideDuration={3000} {...snackbarProps}>
        <Alert severity={snackbar?.severity} sx={contentSx}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </SectionContainer>
  )
}

export default Share
