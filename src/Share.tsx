import { AlertColor, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import IosShareIcon from '@mui/icons-material/IosShare'
import TelegramIcon from '@mui/icons-material/Telegram'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import FlexBox from './components/FlexBox'
import { useEffect, useState } from 'react'
import { BillData } from './hooks/use-bill'
import Toast from './components/Toast'
import Section from './components/Section/Section'
import SectionContainer from './components/Section/SectionContainer'
import { compressToBase64Url } from './share/codec'
import { serializeBill } from './share/format'
import { createShortLink } from './share/short-link'

// `share` carries the whole bill in the link; `s` is the id of a bill stored on the server
const buildShareUrl = (param: 'share' | 's', value: string): string => {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set(param, value)
  return url.toString()
}

const SHARE_TEXT = 'Here is our bill:'

const Share = ({ data }: { data: BillData }) => {
  const [token, setToken] = useState<{ json: string; value: string }>()
  // The link is only created on request, since a short link stores the bill on the server
  const [created, setCreated] = useState<{ json: string; link: string; short: boolean }>()
  const [creating, setCreating] = useState(false)
  // The message is kept while the toast fades out, so only `open` is cleared on close
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'success' })

  // Key everything on the serialized bill, so changes that do not affect the link do not discard it
  const json = serializeBill(data)
  const currentToken = token?.json === json ? token.value : undefined
  const current = created?.json === json ? created : undefined
  const link = current?.link ?? ''

  useEffect(() => {
    let cancelled = false
    compressToBase64Url(json).then(value => {
      if (!cancelled) {
        setToken({ json, value })
      }
    })
    return () => {
      cancelled = true
    }
  }, [json])

  const createLink = async () => {
    if (!currentToken) {
      return
    }
    setCreating(true)
    try {
      const id = await createShortLink(currentToken)
      setCreated({ json, link: buildShareUrl('s', id), short: true })
    } catch (e) {
      // The long link holds the whole bill and needs no server, so sharing still works
      console.warn('Could not create a short link', e)
      setCreated({ json, link: buildShareUrl('share', currentToken), short: false })
    } finally {
      setCreating(false)
    }
  }

  const copy = async (successMessage = 'Link copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(link)
      setToast({ open: true, message: successMessage, severity: 'success' })
    } catch {
      setToast({ open: true, message: 'Could not copy automatically. Please copy the link manually.', severity: 'error' })
    }
  }

  // The native share sheet (mobile, some desktops) lists every installed app, so it covers more than the fixed buttons below.
  const canNativeShare = typeof navigator.share === 'function'
  const nativeShare = async () => {
    try {
      await navigator.share({ title: 'Bill Splitter', text: SHARE_TEXT, url: link })
    } catch (e) {
      // Dismissing the sheet rejects with AbortError; that is not a failure. Match by name: not every browser throws a DOMException.
      if ((e as { name?: string } | null)?.name === 'AbortError') {
        return
      }
      // Some browsers keep the previous share pending after the sheet is dismissed and reject the next call
      // (InvalidStateError), so fall back to something that always works rather than showing an error.
      console.warn('navigator.share failed', e)
      await copy('Share menu unavailable, link copied to clipboard')
    }
  }
  const whatsAppHref = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${link}`)}`
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(SHARE_TEXT)}`

  return (
    <SectionContainer>
      <Section sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 'bold' }}>Share this bill</Typography>
          <Typography variant='subtitle2'>Anyone with the link can view (but not edit) the bill as it is right now.{current?.short && ' The link works for 30 days.'}</Typography>
          {!current && (
            <FlexBox>
              <Button size='small' variant='contained' disabled={!currentToken} loading={creating} onClick={createLink}>
                Create link
              </Button>
            </FlexBox>
          )}
          {current && (
            <>
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
                        <IconButton size='small' aria-label='Copy link' disabled={!link} onClick={() => copy()}>
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
            </>
          )}
        </Stack>
      </Section>
      <Toast open={toast.open} onClose={() => setToast(prev => ({ ...prev, open: false }))} autoHideDuration={3000} severity={toast.severity}>
        {toast.message}
      </Toast>
    </SectionContainer>
  )
}

export default Share
