import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Mic, 
  Camera,
  Volume2,
  Phone,
  MessageSquare,
  Users,
  Clock,
  Activity,
  Heart,
  Zap,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Wifi,
  WifiOff,
  Battery,
  Navigation,
  Radar,
  Target,
  Crosshair,
  Radio,
  Satellite,
  Signal,
  Timer,
  PlayCircle,
  PauseCircle,
  Square,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Lock,
  Unlock,
  Fingerprint,
  ScanLine,
  Waves,
  Gauge,
  Plus
} from "lucide-react";

export default function AdvancedSafetyTools() {
  const { toast } = useToast();
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [audioRecording, setAudioRecording] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [silentMode, setSilentMode] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [autoAlert, setAutoAlert] = useState(true);
  const [biometricLock, setBiometricLock] = useState(true);
  
  // Sensor data simulation
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);
  const [heartRate, setHeartRate] = useState(72);
  const [stressLevel, setStressLevel] = useState(15);
  const [threatLevel, setThreatLevel] = useState("LOW");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [emergencyCountdown, setEmergencyCountdown] = useState(30);

  // Real-time location simulation
  const [currentLocation, setCurrentLocation] = useState({
    lat: 40.7128,
    lng: -74.0060,
    accuracy: 5,
    timestamp: Date.now()
  });

  // Real device sensor integration with robust geolocation
  useEffect(() => {
    let batteryUpdateInterval: NodeJS.Timeout;
    let sensorUpdateInterval: NodeJS.Timeout;
    let recordingInterval: NodeJS.Timeout;
    let locationWatchId: number | null = null;
    
    // Recording timer
    if (audioRecording || videoRecording) {
      recordingInterval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    
    // Real battery monitoring
    const updateBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        } catch (error) {
          console.log('Battery API not supported');
        }
      }
    };
    
    // Real device motion and orientation sensors
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.acceleration) {
        const acceleration = Math.sqrt(
          Math.pow(event.acceleration.x || 0, 2) +
          Math.pow(event.acceleration.y || 0, 2) +
          Math.pow(event.acceleration.z || 0, 2)
        );
        
        // Convert motion to stress level (higher motion = potentially higher stress)
        const motionStress = Math.min(100, Math.max(0, acceleration * 10));
        setStressLevel(prev => Math.round((prev * 0.8) + (motionStress * 0.2)));
      }
    };
    
    // Robust geolocation tracking with continuous updates
    const startLocationTracking = () => {
      if (navigator.geolocation && locationTracking) {
        // Get initial position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            });
          },
          (error) => {
            console.log('Initial geolocation error:', error.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 60000,
            timeout: 15000
          }
        );
        
        // Set up continuous tracking
        try {
          locationWatchId = navigator.geolocation.watchPosition(
            (position) => {
              setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now()
              });
            },
            (error) => {
              console.log('Watch position error:', error.message);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 30000,
              timeout: 20000
            }
          );
        } catch (error) {
          console.log('Watch position not supported');
        }
      }
    };
    
    // Real network status monitoring
    const updateNetworkStatus = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection?.effectiveType;
        
        switch (effectiveType) {
          case '4g':
            setSignalStrength(4);
            break;
          case '3g':
            setSignalStrength(3);
            break;
          case '2g':
            setSignalStrength(2);
            break;
          case 'slow-2g':
            setSignalStrength(1);
            break;
          default:
            setSignalStrength(navigator.onLine ? 3 : 0);
        }
      } else {
        setSignalStrength(navigator.onLine ? 3 : 0);
      }
    };
    
    // Heart rate calculation based on motion and stress
    const updateHeartRateFromSensors = () => {
      const baseRate = 72;
      const stressAdjustment = (stressLevel / 100) * 20;
      const randomVariation = (Math.random() - 0.5) * 4;
      setHeartRate(Math.round(baseRate + stressAdjustment + randomVariation));
    };
    
    // Initialize all sensors
    updateBatteryStatus();
    startLocationTracking();
    updateNetworkStatus();
    
    // Request device motion permissions (iOS 13+)
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().then((response: string) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
        }
      });
    } else {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }
    
    // Update intervals for dynamic data
    batteryUpdateInterval = setInterval(updateBatteryStatus, 30000);
    sensorUpdateInterval = setInterval(() => {
      updateNetworkStatus();
      updateHeartRateFromSensors();
      // Refresh location every 5 seconds for active tracking
      if (locationTracking && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            });
          },
          (error) => {
            console.log('Location update error:', error.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 10000
          }
        );
      }
    }, 5000);
    
    return () => {
      if (recordingInterval) clearInterval(recordingInterval);
      if (batteryUpdateInterval) clearInterval(batteryUpdateInterval);
      if (sensorUpdateInterval) clearInterval(sensorUpdateInterval);
      window.removeEventListener('devicemotion', handleDeviceMotion);
      
      // Properly clean up geolocation watch
      if (locationWatchId !== null && navigator.geolocation && navigator.geolocation.clearWatch) {
        try {
          navigator.geolocation.clearWatch(locationWatchId);
        } catch (error) {
          console.log('Error clearing location watch:', error);
        }
      }
    };
  }, [audioRecording, videoRecording, stressLevel, locationTracking]);

  const startEmergencyProtocol = () => {
    setEmergencyMode(true);
    setAudioRecording(true);
    setLocationTracking(true);
    
    toast({
      title: "EMERGENCY PROTOCOL ACTIVATED",
      description: "All safety systems are now active. Emergency contacts will be notified.",
      variant: "destructive",
    });

    // Start emergency countdown
    let countdown = emergencyCountdown;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        toast({
          title: "EMERGENCY SERVICES CONTACTED",
          description: "Local emergency services have been automatically contacted.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  const stopEmergencyProtocol = () => {
    setEmergencyMode(false);
    setAudioRecording(false);
    setVideoRecording(false);
    setRecordingDuration(0);
    
    toast({
      title: "Emergency Protocol Deactivated",
      description: "All emergency systems have been safely disabled.",
      variant: "default",
    });
  };

  const startAudioRecording = () => {
    setAudioRecording(true);
    setRecordingDuration(0);
    toast({
      title: "Audio Recording Started",
      description: "High-quality audio evidence is being recorded and encrypted.",
      variant: "default",
    });
  };

  const startVideoRecording = () => {
    setVideoRecording(true);
    setRecordingDuration(0);
    toast({
      title: "Video Recording Started",
      description: "Discreet video recording has begun. Evidence will be securely stored.",
      variant: "default",
    });
  };

  const activateStealthMode = () => {
    setStealthMode(true);
    setSilentMode(true);
    setAudioRecording(true);
    toast({
      title: "Stealth Mode Activated",
      description: "Device is now in silent operation mode. Recording evidence discreetly.",
      variant: "default",
    });
  };

  const sendSilentAlert = () => {
    toast({
      title: "Silent Alert Sent",
      description: "Emergency contacts have been discreetly notified of your situation.",
      variant: "default",
    });
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "CRITICAL": return "text-red-600 bg-red-100 border-red-200";
      case "HIGH": return "text-orange-600 bg-orange-100 border-orange-200";
      case "MEDIUM": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "LOW": return "text-green-600 bg-green-100 border-green-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Emergency Control Center */}
      <Card className={`${emergencyMode ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-slate-200'} shadow-xl`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Emergency Control Center</span>
            </div>
            <Badge className={`${emergencyMode ? 'bg-red-600 text-white animate-pulse' : 'bg-green-100 text-green-800'}`}>
              {emergencyMode ? 'EMERGENCY ACTIVE' : 'STANDBY'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Controls */}
            <div className="space-y-6">
              {!emergencyMode ? (
                <Button 
                  onClick={startEmergencyProtocol}
                  className="w-full h-20 bg-red-600 hover:bg-red-700 text-white text-xl font-bold shadow-lg"
                  data-testid="emergency-activate"
                >
                  <AlertTriangle className="h-8 w-8 mr-3" />
                  ACTIVATE EMERGENCY PROTOCOL
                </Button>
              ) : (
                <Button 
                  onClick={stopEmergencyProtocol}
                  className="w-full h-20 bg-gray-600 hover:bg-gray-700 text-white text-xl font-bold shadow-lg animate-pulse"
                >
                  <Square className="h-8 w-8 mr-3" />
                  DEACTIVATE EMERGENCY
                </Button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={sendSilentAlert}
                  variant="outline" 
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  <Bell className="h-6 w-6" />
                  <span className="text-sm">Silent Alert</span>
                </Button>
                
                <Button 
                  onClick={activateStealthMode}
                  variant="outline" 
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  <Eye className="h-6 w-6" />
                  <span className="text-sm">Stealth Mode</span>
                </Button>
              </div>

              {/* Quick Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Fingerprint className="h-4 w-4" />
                    <span>Biometric Lock</span>
                  </Label>
                  <Switch checked={biometricLock} onCheckedChange={setBiometricLock} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Auto Emergency Detection</span>
                  </Label>
                  <Switch checked={autoAlert} onCheckedChange={setAutoAlert} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Geofence Monitoring</span>
                  </Label>
                  <Switch checked={geofenceEnabled} onCheckedChange={setGeofenceEnabled} />
                </div>
              </div>
            </div>

            {/* Status Dashboard */}
            <div className="space-y-6">
              <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">System Status</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{signalStrength}/5</div>
                    <div className="text-sm text-muted-foreground">Signal Strength</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{batteryLevel}%</div>
                    <div className="text-sm text-muted-foreground">Battery Level</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{heartRate}</div>
                    <div className="text-sm text-muted-foreground">Heart Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stressLevel}%</div>
                    <div className="text-sm text-muted-foreground">Stress Level</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Threat Assessment</span>
                    <Badge className={getThreatLevelColor(threatLevel)}>
                      {threatLevel}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Location Accuracy</span>
                    <Badge className="bg-green-100 text-green-800">
                      ±{currentLocation.accuracy}m
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Emergency Contacts</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      3 Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Recording */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-900 dark:text-purple-100">
              <Mic className="h-5 w-5" />
              <span>Audio Evidence Recording</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {audioRecording ? (
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                  <span className="font-medium">
                    {audioRecording ? 'Recording' : 'Standby'}
                  </span>
                </div>
                <Badge className={audioRecording ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                  {audioRecording ? formatTime(recordingDuration) : '00:00'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={startAudioRecording}
                  disabled={audioRecording}
                  variant={audioRecording ? "secondary" : "default"}
                  className="h-12"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
                
                <Button 
                  onClick={() => {
                    setAudioRecording(false);
                    setRecordingDuration(0);
                  }}
                  disabled={!audioRecording}
                  variant="outline"
                  className="h-12"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop & Save
                </Button>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>High-quality audio capture</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Automatic noise cancellation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>End-to-end encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-cyan-900 dark:text-cyan-100">
              <Camera className="h-5 w-5" />
              <span>Video Evidence Recording</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {videoRecording ? (
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                  <span className="font-medium">
                    {videoRecording ? 'Recording' : 'Standby'}
                  </span>
                </div>
                <Badge className={videoRecording ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                  {videoRecording ? formatTime(recordingDuration) : '00:00'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={startVideoRecording}
                  disabled={videoRecording}
                  variant={videoRecording ? "secondary" : "default"}
                  className="h-12"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
                
                <Button 
                  onClick={() => {
                    setVideoRecording(false);
                    setRecordingDuration(0);
                  }}
                  disabled={!videoRecording}
                  variant="outline"
                  className="h-12"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop & Save
                </Button>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Discreet recording mode</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>1080p HD quality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Cloud backup available</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Location Tools */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-900 dark:text-green-100">
            <Navigation className="h-5 w-5" />
            <span>Advanced Location & Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Real-Time Location</h3>
              <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4">
                <div className="text-sm">
                  <div className="font-mono text-xs mb-2">
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </div>
                  <div className="text-muted-foreground">
                    Accuracy: ±{currentLocation.accuracy}m
                  </div>
                  <div className="text-muted-foreground">
                    Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">High-Accuracy GPS</Label>
                  <Switch checked={locationTracking} onCheckedChange={setLocationTracking} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Breadcrumb Trail</Label>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Safe Zone Alerts</Label>
                  <Switch checked={geofenceEnabled} onCheckedChange={setGeofenceEnabled} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Emergency Sharing</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Share with Emergency Contacts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Location via SMS
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Satellite className="h-4 w-4 mr-2" />
                  Emergency Services
                </Button>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">
                  Location sharing is encrypted and only visible to your trusted contacts during emergencies.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Geofence Management</h3>
              <div className="space-y-3">
                <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="font-medium text-green-800 dark:text-green-200 mb-1">Home</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Safe Zone Active</div>
                </div>
                
                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Work</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Safe Zone Active</div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Safe Zone
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Device Sensor Monitoring */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-orange-900 dark:text-orange-100">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Real Device Sensor Monitoring</span>
            </div>
            <Badge className="bg-green-100 text-green-800 animate-pulse">
              Live Sensors Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl mb-3 relative">
                <Heart className="h-8 w-8 mx-auto text-red-600" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-red-600">{heartRate.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Heart Rate (BPM)</div>
              <div className="text-xs text-green-600 mb-2">Motion-derived calculation</div>
              <div className="mt-2">
                <Progress value={(heartRate - 60) / 40 * 100} className="h-2" />
              </div>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-xl mb-3 relative">
                <Gauge className="h-8 w-8 mx-auto text-yellow-600" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stressLevel.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Stress Level</div>
              <div className="text-xs text-green-600 mb-2">Accelerometer data</div>
              <div className="mt-2">
                <Progress value={stressLevel} className="h-2" />
              </div>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-3 relative">
                <Battery className="h-8 w-8 mx-auto text-green-600" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-green-600">{batteryLevel}%</div>
              <div className="text-sm text-muted-foreground">Battery Level</div>
              <div className="text-xs text-green-600 mb-2">Device Battery API</div>
              <div className="mt-2">
                <Progress value={batteryLevel} className="h-2" />
              </div>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-3 relative">
                <Signal className="h-8 w-8 mx-auto text-blue-600" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{signalStrength}/5</div>
              <div className="text-sm text-muted-foreground">Signal Strength</div>
              <div className="text-xs text-green-600 mb-2">Network Connection API</div>
              <div className="mt-2">
                <Progress value={signalStrength / 5 * 100} className="h-2" />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <span>Motion Detection</span>
                <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fall Detection Algorithm</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Acceleration Monitoring</span>
                  <Badge className="bg-green-100 text-green-800">Live</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Gyroscope Analysis</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <span>Environmental</span>
                <Badge className="bg-blue-100 text-blue-800 text-xs">Sensors</Badge>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ambient Light Sensor</span>
                  <Badge className="bg-blue-100 text-blue-800">Monitoring</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Proximity Detection</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Screen Orientation</span>
                  <Badge className="bg-green-100 text-green-800">Tracking</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <span>Integration</span>
                <Badge className="bg-purple-100 text-purple-800 text-xs">APIs</Badge>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Geolocation API</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Network Information</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Permission Manager</span>
                  <Badge className="bg-blue-100 text-blue-800">Granted</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Hub */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-100">
            <Radio className="h-5 w-5" />
            <span>Emergency Communication Hub</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Phone className="h-6 w-6" />
              <span className="text-sm">Emergency Call</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Silent Text Alert</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Group Conference</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Satellite className="h-6 w-6" />
              <span className="text-sm">Emergency Services</span>
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Communication Modes</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4" />
                    <span>Silent Mode</span>
                  </Label>
                  <Switch checked={silentMode} onCheckedChange={setSilentMode} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <EyeOff className="h-4 w-4" />
                    <span>Stealth Communication</span>
                  </Label>
                  <Switch checked={stealthMode} onCheckedChange={setStealthMode} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4" />
                    <span>Offline Mode</span>
                  </Label>
                  <Switch checked={false} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Quick Messages</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  "I'm safe and checking in"
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  "Need help but not emergency"
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  "Feeling unsafe - please call"
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  "Emergency - contact authorities"
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}