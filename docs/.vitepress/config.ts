import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Matrix Assignment Analyzer',
  description: 'Mathematical documentation for the Matrix Assignment Sensitivity Analyzer',
  base: '/matrix-assignment-analyzer/',
  
  head: [
    ['script', { src: 'https://polyfill.io/v3/polyfill.min.js?features=es6' }],
    ['script', { id: 'MathJax-script', async: '', src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js' }],
    ['script', {}, `
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
          displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
        }
      };
    `]
  ],

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Mathematical Theory', link: '/theory/' },
      { text: 'Examples', link: '/examples/' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Features', link: '/features' }
        ]
      },
      {
        text: 'Mathematical Theory',
        items: [
          { text: 'Assignment Problem', link: '/theory/assignment-problem' },
          { text: 'Hungarian Algorithm', link: '/theory/hungarian-algorithm' },
          { text: 'Sensitivity Analysis', link: '/theory/sensitivity-analysis' },
          { text: 'Matrix Operations', link: '/theory/matrix-operations' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Hungarian Algorithm', link: '/api/hungarian-algorithm' },
          { text: 'Sensitivity Analysis', link: '/api/sensitivity-analysis' },
          { text: 'Matrix Utilities', link: '/api/matrix-utils' },
          { text: 'Type Definitions', link: '/api/types' }
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Basic Usage', link: '/examples/basic-usage' },
          { text: 'Advanced Scenarios', link: '/examples/advanced' },
          { text: 'Performance Tips', link: '/examples/performance' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/matrix-assignment-analyzer' }
    ],

    editLink: {
      pattern: 'https://github.com/your-username/matrix-assignment-analyzer/edit/main/docs/:path'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Matrix Assignment Analyzer'
    }
  },

  markdown: {
    math: true
  }
})