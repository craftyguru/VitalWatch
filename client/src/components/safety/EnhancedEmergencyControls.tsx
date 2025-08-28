import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Zap, 
  Phone, 
  Volume2, 
  VolumeX, 
  Bell,
  AlertTriangle,
  Heart,
  Activity,
  Smartphone,
  Headphones,
  Watch,
  Settings,
  Power,
  PlayCircle,
  PauseCircle
} from "lucide-react";

export function EnhancedEmergencyControls() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("control");
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [autoAlert, setAutoAlert] = useState(true);
  const [biometricLock, setBiometricLock] = useState(true);
  
  // Emergency system status
  const [systemStatus, setSystemStatus] = useState({
    countdown: 180,
    isActive: false,
    alertsSent: 0,
    contactsNotified: 0,
    locationShared: true,
    emergencyServices: "ready"
  });

  // Device connectivity status
  const [deviceStatus, setDeviceStatus] = useState({
    phone: { connected: true, battery: 85, signal: "strong" },
    watch: { connected: true, battery: 67, signal: "good" },
    headphones: { connected: false, battery: 0, signal: "none" }
  });

  // Biometric monitoring
  const [biometrics, setBiometrics] = useState({
    heartRate: 72,
    stressLevel: 15,
    activityLevel: 78,
    anomaliesDetected: 0,
    emergencyThreshold: 85
  });

  // Emergency countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (systemStatus.isActive && systemStatus.countdown > 0) {
      interval = setInterval(() => {
        setSystemStatus(prev => ({
          ...prev,
          countdown: prev.countdown - 1
        }));
      }, 1000);
    } else if (systemStatus.countdown === 0) {
      // Auto-trigger emergency alert
      handleEmergencyAlert();
    }
    return () => clearInterval(interval);
  }, [systemStatus.isActive, systemStatus.countdown]);

  const handleEmergencyAlert = () => {
    setSystemStatus(prev => ({
      ...prev,
      alertsSent: prev.alertsSent + 1,
      contactsNotified: 5,
      locationShared: true
    }));
    
    toast({
      title: "Emergency Alert Sent",
      description: "All emergency contacts have been notified with your location.",
      variant: "destructive",
    });
  };

  const startEmergencyCountdown = () => {
    setSystemStatus(prev => ({
      ...prev,
      isActive: true,
      countdown: 180
    }));
    
    toast({
      title: "Emergency Mode Activated",
      description: "Alert will be sent in 3 minutes unless cancelled.",
    });
  };

  const cancelEmergencyCountdown = () => {
    setSystemStatus(prev => ({
      ...prev,
      isActive: false,
      countdown: 180
    }));
    
    toast({
      title: "Emergency Cancelled",
      description: "Emergency alert has been cancelled.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="control" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Control
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="biometrics" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Biometrics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Emergency Control Tab */}
        <TabsContent value="control" className="space-y-4">
          {systemStatus.isActive ? (
            <Card className="border-red-500 border-2 bg-red-50 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                  Emergency Mode Active
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {formatTime(systemStatus.countdown)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Emergency alert will be sent automatically
                  </p>
                  <Progress 
                    value={(180 - systemStatus.countdown) / 180 * 100} 
                    className="h-3 mb-4" 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleEmergencyAlert}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Send Now
                    </Button>
                    <Button 
                      onClick={cancelEmergencyCountdown}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Master Emergency Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={startEmergencyCountdown}
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-16 text-lg"
                >
                  <Zap className="h-6 w-6 mr-2" />
                  SEND EMERGENCY ALERT
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call 911
                  </Button>
                  <Button variant="outline">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Panic Alarm
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  Instantly notifies all emergency contacts with your location and status
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Emergency Contacts</span>
                  <Badge variant="default">5 Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Location Services</span>
                  <Badge variant="default">Online</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Alert Status</span>
                  <Badge variant="secondary">{systemStatus.alertsSent} Sent</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Services</span>
                  <Badge variant="default">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Status Tab */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4">
            {/* Phone Status */}
            <Card className={deviceStatus.phone.connected ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className={`h-5 w-5 ${deviceStatus.phone.connected ? "text-green-600" : "text-red-600"}`} />
                    <div>
                      <h3 className="font-medium">Smartphone</h3>
                      <p className="text-sm text-muted-foreground">Primary emergency device</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={deviceStatus.phone.connected ? "default" : "destructive"}>
                      {deviceStatus.phone.connected ? "Connected" : "Disconnected"}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{deviceStatus.phone.battery}%</span>
                      <Progress value={deviceStatus.phone.battery} className="h-2 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smartwatch Status */}
            <Card className={deviceStatus.watch.connected ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Watch className={`h-5 w-5 ${deviceStatus.watch.connected ? "text-green-600" : "text-red-600"}`} />
                    <div>
                      <h3 className="font-medium">Smartwatch</h3>
                      <p className="text-sm text-muted-foreground">Biometric monitoring active</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={deviceStatus.watch.connected ? "default" : "destructive"}>
                      {deviceStatus.watch.connected ? "Connected" : "Disconnected"}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{deviceStatus.watch.battery}%</span>
                      <Progress value={deviceStatus.watch.battery} className="h-2 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Headphones Status */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Headphones className="h-5 w-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium">Smart Headphones</h3>
                      <p className="text-sm text-muted-foreground">Audio monitoring offline</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="secondary">Disconnected</Badge>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Biometrics Tab */}
        <TabsContent value="biometrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Heart Rate Monitoring */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Heart Rate Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold text-red-500">{biometrics.heartRate}</div>
                  <p className="text-sm text-muted-foreground">BPM - Normal Range</p>
                  <Progress value={(biometrics.heartRate / 100) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Stress Level */}
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-yellow-500" />
                  Stress Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold text-yellow-500">{biometrics.stressLevel}%</div>
                  <p className="text-sm text-muted-foreground">Low Stress Detected</p>
                  <Progress value={biometrics.stressLevel} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>AI Emergency Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Current Risk Level</span>
                  <Badge variant="secondary">Low</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Anomalies Detected</span>
                  <Badge variant="default">{biometrics.anomaliesDetected}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Activity Level</span>
                  <span className="font-medium">{biometrics.activityLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Threshold</span>
                  <span className="font-medium">{biometrics.emergencyThreshold}%</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  AI continuously monitors biometric patterns for early emergency detection
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Safety Modes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Silent Mode</p>
                  <p className="text-sm text-muted-foreground">Send alerts without sound or vibration</p>
                </div>
                <Switch checked={silentMode} onCheckedChange={setSilentMode} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Stealth Mode</p>
                  <p className="text-sm text-muted-foreground">Hide all emergency activity from device notifications</p>
                </div>
                <Switch checked={stealthMode} onCheckedChange={setStealthMode} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Alert</p>
                  <p className="text-sm text-muted-foreground">Automatically send alerts when threats are detected</p>
                </div>
                <Switch checked={autoAlert} onCheckedChange={setAutoAlert} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Biometric Lock</p>
                  <p className="text-sm text-muted-foreground">Require biometric verification to disable emergency features</p>
                </div>
                <Switch checked={biometricLock} onCheckedChange={setBiometricLock} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}