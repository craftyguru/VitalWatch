// VitalWatch Service Worker v7.0.0
self.addEventListener('install', (event) => {
  console.log('VitalWatch SW v7.0.0: Installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('VitalWatch SW v7.0.0: Activating');
  event.waitUntil(clients.claim());
});

// Basic fetch handler to prove SW is controlling (required for PWA installability)
self.addEventListener('fetch', (event) => {
  // Pass through all requests - no caching needed for basic PWA install
});

// PWABuilder Background Sync Detection (exact implementation required)
self.addEventListener('sync', (event) => {
  if (event.tag === 'pwabuilder-offline-sync') {
    event.waitUntil((async () => {
      try { await fetch('/__bg-sync-ping', {method:'POST'}); } catch {}
    })());
  }
});

console.log('VitalWatch Service Worker v7.0.0 loaded and ready');