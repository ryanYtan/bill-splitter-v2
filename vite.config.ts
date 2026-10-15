import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/tools/bill-splitter/',
  server: {
    // There is no local backend: short share links go to the deployed one
    proxy: {
      '/tools/bill-splitter/api': { target: 'https://anmitsu.dev', changeOrigin: true },
    },
  },
})
