import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    title: 'Type Game Engine',
    description: 'TypeScript Yields Powerful [Game] Engines - Modern ECS Game Engine Documentation',
    base: '/TYPE/',
    
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

    ignoreDeadLinks: true,

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
        { text: 'Components', link: '/components' },
        { text: 'Systems', link: '/systems' },
      ],

      sidebar: [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Type?', link: '/' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Building a Game', link: '/building-a-game' },
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture' },
            { text: 'TypeEngine', link: '/architecture/type-engine' },
            { text: 'Build System', link: '/build' },
            {
              text: 'Sub-Engines',
              collapsed: false,
              items: [
                { text: 'EntityEngine', link: '/architecture/entity-engine' },
                { text: 'RenderEngine', link: '/architecture/render-engine' },
                { text: 'PhysicsEngine', link: '/architecture/physics-engine' },
                { text: 'SceneEngine', link: '/architecture/scene-engine' },
                { text: 'SystemEngine', link: '/architecture/system-engine' },
                { text: 'EventEngine', link: '/architecture/event-engine' },
                { text: 'TimeEngine', link: '/architecture/time-engine' }
              ]
            }
          ]
        },
        {
          text: 'Components',
          items: [
            { text: 'Overview', link: '/components' },
            {
              text: 'Drawable Components',
              collapsed: false,
              items: [
                { text: 'Sprite Component', link: '/components/drawable/sprite' }
              ]
            },
            {
              text: 'Physics Components', 
              collapsed: false,
              items: [
                { text: 'Collider Rectangle', link: '/components/physics/collider-rectangle' },
                { text: 'Rigid Body Rectangle', link: '/components/physics/rigid-body-rectangle' },
                { text: 'Sensor Rectangle', link: '/components/physics/sensor-rectangle' }
              ]
            },
            {
              text: 'Input Components',
              collapsed: false,
              items: [
                { text: 'Mouse Component', link: '/components/input/mouse' }
              ]
            }
          ]
        },
        {
          text: 'Systems',
          items: [
            { text: 'Overview', link: '/systems' },
            {
              text: 'Physics Systems',
              collapsed: false,
              items: [
                { text: 'Physics System', link: '/systems/physics' }
              ]
            },
            {
              text: 'Rendering Systems',
              collapsed: false,
              items: [
                { text: 'Render PIXI System', link: '/systems/render-pixi' }
              ]
            },
            {
              text: 'Input Systems',
              collapsed: false,
              items: [
                { text: 'Mouse System', link: '/systems/input/mouse' }
              ]
            }
          ]
        }
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/HenriqueArtur/TYPE' }
      ],

      footer: {
        message: 'Released under the Academic License.',
        copyright: 'Copyright © 2025 Henrique Artur'
      }
    },

    head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

    // Custom CSS variables for theme customization
    markdown: {
      theme: {
        light: 'github-light',
        dark: 'github-dark'
      }
    },

    // Mermaid configuration - Auto theme switching
    mermaid: {
      theme: 'default'
    }
  })
)
