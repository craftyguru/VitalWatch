import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("VitalWatch main.tsx loading...");

// Register PWA Service Worker for PWABuilder detection
if ('serviceWorker' in navigator) {
  // Make sure this path serves from the site root
  navigator.serviceWorker.register('/sw-pwa.js', { scope: '/' })
    .then(async (reg) => {
      console.log('VitalWatch PWA SW registered: ', reg);
      
      // Explicit tag registration so scanners can see it
      if ('sync' in reg && 'SyncManager' in window) {
        try {
          await (reg as any).sync.register('pwabuilder-sync');
          console.log('Background Sync tag registered');
        } catch (err) {
          console.debug('Sync register failed (likely blocked or unsupported):', err);
        }
      }
      
      // Listen for updates to the service worker
      if (reg.waiting) {
        console.log('VitalWatch: New service worker is waiting to activate');
      }
      
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
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
      
    })
    .catch((registrationError) => {
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