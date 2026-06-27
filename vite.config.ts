/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/anime-adventure/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/github\.com\/danielzaiser91\/anime-adventure\/releases\/download\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-assets',
              expiration: { maxEntries: 250, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/objects\.githubusercontent\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-assets-cdn',
              expiration: { maxEntries: 250, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: 'Chronicles of the Celestial Blade',
        short_name: 'Celestial Blade',
        description: 'Choose your destiny in an anime adventure — forge the Celestial Blade',
        theme_color: '#1a0a2e',
        background_color: '#0d0618',
        display: 'fullscreen',
        orientation: 'any',
        scope: '/anime-adventure/',
        start_url: '/anime-adventure/',
        icons: [
          { src: '/anime-adventure/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/anime-adventure/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/anime-adventure/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
