import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRealDeviceScanner } from '@/hooks/useRealDeviceScanner';
import { useBluetoothDevices } from '@/hooks/useBluetoothDevices';
import {
  Bluetooth,
  Smartphone,
  Activity,
  MapPin,
  Battery,
  Wifi,
  CheckCircle,
  AlertCircle,
  Settings,
  Shield,
  Loader2,
  Watch,
  Headphones,
  Heart,
  Thermometer,
  Volume2,
  Signal,
  Zap,
  Eye,
  Navigation,
  Timer,
  Target,
  Waves,
  Gauge,
  Clock,
  User
} from 'lucide-react';

interface DeviceIntegrationHubProps {
  sensorData?: any;
  permissions?: any;
  requestPermissions?: () => void;
}

// Enhanced network type detection for 5G
const getNetworkType = () => {
  const connection = (navigator as any).connection;
  if (!connection) return 'wifi';
  
  const effectiveType = connection.effectiveType;
  const downlink = connection.downlink;
  
  // Enhanced detection for 5G based on speed and other indicators
  if (downlink && downlink > 50) return '5g'; // 5G typically has >50Mbps
  if (downlink && downlink > 10 && effectiveType === '4g') return '5g'; // Fast 4g might be 5g
  if (effectiveType === '4g' && connection.saveData === false && downlink > 20) return '5g';
  
  return effectiveType || 'wifi';
};

// Scan for wearable devices and smartwatches
const scanForWearableDevices = async () => {
  try {
    if ('bluetooth' in navigator) {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['battery_service'] },
          { services: ['device_information'] },
          { namePrefix: 'Apple Watch' },
          { namePrefix: 'Galaxy Watch' },
          { namePrefix: 'Fitbit' },
          { namePrefix: 'Garmin' },
          { namePrefix: 'Wear OS' },
          { namePrefix: 'Mi Band' },
          { namePrefix: 'Amazfit' }
        ],
        optionalServices: [
          'heart_rate',
          'battery_service', 
          'device_information',
          'fitness_machine',
          'cycling_power',
          'running_speed_and_cadence',
          'location_and_navigation'
        ]
      });
      return device;
    }
  } catch (error) {
    console.log('Wearable scan failed:', error);
    return null;
  }
};

export function DeviceIntegrationHub({ sensorData, permissions, requestPermissions }: DeviceIntegrationHubProps) {
  const { toast } = useToast();
  const { 
    capabilities, 
    bluetoothDevices: scannerDevices, 
    isScanning, 
    realTimeData, 
    scanBluetoothDevices, 
    initializeCapabilities 
  } = useRealDeviceScanner();
  
  const {
    devices: connectedDevices,
    isScanning: bluetoothScanning,
    scanForDevices,
    connectToDevice,
    disconnectFromDevice
  } = useBluetoothDevices();

  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time network monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      setLastUpdate(new Date()); // Force re-render to update network status
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Create phone device with real sensor data
  const phoneDevice = {
    id: 'user-phone',
    name: `${navigator.userAgent.includes('iPhone') ? 'iPhone' : 
           navigator.userAgent.includes('Android') ? 'Android Phone' : 
           navigator.userAgent.includes('iPad') ? 'iPad' : 'Mobile Device'}`,
    type: 'phone',
    connected: true,
    sensors: {
      motion: realTimeData?.motion ? {
        acceleration: realTimeData.motion.acceleration,
        rotationRate: realTimeData.motion.rotationRate,
        active: true
      } : { active: false },
      location: realTimeData?.location ? {
        latitude: realTimeData.location.latitude,
        longitude: realTimeData.location.longitude,
        accuracy: realTimeData.location.accuracy,
        active: true
      } : { active: false },
      battery: realTimeData?.battery ? {
        level: realTimeData.battery.level,
        charging: realTimeData.battery.charging,
        active: true
      } : { active: false },
      network: {
        online: navigator.onLine,
        type: getNetworkType(),
        downlink: (navigator as any).connection?.downlink,
        rtt: (navigator as any).connection?.rtt,
        active: true
      },
      temperature: realTimeData?.temperature ? {
        celsius: realTimeData.temperature.celsius,
        reason: realTimeData.temperature.reason,
        active: realTimeData.temperature.active
      } : { active: false, reason: 'Not available on this device' }
    }
  };

  // All devices including phone + any Bluetooth devices
  const allDevices = [phoneDevice, ...scannerDevices.map(device => ({
    ...device,
    type: 'bluetooth'
  }))];
  
  // Auto-initialize capabilities on mount
  useEffect(() => {
    initializeCapabilities();
  }, [initializeCapabilities]);

  const enableAllSensors = async () => {
    try {
      // Initialize capabilities from real device scanner
      await initializeCapabilities();
      
      // Request permissions if available
      if (requestPermissions) {
        await requestPermissions();
      }
      
      toast({
        title: "Sensors enabled",
        description: "All available phone sensors are now active.",
      });
    } catch (error) {
      toast({
        title: "Permission denied",
        description: "Some sensors require manual permission.",
        variant: "destructive"
      });
    }
  };

  const fullDeviceScan = async () => {
    try {
      toast({
        title: "Scanning devices...",
        description: "Looking for all connected devices including wearables.",
      });

      // Scan for regular Bluetooth devices
      await scanForDevices();
      
      // Scan specifically for wearable devices  
      const wearable = await scanForWearableDevices();
      
      // Re-initialize capabilities
      await initializeCapabilities();
      
      if (wearable) {
        toast({
          title: "Device found",
          description: `Connected to ${wearable.name}`,
        });
      } else {
        toast({
          title: "Scan complete",
          description: "No new wearable devices found. Make sure devices are in pairing mode.",
        });
      }
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Unable to scan for devices. Check Bluetooth permissions.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 text-white p-2.5 rounded-xl">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100">Device Integration Hub</CardTitle>
                <p className="text-sm text-blue-700 dark:text-blue-300">Connected devices with real-time sensor monitoring</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                {allDevices.length} Device{allDevices.length !== 1 ? 's' : ''} Connected
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Connected Devices */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Connected Devices
        </h3>
        
        {allDevices.map((device) => (
          <Card key={device.id} className={`${device.type === 'phone' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50' : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200/50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`${device.type === 'phone' ? 'bg-blue-500' : 'bg-gray-500'} text-white p-2.5 rounded-xl`}>
                    {device.type === 'phone' ? <Smartphone className="h-5 w-5" /> : <Bluetooth className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${device.type === 'phone' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      {device.name}
                    </h3>
                    <p className={`text-sm ${device.type === 'phone' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {device.type === 'phone' ? 'Primary device with real-time sensors' : 'Bluetooth connected device'}
                    </p>
                  </div>
                </div>
                <Badge className={device.type === 'phone' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30'}>
                  {device.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              
              {/* Phone Real-time sensor data */}
              {device.type === 'phone' && (
                <div className="space-y-3">
                  {/* Control Buttons */}
                  <div className="flex gap-2 justify-center mb-4 flex-wrap">
                    <Button 
                      onClick={enableAllSensors}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Enable All Sensors
                    </Button>
                    <Button 
                      onClick={fullDeviceScan}
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      disabled={isScanning || bluetoothScanning}
                    >
                      {isScanning || bluetoothScanning ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Watch className="h-4 w-4 mr-2" />
                      )}
                      Scan All Devices
                    </Button>
                  </div>

                  {/* Motion Sensor */}
                  {device.sensors.motion.active && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Motion Sensor</span>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>X: {device.sensors.motion.acceleration?.x?.toFixed(2) || '0.00'}</div>
                        <div>Y: {device.sensors.motion.acceleration?.y?.toFixed(2) || '0.00'}</div>
                        <div>Z: {device.sensors.motion.acceleration?.z?.toFixed(2) || '0.00'}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Location */}
                  {device.sensors.location.active && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">GPS Location</span>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>Lat: {device.sensors.location.latitude?.toFixed(6) || 'N/A'}</div>
                        <div>Lng: {device.sensors.location.longitude?.toFixed(6) || 'N/A'}</div>
                        <div>Accuracy: ±{device.sensors.location.accuracy?.toFixed(0) || 'N/A'}m</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Battery */}
                  {device.sensors.battery.active && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Battery className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Battery</span>
                        </div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>Level: {device.sensors.battery.level}%</div>
                        <div>Status: {device.sensors.battery.charging ? 'Charging' : 'Discharging'}</div>
                      </div>
                      <Progress value={device.sensors.battery.level} className="h-2 mt-2" />
                    </div>
                  )}
                  
                  {/* Network */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Network</span>
                      </div>
                      <div className={`w-2 h-2 ${device.sensors.network.online ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>Status: {device.sensors.network.online ? 'Online' : 'Offline'}</div>
                      <div>Type: {device.sensors.network.type?.toUpperCase() || 'WiFi'}</div>
                      {device.sensors.network.downlink && (
                        <div>Speed: {device.sensors.network.downlink}Mbps</div>
                      )}
                      {device.sensors.network.rtt && (
                        <div>Latency: {device.sensors.network.rtt}ms</div>
                      )}
                    </div>
                  </div>

                  {/* Temperature (if available) */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Temperature</span>
                      </div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {device.sensors.temperature.reason || 'Phone temperature not accessible via web browser'}
                    </div>
                  </div>
                  
                  {/* If no sensors are active, show inactive state */}
                  {!device.sensors.motion.active && !device.sensors.location.active && !device.sensors.battery.active && !device.sensors.network.active && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Sensors not yet active</span>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Click "Enable All Sensors" to start monitoring
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Bluetooth device info */}
              {device.type === 'bluetooth' && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bluetooth className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Bluetooth Device</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Services: {device.services?.length || 0} available
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Footer */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Phone sensors active - scan for Bluetooth devices to add more monitoring capabilities
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                VitalWatch automatically detects and connects to your phone's built-in sensors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}