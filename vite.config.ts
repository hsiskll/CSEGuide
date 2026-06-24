import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Relative paths so the SAME build works in an Android WebView (file://),
  // on GitHub Pages (project subpath), and on any static host.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'CSEGuide — UPSC Smart Reader',
        short_name: 'CSEGuide',
        description: 'A personal UPSC CSE smart reader and learning companion.',
        theme_color: '#0B132B',
        background_color: '#0B132B',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Don't try to cache the Gemini API calls — always go to network.
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
});
