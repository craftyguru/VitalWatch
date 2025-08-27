import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Battery,
  Signal,
  Heart,
  Activity,
  Gauge,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export function SensorMonitoring() {
  // Sensor data simulation with realistic updates
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);
  const [heartRate, setHeartRate] = useState(72);
  const [stressLevel, setStressLevel] = useState(15);
  const [threatLevel, setThreatLevel] = useState("LOW");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(20, prev + (Math.random() - 0.5) * 2));
      setSignalStrength(Math.floor(Math.random() * 5));
      setHeartRate(prev => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 4)));
      setStressLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Determine threat level based on stress
  useEffect(() => {
    if (stressLevel > 70) setThreatLevel("HIGH");
    else if (stressLevel > 40) setThreatLevel("MEDIUM");
    else setThreatLevel("LOW");
  }, [stressLevel]);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "HIGH": return "text-red-600 bg-red-100 dark:bg-red-950";
      case "MEDIUM": return "text-orange-600 bg-orange-100 dark:bg-orange-950";
      case "LOW": return "text-green-600 bg-green-100 dark:bg-green-950";
      default: return "text-slate-600 bg-slate-100 dark:bg-slate-900";
    }
  };

  const getSignalIcon = (strength: number) => {
    return strength > 2 ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Threat Level Overview */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-blue-500" />
              <span>Threat Assessment</span>
            </div>
            <Badge className={getThreatColor(threatLevel)}>
              {threatLevel} RISK
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className={`text-3xl font-bold ${getThreatColor(threatLevel).split(' ')[0]}`}>
              {stressLevel}%
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Current stress level based on biometric analysis
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Device Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Battery className="h-5 w-5 text-green-500" />
            <span>Device Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Battery Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-2">
                  <Battery className="h-4 w-4" />
                  <span>Battery</span>
                </Label>
                <span className="text-sm font-medium">{Math.round(batteryLevel)}%</span>
              </div>
              <Progress value={batteryLevel} className="w-full" />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Critical: 20%</span>
                <span>Optimal: 80%+</span>
              </div>
            </div>

            {/* Signal Strength */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-2">
                  {getSignalIcon(signalStrength)}
                  <span>Signal</span>
                </Label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 h-3 rounded ${
                        bar <= signalStrength
                          ? 'bg-green-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {signalStrength > 2 ? "Strong signal" : "Weak signal - may affect emergency alerts"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biometric Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Biometric Monitoring</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heart Rate */}
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {Math.round(heartRate)}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">BPM</div>
              <div className="text-xs text-slate-500 mt-1">
                {heartRate > 90 ? "Elevated" : heartRate < 70 ? "Low" : "Normal"}
              </div>
            </div>

            {/* Activity Level */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(75 + Math.random() * 25)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Activity</div>
              <div className="text-xs text-slate-500 mt-1">
                Moderate movement
              </div>
            </div>
          </div>

          {/* Sensor Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Accelerometer</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Gyroscope</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Ambient Light</span>
              </div>
              <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                Limited
              </Badge>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}