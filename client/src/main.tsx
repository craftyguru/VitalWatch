import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("VitalWatch main.tsx loading...");

// Force clear old SW and register new one for PWABuilder
if ('serviceWorker' in navigator) {
  // Force unregister any existing service workers first
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Unregistered old SW:', registration.scope);
    }
    
    // Register fresh service worker
    navigator.serviceWorker.register('/sw-pwa.js?v=' + Date.now(), { scope: '/' })
      .then(async function(reg) {
        console.log('VitalWatch PWA SW v2.0 registered:', reg);
        
        // Wait for SW to be ready
        await navigator.serviceWorker.ready;
        
        // Register background sync and push notifications
        if ('sync' in reg && 'SyncManager' in window) {
          try {
            await (reg as any).sync.register('background-sync');
            await (reg as any).sync.register('pwabuilder-sync'); 
            await (reg as any).sync.register('user-actions-sync');
            console.log('Background Sync registered');
          } catch (err) {
            console.debug('Sync register failed:', err);
          }
        }
        
        // Request push notification permission
        if ('Notification' in window && 'PushManager' in window) {
          try {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            
            if (permission === 'granted' && reg.pushManager) {
              const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: null // Add your VAPID key here if needed
              });
              console.log('Push subscription created');
            }
          } catch (err) {
            console.debug('Push notification setup failed:', err);
          }
        }
        
        // Listen for updates to the service worker
        if (reg.waiting) {
          console.log('VitalWatch: New service worker is waiting to activate');
        }
        
        reg.addEventListener('updatefound', function() {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', function() {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('VitalWatch: New service worker installed, ready to activate');
              }
            });
          }
        });

        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'BACKGROUND_SYNC_SUCCESS') {
            console.log('VitalWatch: Background sync completed successfully', event.data);
          }
        });
        
      })
      .catch(function(registrationError) {
        console.log('VitalWatch SW registration failed: ', registrationError);
      });
  });
}

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found!");
  } else {
    console.log("Root element found, creating React root...");
    const root = createRoot(rootElement);
    console.log("React root created, rendering App...");
    root.render(<App />);
    console.log("App rendered successfully!");
  }
} catch (error) {
  console.error("Error in main.tsx:", error);
}