import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Optional: You can configure the development server here if needed
  // For example, to run on a specific port:
  // server: {
  //   port: 3000, // Default is 5173
  // },
})
