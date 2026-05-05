import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate: a new SW becomes active automatically (skipWaiting +
      // clientsClaim below). The page itself still needs a reload to pick
      // up new bundles, which is what <PwaUpdatePrompt /> nudges the user
      // to do.
      registerType: 'autoUpdate',

      // Static assets that aren't code-split bundles (favicon, PWA icons)
      // — make sure they're precached so the install screen / offline
      // launch doesn't 404 them.
      includeAssets: [
        'favicon.svg',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
      ],

      // Mirrors the previous public/manifest.json. The plugin emits
      // /manifest.webmanifest based on this and inserts the <link> tag
      // into index.html at build time, so we drop the hand-written
      // public/manifest.json and remove the manual <link> from
      // index.html in this same change.
      manifest: {
        name: 'MomuPay',
        short_name: 'MomuPay',
        description: 'サロンとお客様を、もっと軽やかに。',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FAF6F1',
        theme_color: '#2C2418',
        orientation: 'portrait',
        lang: 'ja',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      workbox: {
        // Precache the bundled JS/CSS/HTML/icons so cold launches can
        // boot from cache. Auth tokens and API responses still go to
        // the network — those are cross-origin (Supabase / n8n) and
        // never match our same-origin precache anyway.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}'],
        // skipWaiting + clientsClaim = the new SW takes over the moment
        // it finishes installing. Combined with autoUpdate above, that
        // means the moment the user revisits, they're on the new SW;
        // the toast then asks them to reload to pick up the new code.
        skipWaiting: true,
        clientsClaim: true,
        // Drop old precache entries when revisions change so storage
        // doesn't bloat over deploys.
        cleanupOutdatedCaches: true,
        // SPA: any in-app navigation falls back to /index.html so
        // /dashboard, /pay, etc. work on cold launch.
        navigateFallback: '/index.html',
        // ...except auth callback, which we want hitting the network so
        // Supabase's hash/code params aren't cached.
        navigateFallbackDenylist: [/^\/auth\//],
      },

      // Disable the auto-registration script. We mount our own
      // <PwaUpdatePrompt /> using `useRegisterSW`, which both
      // registers the SW and surfaces the "update available" state.
      injectRegister: false,

      devOptions: {
        // Don't run the SW in dev — Vite's HMR transport conflicts
        // with workbox's caching and we don't need offline locally.
        enabled: false,
      },
    }),
  ],
})
