import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/react-pinia/',
  title: 'react-pinia',
  description: '🍍Building a Minimal State Management for React',
  themeConfig: {
    logo: '/assets/favicon.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/examples' },
    ],
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/examples' },
          { text: 'Runtime API Examples', link: '/docs' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/tcly861204/react-pinia' }],
  },
})
