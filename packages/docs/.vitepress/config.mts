import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/react-pinia/',
  title: 'react-pinia',
  description: '🍍Building a Minimal State Management for React',
  appearance: 'dark',
  outDir: '../../dist',
  themeConfig: {
    logo: '/assets/favicon.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/quick-start' },
      { text: '文档', link: '/docs' },
      { text: '示例', link: '/examples' },
      { text: 'API', link: '/api' },
    ],
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/quick-start' },
          { text: '使用文档', link: '/docs' },
          { text: '示例代码', link: '/examples' },
          { text: '调试工具', link: '/devtools-guide' },
          { text: '插件系统', link: '/plugin-guide' },
          { text: '中间件系统', link: '/middleware-guide' },
        ],
      },
      {
        text: 'API 参考',
        items: [
          { text: 'API 文档', link: '/api' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/tcly861204/react-pinia' }],
    footer: {
      copyright: 'Copyright © 2024-present tcly861204',
      message: 'Released under the MIT License.',
    },
  },
  head: [['link', { rel: 'icon', type: 'image/png', href: '/assets/favicon.png' }]],
})
