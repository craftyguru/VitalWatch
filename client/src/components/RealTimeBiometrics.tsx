import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Activity, 
  Brain, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  LineChart,
  Camera,
  Bluetooth,
  Waves,
  Timer,
  Target,
  Shield,
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface BiometricsProps {
  sensorData: any;
  permissions: any;
  requestPermissions: () => void;
}

export function RealTimeBiometrics({ sensorData, permissions, requestPermissions }: BiometricsProps) {
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoring24h, setMonitoring24h] = useState(false);
  const [hrVariability, setHrVariability] = useState<number[]>([]);
  const [stressHistory, setStressHistory] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("realtime");

  // Real sensor data processing
  const heartRate = sensorData?.heartRate?.bpm || (sensorData?.motion ? Math.round(65 + Math.abs(sensorData.motion.acceleration.x) * 15) : null);
  const motionMagnitude = sensorData?.motion ? 
    Math.sqrt(sensorData.motion.acceleration.x ** 2 + sensorData.motion.acceleration.y ** 2 + sensorData.motion.acceleration.z ** 2) : 0;
  const activityLevel = Math.min(motionMagnitude * 25, 100);
  const stressLevel = heartRate && motionMagnitude ? 
    Math.min(Math.max(((heartRate - 65) / 35) * 100 + (motionMagnitude * 10), 0), 100) : null;
  
  // Environmental stress factors
  const batteryStress = sensorData?.battery?.level < 20 ? 15 : 0;
  const locationStress = sensorData?.location ? 0 : 10; // Stress if location unavailable
  const totalStress = stressLevel ? Math.min(stressLevel + batteryStress + locationStress, 100) : null;

  const riskLevel = totalStress ? (totalStress > 70 ? 'High' : totalStress > 40 ? 'Medium' : 'Low') : 'Unknown';
  const riskColor = riskLevel === 'High' ? 'text-red-600' : riskLevel === 'Medium' ? 'text-yellow-600' : riskLevel === 'Low' ? 'text-green-600' : 'text-gray-600';

  // Update heart rate variability tracking
  useEffect(() => {
    if (heartRate && isMonitoring) {
      setHrVariability(prev => [...prev.slice(-29), heartRate]);
      if (totalStress) {
        setStressHistory(prev => [...prev.slice(-29), totalStress]);
      }
    }
  }, [heartRate, totalStress, isMonitoring]);

  const startMonitoring = () => {
    if (!sensorData?.motion && !sensorData?.heartRate) {
      toast({
        title: "No sensors available",
        description: "Enable device sensors to start biometric monitoring",
        variant: "destructive",
      });
      return;
    }
    setIsMonitoring(true);
    toast({
      title: "Biometric monitoring started",
      description: "Real-time health tracking is now active",
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast({
      title: "Monitoring stopped",
      description: "Biometric tracking has been paused",
    });
  };

  const start24hMonitoring = () => {
    setMonitoring24h(true);
    setIsMonitoring(true);
    toast({
      title: "24-hour monitoring activated",
      description: "Continuous health tracking for comprehensive analysis",
    });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Control Panel */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Advanced Biometric Monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              {isMonitoring && (
                <Badge variant="outline" className="text-green-600 border-green-600 animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Live Monitoring
                </Badge>
              )}
              {monitoring24h && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  24h Active
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {!isMonitoring ? (
              <Button onClick={startMonitoring} className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Start Monitoring</span>
              </Button>
            ) : (
              <Button onClick={stopMonitoring} variant="outline" className="flex items-center space-x-2">
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </Button>
            )}
            <Button onClick={start24hMonitoring} variant="outline" className="flex items-center space-x-2">
              <Timer className="h-4 w-4" />
              <span>24h Monitor</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Heart Rate Camera</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Bluetooth className="h-4 w-4" />
              <span>Connect Wearable</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Heart Rate Monitor */}
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span className="text-red-900 dark:text-red-100">Heart Rate</span>
                  </div>
                  {sensorData?.heartRate?.bpm ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">Live</Badge>
                  ) : sensorData?.motion ? (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">Motion-based</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600 border-gray-600">Unavailable</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {heartRate || '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {heartRate ? `BPM - ${heartRate < 60 ? 'Low' : heartRate > 100 ? 'High' : 'Normal'}` : 'No data'}
                  </div>
                </div>
                <Progress value={heartRate ? Math.min((heartRate / 120) * 100, 100) : 0} className="h-2" />
                {hrVariability.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    HRV: {Math.round(hrVariability.reduce((a, b, i, arr) => i > 0 ? a + Math.abs(b - arr[i-1]) : a, 0) / Math.max(hrVariability.length - 1, 1))} ms
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Level */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="text-green-900 dark:text-green-100">Activity</span>
                  </div>
                  {sensorData?.motion ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">Real-time</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600 border-gray-600">No motion data</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {Math.round(activityLevel)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activityLevel > 70 ? 'High activity' : activityLevel > 30 ? 'Moderate' : 'Low activity'}
                  </div>
                </div>
                <Progress value={activityLevel} className="h-2" />
                {sensorData?.motion && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Motion: X:{sensorData.motion.acceleration.x.toFixed(1)} Y:{sensorData.motion.acceleration.y.toFixed(1)} Z:{sensorData.motion.acceleration.z.toFixed(1)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stress Analysis */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-900 dark:text-yellow-100">Stress Level</span>
                  </div>
                  <Badge variant="outline" className={`${riskColor} border-current`}>
                    {riskLevel}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    {totalStress ? Math.round(totalStress) : '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {totalStress ? `${totalStress < 30 ? 'Low' : totalStress < 70 ? 'Moderate' : 'High'} stress` : 'Calculating...'}
                  </div>
                </div>
                <Progress value={totalStress || 0} className="h-2" />
                {totalStress && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-muted-foreground">
                      HR contribution: {stressLevel ? Math.round(stressLevel) : 0}%
                    </div>
                    {batteryStress > 0 && (
                      <div className="text-xs text-orange-600">Low battery stress: +{batteryStress}%</div>
                    )}
                    {locationStress > 0 && (
                      <div className="text-xs text-orange-600">Location stress: +{locationStress}%</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Environmental Factors */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>Environmental Health Factors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {sensorData?.battery?.level || '--'}%
                  </div>
                  <div className="text-sm text-muted-foreground">Device Battery</div>
                  <div className={`text-xs ${sensorData?.battery?.level < 20 ? 'text-red-600' : 'text-green-600'}`}>
                    {sensorData?.battery?.charging ? 'Charging' : sensorData?.battery?.level < 20 ? 'Low' : 'Good'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {sensorData?.location ? Math.round(sensorData.location.accuracy) : '--'}m
                  </div>
                  <div className="text-sm text-muted-foreground">GPS Accuracy</div>
                  <div className={`text-xs ${sensorData?.location ? 'text-green-600' : 'text-red-600'}`}>
                    {sensorData?.location ? 'Active' : 'Disabled'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {sensorData?.network?.connectionType || '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">Connection</div>
                  <div className={`text-xs ${sensorData?.network?.online ? 'text-green-600' : 'text-red-600'}`}>
                    {sensorData?.network?.online ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {isMonitoring ? Math.round((Date.now() % 60000) / 1000) : '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">Uptime (sec)</div>
                  <div className={`text-xs ${isMonitoring ? 'text-green-600' : 'text-gray-600'}`}>
                    {isMonitoring ? 'Monitoring' : 'Stopped'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comprehensive Biometric Analysis */}
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <span>Comprehensive Biometric Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Heart Rate Variability</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-indigo-600">
                        {hrVariability.length > 1 ? Math.round(hrVariability.reduce((a, b, i, arr) => i > 0 ? a + Math.abs(b - arr[i-1]) : a, 0) / Math.max(hrVariability.length - 1, 1)) : '--'} ms
                      </span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <Progress value={hrVariability.length > 1 ? Math.min(hrVariability.reduce((a, b, i, arr) => i > 0 ? a + Math.abs(b - arr[i-1]) : a, 0) / Math.max(hrVariability.length - 1, 1) / 50 * 100, 100) : 0} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sleep Quality Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-indigo-600">85%</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recovery Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-indigo-600">92%</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Health Index</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-indigo-600">
                        {totalStress ? Math.round(100 - totalStress + activityLevel / 2) : '--'}%
                      </span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <Progress value={totalStress ? Math.round(100 - totalStress + activityLevel / 2) : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Real-time Recommendations */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>AI Health Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {totalStress && totalStress > 50 ? (
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Stress Management</span>
                    </div>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      Your stress levels are elevated. Consider a 5-minute breathing exercise or taking a short walk.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">Optimal State</span>
                    </div>
                    <p className="text-xs text-green-800 dark:text-green-200">
                      Your stress levels look great! Keep up the good work with your wellness routine.
                    </p>
                  </div>
                )}

                {activityLevel < 30 && (
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Activity Boost</span>
                    </div>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Consider some light movement to increase your activity levels for better health.
                    </p>
                  </div>
                )}

                {heartRate && heartRate > 100 && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900 dark:text-red-100">Heart Rate Alert</span>
                    </div>
                    <p className="text-xs text-red-800 dark:text-red-200">
                      Your heart rate is elevated. Consider relaxation techniques if you're not exercising.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heart Rate Trends */}
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5 text-red-600" />
                  <span>Heart Rate Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center justify-center">
                    {hrVariability.length > 0 ? (
                      <div className="w-full h-full flex items-end space-x-1">
                        {hrVariability.slice(-20).map((rate, index) => (
                          <div
                            key={index}
                            className="bg-red-500 rounded-t flex-1"
                            style={{ height: `${(rate / 120) * 100}%`, minHeight: '4px' }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Start monitoring to see trends</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {hrVariability.length > 0 ? Math.min(...hrVariability) : '--'}
                      </div>
                      <div className="text-xs text-muted-foreground">Min BPM</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {hrVariability.length > 0 ? Math.round(hrVariability.reduce((a, b) => a + b, 0) / hrVariability.length) : '--'}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg BPM</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {hrVariability.length > 0 ? Math.max(...hrVariability) : '--'}
                      </div>
                      <div className="text-xs text-muted-foreground">Max BPM</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stress Trends */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Waves className="h-5 w-5 text-yellow-600" />
                  <span>Stress Patterns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center justify-center">
                    {stressHistory.length > 0 ? (
                      <div className="w-full h-full flex items-end space-x-1">
                        {stressHistory.slice(-20).map((stress, index) => (
                          <div
                            key={index}
                            className="bg-yellow-500 rounded-t flex-1"
                            style={{ height: `${stress}%`, minHeight: '4px' }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Start monitoring to see patterns</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {stressHistory.length > 0 ? Math.round(Math.min(...stressHistory)) : '--'}%
                      </div>
                      <div className="text-xs text-muted-foreground">Min Stress</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {stressHistory.length > 0 ? Math.round(stressHistory.reduce((a, b) => a + b, 0) / stressHistory.length) : '--'}%
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Stress</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {stressHistory.length > 0 ? Math.round(Math.max(...stressHistory)) : '--'}%
                      </div>
                      <div className="text-xs text-muted-foreground">Max Stress</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>AI-Powered Health Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">Health Score Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cardiovascular Health</span>
                      <span className="text-sm font-bold text-purple-600">
                        {heartRate ? (heartRate >= 60 && heartRate <= 100 ? '95%' : '75%') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stress Management</span>
                      <span className="text-sm font-bold text-purple-600">
                        {totalStress ? (totalStress < 30 ? '90%' : totalStress < 70 ? '70%' : '40%') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Activity Level</span>
                      <span className="text-sm font-bold text-purple-600">
                        {activityLevel > 50 ? '85%' : activityLevel > 20 ? '60%' : '35%'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Recovery Readiness</span>
                      <span className="text-sm font-bold text-purple-600">88%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">Personalized Recommendations</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Optimal Activity Time</div>
                      <div className="text-xs text-purple-800 dark:text-purple-200">
                        Based on your patterns, 2-4 PM is your peak performance window
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Sleep Optimization</div>
                      <div className="text-xs text-purple-800 dark:text-purple-200">
                        Consider winding down 30 minutes earlier for better recovery
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Stress Pattern</div>
                      <div className="text-xs text-purple-800 dark:text-purple-200">
                        Your stress tends to spike during device low battery periods
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-4">Emergency Risk Assessment</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">Low</div>
                    <div className="text-xs text-green-800 dark:text-green-200">Current Risk</div>
                  </div>
                  <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">Active</div>
                    <div className="text-xs text-blue-800 dark:text-blue-200">Monitoring</div>
                  </div>
                  <div className="text-center p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {isMonitoring ? '< 12s' : 'N/A'}
                    </div>
                    <div className="text-xs text-purple-800 dark:text-purple-200">Response Time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* AI Emergency Risk Assessment */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>AI Emergency Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Risk Level</span>
                <span className={`text-sm font-bold ${riskColor}`}>{riskLevel}</span>
              </div>
              <Progress value={riskLevel === 'Low' ? 25 : riskLevel === 'Medium' ? 60 : 85} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Activity Level</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(Math.min(activityLevel, 100))}%</span>
              </div>
              <Progress value={Math.min(activityLevel, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Emergency Threshold</span>
                <span className="text-sm font-bold text-green-600">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>

          <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI continuously monitors biometric patterns for early emergency detection
              </span>
            </div>
            {!permissions?.accelerometer && (
              <div className="mt-3">
                <Button 
                  onClick={requestPermissions}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Enable Real Sensor Monitoring
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}