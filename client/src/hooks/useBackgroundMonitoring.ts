import { useState, useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

interface BackgroundMonitoringState {
  isActive: boolean;
  isSupported: boolean;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  status: 'idle' | 'starting' | 'active' | 'error';
}

export function useBackgroundMonitoring(): BackgroundMonitoringState {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');
  const workerRef = useRef<Worker | null>(null);
  const { isGranted, isRegistered, requestPermission, registerForPush } = usePushNotifications();

  useEffect(() => {
    // Check if background monitoring is supported
    const supported = 'serviceWorker' in navigator && 'Worker' in window;
    setIsSupported(supported);
    
    // Cleanup on unmount
    return () => {
      stopMonitoring();
    };
  }, []);

  const startMonitoring = async (): Promise<void> => {
    if (!isSupported) {
      throw new Error('Background monitoring not supported');
    }

    setStatus('starting');

    try {
      // Request notification permission if not granted
      if (!isGranted) {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Notification permission required for background monitoring');
        }
      }

      // Register for push notifications if not already registered
      if (!isRegistered) {
        await registerForPush();
      }

      // Register service worker for background tasks
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      // Create a Web Worker for continuous monitoring
      workerRef.current = new Worker('/monitoring-worker.js');
      
      workerRef.current.onmessage = (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'MONITORING_STATUS':
            setIsActive(data.active);
            setStatus(data.active ? 'active' : 'idle');
            break;
          case 'EMERGENCY_DETECTED':
            handleEmergencyDetection(data);
            break;
          case 'HEALTH_ALERT':
            handleHealthAlert(data);
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Monitoring worker error:', error);
        setStatus('error');
      };

      // Start monitoring
      workerRef.current.postMessage({
        type: 'START_MONITORING',
        config: {
          emergencyThresholds: {
            heartRateMin: 50,
            heartRateMax: 120,
            accelerationThreshold: 15,
            fallDetectionEnabled: true
          },
          monitoringInterval: 5000, // 5 seconds
          backgroundSync: true
        }
      });

      // Enable background sync for emergency alerts
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        await (registration as any).sync.register('emergency-alert-sync');
      }

      setStatus('active');
      setIsActive(true);

    } catch (error) {
      console.error('Failed to start background monitoring:', error);
      setStatus('error');
      throw error;
    }
  };

  const stopMonitoring = (): void => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP_MONITORING' });
      workerRef.current.terminate();
      workerRef.current = null;
    }
    
    setIsActive(false);
    setStatus('idle');
  };

  const handleEmergencyDetection = (data: any) => {
    // Handle emergency detection from background monitoring
    console.log('Emergency detected in background:', data);
    
    // Show notification even if app is in background
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('VitalWatch Emergency Alert', {
          body: `Emergency detected: ${data.type}. Tap to open VitalWatch.`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'emergency-alert',
          requireInteraction: true,
          actions: [
            { action: 'open', title: 'Open VitalWatch' },
            { action: 'call911', title: 'Call 911' }
          ]
        } as any);
      });
    }
  };

  const handleHealthAlert = (data: any) => {
    // Handle health alerts from background monitoring
    console.log('Health alert from background monitoring:', data);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('VitalWatch Health Alert', {
          body: data.message,
          icon: '/icons/icon-192x192.png',
          tag: 'health-alert'
        });
      });
    }
  };

  return {
    isActive,
    isSupported,
    startMonitoring,
    stopMonitoring,
    status
  };
}