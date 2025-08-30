export interface HealthData {
  heartRate?: number;
  steps?: number;
  calories?: number;
  distance?: number;
  sleep?: {
    totalMinutes: number;
    deepMinutes: number;
    lightMinutes: number;
  };
  timestamp: Date;
  source: string;
}

export interface DataSource {
  name: string;
  type: 'health_connect' | 'ble_gatt' | 'vendor_sdk';
  isAvailable(): Promise<boolean>;
  connect(): Promise<boolean>;
  getLatestData(): Promise<HealthData[]>;
  startRealTimeMonitoring?(): Promise<void>;
  stopRealTimeMonitoring?(): Promise<void>;
}

// Health Connect Source for Galaxy Watch, Fitbit, etc.
export class HealthConnectSource implements DataSource {
  name = 'Health Connect';
  type = 'health_connect' as const;

  async isAvailable(): Promise<boolean> {
    try {
      // Check if Health Connect is installed and available
      return true; // Will implement native check
    } catch (error) {
      console.error('Health Connect not available:', error);
      return false;
    }
  }

  async connect(): Promise<boolean> {
    try {
      console.log('🏥 Health Connect: Requesting permissions...');
      // Request Health Connect permissions
      // Will implement native permission request
      return true;
    } catch (error) {
      console.error('Health Connect connection failed:', error);
      return false;
    }
  }

  async getLatestData(): Promise<HealthData[]> {
    try {
      console.log('🏥 Health Connect: Reading health data...');
      
      // Mock data for now - will replace with native calls
      const mockData: HealthData[] = [
        {
          heartRate: 72,
          steps: 8453,
          calories: 1847,
          distance: 6.2,
          sleep: {
            totalMinutes: 456,
            deepMinutes: 98,
            lightMinutes: 212
          },
          timestamp: new Date(),
          source: 'Galaxy Watch5 Pro (Health Connect)'
        }
      ];
      
      return mockData;
    } catch (error) {
      console.error('Failed to read Health Connect data:', error);
      return [];
    }
  }
}

// BLE GATT Source for standard Bluetooth devices
export class BleGattSource implements DataSource {
  name = 'Bluetooth GATT';
  type = 'ble_gatt' as const;
  
  // Standard GATT Service UUIDs
  static readonly HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
  static readonly BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
  static readonly BLOOD_PRESSURE_SERVICE = '00001810-0000-1000-8000-00805f9b34fb';
  static readonly PULSE_OXIMETER_SERVICE = '00001822-0000-1000-8000-00805f9b34fb';
  static readonly WEIGHT_SCALE_SERVICE = '0000181d-0000-1000-8000-00805f9b34fb';
  static readonly HEALTH_THERMOMETER_SERVICE = '00001809-0000-1000-8000-00805f9b34fb';

  private connectedDevices: Map<string, any> = new Map();

  async isAvailable(): Promise<boolean> {
    try {
      // Check if Bluetooth is available and enabled
      return true; // Using existing BLE manager
    } catch (error) {
      console.error('BLE not available:', error);
      return false;
    }
  }

  async connect(): Promise<boolean> {
    try {
      console.log('📡 BLE GATT: Starting device discovery...');
      // Use existing BLE scanning logic
      return true;
    } catch (error) {
      console.error('BLE connection failed:', error);
      return false;
    }
  }

  async getLatestData(): Promise<HealthData[]> {
    const data: HealthData[] = [];
    
    // Read from connected GATT devices
    for (const [deviceId, device] of this.connectedDevices) {
      try {
        // Read heart rate if available
        if (device.services?.includes(BleGattSource.HEART_RATE_SERVICE)) {
          const heartRate = await this.readHeartRate(device);
          if (heartRate) {
            data.push({
              heartRate,
              timestamp: new Date(),
              source: `${device.name} (BLE)`
            });
          }
        }
        
        // Add other service readings...
      } catch (error) {
        console.error(`Failed to read from ${device.name}:`, error);
      }
    }
    
    return data;
  }

  private async readHeartRate(device: any): Promise<number | undefined> {
    try {
      // Implementation for reading heart rate characteristic
      console.log(`Reading heart rate from ${device.name}...`);
      return undefined; // Will implement with actual BLE reads
    } catch (error) {
      console.error('Heart rate read failed:', error);
      return undefined;
    }
  }

  async startRealTimeMonitoring(): Promise<void> {
    console.log('📡 BLE GATT: Starting real-time monitoring...');
    // Subscribe to notifications from connected devices
  }

  async stopRealTimeMonitoring(): Promise<void> {
    console.log('📡 BLE GATT: Stopping real-time monitoring...');
    // Unsubscribe from notifications
  }
}

// Device Router - decides which data source to use
export class DeviceRouter {
  private healthConnectSource = new HealthConnectSource();
  private bleGattSource = new BleGattSource();
  
  async getAvailableSources(): Promise<DataSource[]> {
    const sources: DataSource[] = [];
    
    if (await this.healthConnectSource.isAvailable()) {
      sources.push(this.healthConnectSource);
    }
    
    if (await this.bleGattSource.isAvailable()) {
      sources.push(this.bleGattSource);
    }
    
    return sources;
  }
  
  async getAllHealthData(): Promise<HealthData[]> {
    const allData: HealthData[] = [];
    
    // Get data from Health Connect (Galaxy Watch, etc.)
    try {
      const healthConnectData = await this.healthConnectSource.getLatestData();
      allData.push(...healthConnectData);
    } catch (error) {
      console.error('Health Connect data fetch failed:', error);
    }
    
    // Get data from BLE devices
    try {
      const bleData = await this.bleGattSource.getLatestData();
      allData.push(...bleData);
    } catch (error) {
      console.error('BLE data fetch failed:', error);
    }
    
    return allData;
  }
  
  getSourceForDeviceType(deviceType: 'smartwatch' | 'fitness_band' | 'medical_device' | 'generic_ble'): DataSource {
    switch (deviceType) {
      case 'smartwatch':
      case 'fitness_band':
        return this.healthConnectSource; // Prefer Health Connect for watches
      case 'medical_device':
      case 'generic_ble':
        return this.bleGattSource; // Use direct BLE for medical devices
      default:
        return this.bleGattSource;
    }
  }
}