import { useState, useEffect, useCallback } from 'react';

interface DeviceCapability {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'unavailable' | 'scanning' | 'connected' | 'error';
  icon: string;
  data?: any;
}

interface BluetoothDevice {
  id: string;
  name: string;
  services: string[];
  connected: boolean;
  rssi?: number;
}

export function useRealDeviceScanner() {
  const [capabilities, setCapabilities] = useState<DeviceCapability[]>([]);
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [realTimeData, setRealTimeData] = useState<any>({});

  // Initialize device capabilities checking
  const initializeCapabilities = useCallback(async () => {
    const caps: DeviceCapability[] = [];

    // Motion Sensors (Real DeviceMotionEvent)
    const motionAvailable = 'DeviceMotionEvent' in window;
    let motionPermission = 'unavailable';
    
    if (motionAvailable) {
      try {
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          motionPermission = permission === 'granted' ? 'available' : 'unavailable';
        } else {
          motionPermission = 'available';
        }
      } catch (error) {
        motionPermission = 'error';
      }
    }

    caps.push({
      id: 'motion',
      name: 'Motion Sensors',
      description: 'Accelerometer & Gyroscope',
      status: motionPermission as any,
      icon: 'activity'
    });

    // GPS Location (Real Geolocation API)
    const locationAvailable = 'geolocation' in navigator;
    let locationStatus = 'unavailable';
    
    if (locationAvailable) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationStatus = 'available';
        setRealTimeData((prev: any) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          }
        }));
      } catch (error) {
        locationStatus = 'error';
      }
    }

    caps.push({
      id: 'location',
      name: 'Location Services',
      description: 'GPS Positioning',
      status: locationStatus as any,
      icon: 'map-pin'
    });

    // Battery Status (Real Battery API)
    const batteryAvailable = 'getBattery' in navigator;
    let batteryStatus = 'unavailable';
    
    if (batteryAvailable) {
      try {
        const battery = await (navigator as any).getBattery();
        batteryStatus = 'available';
        setRealTimeData((prev: any) => ({
          ...prev,
          battery: {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
            timestamp: Date.now()
          }
        }));
      } catch (error) {
        batteryStatus = 'error';
      }
    }

    caps.push({
      id: 'battery',
      name: 'Battery Status',
      description: 'Power Level Monitoring',
      status: batteryStatus as any,
      icon: 'battery'
    });

    // Bluetooth (Real Web Bluetooth API)
    const bluetoothAvailable = 'bluetooth' in navigator;
    const bluetoothStatus = bluetoothAvailable ? 'available' : 'unavailable';

    caps.push({
      id: 'bluetooth',
      name: 'Bluetooth',
      description: 'Device Connectivity',
      status: bluetoothStatus as any,
      icon: 'bluetooth'
    });

    // Network Status (Real Network Information API)
    const networkAvailable = 'onLine' in navigator;
    const networkStatus = networkAvailable && navigator.onLine ? 'available' : 'unavailable';
    
    if (networkAvailable) {
      setRealTimeData((prev: any) => ({
        ...prev,
        network: {
          online: navigator.onLine,
          connectionType: (navigator as any).connection?.effectiveType || '4g',
          downlink: (navigator as any).connection?.downlink || 10,
          rtt: (navigator as any).connection?.rtt || 50,
          timestamp: Date.now()
        }
      }));
    }

    // Add temperature sensor detection (if available)
    let temperatureStatus = 'unavailable';
    if ('AmbientTemperature' in window || 'TemperatureSensor' in window) {
      temperatureStatus = 'available';
      try {
        // Note: Most phones don't expose temperature via web APIs for privacy/security
        setRealTimeData((prev: any) => ({
          ...prev,
          temperature: {
            celsius: null, // Temperature not available in web browsers for security reasons
            active: false,
            reason: 'Not accessible via web browser for privacy'
          }
        }));
      } catch (error) {
        temperatureStatus = 'error';
      }
    }

    caps.push({
      id: 'network',
      name: 'Network Status',
      description: 'Connectivity Monitoring',
      status: networkStatus as any,
      icon: 'wifi'
    });

    // Device Type Detection
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Tablet/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    caps.push({
      id: 'device-type',
      name: 'Device Type',
      description: 'Platform Detection',
      status: 'available',
      icon: 'smartphone',
      data: { type: deviceType, userAgent: navigator.userAgent }
    });

    setCapabilities(caps);
  }, []);

  // Real Bluetooth device scanning
  const scanBluetoothDevices = useCallback(async () => {
    if (!('bluetooth' in navigator)) {
      throw new Error('Bluetooth not supported');
    }

    setIsScanning(true);
    try {
      // Request any Bluetooth device
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'heart_rate',
          'battery_service',
          'device_information',
          'fitness_machine',
          'cycling_power',
          'running_speed_and_cadence'
        ]
      });

      if (device) {
        const newDevice: BluetoothDevice = {
          id: device.id,
          name: device.name || 'Unknown Device',
          services: [],
          connected: false
        };

        // Connect to device and get services
        const server = await device.gatt?.connect();
        if (server) {
          newDevice.connected = true;
          
          try {
            const services = await server.getPrimaryServices();
            newDevice.services = services.map((service: any) => service.uuid);
            
            // Try to read some basic characteristics
            for (const service of services) {
              try {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                  if (char.properties.read) {
                    const value = await char.readValue();
                    // Process characteristic data based on service type
                    if (service.uuid.includes('heart_rate')) {
                      const heartRate = value.getUint8(1);
                      setRealTimeData((prev: any) => ({
                        ...prev,
                        heartRate: { bpm: heartRate, timestamp: Date.now() }
                      }));
                    }
                    if (service.uuid.includes('battery')) {
                      const batteryLevel = value.getUint8(0);
                      setRealTimeData((prev: any) => ({
                        ...prev,
                        deviceBattery: { level: batteryLevel, timestamp: Date.now() }
                      }));
                    }
                  }
                }
              } catch (charError) {
                console.log('Characteristic read error:', charError);
              }
            }
          } catch (serviceError) {
            console.log('Service discovery error:', serviceError);
          }
        }

        setBluetoothDevices(prev => [...prev, newDevice]);
      }
    } catch (error: any) {
      console.error('Bluetooth scan error:', error);
      throw error;
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Start real-time sensor monitoring
  const startRealTimeMonitoring = useCallback(() => {
    // Motion sensor monitoring
    const handleMotion = (event: DeviceMotionEvent) => {
      if (event.acceleration) {
        setRealTimeData((prev: any) => ({
          ...prev,
          motion: {
            acceleration: {
              x: event.acceleration?.x || 0,
              y: event.acceleration?.y || 0,
              z: event.acceleration?.z || 0
            },
            rotationRate: {
              alpha: event.rotationRate?.alpha || 0,
              beta: event.rotationRate?.beta || 0,
              gamma: event.rotationRate?.gamma || 0
            },
            timestamp: Date.now()
          }
        }));
      }
    };

    // Orientation monitoring
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setRealTimeData((prev: any) => ({
        ...prev,
        orientation: {
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0,
          timestamp: Date.now()
        }
      }));
    };

    // Network monitoring
    const handleNetworkChange = () => {
      setRealTimeData((prev: any) => ({
        ...prev,
        network: {
          ...prev.network,
          online: navigator.onLine,
          timestamp: Date.now()
        }
      }));
    };

    // Add event listeners
    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // GPS monitoring
    let watchId: number | undefined = undefined;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setRealTimeData((prev: any) => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              heading: position.coords.heading,
              timestamp: Date.now()
            }
          }));
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }

    // Immediately set initial network state
    handleNetworkChange();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      if (watchId !== undefined && navigator.geolocation && typeof navigator.geolocation.clearWatch === 'function') {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch (error) {
          console.warn('Failed to clear geolocation watch in device scanner:', error);
        }
      }
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeCapabilities();
    const cleanup = startRealTimeMonitoring();
    return cleanup;
  }, [initializeCapabilities, startRealTimeMonitoring]);

  return {
    capabilities,
    bluetoothDevices,
    isScanning,
    realTimeData,
    scanBluetoothDevices,
    initializeCapabilities
  };
}