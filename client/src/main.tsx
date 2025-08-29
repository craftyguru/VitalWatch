import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("VitalWatch main.tsx loading...");

// Register Workbox Service Worker for comprehensive PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('VitalWatch SW registered: ', registration);
      
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
          console.log('VitalWatch: Background sync completed successfully');
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
