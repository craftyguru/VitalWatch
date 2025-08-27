import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for TWA/PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('VitalWatch SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('VitalWatch SW registration failed:', error);
      });
  });
}

// Handle PWA install prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('VitalWatch can be installed as an app');
});

window.addEventListener('appinstalled', () => {
  console.log('VitalWatch installed successfully');
  deferredPrompt = null;
});

createRoot(document.getElementById("root")!).render(<App />);
