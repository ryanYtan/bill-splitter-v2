import { Container, Stack, Typography } from '@mui/material'
import Users from './Users'
import useBill from './hooks/use-bill'
import Items from './Items'
import Taxes from './Taxes'
import PriceSummary from './PriceSummary'
import WhoPaid from './WhoPaid.tsx'
import Report from './Report.tsx'
import { useParams } from 'react-router'

function App() {
  const { slug } = useParams()
  const { data, methods } = useBill()

  return (
    <Container maxWidth='sm'>
      <Stack spacing={1}>
        <Typography variant='h1'>Bill Splitter</Typography>
        <Users data={data} methods={methods} />
        <Items data={data} methods={methods} />
        <Taxes data={data} methods={methods} />
        <PriceSummary data={data} methods={methods} />
        <WhoPaid data={data} methods={methods} />
        <Report data={data} methods={methods} />
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </Stack>
    </Container>
  )
}

export default App
