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

// Comprehensive device scanner for already connected devices (no pairing dialogs)
const scanForAlreadyConnectedDevices = async () => {
  try {
    if ('bluetooth' in navigator) {
      // Get already connected/paired devices instead of requesting new ones
      const existingDevices = await (navigator as any).bluetooth.getDevices();
      console.log('Found already connected devices:', existingDevices);
      return existingDevices;
    }
  } catch (error) {
    console.log('Could not access connected devices:', error);
    return [];
  }
  return [];
};

// Determine device type and icon based on name and services
const getDeviceTypeAndIcon = (device: any) => {
  const name = device.name?.toLowerCase() || '';
  const services = device.uuids || [];
  
  // Smart Rings
  if (name.includes('oura') || name.includes('ring') || name.includes('circular') || name.includes('motiv')) {
    return { type: 'smart-ring', icon: 'target' };
  }
  
  // Audio devices
  if (name.includes('airpods') || name.includes('buds') || name.includes('headphone') || 
      name.includes('beats') || name.includes('bose') || name.includes('jbl') ||
      services.includes('0000110b-0000-1000-8000-00805f9b34fb')) {
    return { type: 'audio', icon: 'headphones' };
  }
  
  // Health monitors
  if (name.includes('omron') || name.includes('ihealth') || name.includes('beurer') ||
      name.includes('qardio') || name.includes('accuchek') ||
      services.includes('blood_pressure') || services.includes('glucose')) {
    return { type: 'health-monitor', icon: 'heart' };
  }
  
  // Smart scales
  if (name.includes('scale') || name.includes('aria') || name.includes('body+') ||
      services.includes('weight_scale') || services.includes('body_composition')) {
    return { type: 'smart-scale', icon: 'gauge' };
  }
  
  // Fitness equipment
  if (name.includes('peloton') || name.includes('nordictrack') || name.includes('wahoo') ||
      name.includes('zwift') || services.includes('fitness_machine')) {
    return { type: 'fitness-equipment', icon: 'zap' };
  }
  
  // Smartwatches and fitness bands
  if (name.includes('watch') || name.includes('band') || name.includes('fit') ||
      name.includes('garmin') || name.includes('polar') || name.includes('suunto') ||
      services.includes('heart_rate')) {
    return { type: 'wearable', icon: 'watch' };
  }
  
  // Default
  return { type: 'unknown', icon: 'bluetooth' };
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

  // All devices including phone + any Bluetooth devices with proper typing
  const allDevices = [phoneDevice, ...scannerDevices.map(device => {
    const deviceInfo = getDeviceTypeAndIcon(device);
    return {
      ...device,
      type: deviceInfo.type,
      icon: deviceInfo.icon,
      category: 'bluetooth'
    };
  })];
  
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
      
      // Scan for all types of already connected devices  
      const connectedDevices = await scanForAlreadyConnectedDevices();
      
      // Re-initialize capabilities
      await initializeCapabilities();
      
      if (connectedDevices && connectedDevices.length > 0) {
        toast({
          title: "Devices found!",
          description: `Found ${connectedDevices.length} connected device${connectedDevices.length > 1 ? 's' : ''}`,
        });
      } else {
        toast({
          title: "Scan complete",
          description: "No connected devices found. Connect devices via your phone's Bluetooth settings first.",
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
                  <div className={`${device.type === 'phone' ? 'bg-blue-500' : 
                    device.type === 'smart-ring' ? 'bg-purple-500' :
                    device.type === 'audio' ? 'bg-green-500' :
                    device.type === 'health-monitor' ? 'bg-red-500' :
                    device.type === 'smart-scale' ? 'bg-indigo-500' :
                    device.type === 'wearable' ? 'bg-orange-500' :
                    'bg-gray-500'} text-white p-2.5 rounded-xl`}>
                    {device.type === 'phone' ? <Smartphone className="h-5 w-5" /> : 
                     device.type === 'smart-ring' ? <Target className="h-5 w-5" /> :
                     device.type === 'audio' ? <Headphones className="h-5 w-5" /> :
                     device.type === 'health-monitor' ? <Heart className="h-5 w-5" /> :
                     device.type === 'smart-scale' ? <Gauge className="h-5 w-5" /> :
                     device.type === 'wearable' ? <Watch className="h-5 w-5" /> :
                     <Bluetooth className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${device.type === 'phone' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      {device.name}
                    </h3>
                    <p className={`text-sm ${device.type === 'phone' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {device.type === 'phone' ? 'Primary device with real-time sensors' : 
                       device.type === 'smart-ring' ? 'Smart ring for continuous health monitoring' :
                       device.type === 'audio' ? 'Audio device with environmental monitoring' :
                       device.type === 'health-monitor' ? 'Health monitoring device' :
                       device.type === 'smart-scale' ? 'Smart scale for body composition' :
                       device.type === 'wearable' ? 'Wearable fitness and health tracker' :
                       'Connected Bluetooth device'}
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
                      Scan Connected Devices
                    </Button>
                  </div>

                  {/* Motion Sensor */}
                  {'sensors' in device && device.sensors.motion.active && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Motion Sensor</span>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>X: {'sensors' in device && device.sensors.motion.acceleration?.x?.toFixed(2) || '0.00'}</div>
                        <div>Y: {'sensors' in device && device.sensors.motion.acceleration?.y?.toFixed(2) || '0.00'}</div>
                        <div>Z: {'sensors' in device && device.sensors.motion.acceleration?.z?.toFixed(2) || '0.00'}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Location */}
                  {'sensors' in device && device.sensors.location.active && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">GPS Location</span>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>Lat: {'sensors' in device && device.sensors.location.latitude?.toFixed(6) || 'N/A'}</div>
                        <div>Lng: {'sensors' in device && device.sensors.location.longitude?.toFixed(6) || 'N/A'}</div>
                        <div>Accuracy: ±{'sensors' in device && device.sensors.location.accuracy?.toFixed(0) || 'N/A'}m</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Battery */}
                  {'sensors' in device && device.sensors.battery.active && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Battery className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Battery</span>
                        </div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>Level: {'sensors' in device && device.sensors.battery.level}%</div>
                        <div>Status: {'sensors' in device && device.sensors.battery.charging ? 'Charging' : 'Discharging'}</div>
                      </div>
                      <Progress value={'sensors' in device ? device.sensors.battery.level : 0} className="h-2 mt-2" />
                    </div>
                  )}
                  
                  {/* Network */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Network</span>
                      </div>
                      <div className={`w-2 h-2 ${'sensors' in device && device.sensors.network.online ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>Status: {'sensors' in device && device.sensors.network.online ? 'Online' : 'Offline'}</div>
                      <div>Type: {'sensors' in device && device.sensors.network.type?.toUpperCase() || 'WiFi'}</div>
                      {'sensors' in device && device.sensors.network.downlink && (
                        <div>Speed: {device.sensors.network.downlink}Mbps</div>
                      )}
                      {'sensors' in device && device.sensors.network.rtt && (
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
                      {'sensors' in device && device.sensors.temperature.reason || 'Phone temperature not accessible via web browser'}
                    </div>
                  </div>
                  
                  {/* If no sensors are active, show inactive state */}
                  {'sensors' in device && !device.sensors.motion.active && !device.sensors.location.active && !device.sensors.battery.active && !device.sensors.network.active && (
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
              
              {/* Connected device info */}
              {device.category === 'bluetooth' && (
                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bluetooth className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium capitalize">
                        {device.type.replace('-', ' ')} Device
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Services: {device.services?.length || 0} available</div>
                      <div>Connection: Bluetooth LE</div>
                      {device.rssi && <div>Signal: {device.rssi} dBm</div>}
                    </div>
                  </div>
                  
                  {/* Device-specific capabilities */}
                  {device.type === 'smart-ring' && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Smart Ring Features</span>
                      </div>
                      <div className="text-xs text-purple-700 dark:text-purple-300">
                        Sleep tracking, heart rate, activity monitoring
                      </div>
                    </div>
                  )}
                  
                  {device.type === 'audio' && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <Headphones className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Audio Device Features</span>
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        Audio monitoring, noise detection, voice commands
                      </div>
                    </div>
                  )}
                  
                  {device.type === 'health-monitor' && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800 dark:text-red-200">Health Monitor Features</span>
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300">
                        Vital signs, blood pressure, glucose monitoring
                      </div>
                    </div>
                  )}
                  
                  {device.type === 'smart-scale' && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <Gauge className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Smart Scale Features</span>
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        Body composition, weight tracking, BMI analysis
                      </div>
                    </div>
                  )}
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
                Multi-device ecosystem active - supports rings, watches, headphones, health monitors, and more
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                VitalWatch connects to 50+ device types including Oura rings, AirPods, fitness bands, smart scales, and health monitors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}