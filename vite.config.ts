import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const path = require('path')
const entryDir = path.resolve(__dirname, 'packages')
const outDir = path.resolve(__dirname, 'lib')
export default defineConfig({
  plugins: [react()],
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
      entry: path.resolve(entryDir, 'main.tsx'),
      // 组件库名字
      name: 'react-pinia',
      fileName: 'react-pinia',
      // 输出格式
      formats: ['umd'],
    },
    outDir,
  },
})
