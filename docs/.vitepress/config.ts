import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    title: 'Type Game Engine',
    description: 'TypeScript Yields Powerful [Game] Engines - Modern ECS Game Engine Documentation',
    base: '/Type/',
    
    vite: {
      optimizeDeps: { 
        include: [
          '@braintree/sanitize-url',
          'dayjs',
          'debug',
          'cytoscape',
          'cytoscape-cose-bilkent'
        ]
      }
    },

    themeConfig: {
      logo: '/logo.png',
      siteTitle: false,

      search: {
        provider: 'local'
      },
      
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Getting Started', link: '/getting-started' },
        { text: 'Architecture', link: '/architecture' },
        { text: 'API Reference', link: '/api' }
      ],

      sidebar: [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Type?', link: '/' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Quick Start', link: '/quick-start' }
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture' },
            { text: 'TypeEngine', link: '/architecture/type-engine' },
            { text: 'Sub-Engines', link: '/architecture/sub-engines' },
            { text: 'ECS System', link: '/architecture/ecs' }
          ]
        },
        {
          text: 'Components',
          items: [
            { text: 'Overview', link: '/components' },
            { text: 'Drawable Components', link: '/components/drawable' },
            { text: 'Physics Components', link: '/components/physics' },
            { text: 'Input Components', link: '/components/input' }
          ]
        },
        {
          text: 'Systems',
          items: [
            { text: 'Overview', link: '/systems' },
            { text: 'Creating Systems', link: '/systems/creating' },
            { text: 'Built-in Systems', link: '/systems/built-in' }
          ]
        }
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/HenriqueArtur/Type' }
      ],

      footer: {
        message: 'Released under the Academic License.',
        copyright: 'Copyright © 2025 Henrique Artur'
      }
    },

    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }]
    ],

    // Custom CSS variables for theme customization
    markdown: {
      theme: 'github-dark'
    },

    // Mermaid configuration
    mermaid: {
      theme: 'dark'
    }
  })
)
