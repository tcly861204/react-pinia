import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const path = require('path')
const entryDir = path.resolve(__dirname, 'src')
const outDir = path.resolve(__dirname, 'lib')
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
    lib: {
      // 入口
      entry: path.resolve(entryDir, 'main.ts'),
      // 组件库名字
      name: 'react-pinia',
      fileName: 'react-pinia',
      // 输出格式
      formats: ['umd', 'es'],
    },
    outDir,
  },
})
