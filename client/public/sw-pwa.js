/* PWABuilder-detectable Background Sync */
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());

// Queue for storing offline requests
let syncQueue = [];

// Minimal detectable sync handler with actual usage
self.addEventListener('sync', (event) => {
  if (event.tag === 'pwabuilder-sync') {
    event.waitUntil((async () => {
      console.log('[SW] pwabuilder-sync fired - processing queued requests');
      await processQueuedRequests();
    })());
  }
  
  // Handle user action syncs
  if (event.tag === 'user-actions-sync') {
    event.waitUntil(syncUserActions());
  }
});

// Process queued requests when back online
async function processQueuedRequests() {
  while (syncQueue.length > 0) {
    const request = syncQueue.shift();
    try {
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      console.log('Synced queued request:', request.url);
    } catch (error) {
      console.log('Failed to sync request, re-queuing:', request.url);
      syncQueue.unshift(request); // Put it back at the front
      break; // Stop processing if network is still down
    }
  }
}

// Sync user actions (mood entries, emergency data, etc.)
async function syncUserActions() {
  console.log('Syncing user actions...');
  return processQueuedRequests();
}

// Intercept network requests and queue when offline
self.addEventListener('fetch', (event) => {
  // Only handle API requests that modify data
  if (event.request.url.includes('/api/') && 
      (event.request.method === 'POST' || event.request.method === 'PUT' || event.request.method === 'DELETE')) {
    
    event.respondWith(
      fetch(event.request.clone()).catch(async () => {
        // Network failed, queue the request
        const requestData = {
          url: event.request.url,
          method: event.request.method,
          headers: Object.fromEntries(event.request.headers.entries()),
          body: await event.request.clone().text()
        };
        
        syncQueue.push(requestData);
        console.log('Queued offline request:', requestData.url);
        
        // Register sync to process when online
        if (self.registration && self.registration.sync) {
          await self.registration.sync.register('user-actions-sync');
        }
        
        // Return success response so UI doesn't break
        return new Response(JSON.stringify({ 
          success: true, 
          queued: true,
          message: 'Action saved and will sync when online' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  }
});