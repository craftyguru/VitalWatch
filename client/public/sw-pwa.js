/* PWABuilder Background Sync Implementation v2.0 */
const CACHE_NAME = 'vitalwatch-sync-v1';
const SYNC_STORE = 'sync-requests';

self.addEventListener('install', (e) => {
  console.log('SW Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('SW Activating...');
  e.waitUntil(self.clients.claim());
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

// Fetch event handler for background sync
self.addEventListener('fetch', function(event) {
  // Handle API requests that need background sync
  if (event.request.url.includes('/api/') && 
      (event.request.method === 'POST' || event.request.method === 'PUT' || event.request.method === 'DELETE')) {
    
    event.respondWith(
      fetch(event.request.clone()).catch(async function() {
        console.log('Network request failed, queuing for background sync');
        
        // Store request for background sync
        const requestData = {
          url: event.request.url,
          method: event.request.method,
          headers: Object.fromEntries(event.request.headers.entries()),
          body: await event.request.clone().text(),
          timestamp: Date.now()
        };
        
        await backgroundSyncDB.addRequest(requestData);
        console.log('Request queued for background sync:', requestData.url);
        
        // Register background sync
        if (self.registration && self.registration.sync) {
          try {
            await self.registration.sync.register('background-sync');
            await self.registration.sync.register('pwabuilder-sync');
            await self.registration.sync.register('user-actions-sync');
            console.log('Background sync registered');
          } catch (err) {
            console.log('Failed to register background sync:', err);
          }
        }
        
        // Return response indicating data was queued
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
  }
  
  // Let other requests pass through normally
  return;
});