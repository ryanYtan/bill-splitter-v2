import { Alert, Button } from '@mui/material'
import { AppHeader, Page, PageHeader } from '@anmitsu/ui'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { Link, useSearchParams } from 'react-router'
import Users from './Users'
import useBill, { BillData } from './hooks/use-bill'
import useSharedBill from './hooks/use-shared-bill'
import Items from './Items'
import Taxes from './Taxes'
import PriceSummary from './PriceSummary'
import WhoPaid from './WhoPaid'
import Report from './Report'
import Share from './Share'
import BillSkeleton from './components/BillSkeleton'

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
  const shared = useSharedBill(searchParams.get('share'), searchParams.get('s'))
  const isShared = shared.status !== 'none'

  const newBillButton = (
    <Button color='inherit' size='small' onClick={() => setSearchParams({})}>
      New bill
    </Button>
  )

  return (
    <>
      {/* The name links to the page without its query string, which also leaves a shared bill */}
      <AppHeader icon={<ReceiptLongIcon />} name='Bill Splitter' linkComponent={Link} homeTo='/' maxWidth='sm' />
      <Page maxWidth='sm'>
        <PageHeader title={isShared ? 'Shared bill' : 'Split a bill'}>{isShared ? undefined : 'Add who’s sharing and what everyone had. Service charge and GST are shared out for you.'}</PageHeader>
        {shared.status === 'none' && <Bill />}
        {shared.status === 'loading' && <BillSkeleton />}
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
      </Page>
    </>
  )
}

export default App
