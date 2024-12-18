import { Container, createTheme, Stack, ThemeProvider, Typography } from '@mui/material'
import Users from './Users'
import useBill from './hooks/use-bill'
import Items from './Items'
import Taxes from './Taxes'
import PriceSummary from './PriceSummary'
import WhoPaid from './WhoPaid.tsx'
import Report from './Report.tsx'

const theme = createTheme({
  typography: {
    fontSize: 12,
    fontFamily: 'Roboto',
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    h3: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
    },
    h4: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 'bold',
    },
  },
})

function App() {
  const { data, methods } = useBill()

  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  )
}

export default App
