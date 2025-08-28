import { useState, useEffect } from 'react';
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

  // Initialize mock device data - in real app this would come from device APIs
  useEffect(() => {
    const mockDevices: DeviceData[] = [
      {
        id: 'bluetooth-headphones-1',
        name: 'Wireless Headphones',
        type: 'headphones',
        connected: true,
        battery: 87,
        signal: 95,
        lastSync: new Date(),
        sensors: [
          { id: 'audio-level', name: 'Audio Level', icon: Volume2, value: 65, unit: 'dB', status: 'active', accuracy: 98, description: 'Environmental audio monitoring for stress detection' },
          { id: 'head-movement', name: 'Head Movement', icon: Navigation, value: 'Stable', status: 'active', accuracy: 92, description: 'Head tracking and orientation monitoring' },
          { id: 'ambient-noise', name: 'Ambient Noise', icon: Waves, value: 42, unit: 'dB', status: 'active', accuracy: 95, description: 'Background noise analysis for situation assessment' },
          { id: 'voice-patterns', name: 'Voice Analysis', icon: Mic, value: 'Calm', status: 'active', accuracy: 89, description: 'Speech patterns and stress indicators' },
          { id: 'touch-controls', name: 'Touch Sensors', icon: Target, value: 'Active', status: 'active', accuracy: 94, description: 'Emergency gesture detection' }
        ]
      },
      {
        id: 'smartwatch-1',
        name: 'Fitness Smartwatch',
        type: 'watch',
        connected: true,
        battery: 73,
        signal: 88,
        lastSync: new Date(Date.now() - 30000),
        sensors: [
          { id: 'heart-rate', name: 'Heart Rate', icon: Heart, value: 72, unit: 'BPM', status: 'active', accuracy: 99, description: 'Continuous heart rate monitoring' },
          { id: 'pulse-ox', name: 'Pulse Oximeter', icon: Target, value: 98, unit: '%', status: 'active', accuracy: 96, description: 'Blood oxygen saturation levels' },
          { id: 'skin-temp', name: 'Skin Temperature', icon: Thermometer, value: 36.2, unit: '°C', status: 'active', accuracy: 91, description: 'Body temperature monitoring' },
          { id: 'accelerometer', name: 'Motion Detection', icon: Zap, value: 'Moderate', status: 'active', accuracy: 97, description: 'Fall detection and activity monitoring' },
          { id: 'gyroscope', name: 'Orientation', icon: RotateCcw, value: 'Stable', status: 'active', accuracy: 93, description: 'Balance and posture analysis' },
          { id: 'gps', name: 'GPS Tracking', icon: MapPin, value: 'Enabled', status: 'active', accuracy: 85, description: 'Emergency location tracking' },
          { id: 'stress-monitor', name: 'Stress Monitor', icon: Brain, value: 'Low', status: 'active', accuracy: 91, description: 'HRV-based stress level analysis' },
          { id: 'sleep-tracking', name: 'Sleep Sensor', icon: Moon, value: 'Awake', status: 'active', accuracy: 88, description: 'Sleep pattern and fatigue detection' }
        ]
      },
      {
        id: 'smartphone-1',
        name: 'Android/iOS Phone',
        type: 'phone',
        connected: true,
        battery: 82,
        signal: 92,
        lastSync: new Date(Date.now() - 15000),
        sensors: [
          { id: 'camera-monitor', name: 'Camera Sensor', icon: Camera, value: 'Active', status: 'active', accuracy: 87, description: 'Facial expression and environment analysis' },
          { id: 'ambient-light', name: 'Light Sensor', icon: Sun, value: 450, unit: 'lux', status: 'active', accuracy: 88, description: 'Environmental lighting conditions' },
          { id: 'barometer', name: 'Pressure Sensor', icon: Gauge, value: 1013, unit: 'hPa', status: 'active', accuracy: 92, description: 'Atmospheric pressure changes' },
          { id: 'proximity', name: 'Proximity Sensor', icon: Eye, value: 'Clear', status: 'active', accuracy: 95, description: 'Nearby object detection' },
          { id: 'microphone', name: 'Microphone', icon: Mic, value: 'Standby', status: 'limited', accuracy: 91, description: 'Emergency audio capture and analysis' },
          { id: 'gps-phone', name: 'GPS Location', icon: MapPin, value: 'Enabled', status: 'active', accuracy: 89, description: 'High-accuracy location tracking' },
          { id: 'accelerometer-phone', name: 'Accelerometer', icon: Zap, value: 'Normal', status: 'active', accuracy: 94, description: 'Motion and impact detection' },
          { id: 'compass', name: 'Magnetometer', icon: Navigation, value: 'North', status: 'active', accuracy: 86, description: 'Direction and orientation sensing' }
        ]
      },
      {
        id: 'fitness-tracker-1',
        name: 'Fitness Band',
        type: 'watch',
        connected: false,
        battery: 45,
        signal: 0,
        lastSync: new Date(Date.now() - 300000),
        sensors: [
          { id: 'steps', name: 'Step Counter', icon: Activity, value: 8542, unit: 'steps', status: 'inactive', accuracy: 95, description: 'Daily activity tracking' },
          { id: 'heart-rate-basic', name: 'Heart Monitor', icon: Heart, value: 0, unit: 'BPM', status: 'inactive', accuracy: 92, description: 'Basic heart rate monitoring' },
          { id: 'sleep-basic', name: 'Sleep Tracker', icon: Moon, value: 'Unknown', status: 'inactive', accuracy: 85, description: 'Basic sleep pattern tracking' }
        ]
      },
      {
        id: 'bluetooth-earbuds-1',
        name: 'Gaming Earbuds',
        type: 'headphones',
        connected: true,
        battery: 68,
        signal: 82,
        lastSync: new Date(Date.now() - 120000),
        sensors: [
          { id: 'audio-latency', name: 'Audio Latency', icon: Zap, value: 15, unit: 'ms', status: 'active', accuracy: 96, description: 'Real-time audio processing delay' },
          { id: 'ear-detection', name: 'In-Ear Detection', icon: Eye, value: 'Both Ears', status: 'active', accuracy: 99, description: 'Automatic wear detection' },
          { id: 'noise-cancel', name: 'ANC Level', icon: Volume2, value: 85, unit: '%', status: 'active', accuracy: 93, description: 'Active noise cancellation monitoring' }
        ]
      },
      {
        id: 'smart-ring-1',
        name: 'Health Ring',
        type: 'watch',
        connected: true,
        battery: 91,
        signal: 77,
        lastSync: new Date(Date.now() - 60000),
        sensors: [
          { id: 'body-temp', name: 'Body Temperature', icon: Thermometer, value: 36.8, unit: '°C', status: 'active', accuracy: 97, description: 'Continuous body temperature monitoring' },
          { id: 'finger-pulse', name: 'Pulse Monitor', icon: Heart, value: 68, unit: 'BPM', status: 'active', accuracy: 98, description: 'Finger-based pulse detection' },
          { id: 'sleep-stage', name: 'Sleep Analysis', icon: Moon, value: 'Awake', status: 'active', accuracy: 91, description: 'Advanced sleep stage detection' },
          { id: 'gesture-control', name: 'Gesture Sensor', icon: Target, value: 'Ready', status: 'active', accuracy: 89, description: 'Emergency gesture recognition' }
        ]
      }
    ];
    setDevices(mockDevices);
  }, []);

  const handleDeviceScan = async () => {
    setScanning(true);
    toast({
      title: "Scanning for devices...",
      description: "Looking for nearby Bluetooth devices",
    });

    // Simulate scanning delay
    setTimeout(() => {
      setScanning(false);
      toast({
        title: "Scan complete",
        description: "Found all connected devices",
      });
    }, 3000);
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

  const totalSensors = devices.reduce((acc, device) => acc + device.sensors.length, 0);
  const activeSensors = devices.reduce((acc, device) => 
    acc + device.sensors.filter(sensor => sensor.status === 'active').length, 0
  );
  const connectedDevices = devices.filter(device => device.connected).length;
  const averageAccuracy = devices.reduce((acc, device) => {
    const deviceAccuracy = device.sensors.reduce((sensorAcc, sensor) => sensorAcc + sensor.accuracy, 0) / device.sensors.length;
    return acc + deviceAccuracy;
  }, 0) / devices.length;

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
                <p className="text-2xl font-bold">{connectedDevices}</p>
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

      {/* Device Cards */}
      <div className="space-y-6">
        {devices.map((device) => {
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