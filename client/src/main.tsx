import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("VitalWatch main.tsx loading...");

// PWABuilder Compatible Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-pwa.js?v=' + Date.now(), { scope: '/' })
    .then(async function(registration) {
      console.log('VitalWatch SW registered:', registration);
      
      // Wait for SW to be ready
      await navigator.serviceWorker.ready;
      
      // Background Sync Registration
      if ('sync' in registration && 'SyncManager' in window) {
        try {
          await (registration as any).sync.register('sync-tag');
          await (registration as any).sync.register('pwabuilder-sync');
          await (registration as any).sync.register('background-sync');
          console.log('Background sync registered');
        } catch (err) {
          console.debug('Sync registration failed:', err);
        }
      }
      
      // Push Notification Setup
      if ('Notification' in window && 'PushManager' in window) {
        try {
          const permission = await Notification.requestPermission();
          console.log('Notification permission:', permission);
          
          if (permission === 'granted' && registration.pushManager) {
            try {
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: null
              });
              console.log('Push subscription created');
            } catch (subscribeError) {
              console.log('Push subscription failed:', subscribeError);
            }
          }
        } catch (err) {
          console.debug('Push notification setup failed:', err);
        }
      }
        
        // Listen for updates to the service worker
        if (registration.waiting) {
          console.log('VitalWatch: New service worker is waiting to activate');
        }
        
        registration.addEventListener('updatefound', function() {
          const newWorker = registration.installing;
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