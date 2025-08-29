// VitalWatch Service Worker with Background Sync and Offline Support
// Built to satisfy PWABuilder requirements without external dependencies

console.log('VitalWatch: Service Worker starting...');

const CACHE_NAME = 'vitalwatch-v6.0.0';
const OFFLINE_CACHE = 'vitalwatch-offline-v6.0.0'; 
const API_CACHE = 'vitalwatch-api-v6.0.0';
const QUEUE_NAME = 'vitalwatch-background-sync';

// Critical resources for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logo.png'
];

// Assets to cache opportunistically
const STATIC_ASSETS = [
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-384x384.png'
];

// Install event - precache critical resources
self.addEventListener('install', event => {
  console.log('VitalWatch: Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(CACHE_NAME).then(cache => {
        console.log('VitalWatch: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES).catch(error => {
          console.warn('VitalWatch: Some critical resources could not be cached:', error);
          // Continue installation even if some resources fail
          return Promise.resolve();
        });
      }),
      // Cache static assets
      caches.open(OFFLINE_CACHE).then(cache => {
        console.log('VitalWatch: Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(error => {
          console.warn('VitalWatch: Some static assets could not be cached:', error);
          return Promise.resolve();
        });
      })
    ])
  );
  
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  console.log('VitalWatch: Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE && cacheName !== API_CACHE) {
              console.log('VitalWatch: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// Background sync queue for offline actions
let backgroundSyncQueue = [];

// Function to add request to background sync queue
function addToBackgroundSyncQueue(request, options = {}) {
  const queueItem = {
    url: request.url,
    method: request.method,
    headers: {},
    body: null,
    timestamp: Date.now()
  };
  
  // Copy headers
  for (let [key, value] of request.headers.entries()) {
    queueItem.headers[key] = value;
  }
  
  // Handle body for POST/PUT requests
  if (request.method === 'POST' || request.method === 'PUT') {
    return request.clone().text().then(body => {
      queueItem.body = body;
      backgroundSyncQueue.push(queueItem);
      console.log('VitalWatch: Added request to background sync queue:', queueItem.url);
      
      // Try to register background sync
      if ('serviceWorker' in self && self.registration && self.registration.sync) {
        return self.registration.sync.register(QUEUE_NAME);
      }
    });
  } else {
    backgroundSyncQueue.push(queueItem);
    console.log('VitalWatch: Added request to background sync queue:', queueItem.url);
    
    if ('serviceWorker' in self && self.registration && self.registration.sync) {
      return self.registration.sync.register(QUEUE_NAME);
    }
  }
}

// Process background sync queue
async function processBackgroundSyncQueue() {
  console.log('VitalWatch: Processing background sync queue, items:', backgroundSyncQueue.length);
  
  const failedItems = [];
  
  for (const item of backgroundSyncQueue) {
    try {
      const requestInit = {
        method: item.method,
        headers: item.headers
      };
      
      if (item.body) {
        requestInit.body = item.body;
      }
      
      const response = await fetch(item.url, requestInit);
      
      if (response.ok) {
        console.log('VitalWatch: Successfully synced:', item.url);
      } else {
        console.warn('VitalWatch: Failed to sync (will retry):', item.url, response.status);
        failedItems.push(item);
      }
    } catch (error) {
      console.warn('VitalWatch: Failed to sync (will retry):', item.url, error);
      failedItems.push(item);
    }
  }
  
  // Update queue with failed items
  backgroundSyncQueue = failedItems;
  
  // Notify clients of successful sync
  if (failedItems.length < backgroundSyncQueue.length) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'BACKGROUND_SYNC_SUCCESS' });
      });
    });
  }
}

// Background sync event handler
self.addEventListener('sync', event => {
  console.log('VitalWatch: Background sync event:', event.tag);
  
  if (event.tag === QUEUE_NAME) {
    event.waitUntil(processBackgroundSyncQueue());
  }
});

// Fetch event handler with comprehensive caching and background sync
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'GET') {
      // GET requests: Cache-first with network fallback
      event.respondWith(
        caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response and update in background
            fetch(request).then(networkResponse => {
              if (networkResponse.ok) {
                caches.open(API_CACHE).then(cache => {
                  cache.put(request, networkResponse.clone());
                });
              }
            }).catch(() => {
              // Network failed, but we have cached response
            });
            return cachedResponse;
          }
          
          // No cached response, try network
          return fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              // Cache successful response
              caches.open(API_CACHE).then(cache => {
                cache.put(request, networkResponse.clone());
              });
            }
            return networkResponse;
          }).catch(error => {
            console.warn('VitalWatch: API request failed and no cache available:', request.url);
            return new Response(JSON.stringify({ error: 'Offline - request will be retried' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
      );
    } else {
      // POST/PUT/DELETE requests: Network-first with background sync fallback
      event.respondWith(
        fetch(request.clone()).then(response => {
          return response;
        }).catch(error => {
          console.log('VitalWatch: Network request failed, adding to background sync queue');
          addToBackgroundSyncQueue(request.clone());
          
          // Return success response to prevent UI errors
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Request queued for background sync',
            queued: true 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
    }
    return;
  }
  
  // Handle navigation requests (HTML pages)
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => {
        // Network failed, try cache
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page
          return caches.match('/offline.html') || caches.match('/');
        });
      })
    );
    return;
  }
  
  // Handle static assets (JS, CSS, images)
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg')) {
    
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            // Cache successful responses
            caches.open(OFFLINE_CACHE).then(cache => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(error => {
          console.warn('VitalWatch: Static asset request failed:', request.url);
          // For images, could return a placeholder
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }
  
  // Default: network-first
  event.respondWith(
    fetch(request).catch(error => {
      return caches.match(request) || caches.match('/offline.html');
    })
  );
});

// Push notification handling
self.addEventListener('push', event => {
  console.log('VitalWatch: Push notification received');
  
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'VitalWatch', body: event.data.text() };
    }
  }
  
  const options = {
    body: payload.body || 'Emergency notification from VitalWatch',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.tag || 'vitalwatch',
    requireInteraction: payload.priority === 'high',
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: payload.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(
      payload.title || 'VitalWatch Emergency Alert',
      options
    )
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('VitalWatch: Notification clicked');
  event.notification.close();
  
  if (event.action === 'view') {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// Message handling from main app
self.addEventListener('message', event => {
  console.log('VitalWatch: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_QUEUE_SIZE') {
    event.ports[0].postMessage({ queueSize: backgroundSyncQueue.length });
  }
});

console.log('VitalWatch: Service Worker loaded and ready for PWA functionality');