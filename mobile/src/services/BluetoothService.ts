import { BleManager, Device, State } from 'react-native-ble-plx';

export interface DeviceData {
  id: string;
  name: string;
  services: string[];
  connected: boolean;
  rssi?: number;
  heartRate?: number;
  batteryLevel?: number;
  deviceInfo?: string;
}

export class BluetoothService {
  private manager: BleManager;
  private connectedDevices: Map<string, Device> = new Map();

  constructor() {
    this.manager = new BleManager();
  }

  // Initialize Bluetooth and check permissions
  async initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      const subscription = this.manager.onStateChange((state) => {
        if (state === State.PoweredOn) {
          subscription.remove();
          resolve(true);
        } else {
          console.log('Bluetooth State:', state);
          resolve(false);
        }
      }, true);
    });
  }

  // Scan for nearby devices (especially health/fitness devices)
  async scanForDevices(onDeviceFound: (device: DeviceData) => void): Promise<void> {
    const foundDevices = new Set<string>();

    console.log('Starting Bluetooth device scan...');
    
    this.manager.startDeviceScan(
      null, // Service UUIDs - null means scan for all
      { allowDuplicates: false },
      async (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }

        if (device && device.name && !foundDevices.has(device.id)) {
          foundDevices.add(device.id);
          
          // Filter for health/fitness devices
          const isHealthDevice = this.isHealthOrFitnessDevice(device.name);
          
          if (isHealthDevice) {
            console.log('Found health device:', device.name);
            
            const deviceData: DeviceData = {
              id: device.id,
              name: device.name,
              services: device.serviceUUIDs || [],
              connected: false,
              rssi: device.rssi || undefined
            };

            onDeviceFound(deviceData);
          }
        }
      }
    );

    // Stop scanning after 15 seconds
    setTimeout(() => {
      this.manager.stopDeviceScan();
      console.log('Device scan completed');
    }, 15000);
  }

  // Connect to a specific device
  async connectToDevice(deviceId: string): Promise<DeviceData | null> {
    try {
      console.log('Connecting to device:', deviceId);
      
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevices.set(deviceId, device);
      
      const deviceData: DeviceData = {
        id: device.id,
        name: device.name || 'Unknown Device',
        services: device.serviceUUIDs || [],
        connected: true,
        rssi: device.rssi || undefined
      };

      // Try to read device characteristics
      await this.readDeviceCharacteristics(device, deviceData);
      
      return deviceData;
    } catch (error) {
      console.error('Connection error:', error);
      return null;
    }
  }

  // Disconnect from a device
  async disconnectDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      try {
        await device.cancelConnection();
        this.connectedDevices.delete(deviceId);
        console.log('Disconnected from device:', deviceId);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  }

  // Read device characteristics for health data
  private async readDeviceCharacteristics(device: Device, deviceData: DeviceData): Promise<void> {
    try {
      const services = await device.services();
      
      for (const service of services) {
        const characteristics = await service.characteristics();
        
        for (const characteristic of characteristics) {
          if (characteristic.isReadable) {
            try {
              const value = await characteristic.read();
              
              // Heart Rate Service (0x180D)
              if (service.uuid.toLowerCase().includes('180d') && value.value) {
                const heartRate = this.parseHeartRate(value.value);
                if (heartRate) {
                  deviceData.heartRate = heartRate;
                  console.log('Heart rate:', heartRate);
                }
              }
              
              // Battery Service (0x180F)
              if (service.uuid.toLowerCase().includes('180f') && value.value) {
                const batteryLevel = this.parseBatteryLevel(value.value);
                if (batteryLevel !== undefined) {
                  deviceData.batteryLevel = batteryLevel;
                  console.log('Battery level:', batteryLevel);
                }
              }
              
              // Device Information Service (0x180A)
              if (service.uuid.toLowerCase().includes('180a') && value.value) {
                const deviceInfo = this.parseDeviceInfo(value.value);
                if (deviceInfo) {
                  deviceData.deviceInfo = deviceInfo;
                  console.log('Device info:', deviceInfo);
                }
              }
              
            } catch (readError) {
              console.log('Characteristic read error:', readError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading characteristics:', error);
    }
  }

  // Monitor device for real-time data updates
  async monitorDevice(deviceId: string, onDataUpdate: (data: Partial<DeviceData>) => void): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) return;

    try {
      const services = await device.services();
      
      for (const service of services) {
        const characteristics = await service.characteristics();
        
        for (const characteristic of characteristics) {
          if (characteristic.isNotifiable) {
            characteristic.monitor((error, characteristic) => {
              if (error) {
                console.error('Monitor error:', error);
                return;
              }
              
              if (characteristic?.value) {
                // Parse notifications for real-time data
                if (service.uuid.toLowerCase().includes('180d')) {
                  const heartRate = this.parseHeartRate(characteristic.value);
                  if (heartRate) {
                    onDataUpdate({ heartRate });
                  }
                }
                
                if (service.uuid.toLowerCase().includes('180f')) {
                  const batteryLevel = this.parseBatteryLevel(characteristic.value);
                  if (batteryLevel !== undefined) {
                    onDataUpdate({ batteryLevel });
                  }
                }
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Monitor setup error:', error);
    }
  }

  // Helper method to identify health/fitness devices
  private isHealthOrFitnessDevice(deviceName: string): boolean {
    const healthKeywords = [
      'watch', 'band', 'tracker', 'fit', 'health', 'heart', 'pulse',
      'apple watch', 'fitbit', 'garmin', 'samsung', 'polar', 'suunto',
      'oura', 'whoop', 'mi band', 'galaxy', 'amazfit', 'huawei',
      'withings', 'jabra', 'bose', 'sony', 'beats'
    ];
    
    const lowerName = deviceName.toLowerCase();
    return healthKeywords.some(keyword => lowerName.includes(keyword));
  }

  // Parse heart rate from BLE characteristic value
  private parseHeartRate(base64Value: string): number | null {
    try {
      const buffer = Buffer.from(base64Value, 'base64');
      if (buffer.length >= 2) {
        // Heart rate format: first byte contains format info, second byte is heart rate
        const flags = buffer[0];
        const heartRate = (flags & 0x01) ? buffer.readUInt16LE(1) : buffer[1];
        return heartRate > 0 && heartRate < 300 ? heartRate : null;
      }
    } catch (error) {
      console.error('Heart rate parse error:', error);
    }
    return null;
  }

  // Parse battery level from BLE characteristic value
  private parseBatteryLevel(base64Value: string): number | undefined {
    try {
      const buffer = Buffer.from(base64Value, 'base64');
      if (buffer.length >= 1) {
        const level = buffer[0];
        return level >= 0 && level <= 100 ? level : undefined;
      }
    } catch (error) {
      console.error('Battery level parse error:', error);
    }
    return undefined;
  }

  // Parse device information from BLE characteristic value
  private parseDeviceInfo(base64Value: string): string | null {
    try {
      const buffer = Buffer.from(base64Value, 'base64');
      return buffer.toString('utf8').trim();
    } catch (error) {
      console.error('Device info parse error:', error);
    }
    return null;
  }

  // Get list of connected devices
  getConnectedDevices(): string[] {
    return Array.from(this.connectedDevices.keys());
  }

  // Stop all scanning and disconnect all devices
  async cleanup(): Promise<void> {
    this.manager.stopDeviceScan();
    
    for (const deviceId of this.connectedDevices.keys()) {
      await this.disconnectDevice(deviceId);
    }
    
    this.connectedDevices.clear();
  }
}