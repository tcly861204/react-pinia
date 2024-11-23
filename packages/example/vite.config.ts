import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'apiServer',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith('/api')) {
            res.end('api server')
          } else {
            next()
          }
        })
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
  },
})
