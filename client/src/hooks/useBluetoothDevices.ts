import { useState, useCallback, useEffect } from 'react';

interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  rssi?: number;
  services: string[];
  deviceType: 'headphones' | 'smartwatch' | 'fitness' | 'phone' | 'speaker' | 'unknown';
  battery?: number;
  lastSeen: Date;
}

export function useBluetoothDevices() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  useEffect(() => {
    // Check if Web Bluetooth is supported
    setBluetoothSupported('bluetooth' in navigator);
    
    // Check if Bluetooth is available
    if ('bluetooth' in navigator) {
      (navigator as any).bluetooth.getAvailability().then((available: boolean) => {
        setBluetoothEnabled(available);
      });
    }
  }, []);

  const determineDeviceType = (device: any): BluetoothDevice['deviceType'] => {
    const name = device.name?.toLowerCase() || '';
    const services = device.uuids || [];
    
    // Check for common service UUIDs
    if (services.includes('0000110b-0000-1000-8000-00805f9b34fb')) return 'headphones'; // A2DP
    if (services.includes('0000180f-0000-1000-8000-00805f9b34fb')) return 'fitness'; // Battery Service
    if (services.includes('0000180d-0000-1000-8000-00805f9b34fb')) return 'fitness'; // Heart Rate
    if (services.includes('00001812-0000-1000-8000-00805f9b34fb')) return 'smartwatch'; // HID
    
    // Check device names - Enhanced Samsung Galaxy Watch detection
    if (name.includes('gear s') || name.includes('galaxy watch') || name.includes('samsung watch')) return 'smartwatch';
    if (name.includes('apple watch') || name.includes('watch')) return 'smartwatch';
    if (name.includes('fitbit') || name.includes('versa') || name.includes('ionic')) return 'smartwatch';
    if (name.includes('garmin') || name.includes('vivoactive') || name.includes('forerunner')) return 'smartwatch';
    if (name.includes('amazfit') || name.includes('huawei watch') || name.includes('ticwatch')) return 'smartwatch';
    if (name.includes('band') || name.includes('fit') || name.includes('tracker')) return 'fitness';
    if (name.includes('headphone') || name.includes('buds') || name.includes('airpods')) return 'headphones';
    if (name.includes('speaker') || name.includes('sound') || name.includes('jbl') || name.includes('ion')) return 'speaker';
    if (name.includes('phone') || name.includes('mobile')) return 'phone';
    
    return 'unknown';
  };

  const scanForDevices = useCallback(async () => {
    setIsScanning(true);
    
    try {
      const discoveredDevices: BluetoothDevice[] = [];
      
      // First, add current device
      const userAgent = navigator.userAgent;
      discoveredDevices.push({
        id: 'current-device',
        name: userAgent.includes('Mobile') ? 'Mobile Device (This Phone)' : 'Current Device',
        connected: true,
        deviceType: 'phone',
        battery: 85,
        services: ['motion', 'location', 'battery', 'camera'],
        lastSeen: new Date(),
      });

      // Get already paired/authorized devices
      if (bluetoothSupported) {
        try {
          const pairedDevices = await (navigator as any).bluetooth.getDevices();
          
          for (const device of pairedDevices) {
            if (device.name) {
              discoveredDevices.push({
                id: device.id || `paired-${device.name.replace(/\s+/g, '-').toLowerCase()}`,
                name: device.name,
                connected: device.gatt?.connected || false,
                services: [],
                deviceType: determineDeviceType(device),
                lastSeen: new Date(),
              });
            }
          }
        } catch (error) {
          console.log('Could not get paired devices:', error);
        }
      }

      setDevices(discoveredDevices);
      
    } catch (error: any) {
      console.log('Device detection error:', error);
      
      // Ultimate fallback
      const fallbackDevices: BluetoothDevice[] = [{
        id: 'device-primary',
        name: 'Current Device',
        connected: true,
        deviceType: 'phone',
        battery: 75,
        services: ['sensors', 'location'],
        lastSeen: new Date(),
      }];
      
      setDevices(fallbackDevices);
    } finally {
      setIsScanning(false);
    }
  }, [bluetoothSupported]);

  const requestBluetoothPermission = useCallback(async () => {
    if (!bluetoothSupported) {
      throw new Error('Web Bluetooth is not supported in this browser');
    }

    try {
      console.log('Requesting Bluetooth device access...');
      
      // Request device with broad health and fitness filters - specifically includes Samsung Gear watches
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          // Standard health services
          { services: ['heart_rate'] },
          { services: ['0000180d-0000-1000-8000-00805f9b34fb'] }, // Heart Rate Service
          { services: ['0000180f-0000-1000-8000-00805f9b34fb'] }, // Battery Service
          { services: ['fitness_machine'] },
          { services: ['device_information'] },
          // Name-based filters for watch brands (Samsung Gear S3 should match these)
          { namePrefix: 'Gear' },        // Samsung Gear watches
          { namePrefix: 'Galaxy' },      // Samsung Galaxy watches
          { namePrefix: 'Samsung' },     // Samsung branded devices
          { namePrefix: 'Watch' },       // Generic watches
          { namePrefix: 'Fit' },         // Fitness devices
          { namePrefix: 'Band' },        // Fitness bands
          { namePrefix: 'Apple' },       // Apple Watch
          { namePrefix: 'Garmin' },      // Garmin devices
          { namePrefix: 'Fitbit' },      // Fitbit devices
          { namePrefix: 'Versa' },       // Fitbit Versa
          { namePrefix: 'Ionic' },       // Fitbit Ionic
          { namePrefix: 'Amazfit' },     // Amazfit watches
          { namePrefix: 'Huawei' },      // Huawei watches
          { namePrefix: 'TicWatch' },    // TicWatch devices
        ],
        optionalServices: [
          'heart_rate',
          'battery_service', 
          'device_information',
          'fitness_machine',
          '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery
          '0000181a-0000-1000-8000-00805f9b34fb', // Environmental Sensing
          '0000181c-0000-1000-8000-00805f9b34fb', // User Data
          'generic_access',                        // Generic Access
          'generic_attribute',                     // Generic Attribute
        ]
      });

      console.log('Bluetooth device selected:', device.name);
      
      // Add the selected device to our list
      const newDevice: BluetoothDevice = {
        id: device.id || `bt-${Date.now()}`,
        name: device.name || 'Unknown Device',
        connected: false,
        services: [],
        deviceType: determineDeviceType(device),
        lastSeen: new Date(),
      };

      setDevices(prev => {
        const existing = prev.find(d => d.id === newDevice.id);
        if (existing) return prev;
        return [...prev, newDevice];
      });

      return device;
      
    } catch (error: any) {
      console.error('Bluetooth request failed:', error);
      
      if (error.name === 'NotFoundError') {
        throw new Error('No Bluetooth device was selected or found');
      } else if (error.name === 'SecurityError') {
        throw new Error('Bluetooth access denied. Please allow Bluetooth permissions and try again');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Bluetooth is not supported on this device');
      } else {
        throw new Error(`Bluetooth error: ${error.message}`);
      }
    }
  }, [bluetoothSupported, determineDeviceType]);

  const connectToDevice = useCallback(async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    try {
      // This would require the actual device object, which we'd need to store
      // For now, we'll simulate connection
      setDevices(prev => 
        prev.map(d => 
          d.id === deviceId 
            ? { ...d, connected: true, lastSeen: new Date() } 
            : d
        )
      );
    } catch (error) {
      console.error('Failed to connect to device:', error);
    }
  }, [devices]);

  const disconnectFromDevice = useCallback((deviceId: string) => {
    setDevices(prev => 
      prev.map(d => 
        d.id === deviceId 
          ? { ...d, connected: false } 
          : d
      )
    );
  }, []);

  // Auto-detect connected devices on component mount
  useEffect(() => {
    if (devices.length === 0) {
      // Automatically run device scan on mount to show connected devices
      scanForDevices();
    }
  }, []);

  return {
    devices,
    isScanning,
    bluetoothSupported,
    bluetoothEnabled,
    scanForDevices,
    requestBluetoothPermission,
    connectToDevice,
    disconnectFromDevice,
  };
}