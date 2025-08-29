import { useEffect, useState } from 'react';

const APP_VERSION = '5.0.0';

export function useAppVersion() {
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Temporarily disable update notifications to prevent popup spam
    // This prevents the constant popup issue during development
    
    // Still store version for future use
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