import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'jspdf',
      'jspdf-autotable',
      'xlsx',
      'react-day-picker',
      'date-fns'
    ],
  },
  build: {
    commonjsOptions: { 
      include: [/jspdf/, /xlsx/, /node_modules/] 
    }
  }
})
