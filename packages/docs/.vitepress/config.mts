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
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/examples' },
    ],
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: '快速开始',
        items: [
          { text: '安装', link: '/examples' },
          { text: '使用', link: '/docs' },
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
