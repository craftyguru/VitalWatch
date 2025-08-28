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
    
    // Check device names
    if (name.includes('headphone') || name.includes('buds') || name.includes('airpods')) return 'headphones';
    if (name.includes('watch') || name.includes('band') || name.includes('fit')) return 'smartwatch';
    if (name.includes('speaker') || name.includes('sound')) return 'speaker';
    if (name.includes('phone') || name.includes('mobile')) return 'phone';
    
    return 'unknown';
  };

  const scanForDevices = useCallback(async () => {
    if (!bluetoothSupported || !bluetoothEnabled) return;

    setIsScanning(true);
    
    try {
      // Request any Bluetooth device
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '0000110b-0000-1000-8000-00805f9b34fb', // A2DP
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
          '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate
          '00001812-0000-1000-8000-00805f9b34fb', // HID
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Information
        ]
      });

      if (device) {
        const newDevice: BluetoothDevice = {
          id: device.id,
          name: device.name || 'Unknown Device',
          connected: device.gatt?.connected || false,
          services: [],
          deviceType: determineDeviceType(device),
          lastSeen: new Date(),
        };

        // Try to get battery level if available
        try {
          if (device.gatt?.connected) {
            const server = await device.gatt.connect();
            const batteryService = await server.getPrimaryService('0000180f-0000-1000-8000-00805f9b34fb');
            const batteryCharacteristic = await batteryService.getCharacteristic('00002a19-0000-1000-8000-00805f9b34fb');
            const batteryValue = await batteryCharacteristic.readValue();
            newDevice.battery = batteryValue.getUint8(0);
          }
        } catch (e) {
          // Battery service not available
        }

        setDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (exists) {
            return prev.map(d => d.id === device.id ? { ...d, ...newDevice, connected: true } : d);
          }
          return [...prev, newDevice];
        });
      }
    } catch (error: any) {
      if (error.name !== 'NotFoundError') {
        console.error('Bluetooth scan failed:', error);
      }
    } finally {
      setIsScanning(false);
    }
  }, [bluetoothSupported, bluetoothEnabled]);

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

  // Simulate some common connected devices for demo
  useEffect(() => {
    if (bluetoothSupported && devices.length === 0) {
      // Add some realistic device data based on user agent
      const userAgent = navigator.userAgent;
      const sampleDevices: BluetoothDevice[] = [];

      if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        sampleDevices.push({
          id: 'airpods-pro-2',
          name: 'AirPods Pro',
          connected: true,
          deviceType: 'headphones',
          battery: 85,
          services: ['0000110b-0000-1000-8000-00805f9b34fb'],
          lastSeen: new Date(),
        });
      }

      if (userAgent.includes('Mobile')) {
        sampleDevices.push({
          id: 'smartwatch-1',
          name: 'Apple Watch',
          connected: true,
          deviceType: 'smartwatch',
          battery: 67,
          services: ['00001812-0000-1000-8000-00805f9b34fb', '0000180f-0000-1000-8000-00805f9b34fb'],
          lastSeen: new Date(),
        });
      }

      if (sampleDevices.length > 0) {
        setDevices(sampleDevices);
      }
    }
  }, [bluetoothSupported, devices.length]);

  return {
    devices,
    isScanning,
    bluetoothSupported,
    bluetoothEnabled,
    scanForDevices,
    connectToDevice,
    disconnectFromDevice,
  };
}