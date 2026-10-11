import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/a/billsplit/',
  server: {
    // There is no local backend: short share links go to the deployed one
    proxy: {
      '/a/billsplit/api': { target: 'https://anmitsu.dev', changeOrigin: true },
    },
  },
})
