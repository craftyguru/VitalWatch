import { useState } from 'react';

// Safe fallback hook for device sensors
export const useSafeDeviceSensors = () => {
  const [fallbackData] = useState({
    sensorData: {
      accelerometer: { x: 0, y: 0, z: 0, active: false },
      gyroscope: { alpha: 0, beta: 0, gamma: 0, active: false },
      location: { lat: 0, lng: 0, accuracy: 0, active: false },
      battery: { level: 75, charging: false, active: false },
      ambient: { light: 0, active: false },
      heartRate: { bpm: 0, active: false }
    },
    permissions: {
      accelerometer: 'prompt' as PermissionState,
      gyroscope: 'prompt' as PermissionState,
      geolocation: 'prompt' as PermissionState,
      battery: 'prompt' as PermissionState,
      camera: 'prompt' as PermissionState
    },
    requestPermissions: async () => {
      console.log('Safe fallback: Permission request would happen here');
    },
    isConnected: false
  });

  return fallbackData;
};