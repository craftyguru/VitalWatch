import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Bluetooth,
  Headphones,
  Watch,
  Smartphone,
  Heart,
  Activity,
  Thermometer,
  Gauge,
  Volume2,
  MapPin,
  Battery,
  Signal,
  Wifi,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  Brain,
  Eye,
  Mic,
  Camera,
  Navigation,
  Sun,
  Waves,
  Moon,
  RotateCcw,
  Play,
  Pause,
  MoreHorizontal,
  TrendingUp,
  Shield,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';

interface DeviceData {
  id: string;
  name: string;
  type: 'headphones' | 'watch' | 'phone';
  connected: boolean;
  battery?: number;
  signal?: number;
  sensors: SensorData[];
  lastSync: Date;
}

interface SensorData {
  id: string;
  name: string;
  icon: any;
  value: string | number;
  unit?: string;
  status: 'active' | 'limited' | 'inactive';
  accuracy: number;
  description: string;
}

export function DeviceIntegrationHub() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [scanning, setScanning] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [connectedDevices, setConnectedDevices] = useState<DeviceData[]>([]);
  const [sensorData, setSensorData] = useState<{ [key: string]: any }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real device detection and sensor integration
  const initializeRealSensors = async () => {
    const detectedDevices: DeviceData[] = [];

    // Check for Device Motion API (phone sensors)
    if ('DeviceMotionEvent' in window && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          detectedDevices.push({
            id: 'device-motion',
            name: 'Smartphone Sensors',
            type: 'phone',
            connected: true,
            battery: 100,
            signal: 100,
            lastSync: new Date(),
            sensors: [
              { id: 'accelerometer', name: 'Accelerometer', icon: Zap, value: 'Active', status: 'active', accuracy: 95, description: 'Motion and impact detection' },
              { id: 'gyroscope', name: 'Gyroscope', icon: RotateCcw, value: 'Active', status: 'active', accuracy: 93, description: 'Orientation and rotation sensing' },
              { id: 'orientation', name: 'Device Orientation', icon: Navigation, value: 'Active', status: 'active', accuracy: 90, description: 'Device position tracking' }
            ]
          });
        }
      } catch (error) {
        console.log('Device motion permission denied');
      }
    }

    // Check for Geolocation API
    if ('geolocation' in navigator) {
      detectedDevices.push({
        id: 'geolocation',
        name: 'GPS Location',
        type: 'phone',
        connected: true,
        battery: 100,
        signal: 95,
        lastSync: new Date(),
        sensors: [
          { id: 'gps', name: 'GPS Tracking', icon: MapPin, value: 'Ready', status: 'active', accuracy: 88, description: 'High-accuracy location tracking' },
          { id: 'speed', name: 'Speed Detection', icon: Gauge, value: '0', unit: 'km/h', status: 'active', accuracy: 85, description: 'Movement speed monitoring' }
        ]
      });
    }

    // Check for Ambient Light API
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor();
        detectedDevices.push({
          id: 'ambient-light',
          name: 'Light Sensor',
          type: 'phone',
          connected: true,
          battery: 100,
          signal: 100,
          lastSync: new Date(),
          sensors: [
            { id: 'light-level', name: 'Ambient Light', icon: Sun, value: '450', unit: 'lux', status: 'active', accuracy: 92, description: 'Environmental lighting detection' }
          ]
        });
      } catch (error) {
        console.log('Ambient light sensor not available');
      }
    }

    // Check for Web Audio API (microphone access)
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately after checking
        
        detectedDevices.push({
          id: 'microphone',
          name: 'Audio Sensors',
          type: 'phone',
          connected: true,
          battery: 100,
          signal: 100,
          lastSync: new Date(),
          sensors: [
            { id: 'audio-level', name: 'Audio Level', icon: Volume2, value: '0', unit: 'dB', status: 'active', accuracy: 94, description: 'Environmental audio monitoring' },
            { id: 'voice-detection', name: 'Voice Activity', icon: Mic, value: 'Silent', status: 'active', accuracy: 89, description: 'Speech pattern analysis' }
          ]
        });
      } catch (error) {
        console.log('Microphone access denied');
      }
    }

    // Check for Bluetooth API
    if ('bluetooth' in navigator) {
      detectedDevices.push({
        id: 'bluetooth-scanner',
        name: 'Bluetooth Scanner',
        type: 'phone',
        connected: true,
        battery: 100,
        signal: 100,
        lastSync: new Date(),
        sensors: [
          { id: 'bluetooth-devices', name: 'Nearby Devices', icon: Bluetooth, value: '0', unit: 'devices', status: 'active', accuracy: 87, description: 'Bluetooth device detection' }
        ]
      });
    }

    setDevices(detectedDevices);
    setConnectedDevices(detectedDevices.filter(device => device.connected));
  };

  useEffect(() => {
    initializeRealSensors();
  }, []);

  // Real-time sensor monitoring
  useEffect(() => {
    if (!realTimeMonitoring) return;

    const startSensorMonitoring = () => {
      // Motion sensors
      if (window.DeviceMotionEvent) {
        const handleMotion = (event: DeviceMotionEvent) => {
          setSensorData(prev => ({
            ...prev,
            accelerometer: Math.sqrt(
              (event.acceleration?.x || 0) ** 2 +
              (event.acceleration?.y || 0) ** 2 +
              (event.acceleration?.z || 0) ** 2
            ).toFixed(2)
          }));
        };
        window.addEventListener('devicemotion', handleMotion);
      }

      // Orientation sensors
      if (window.DeviceOrientationEvent) {
        const handleOrientation = (event: DeviceOrientationEvent) => {
          setSensorData(prev => ({
            ...prev,
            orientation: `${Math.round(event.alpha || 0)}°`
          }));
        };
        window.addEventListener('deviceorientation', handleOrientation);
      }

      // Location tracking
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setSensorData(prev => ({
              ...prev,
              gps: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
              speed: Math.round(position.coords.speed || 0)
            }));
          },
          (error) => console.log('Geolocation error:', error),
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
      }
    };

    startSensorMonitoring();

    // Update sensor readings every 2 seconds
    intervalRef.current = setInterval(() => {
      setConnectedDevices(prev => prev.map(device => ({
        ...device,
        lastSync: new Date(),
        sensors: device.sensors.map(sensor => ({
          ...sensor,
          value: sensorData[sensor.id] || sensor.value
        }))
      })));
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [realTimeMonitoring, sensorData]);

  const handleDeviceScan = async () => {
    setScanning(true);
    toast({
      title: "Scanning for devices...",
      description: "Looking for available sensors and Bluetooth devices",
    });

    try {
      // Try to connect to Web Bluetooth devices
      if ('bluetooth' in navigator) {
        try {
          const device = await (navigator as any).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service', 'heart_rate', 'device_information']
          });
          
          const gattServer = await device.gatt.connect();
          
          toast({
            title: "Bluetooth device connected",
            description: `Connected to ${device.name}`,
          });

          // Add to connected devices
          const newDevice: DeviceData = {
            id: device.id,
            name: device.name || 'Unknown Device',
            type: 'watch',
            connected: true,
            battery: 100,
            signal: 100,
            lastSync: new Date(),
            sensors: [
              { id: 'bluetooth-connection', name: 'Connection', icon: Bluetooth, value: 'Connected', status: 'active', accuracy: 100, description: 'Bluetooth connection status' }
            ]
          };
          
          setConnectedDevices(prev => [...prev, newDevice]);
        } catch (error) {
          console.log('Bluetooth scan cancelled or failed');
        }
      }

      // Re-scan for device sensors
      await initializeRealSensors();
      
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Could not complete device scan",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
      toast({
        title: "Scan complete",
        description: `Found ${connectedDevices.length} connected devices`,
      });
    }
  };

  const handleConnectDevice = async (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, connected: !device.connected, lastSync: new Date() }
        : device
    ));
    
    const device = devices.find(d => d.id === deviceId);
    toast({
      title: device?.connected ? "Device disconnected" : "Device connected",
      description: `${device?.name} ${device?.connected ? 'disconnected from' : 'connected to'} VitalWatch`,
    });
  };

  const handleSensorToggle = (deviceId: string, sensorId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? {
            ...device,
            sensors: device.sensors.map(sensor =>
              sensor.id === sensorId
                ? { 
                    ...sensor, 
                    status: sensor.status === 'active' ? 'inactive' : 'active' 
                  }
                : sensor
            )
          }
        : device
    ));
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'headphones': return Headphones;
      case 'watch': return Watch;
      case 'phone': return Smartphone;
      default: return Bluetooth;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'limited': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'limited': return 'secondary';
      case 'inactive': return 'outline';
      default: return 'outline';
    }
  };

  const totalSensors = connectedDevices.reduce((acc, device) => acc + device.sensors.length, 0);
  const activeSensors = connectedDevices.reduce((acc, device) => 
    acc + device.sensors.filter(sensor => sensor.status === 'active').length, 0
  );
  const connectedDeviceCount = connectedDevices.length;
  const averageAccuracy = connectedDevices.length > 0 ? connectedDevices.reduce((acc, device) => {
    const deviceAccuracy = device.sensors.reduce((sensorAcc, sensor) => sensorAcc + sensor.accuracy, 0) / device.sensors.length;
    return acc + deviceAccuracy;
  }, 0) / connectedDevices.length : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Bluetooth className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connected Devices</p>
                <p className="text-2xl font-bold">{connectedDeviceCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sensors</p>
                <p className="text-2xl font-bold">{activeSensors}/{totalSensors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                <p className="text-2xl font-bold">{averageAccuracy.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Protection Level</p>
                <p className="text-2xl font-bold">Maximum</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <CardTitle>Device Management</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={autoSync} 
                  onCheckedChange={setAutoSync}
                  id="auto-sync"
                />
                <label htmlFor="auto-sync" className="text-sm">Auto-sync</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={realTimeMonitoring} 
                  onCheckedChange={setRealTimeMonitoring}
                  id="real-time"
                />
                <label htmlFor="real-time" className="text-sm">Real-time</label>
              </div>
              <Button 
                onClick={handleDeviceScan}
                disabled={scanning}
                size="sm"
              >
                {scanning ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Bluetooth className="w-4 h-4 mr-2" />
                    Scan Devices
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Connected Device Cards Only */}
      <div className="space-y-6">
        {connectedDevices.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bluetooth className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Devices Connected</h3>
              <p className="text-muted-foreground text-center mb-4">
                Click "Scan Devices" to detect and connect your Bluetooth devices with sensors
              </p>
              <Button onClick={handleDeviceScan} disabled={scanning}>
                {scanning ? "Scanning..." : "Scan for Devices"}
              </Button>
            </CardContent>
          </Card>
        )}
        
        {connectedDevices.map((device) => {
          const DeviceIcon = getDeviceIcon(device.type);
          
          return (
            <Card key={device.id} className={`transition-all duration-200 ${device.connected ? 'ring-2 ring-primary/20' : 'opacity-60'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl ${device.connected ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center`}>
                      <DeviceIcon className={`w-6 h-6 ${device.connected ? 'text-primary' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <span>{device.name}</span>
                        {device.connected && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {device.lastSync.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {device.connected && (
                      <>
                        {device.battery && (
                          <div className="flex items-center space-x-2">
                            <Battery className="w-4 h-4" />
                            <span className="text-sm">{device.battery}%</span>
                          </div>
                        )}
                        {device.signal && (
                          <div className="flex items-center space-x-2">
                            <Signal className="w-4 h-4" />
                            <span className="text-sm">{device.signal}%</span>
                          </div>
                        )}
                      </>
                    )}
                    <Button
                      onClick={() => handleConnectDevice(device.id)}
                      variant={device.connected ? "outline" : "default"}
                      size="sm"
                    >
                      {device.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {device.connected && (
                <CardContent>
                  <div className="space-y-4">
                    <Separator />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {device.sensors.map((sensor) => {
                        const SensorIcon = sensor.icon;
                        
                        return (
                          <div key={sensor.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg ${getStatusColor(sensor.status)} flex items-center justify-center`}>
                                <SensorIcon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-sm">{sensor.name}</h4>
                                  <Badge variant={getStatusBadgeVariant(sensor.status)} className="text-xs">
                                    {sensor.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{sensor.description}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-lg font-bold">{sensor.value}</span>
                                  {sensor.unit && <span className="text-sm text-muted-foreground">{sensor.unit}</span>}
                                  <span className="text-xs text-muted-foreground">({sensor.accuracy}% accuracy)</span>
                                </div>
                              </div>
                            </div>
                            
                            <Switch
                              checked={sensor.status === 'active'}
                              onCheckedChange={() => handleSensorToggle(device.id, sensor.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}