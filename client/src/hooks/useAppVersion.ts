import { useEffect, useState } from 'react';

const APP_VERSION = '5.0.0';

export function useAppVersion() {
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setRegistration(reg);
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setHasUpdate(true);
                }
              });
            }
          });
        }
      });
    }

    // Check version from localStorage
    const storedVersion = localStorage.getItem('app-version');
    if (storedVersion && storedVersion !== APP_VERSION) {
      setHasUpdate(true);
    }
    
    localStorage.setItem('app-version', APP_VERSION);
  }, []);

  const updateApp = async () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for when the new service worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } else {
      // Force reload for version updates
      window.location.reload();
    }
  };

  return {
    currentVersion,
    hasUpdate,
    updateApp
  };
}