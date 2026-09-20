import { Alert, Button, IconButton, InputAdornment, Snackbar, Stack, TextField, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import IosShareIcon from '@mui/icons-material/IosShare'
import TelegramIcon from '@mui/icons-material/Telegram'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import FlexBox from './components/FlexBox'
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

const SHARE_TEXT = 'Here is our bill:'

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

  // The native share sheet (mobile, some desktops) lists every installed app, so it covers more than the fixed buttons below.
  const canNativeShare = typeof navigator.share === 'function'
  const nativeShare = async () => {
    try {
      await navigator.share({ title: 'Bill Splitter', text: SHARE_TEXT, url: link })
    } catch (e) {
      // Dismissing the sheet rejects with AbortError; that is not a failure.
      if (!(e instanceof DOMException && e.name === 'AbortError')) {
        setSnackbar({ message: 'Could not open the share menu. Try copying the link instead.', severity: 'error' })
      }
    }
  }
  const whatsAppHref = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${link}`)}`
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(SHARE_TEXT)}`

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
          <FlexBox>
            {canNativeShare && (
              <Button size='small' variant='outlined' startIcon={<IosShareIcon />} disabled={!link} onClick={nativeShare}>
                Share
              </Button>
            )}
            <Button size='small' variant='outlined' startIcon={<WhatsAppIcon />} disabled={!link} href={whatsAppHref} target='_blank' rel='noopener noreferrer'>
              WhatsApp
            </Button>
            <Button size='small' variant='outlined' startIcon={<TelegramIcon />} disabled={!link} href={telegramHref} target='_blank' rel='noopener noreferrer'>
              Telegram
            </Button>
          </FlexBox>
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
