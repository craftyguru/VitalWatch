import { useState, useEffect, useCallback } from 'react';

interface SensorData {
  accelerometer: {
    x: number;
    y: number;
    z: number;
    active: boolean;
  };
  gyroscope: {
    alpha: number;
    beta: number;
    gamma: number;
    active: boolean;
  };
  orientation: {
    orientation: number;
    active: boolean;
  };
  location: {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    active: boolean;
  };
  battery: {
    level: number;
    charging: boolean;
    active: boolean;
  };
  heartRate: {
    bpm: number | null;
    active: boolean;
  };
  ambient: {
    light: number | null;
    active: boolean;
  };
}

export function useDeviceSensors() {
  const [sensorData, setSensorData] = useState<SensorData>({
    accelerometer: { x: 0, y: 0, z: 0, active: false },
    gyroscope: { alpha: 0, beta: 0, gamma: 0, active: false },
    orientation: { orientation: 0, active: false },
    location: { latitude: null, longitude: null, accuracy: null, active: false },
    battery: { level: 0, charging: false, active: false },
    heartRate: { bpm: null, active: false },
    ambient: { light: null, active: false }
  });

  const [permissions, setPermissions] = useState({
    accelerometer: 'denied' as PermissionState,
    gyroscope: 'denied' as PermissionState,
    geolocation: 'denied' as PermissionState,
    battery: 'denied' as PermissionState,
    camera: 'denied' as PermissionState
  });

  // Request device permissions
  const requestPermissions = useCallback(async () => {
    try {
      // Request motion permissions (iOS 13+)
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        setPermissions(prev => ({ 
          ...prev, 
          accelerometer: permission === 'granted',
          gyroscope: permission === 'granted'
        }));
      } else {
        setPermissions(prev => ({ 
          ...prev, 
          accelerometer: true,
          gyroscope: true
        }));
      }

      // Request location permission
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => setPermissions(prev => ({ ...prev, location: true })),
          () => setPermissions(prev => ({ ...prev, location: false }))
        );
      }

      // Battery API permission
      if ('getBattery' in navigator) {
        setPermissions(prev => ({ ...prev, battery: true }));
      }

    } catch (error) {
      console.error('Permission request failed:', error);
    }
  }, []);

  // Initialize accelerometer
  useEffect(() => {
    if (!permissions.accelerometer) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (event.acceleration && event.acceleration.x !== null) {
        setSensorData(prev => ({
          ...prev,
          accelerometer: {
            x: event.acceleration?.x || 0,
            y: event.acceleration?.y || 0,
            z: event.acceleration?.z || 0,
            active: true
          }
        }));
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [permissions.accelerometer]);

  // Initialize gyroscope
  useEffect(() => {
    if (!permissions.gyroscope) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setSensorData(prev => ({
        ...prev,
        gyroscope: {
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0,
          active: true
        },
        orientation: {
          orientation: event.alpha || 0,
          active: true
        }
      }));
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [permissions.gyroscope]);

  // Initialize GPS location
  useEffect(() => {
    if (!permissions.location) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setSensorData(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            active: true
          }
        }));
      },
      (error) => {
        console.error('Location error:', error);
        setSensorData(prev => ({
          ...prev,
          location: { ...prev.location, active: false }
        }));
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [permissions.location]);

  // Initialize battery monitoring
  useEffect(() => {
    if (!permissions.battery) return;

    const updateBattery = async () => {
      try {
        const battery = await (navigator as any).getBattery();
        setSensorData(prev => ({
          ...prev,
          battery: {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            active: true
          }
        }));

        battery.addEventListener('levelchange', () => {
          setSensorData(prev => ({
            ...prev,
            battery: {
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              active: true
            }
          }));
        });

        battery.addEventListener('chargingchange', () => {
          setSensorData(prev => ({
            ...prev,
            battery: {
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              active: true
            }
          }));
        });
      } catch (error) {
        console.error('Battery API error:', error);
      }
    };

    updateBattery();
  }, [permissions.battery]);

  // Initialize ambient light sensor
  useEffect(() => {
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          setSensorData(prev => ({
            ...prev,
            ambient: {
              light: sensor.illuminance,
              active: true
            }
          }));
        });
        sensor.start();

        return () => sensor.stop();
      } catch (error) {
        console.error('Ambient light sensor error:', error);
      }
    }
  }, []);

  // Simulate heart rate monitoring (would need actual heart rate sensor or camera)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate heart rate detection through camera/sensor
      const simulatedBPM = 72 + Math.floor(Math.random() * 20) - 10;
      setSensorData(prev => ({
        ...prev,
        heartRate: {
          bpm: simulatedBPM,
          active: true
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return {
    sensorData,
    permissions,
    requestPermissions,
    isConnected: Object.values(permissions).some(p => p)
  };
}