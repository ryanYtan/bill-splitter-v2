import { Alert, Button, LinearProgress, Stack, Typography } from '@mui/material'
import DocumentScannerOutlinedIcon from '@mui/icons-material/DocumentScannerOutlined'
import { useRef, useState } from 'react'
import { BillData, BillMethods } from '../hooks/use-bill'
import { parseReceiptText } from '../ocr/parse-receipt'
import { MAX_ITEMS, MAX_TEXT_LENGTH } from '../bill/limits'
import { validateItemFields } from '../bill/validate'
import SectionDialog from './SectionDialog'
import Toast from './Toast'

type Status = { kind: 'idle' } | { kind: 'scanning'; label: string; progress: number } | { kind: 'error'; message: string }

const ReceiptScanner = ({ data, methods }: { data: BillData; methods: BillMethods }) => {
  const inputRef = useRef<HTMLInputElement>(null)
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
      const parsed = parseReceiptText(text)
        .map(item => ({ ...item, name: item.name.slice(0, MAX_TEXT_LENGTH) }))
        .filter(item => !validateItemFields(item))
        .slice(0, room)
      if (parsed.length === 0) {
        setStatus({ kind: 'error', message: room === 0 ? 'This bill already has the maximum number of items.' : 'No items were found on that receipt. Try a clearer, well-lit, straight-on photo.' })
        return
      }
      setAdded(parsed.map(item => methods.addItem(item)))
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
      <Button size='small' startIcon={<DocumentScannerOutlinedIcon />} onClick={() => inputRef.current?.click()} disabled={status.kind === 'scanning'}>
        Scan receipt
      </Button>
      <SectionDialog
        open={status.kind !== 'idle'}
        title={status.kind === 'error' ? 'Couldn’t scan the receipt' : 'Scanning receipt'}
        onClose={status.kind === 'error' ? () => setStatus({ kind: 'idle' }) : undefined}
        actions={
          status.kind === 'error' && (
            <Button variant='outlined' onClick={() => setStatus({ kind: 'idle' })}>
              Close
            </Button>
          )
        }
      >
        {status.kind === 'scanning' && (
          <Stack spacing={1}>
            <Typography variant='body2' color='textSecondary' sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
              {status.label}
            </Typography>
            <LinearProgress variant={status.progress > 0 ? 'determinate' : 'indeterminate'} value={status.progress * 100} />
          </Stack>
        )}
        {status.kind === 'error' && <Alert severity='error'>{status.message}</Alert>}
      </SectionDialog>
      <Toast
        open={added.length > 0}
        autoHideDuration={10000}
        onClose={(_, reason) => reason !== 'clickaway' && setAdded([])}
        action={
          <Button color='inherit' size='small' onClick={undo}>
            Undo
          </Button>
        }
      >
        {`Added ${added.length} item${added.length === 1 ? '' : 's'} from receipt`}
      </Toast>
    </>
  )
}

export default ReceiptScanner
