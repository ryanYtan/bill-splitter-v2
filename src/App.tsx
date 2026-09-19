import { Alert, Button, CircularProgress, Container, Stack, Typography } from '@mui/material'
import { useSearchParams } from 'react-router'
import Users from './Users'
import useBill, { BillData } from './hooks/use-bill'
import useSharedBill from './hooks/use-shared-bill'
import Items from './Items'
import Taxes from './Taxes'
import PriceSummary from './PriceSummary'
import WhoPaid from './WhoPaid'
import Report from './Report'
import Share from './Share'

const Bill = ({ initial, readOnly }: { initial?: BillData; readOnly?: boolean }) => {
  const { data, methods } = useBill(initial)

  return (
    <>
      <Users data={data} methods={methods} readOnly={readOnly} />
      <Items data={data} methods={methods} readOnly={readOnly} />
      <Taxes data={data} methods={methods} readOnly={readOnly} />
      <PriceSummary data={data} methods={methods} />
      <WhoPaid data={data} methods={methods} readOnly={readOnly} />
      <Report data={data} methods={methods} />
      {!readOnly && data.items.length > 0 && <Share data={data} />}
    </>
  )
}

function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const shared = useSharedBill(searchParams.get('share'))

  const newBillButton = (
    <Button color='inherit' size='small' onClick={() => setSearchParams({})}>
      New bill
    </Button>
  )

  return (
    <Container maxWidth='sm'>
      <Stack spacing={1}>
        <Typography variant='h1'>Bill Splitter</Typography>
        {shared.status === 'none' && <Bill />}
        {shared.status === 'loading' && (
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Stack>
        )}
        {shared.status === 'error' && (
          <Alert severity='error' action={newBillButton}>
            {shared.message}
          </Alert>
        )}
        {shared.status === 'ready' && (
          <>
            <Alert severity='info' action={newBillButton}>
              You&apos;re viewing a shared bill. It can&apos;t be edited.
            </Alert>
            <Bill initial={shared.data} readOnly />
          </>
        )}
      </Stack>
    </Container>
  )
}

export default App
