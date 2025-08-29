import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("VitalWatch main.tsx loading...");

// PWABuilder Compatible Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // PWABuilder Background Sync registration (exact format expected)
      if ('SyncManager' in window && (reg as any).sync) {
        try { 
          await (reg as any).sync.register('pwabuilder-offline-sync'); 
          console.debug('[PWA] Background Sync tag registered');
        } catch {} 
      }
      
      // Push Notification Setup
      if ('Notification' in window && 'PushManager' in window) {
        try {
          const permission = await Notification.requestPermission();
          console.log('Notification permission:', permission);
          
          if (permission === 'granted' && reg.pushManager) {
            try {
              const subscription = await reg.pushManager.subscribe({
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
        
    } catch (e) {
      console.error('[PWA] SW registration failed', e);
    }
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