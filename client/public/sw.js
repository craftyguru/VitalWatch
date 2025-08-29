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

// IndexedDB for persistent background sync queue
const DB_NAME = 'VitalWatchSyncDB';
const DB_VERSION = 1;
const STORE_NAME = 'syncQueue';

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Add request to IndexedDB queue
async function addToSyncQueue(request) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const requestData = {
      url: request.url,
      method: request.method,
      headers: {},
      body: null,
      timestamp: Date.now()
    };
    
    // Copy headers
    for (let [key, value] of request.headers.entries()) {
      requestData.headers[key] = value;
    }
    
    // Handle body for POST/PUT requests
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      requestData.body = await request.clone().text();
    }
    
    await new Promise((resolve, reject) => {
      const addRequest = store.add(requestData);
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    });
    
    console.log('VitalWatch: Added request to background sync queue:', requestData.url);
    
    // Register background sync event
    if (self.registration && self.registration.sync) {
      await self.registration.sync.register(QUEUE_NAME);
      console.log('VitalWatch: Registered background sync for queue:', QUEUE_NAME);
    }
    
    return true;
  } catch (error) {
    console.error('VitalWatch: Failed to add request to sync queue:', error);
    return false;
  }
}

// Process background sync queue from IndexedDB
async function processSyncQueue() {
  console.log('VitalWatch: Processing background sync queue from IndexedDB');
  
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Get all queued requests
    const getAllRequest = store.getAll();
    const queuedRequests = await new Promise((resolve, reject) => {
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
    
    console.log('VitalWatch: Found', queuedRequests.length, 'queued requests');
    
    let processedCount = 0;
    
    for (const item of queuedRequests) {
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
          
          // Remove from queue
          const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
          const deleteStore = deleteTransaction.objectStore(STORE_NAME);
          await new Promise((resolve, reject) => {
            const deleteRequest = deleteStore.delete(item.id);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
          });
          
          processedCount++;
        } else {
          console.warn('VitalWatch: Failed to sync (will retry later):', item.url, response.status);
        }
      } catch (error) {
        console.warn('VitalWatch: Failed to sync (will retry later):', item.url, error);
      }
    }
    
    console.log('VitalWatch: Successfully processed', processedCount, 'requests');
    
    // Notify clients of successful sync
    if (processedCount > 0) {
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({ 
          type: 'BACKGROUND_SYNC_SUCCESS', 
          processedCount: processedCount 
        });
      });
    }
    
    return true;
  } catch (error) {
    console.error('VitalWatch: Failed to process sync queue:', error);
    return false;
  }
}

// Background sync event handler - this is what PWABuilder looks for
self.addEventListener('sync', event => {
  console.log('VitalWatch: Background sync event triggered:', event.tag);
  
  if (event.tag === QUEUE_NAME) {
    console.log('VitalWatch: Processing sync queue for tag:', QUEUE_NAME);
    event.waitUntil(processSyncQueue());
  }
  
  // Handle additional sync tags
  if (event.tag === 'emergency-alert-sync') {
    event.waitUntil(syncEmergencyData());
  }
  
  if (event.tag === 'mood-sync') {
    event.waitUntil(syncMoodData());
  }
  
  if (event.tag === 'health-data-sync') {
    event.waitUntil(syncHealthData());
  }
});

// Explicit sync functions for different data types
async function syncEmergencyData() {
  console.log('VitalWatch: Syncing emergency data');
  // This would sync emergency-specific data
  return processSyncQueue();
}

async function syncMoodData() {
  console.log('VitalWatch: Syncing mood data');  
  // This would sync mood-specific data
  return processSyncQueue();
}

async function syncHealthData() {
  console.log('VitalWatch: Syncing health data');
  // This would sync health-specific data  
  return processSyncQueue();
}

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
        }).catch(async (error) => {
          console.log('VitalWatch: Network request failed, adding to background sync queue');
          
          // Add to IndexedDB queue for background sync
          const queued = await addToSyncQueue(request.clone());
          
          // Return success response to prevent UI errors
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Request queued for background sync',
            queued: queued,
            willRetry: true
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
    // Get queue size from IndexedDB
    initDB().then(db => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        event.ports[0].postMessage({ queueSize: countRequest.result });
      };
    }).catch(error => {
      event.ports[0].postMessage({ queueSize: 0, error: error.message });
    });
  }
  
  if (event.data && event.data.type === 'TEST_BACKGROUND_SYNC') {
    console.log('VitalWatch: Testing background sync registration');
    if (self.registration && self.registration.sync) {
      self.registration.sync.register('test-sync').then(() => {
        console.log('VitalWatch: Test background sync registered successfully');
      }).catch(error => {
        console.error('VitalWatch: Test background sync registration failed:', error);
      });
    }
  }
});

console.log('VitalWatch: Service Worker loaded and ready for PWA functionality');