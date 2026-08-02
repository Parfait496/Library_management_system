// src/serviceWorkerRegistration.ts
//
// Registers public/sw.js and — this is the important part — makes
// sure that when a new version deploys, the user's open tab reloads
// itself automatically instead of showing a stale cached app until
// they manually clear browser data.

export function register(): void {
  if (process.env.NODE_ENV !== 'production') return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for a new version every time the app loads
        registration.update()

        // If a new service worker takes over, reload this tab once
        // so the user gets the new version without doing anything.
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return
          refreshing = true
          window.location.reload()
        })
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error)
      })
  })
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister()
    })
  }
}