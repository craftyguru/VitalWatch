import { useState, useEffect } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isGranted: boolean;
  isRegistered: boolean;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<boolean>;
  registerForPush: () => Promise<void>;
}

export function usePushNotifications(): PushNotificationState {
  const [isSupported, setIsSupported] = useState(false);
  const [isGranted, setIsGranted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      // Check current permission status
      setIsGranted(Notification.permission === 'granted');
      
      // Check if already registered
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setIsGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const registerForPush = async (): Promise<void> => {
    if (!isSupported || !isGranted) {
      throw new Error('Push notifications not supported or not granted');
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('Service worker not registered');
      }

      // VAPID public key (would normally be from your push service)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0PiYKz7c4R-KI0G8V9RlFzP2fFwdPVMAyI9lVaM5xyCz8NqVq2VGOb3g';
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(pushSubscription);
      setIsRegistered(true);

      // Send subscription to server
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subscription: pushSubscription,
          userAgent: navigator.userAgent
        })
      });

    } catch (error) {
      console.error('Error registering for push notifications:', error);
      throw error;
    }
  };

  return {
    isSupported,
    isGranted,
    isRegistered,
    subscription,
    requestPermission,
    registerForPush
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}