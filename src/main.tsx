import '@anmitsu/ui/fonts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ACCENTS, AnmitsuProvider } from '@anmitsu/ui'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* The shared anmitsu.dev look; each app has its own accent (debts lavender, dashboard teal) */}
    <AnmitsuProvider accent={ACCENTS.coral}>
      {/* Vite's `base` (see vite.config.ts) is the single source of the path the app is served under */}
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Routes>
          <Route path='/' element={<App />} />
        </Routes>
      </BrowserRouter>
    </AnmitsuProvider>
  </StrictMode>
)
