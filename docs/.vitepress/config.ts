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

    // Mermaid configuration - Auto theme switching for optimal contrast
    mermaid: {
      // Use 'neutral' theme which adapts better to different backgrounds
      theme: 'neutral',
      // Configure specific colors for better readability
      themeVariables: {
        // Light mode colors (high contrast)
        primaryColor: '#ffffff',
        primaryTextColor: '#1a1a1f', 
        primaryBorderColor: '#2e2e32',
        lineColor: '#2e2e32',
        secondaryColor: '#f6f6f7',
        tertiaryColor: '#e2e2e3',
        background: '#ffffff',
        mainBkg: '#ffffff',
        secondBkg: '#f6f6f7',
        textColor: '#1a1a1f',
        labelTextColor: '#1a1a1f',
        edgeLabelBackground: '#ffffff',
        clusterBkg: '#f6f6f7',
        clusterBorder: '#2e2e32',
        
        // Enhanced colors for flowchart elements
        fillType0: '#ffffff',
        fillType1: '#f6f6f7', 
        fillType2: '#e2e2e3',
        fillType3: '#d1d1d6',
        fillType4: '#c0c0c5',
        fillType5: '#b0b0b5',
        fillType6: '#9f9fa4',
        fillType7: '#8f8f94'
      },
    }
  })
)
