/* PWABuilder Compatible Implementation v4.0 */
const CACHE_NAME = "vitalwatch-v1";
const urlsToCache = [
  "/",
  "/index.html", 
  "/offline.html",
  "/manifest.json",
  "/logo.png",
  "/assets/vitalwatch-logo.png"
];

// Install event - cache essential resources
self.addEventListener("install", event => {
  console.log('SW installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", event => {
  console.log('SW activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Background Sync with IndexedDB
const DB_NAME = 'VitalWatchSync';
const DB_VERSION = 1;
const STORE_NAME = 'sync-requests';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function addToQueue(requestData) {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME], 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  return store.add(requestData);
}

async function getAllFromQueue() {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME], 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function clearQueue() {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME], 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  return store.clear();
}

// Background Sync Event Handler
self.addEventListener('sync', event => {
  console.log('Background sync event fired:', event.tag);
  
  if (event.tag === 'sync-tag') {
    event.waitUntil(doBackgroundSync());
  }
  
  if (event.tag === 'pwabuilder-sync') {
    event.waitUntil(doBackgroundSync());
  }
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Processing background sync...');
  try {
    const requests = await getAllFromQueue();
    console.log('Found queued requests:', requests.length);
    
    for (const request of requests) {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      console.log('Synced request:', request.url, response.status);
    }
    
    await clearQueue();
    console.log('Background sync completed');
    
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

// Fetch event handler with offline support
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  
  // Handle API requests for background sync
  if (url.pathname.includes('/api/') && 
      (event.request.method === 'POST' || event.request.method === 'PUT' || event.request.method === 'DELETE')) {
    
    event.respondWith(
      fetch(event.request.clone()).catch(async () => {
        console.log('API request failed, queuing for background sync');
        
        const requestData = {
          url: event.request.url,
          method: event.request.method,
          headers: Object.fromEntries(event.request.headers.entries()),
          body: await event.request.clone().text(),
          timestamp: Date.now()
        };
        
        await addToQueue(requestData);
        
        // Register background sync
        if (self.registration && self.registration.sync) {
          try {
            await self.registration.sync.register('sync-tag');
            await self.registration.sync.register('pwabuilder-sync');
            await self.registration.sync.register('background-sync');
            console.log('Background sync registered');
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
  
  // Offline support with cache-first strategy
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        
        // For navigation requests, return offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        
        // For other requests, try cache first
        return caches.match('/offline.html');
      });
    })
  );
});

// Push Notifications Support
self.addEventListener("push", event => {
  console.log('Push notification received');
  
  const data = event.data ? event.data.json() : {
    title: 'VitalWatch',
    body: 'You have a new notification',
    icon: '/assets/vitalwatch-logo.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/assets/vitalwatch-logo.png',
      badge: '/assets/vitalwatch-logo.png',
      tag: 'vitalwatch-notification',
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
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
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