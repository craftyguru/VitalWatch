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

  const handleScanDevices = async () => {
    try {
      toast({
        title: "Scanning devices...",
        description: "Searching for real Bluetooth devices and updating sensor data",
      });
      
      await initializeCapabilities();
      
      toast({
        title: "Device scan complete",
        description: `Found ${capabilities.filter(cap => cap.status === 'available').length} available capabilities`,
      });
    } catch (error: any) {
      toast({
        title: "Scan error",
        description: error.message || "Failed to scan devices",
        variant: "destructive",
      });
    }
  };

  const handleBluetoothScan = async () => {
    try {
      await scanForDevices();
      toast({
        title: "Scanning for devices",
        description: "Looking for nearby Bluetooth devices...",
      });
    } catch (error: any) {
      toast({
        title: "Bluetooth scan failed",
        description: error.message || "Could not scan for Bluetooth devices",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'smartwatch':
        return Watch;
      case 'headphones':
        return Headphones;
      case 'fitness':
        return Activity;
      case 'speaker':
        return Volume2;
      case 'phone':
        return Smartphone;
      default:
        return Bluetooth;
    }
  };

  const getDeviceSensors = (deviceType: string) => {
    switch (deviceType) {
      case 'phone':
        return [
          { name: 'GPS Location', icon: Navigation, value: realTimeData.location ? 'Active' : null, unit: '', color: 'text-green-500' },
          { name: 'Motion Sensors', icon: Activity, value: realTimeData.motion ? 'Active' : null, unit: '', color: 'text-blue-500' },
          { name: 'Battery Level', icon: Battery, value: realTimeData.battery?.level || null, unit: '%', color: 'text-green-500' },
          { name: 'Network', icon: Wifi, value: realTimeData.network?.online ? 'Online' : null, unit: '', color: 'text-blue-500' },
          { name: 'Ambient Light', icon: Eye, value: null, unit: 'lux', color: 'text-yellow-500' },
        ];
      case 'smartwatch':
        return [
          { name: 'Heart Rate', icon: Heart, value: null, unit: 'BPM', color: 'text-red-500' },
          { name: 'Motion', icon: Activity, value: null, unit: '', color: 'text-blue-500' },
          { name: 'GPS', icon: Navigation, value: null, unit: '', color: 'text-green-500' },
          { name: 'Temperature', icon: Thermometer, value: null, unit: '°F', color: 'text-orange-500' },
        ];
      case 'headphones':
        return [
          { name: 'Audio Level', icon: Volume2, value: null, unit: 'dB', color: 'text-blue-500' },
          { name: 'Connection', icon: Signal, value: 'Connected', unit: '', color: 'text-green-500' },
          { name: 'Noise Cancellation', icon: Waves, value: null, unit: '', color: 'text-purple-500' },
        ];
      case 'fitness':
        return [
          { name: 'Heart Rate', icon: Heart, value: null, unit: 'BPM', color: 'text-red-500' },
          { name: 'Steps', icon: Target, value: null, unit: 'steps', color: 'text-blue-500' },
          { name: 'Calories', icon: Zap, value: null, unit: 'cal', color: 'text-orange-500' },
          { name: 'Sleep Quality', icon: Timer, value: null, unit: '%', color: 'text-purple-500' },
        ];
      default:
        return [
          { name: 'Connection', icon: Signal, value: 'Connected', unit: '', color: 'text-green-500' },
        ];
    }
  };

  // Add the phone as a device
  const phoneDevice = {
    id: 'phone-device',
    name: navigator.userAgent.includes('iPhone') ? 'iPhone' : 
          navigator.userAgent.includes('Android') ? 'Android Phone' : 
          'Phone',
    deviceType: 'phone' as const,
    connected: true,
    battery: realTimeData.battery?.level || null,
    lastSeen: new Date(),
    rssi: null,
    services: ['sensors', 'gps', 'battery', 'network']
  };

  const allDevices = [phoneDevice, ...connectedDevices];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Device Integration Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real-time Status Overview */}
        <Card className={`${
          connectedDevices.length >= 1
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
            : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              {connectedDevices.length >= 1 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Devices Connected</h3>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Phone Only - Scan for More Devices</h3>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {[
                { name: 'Motion Sensors', active: realTimeData.motion },
                { name: 'Location Services', active: realTimeData.location },
                { name: 'Battery Status', active: realTimeData.battery },
                { name: 'Network Status', active: realTimeData.network }
              ].map((cap, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`h-2 w-2 rounded-full ${
                    cap.active ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="capitalize">{cap.name}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleScanDevices} className="w-full" disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Enable All Sensors
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Connected Devices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Connected Devices</h3>
            <div className="flex gap-2">
              <Button onClick={handleBluetoothScan} variant="outline" size="sm" disabled={bluetoothScanning}>
                {bluetoothScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-4 w-4 mr-2" />
                    Scan Devices
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {connectedDevices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Bluetooth className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-semibold mb-2">No Devices Connected</h4>
                <p className="text-muted-foreground mb-4">
                  Your phone is connected. Scan for Bluetooth devices like smartwatches, headphones, or fitness bands to add more sensors.
                </p>
                <Button onClick={handleBluetoothScan} disabled={bluetoothScanning}>
                  {bluetoothScanning ? 'Scanning...' : 'Scan for Devices'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allDevices.map((device) => {
                const IconComponent = getDeviceIcon(device.deviceType);
                const sensors = getDeviceSensors(device.deviceType);
                
                return (
                  <Card key={device.id} className={`relative ${
                    device.connected 
                      ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                      : 'border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/20'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            device.connected 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{device.name}</CardTitle>
                            <p className="text-sm text-muted-foreground capitalize">
                              {device.deviceType.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={device.connected ? "default" : "secondary"}>
                            {device.connected ? "Connected" : "Disconnected"}
                          </Badge>
                          {device.rssi && (
                            <span className="text-xs text-muted-foreground">
                              {device.rssi} dBm
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                          Available Sensors
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {sensors.map((sensor, index) => {
                            const SensorIcon = sensor.icon;
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <SensorIcon className={`h-4 w-4 ${sensor.color}`} />
                                  <span className="text-sm font-medium">{sensor.name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {sensor.value !== null ? (
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                      {sensor.value}{sensor.unit}
                                    </span>
                                  ) : (
                                    <span>Not Available</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {device.battery !== undefined && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium flex items-center gap-1">
                                <Battery className="h-4 w-4 text-green-500" />
                                Device Battery
                              </span>
                              <span className="text-sm text-muted-foreground">{device.battery}%</span>
                            </div>
                            <Progress value={device.battery} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last seen: {device.lastSeen.toLocaleTimeString()}
                          </span>
                          {device.id === 'phone-device' ? (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              Built-in
                            </Badge>
                          ) : device.connected ? (
                            <Button 
                              onClick={() => disconnectFromDevice(device.id)} 
                              variant="outline" 
                              size="sm"
                              className="text-xs h-7"
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => connectToDevice(device.id)} 
                              variant="outline" 
                              size="sm"
                              className="text-xs h-7"
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>


        {/* Status Summary */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          {connectedDevices.length > 0 ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">
                Phone + {connectedDevices.length} Bluetooth device{connectedDevices.length > 1 ? 's' : ''} ready for VitalWatch monitoring
              </span>
            </>
          ) : (
            <>
              <Smartphone className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Phone sensors active - scan for Bluetooth devices to add more monitoring capabilities</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}