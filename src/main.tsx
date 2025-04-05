import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { createTheme, ThemeProvider } from '@mui/material'

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

const PROG = 'bill-splitter-v2'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path={`${PROG}`} element={<App />} />
          <Route path={`${PROG}/s/:slug`} element={<App />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
