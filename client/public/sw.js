// VitalWatch Service Worker for TWA
// Provides offline functionality and caching for emergency features

const CACHE_NAME = 'vitalwatch-v6.0.0';
const EMERGENCY_CACHE = 'vitalwatch-emergency-v6.0.0';

// Critical resources that must be cached for emergency functionality
const CRITICAL_RESOURCES = [
  '/'
];

// Emergency-specific resources (only cache non-API URLs)
const EMERGENCY_RESOURCES = [];

// Assets that can be cached opportunistically  
const CACHE_ASSETS = [];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('VitalWatch Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching critical resources');
      // Only try to cache resources that actually exist
      return cache.addAll(CRITICAL_RESOURCES).catch(error => {
        console.warn('Some resources could not be cached:', error);
        // Continue without failing
        return Promise.resolve();
      });
    })
  );
  
  // Allow controlled activation instead of forcing immediate updates
  // self.skipWaiting(); // Disabled to prevent constant updates
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('VitalWatch Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== EMERGENCY_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Allow controlled client claim instead of immediate takeover
  // self.clients.claim(); // Disabled to prevent constant updates
});

// Fetch event - minimal intervention for now
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests, Chrome extension requests, and external requests
  if (request.method !== 'GET' || 
      url.protocol === 'chrome-extension:' ||
      !url.origin.includes(self.location.origin)) {
    return;
  }
  
  // Only handle specific emergency API requests with high priority
  if (url.pathname.includes('/api/send-emergency-alert') || 
      url.pathname.includes('/api/emergency-contacts')) {
    event.respondWith(handleEmergencyRequest(request));
    return;
  }
  
  // Let all other requests pass through normally
  // This prevents the service worker from interfering with normal app operation
});

// Priority handling for emergency requests
async function handleEmergencyRequest(request) {
  try {
    // Always try network first for emergency requests
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.error('Emergency request failed:', error);
    
    // For emergency contacts, try to serve from cache
    if (request.url.includes('/api/emergency-contacts')) {
      const cache = await caches.open(EMERGENCY_CACHE);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return a fallback response for failed emergency alerts
    return new Response(
      JSON.stringify({ 
        error: 'Emergency service temporarily unavailable. Please call 911 directly.',
        fallback: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle regular API requests
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Service temporarily unavailable',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests (pages)
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to main page
    const mainPage = await cache.match('/');
    if (mainPage) {
      return mainPage;
    }
    
    // Ultimate fallback
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>VitalWatch - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui; text-align: center; padding: 50px; }
            .offline { color: #666; margin: 20px 0; }
            .emergency { background: #dc2626; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>VitalWatch</h1>
          <div class="offline">You're currently offline</div>
          <div class="emergency">
            <strong>Emergency?</strong><br>
            Call 911 immediately if you need emergency assistance
          </div>
          <p>Connect to the internet to access all VitalWatch features</p>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle static asset requests
async function handleAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return 404 for missing assets
    return new Response('Asset not found', { status: 404 });
  }
}

// Background sync for emergency alerts
self.addEventListener('sync', event => {
  if (event.tag === 'emergency-alert-sync') {
    event.waitUntil(syncEmergencyAlerts());
  }
});

async function syncEmergencyAlerts() {
  // Handle any queued emergency alerts when connection is restored
  console.log('Syncing emergency alerts...');
  
  try {
    // Check for any pending emergency data in IndexedDB
    // and attempt to send when connection is restored
    const registration = await self.registration;
    const clients = await registration.clients.matchAll();
    
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_EMERGENCY_ALERTS',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Emergency sync failed:', error);
  }
}

// Push notification handling for emergency alerts
self.addEventListener('push', event => {
  if (event.data) {
    const payload = event.data.json();
    
    const options = {
      body: payload.body || 'Emergency notification from VitalWatch',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'emergency',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        payload.title || 'VitalWatch Emergency Alert',
        options
      )
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/?notification=emergency')
    );
  }
});

console.log('VitalWatch Service Worker loaded successfully');