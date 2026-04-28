/**
 * MomuPay service worker.
 *
 * Goal: make the standalone (PWA) launch feel instant by serving the app
 * shell from cache when offline / on flaky cellular, while never caching
 * anything sensitive (auth tokens, API responses).
 *
 * Strategy:
 *   - On install, prefetch the bare app shell (/, /manifest.json, icons)
 *     so first render works without a network round-trip after install.
 *   - At runtime, network-first for everything we DO cache. The cache is
 *     a fallback only — keeps users from seeing a stale build for hours.
 *   - Auth, Supabase, n8n, and anything POST is bypassed entirely. Those
 *     responses MUST come straight from the network every time.
 */

const VERSION = 'v1'
const CACHE = `momupay-shell-${VERSION}`

const SHELL = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/favicon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

/** Anything that should hit the network unconditionally. Adding to this
 *  list is always safer than aggressively caching. */
function shouldBypass(request) {
  const url = new URL(request.url)

  // Non-GET (POST/PUT/DELETE/etc) — never serve from cache.
  if (request.method !== 'GET') return true

  // Cross-origin, non-static-asset hosts: Supabase, n8n, Stripe, etc.
  if (url.origin !== self.location.origin) return true

  // Auth surfaces and any API path — even on the same origin.
  if (
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/login' ||
    url.pathname === '/auth/callback'
  ) return true

  return false
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (shouldBypass(request)) return // let it fall through to the network normally

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache opaque-success same-origin GETs. Don't poison the
        // cache with 404s / 500s / redirects.
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
        }
        return response
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match('/'))),
  )
})
