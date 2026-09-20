import { Alert, Box, Button, Dialog, LinearProgress, Snackbar, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { BillData, BillMethods } from '../hooks/use-bill'
import { useToastPlacement } from '../hooks/use-toast-placement'
import { parseReceiptText } from '../ocr/parse-receipt'
import { MAX_ITEMS, MAX_TEXT_LENGTH } from '../share/format'
import SectionContainer from './Section/SectionContainer'
import Section from './Section/Section'

type Status = { kind: 'idle' } | { kind: 'scanning'; label: string; progress: number } | { kind: 'error'; message: string }

const ReceiptScanner = ({ data, methods }: { data: BillData; methods: BillMethods }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { snackbarProps, contentSx } = useToastPlacement()
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [added, setAdded] = useState<string[]>([])

  const scan = async (file: File) => {
    setStatus({ kind: 'scanning', label: 'Starting scanner', progress: 0 })
    try {
      // Loaded on demand: the OCR engine and language data are several MB.
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: m => setStatus({ kind: 'scanning', label: m.status, progress: m.progress }),
      })
      let text: string
      try {
        text = (await worker.recognize(file)).data.text
      } finally {
        await worker.terminate()
      }

      // Keep within what a share link can carry, otherwise the sender's own link would be rejected.
      const room = Math.max(0, MAX_ITEMS - data.items.length)
      const parsed = parseReceiptText(text).slice(0, room)
      if (parsed.length === 0) {
        setStatus({ kind: 'error', message: room === 0 ? 'This bill already has the maximum number of items.' : 'No items were found on that receipt. Try a clearer, well-lit, straight-on photo.' })
        return
      }
      setAdded(parsed.map(item => methods.addItem({ ...item, name: item.name.slice(0, MAX_TEXT_LENGTH) })))
      setStatus({ kind: 'idle' })
    } catch {
      setStatus({ kind: 'error', message: 'Could not scan the receipt. Check your connection and try again.' })
    }
  }

  const undo = () => {
    added.forEach(id => methods.removeItem(id))
    setAdded([])
  }

  return (
    <>
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        capture='environment'
        hidden
        onChange={e => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void scan(file)
        }}
      />
      <Button fullWidth onClick={() => inputRef.current?.click()} disabled={status.kind === 'scanning'} sx={{ borderRadius: theme => `0px 0px ${theme.shape.borderRadius}px 0px` }}>
        Scan Receipt
      </Button>
      <Dialog open={status.kind !== 'idle'} onClose={status.kind === 'error' ? () => setStatus({ kind: 'idle' }) : undefined} fullWidth maxWidth='xs'>
        <SectionContainer>
          <Section sx={{ p: 2 }}>
            {status.kind === 'scanning' && (
              <Box>
                <Typography variant='h3' sx={{ mb: 1 }}>
                  Scanning receipt
                </Typography>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  {status.label}
                </Typography>
                <LinearProgress variant={status.progress > 0 ? 'determinate' : 'indeterminate'} value={status.progress * 100} />
              </Box>
            )}
            {status.kind === 'error' && (
              <Box>
                <Alert severity='error' sx={{ mb: 2 }}>
                  {status.message}
                </Alert>
                <Button fullWidth onClick={() => setStatus({ kind: 'idle' })}>
                  Close
                </Button>
              </Box>
            )}
          </Section>
        </SectionContainer>
      </Dialog>
      <Snackbar
        open={added.length > 0}
        {...snackbarProps}
        slotProps={{ content: { sx: contentSx } }}
        autoHideDuration={10000}
        onClose={(_, reason) => reason !== 'clickaway' && setAdded([])}
        message={`Added ${added.length} item${added.length === 1 ? '' : 's'} from receipt`}
        action={
          <Button color='inherit' size='small' onClick={undo}>
            Undo
          </Button>
        }
      />
    </>
  )
}

export default ReceiptScanner
