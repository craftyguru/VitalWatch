import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("VitalWatch main.tsx loading...");

// Register Service Worker for comprehensive PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('VitalWatch SW registered: ', registration);
      
      // Register background sync immediately for PWABuilder detection
      if ('sync' in registration && 'SyncManager' in window) {
        try {
          await (registration as any).sync.register('pwabuilder-sync');
          console.log('Background sync registered for PWABuilder detection');
        } catch (syncError) {
          console.log('Background sync registration failed:', syncError);
        }
      }
      
      // Listen for updates to the service worker
      if (registration.waiting) {
        console.log('VitalWatch: New service worker is waiting to activate');
      }
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('VitalWatch: New service worker installed, ready to activate');
            }
          });
        }
      });

      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC_SUCCESS') {
          console.log('VitalWatch: Background sync completed successfully', event.data);
        }
      });


    } catch (registrationError) {
      console.log('VitalWatch SW registration failed: ', registrationError);
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
