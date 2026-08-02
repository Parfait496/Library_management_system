// public/sw.js
//
// Strategy, explained:
// - Navigation requests (loading the app / a route) → NETWORK FIRST.
//   This means every time someone opens the app, it tries to fetch the
//   latest index.html from the server first. Only if they're offline
//   does it fall back to the cached version. This is what prevents the
//   "have to clear browser data to see updates" problem — the app
//   shell is never allowed to go stale while online.
// - Static hashed assets (/static/js/main.abc123.js etc.) → CACHE FIRST.
//   These are safe to cache aggressively forever, because React's build
//   process puts a content hash in the filename — if the file content
//   changes, the filename changes too, so there's never a stale-cache
//   risk here. This is what makes the app fast and installable/offline.
//
// CACHE_VERSION bump forces old caches to be wiped on next deploy.
// You don't need to touch this file per-deploy — it's automatic.

const CACHE_VERSION = 'codex-v1'
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

self.addEventListener('install', (event) => {
  // Activate the new service worker immediately, don't wait for old
  // tabs to close first.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete any cache from a previous version
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('codex-') && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
      // Take control of all open tabs immediately
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Never intercept API calls — those should always go straight to
  // the network and reflect live data.
  if (url.pathname.startsWith('/api/')) return

  // Navigation requests (HTML / route loads) — network first
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          const cache = await caches.open(RUNTIME_CACHE)
          cache.put(request, fresh.clone())
          return fresh
        } catch (err) {
          // Offline fallback — serve last cached shell if we have one
          const cached = await caches.match('/index.html')
          return cached || Response.error()
        }
      })()
    )
    return
  }

  // Hashed static assets — cache first, fall back to network
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        const fresh = await fetch(request)
        const cache = await caches.open(RUNTIME_CACHE)
        cache.put(request, fresh.clone())
        return fresh
      })()
    )
  }
})