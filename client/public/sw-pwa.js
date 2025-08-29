/* PWABuilder Complete PWA Implementation v3.0 */
const CACHE_NAME = 'vitalwatch-cache-v3';
const OFFLINE_CACHE = 'vitalwatch-offline-v3';
const SYNC_STORE = 'sync-requests';

// Essential files for offline functionality
const OFFLINE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/assets/vitalwatch-logo.png'
];

self.addEventListener('install', function(e) {
  console.log('SW Installing with offline support...');
  e.waitUntil(
    caches.open(OFFLINE_CACHE).then(function(cache) {
      return cache.addAll(OFFLINE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('SW Activating...');
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Background Sync Storage
const backgroundSyncDB = {
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VitalWatchSync', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          db.createObjectStore(SYNC_STORE, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  },
  
  async addRequest(request) {
    const db = await this.open();
    const tx = db.transaction([SYNC_STORE], 'readwrite');
    const store = tx.objectStore(SYNC_STORE);
    await store.add(request);
  },
  
  async getAllRequests() {
    const db = await this.open();
    const tx = db.transaction([SYNC_STORE], 'readonly');
    const store = tx.objectStore(SYNC_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  async clearRequests() {
    const db = await this.open();
    const tx = db.transaction([SYNC_STORE], 'readwrite');
    const store = tx.objectStore(SYNC_STORE);
    await store.clear();
  }
};

// PWABuilder Background Sync Event Handler
self.addEventListener('sync', function(event) {
  console.log('Background sync event fired:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
  
  if (event.tag === 'pwabuilder-sync') {
    event.waitUntil(doBackgroundSync());
  }
  
  if (event.tag === 'user-actions-sync') {
    event.waitUntil(syncUserActions());
  }
});

// Main background sync function
async function doBackgroundSync() {
  console.log('Performing background sync...');
  try {
    const requests = await backgroundSyncDB.getAllRequests();
    console.log('Found', requests.length, 'requests to sync');
    
    for (const request of requests) {
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      console.log('Synced:', request.url);
    }
    
    await backgroundSyncDB.clearRequests();
    console.log('Background sync completed successfully');
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_SUCCESS',
        synced: requests.length
      });
    });
    
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error;
  }
}

// Sync user actions function
async function syncUserActions() {
  console.log('Syncing user actions...');
  return doBackgroundSync();
}

// Comprehensive fetch handler for offline support and background sync
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // Handle API requests with background sync
  if (url.pathname.includes('/api/') && 
      (event.request.method === 'POST' || event.request.method === 'PUT' || event.request.method === 'DELETE')) {
    
    event.respondWith(
      fetch(event.request.clone()).catch(async function() {
        console.log('API request failed, queuing for background sync');
        
        // Store request for background sync
        const requestData = {
          url: event.request.url,
          method: event.request.method,
          headers: Object.fromEntries(event.request.headers.entries()),
          body: await event.request.clone().text(),
          timestamp: Date.now()
        };
        
        await backgroundSyncDB.addRequest(requestData);
        
        // Register background sync
        if (self.registration && self.registration.sync) {
          try {
            await self.registration.sync.register('background-sync');
            await self.registration.sync.register('pwabuilder-sync');
            await self.registration.sync.register('user-actions-sync');
          } catch (err) {
            console.log('Failed to register background sync:', err);
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          queued: true,
          message: 'Request queued for background sync' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  
  // Handle navigation requests for offline support
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/offline.html');
      })
    );
    return;
  }
  
  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request).then(function(response) {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(function() {
        // Return offline page for failed requests
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Push notification event handler
self.addEventListener('push', function(event) {
  console.log('Push notification received');
  
  let notificationData = {
    title: 'VitalWatch',
    body: 'You have a new notification',
    icon: '/assets/vitalwatch-logo.png',
    badge: '/assets/vitalwatch-logo.png',
    tag: 'vitalwatch-notification'
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open VitalWatch'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ]
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(function(clients) {
        for (let client of clients) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});