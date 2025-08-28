import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity,
  Smartphone,
  Headphones,
  Watch,
  Wifi,
  Battery,
  Signal,
  Bluetooth,
  Heart,
  Zap,
  Eye,
  Ear,
  Move,
  Lightbulb,
  Thermometer,
  Wind,
  Gauge,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Settings
} from "lucide-react";

export function EnhancedSensorMonitoring() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("devices");
  
  // Device sensor states
  const [deviceSensors, setDeviceSensors] = useState({
    phone: {
      connected: true,
      battery: 85,
      sensors: {
        accelerometer: { active: true, accuracy: "high", lastReading: "0.1, -9.8, 0.2" },
        gyroscope: { active: true, accuracy: "high", lastReading: "0.05, 0.02, -0.01" },
        magnetometer: { active: true, accuracy: "medium", lastReading: "45.2°" },
        proximity: { active: true, accuracy: "high", lastReading: "Near" },
        lightSensor: { active: true, accuracy: "medium", lastReading: "350 lux" },
        barometer: { active: false, accuracy: "low", lastReading: "1013 hPa" }
      }
    },
    watch: {
      connected: true,
      battery: 67,
      sensors: {
        heartRate: { active: true, accuracy: "high", lastReading: "72 BPM" },
        skinTemp: { active: true, accuracy: "high", lastReading: "98.6°F" },
        bloodOxygen: { active: true, accuracy: "medium", lastReading: "98%" },
        stepCounter: { active: true, accuracy: "high", lastReading: "8,247 steps" },
        sleepMonitor: { active: true, accuracy: "high", lastReading: "7.5h last night" },
        stressLevel: { active: true, accuracy: "medium", lastReading: "Low (15%)" }
      }
    },
    headphones: {
      connected: false,
      battery: 0,
      sensors: {
        audioAnalysis: { active: false, accuracy: "none", lastReading: "Offline" },
        noiseLevel: { active: false, accuracy: "none", lastReading: "Offline" },
        voiceStress: { active: false, accuracy: "none", lastReading: "Offline" }
      }
    }
  });

  // Environmental monitoring
  const [environmentalData, setEnvironmentalData] = useState({
    temperature: 72,
    humidity: 45,
    noiseLevel: 35,
    lightLevel: 350,
    airQuality: 85,
    vibration: 2
  });

  // Biometric analytics
  const [biometricAnalytics, setBiometricAnalytics] = useState({
    heartRateVariability: 42,
    stressIndex: 15,
    activityLevel: 78,
    sleepQuality: 87,
    recoveryScore: 93,
    alertness: 82
  });

  // Real-time sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real sensor data updates
      setDeviceSensors(prev => ({
        ...prev,
        phone: {
          ...prev.phone,
          sensors: {
            ...prev.phone.sensors,
            accelerometer: {
              ...prev.phone.sensors.accelerometer,
              lastReading: `${(Math.random() * 0.4 - 0.2).toFixed(1)}, ${(-9.8 + Math.random() * 0.2 - 0.1).toFixed(1)}, ${(Math.random() * 0.4 - 0.2).toFixed(1)}`
            },
            lightSensor: {
              ...prev.phone.sensors.lightSensor,
              lastReading: `${Math.floor(300 + Math.random() * 100)} lux`
            }
          }
        },
        watch: {
          ...prev.watch,
          sensors: {
            ...prev.watch.sensors,
            heartRate: {
              ...prev.watch.sensors.heartRate,
              lastReading: `${Math.floor(70 + Math.random() * 6)} BPM`
            }
          }
        }
      }));

      setEnvironmentalData(prev => ({
        ...prev,
        noiseLevel: Math.floor(30 + Math.random() * 20),
        lightLevel: Math.floor(300 + Math.random() * 100)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSensorStatusColor = (active: boolean, accuracy: string) => {
    if (!active) return "text-gray-500";
    switch (accuracy) {
      case "high": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-orange-600";
      default: return "text-gray-500";
    }
  };

  const getSensorIcon = (sensorName: string) => {
    const iconMap: { [key: string]: any } = {
      accelerometer: Move,
      gyroscope: RotateCcw,
      magnetometer: Gauge,
      proximity: Eye,
      lightSensor: Lightbulb,
      heartRate: Heart,
      audioAnalysis: Ear,
      noiseLevel: Ear,
      temperature: Thermometer,
      humidity: Wind
    };
    const Icon = iconMap[sensorName] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  const connectHeadphones = () => {
    setDeviceSensors(prev => ({
      ...prev,
      headphones: {
        connected: true,
        battery: 78,
        sensors: {
          audioAnalysis: { active: true, accuracy: "high", lastReading: "Normal patterns" },
          noiseLevel: { active: true, accuracy: "high", lastReading: "42 dB" },
          voiceStress: { active: true, accuracy: "medium", lastReading: "Low stress" }
        }
      }
    }));

    toast({
      title: "Headphones Connected",
      description: "Audio monitoring sensors are now active.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="biometrics" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Biometrics
          </TabsTrigger>
          <TabsTrigger value="environment" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Environment
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Device Sensors Tab */}
        <TabsContent value="devices" className="space-y-4">
          {/* Smartphone Sensors */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                Smartphone Sensors
                <Badge variant="default" className="ml-auto">Connected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(deviceSensors.phone.sensors).map(([key, sensor]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(key)}
                      <div>
                        <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-xs text-muted-foreground">{sensor.lastReading}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`h-2 w-2 rounded-full ${sensor.active ? "bg-green-500" : "bg-gray-400"}`}></div>
                      <p className={`text-xs ${getSensorStatusColor(sensor.active, sensor.accuracy)}`}>
                        {sensor.accuracy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Smartwatch Sensors */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="h-5 w-5 text-blue-600" />
                Smartwatch Sensors
                <Badge variant="default" className="ml-auto">Connected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(deviceSensors.watch.sensors).map(([key, sensor]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(key)}
                      <div>
                        <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-xs text-muted-foreground">{sensor.lastReading}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`h-2 w-2 rounded-full ${sensor.active ? "bg-blue-500" : "bg-gray-400"}`}></div>
                      <p className={`text-xs ${getSensorStatusColor(sensor.active, sensor.accuracy)}`}>
                        {sensor.accuracy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Smart Headphones */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-gray-600" />
                Smart Headphones
                <Badge variant="secondary" className="ml-auto">Disconnected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!deviceSensors.headphones.connected ? (
                <div className="text-center py-6">
                  <Headphones className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground mb-4">Connect headphones for audio monitoring</p>
                  <Button onClick={connectHeadphones} variant="outline">
                    <Bluetooth className="h-4 w-4 mr-2" />
                    Connect Headphones
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(deviceSensors.headphones.sensors).map(([key, sensor]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getSensorIcon(key)}
                        <div>
                          <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-xs text-muted-foreground">{sensor.lastReading}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`h-2 w-2 rounded-full ${sensor.active ? "bg-green-500" : "bg-gray-400"}`}></div>
                        <p className={`text-xs ${getSensorStatusColor(sensor.active, sensor.accuracy)}`}>
                          {sensor.accuracy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biometrics Tab */}
        <TabsContent value="biometrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Heart className="h-5 w-5" />
                  Heart Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-1">72</div>
                  <p className="text-sm text-muted-foreground mb-3">BPM</p>
                  <Progress value={72} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Normal range</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Activity className="h-5 w-5" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{biometricAnalytics.activityLevel}</div>
                  <p className="text-sm text-muted-foreground mb-3">Score</p>
                  <Progress value={biometricAnalytics.activityLevel} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">High activity</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <Zap className="h-5 w-5" />
                  Stress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{biometricAnalytics.stressIndex}</div>
                  <p className="text-sm text-muted-foreground mb-3">Index</p>
                  <Progress value={biometricAnalytics.stressIndex} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Low stress</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Biometric Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Biometric Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Heart Rate Variability</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{biometricAnalytics.heartRateVariability} ms</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <Progress value={biometricAnalytics.heartRateVariability} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sleep Quality</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{biometricAnalytics.sleepQuality}%</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <Progress value={biometricAnalytics.sleepQuality} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recovery Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{biometricAnalytics.recoveryScore}%</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <Progress value={biometricAnalytics.recoveryScore} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alertness Level</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{biometricAnalytics.alertness}%</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <Progress value={biometricAnalytics.alertness} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Thermometer className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{environmentalData.temperature}°F</div>
                <p className="text-sm text-muted-foreground">Temperature</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Wind className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{environmentalData.humidity}%</div>
                <p className="text-sm text-muted-foreground">Humidity</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Ear className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{environmentalData.noiseLevel} dB</div>
                <p className="text-sm text-muted-foreground">Noise Level</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Lightbulb className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">{environmentalData.lightLevel}</div>
                <p className="text-sm text-muted-foreground">Lux</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Wind className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{environmentalData.airQuality}%</div>
                <p className="text-sm text-muted-foreground">Air Quality</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{environmentalData.vibration}</div>
                <p className="text-sm text-muted-foreground">Vibration Level</p>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Environmental Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Temperature</span>
                  </div>
                  <Badge variant="default">Normal</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Noise Level</span>
                  </div>
                  <Badge variant="default">Safe</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Air Quality</span>
                  </div>
                  <Badge variant="default">Good</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sensor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Sensors</span>
                    <Badge variant="default">12/15</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Accuracy</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Update Frequency</span>
                    <span className="text-sm font-medium">5s avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Battery Impact</span>
                    <span className="text-sm font-medium">Low</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">8,247</div>
                    <p className="text-xs text-muted-foreground">Steps</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">72</div>
                    <p className="text-xs text-muted-foreground">Avg BPM</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">7.5h</div>
                    <p className="text-xs text-muted-foreground">Sleep</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">93%</div>
                    <p className="text-xs text-muted-foreground">Recovery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}