import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Activity, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Settings, 
  Zap,
  Heart,
  MapPin,
  Smartphone,
  Volume2,
  Camera,
  Wifi,
  Clock,
  Target
} from 'lucide-react';

interface AIGuardianProps {
  sensorData?: any;
  onPanicTrigger?: () => void;
  realTimeData?: any;
}

interface ThreatLevel {
  level: 'safe' | 'caution' | 'warning' | 'critical';
  confidence: number;
  reasons: string[];
  recommendations: string[];
}

export default function AIGuardian({ sensorData, onPanicTrigger, realTimeData }: AIGuardianProps) {
  const [isActive, setIsActive] = useState(false);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>({
    level: 'safe',
    confidence: 0.95,
    reasons: ['All sensors normal', 'No unusual patterns detected'],
    recommendations: ['Continue normal activities']
  });
  
  // Threshold settings
  const [thresholds, setThresholds] = useState({
    heartRateMin: 50,
    heartRateMax: 120,
    motionThreshold: 15,
    audioLevelMax: 80,
    lightLevelMin: 10,
    autoTriggerPanic: true,
    confidenceThreshold: 85
  });

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated sensor readings (in real app, these would come from actual sensors)
  const [currentReadings, setCurrentReadings] = useState({
    heartRate: realTimeData?.heartRate?.bpm || 72,
    motion: realTimeData?.motion ? Math.sqrt(
      Math.pow(realTimeData.motion.acceleration.x, 2) +
      Math.pow(realTimeData.motion.acceleration.y, 2) +
      Math.pow(realTimeData.motion.acceleration.z, 2)
    ) : 9.8,
    audioLevel: 45,
    lightLevel: 65,
    location: realTimeData?.location || null,
    batteryLevel: realTimeData?.battery?.level || 85,
    networkStrength: 4
  });

  // Start AI Guardian monitoring
  const startGuardian = async () => {
    setIsActive(true);
    
    // Start continuous analysis
    analysisIntervalRef.current = setInterval(() => {
      performAIAnalysis();
    }, 10000); // Analyze every 10 seconds

    // Initial analysis
    await performAIAnalysis();
  };

  // Stop AI Guardian monitoring
  const stopGuardian = () => {
    setIsActive(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  // Perform AI-powered situation assessment
  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Prepare sensor data for AI analysis
      const sensorContext = {
        timestamp: new Date().toISOString(),
        heartRate: currentReadings.heartRate,
        motion: currentReadings.motion,
        audioLevel: currentReadings.audioLevel,
        lightLevel: currentReadings.lightLevel,
        batteryLevel: currentReadings.batteryLevel,
        networkStrength: currentReadings.networkStrength,
        location: currentReadings.location,
        thresholds
      };

      // Send to AI for analysis
      const response = await fetch('/api/ai-guardian-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sensorData: sensorContext })
      });

      if (response.ok) {
        const analysis = await response.json();
        setThreatLevel(analysis.threatLevel);
        setAiAnalysis(analysis.explanation);

        // Check if auto-panic should be triggered
        if (
          thresholds.autoTriggerPanic && 
          analysis.threatLevel.level === 'critical' &&
          analysis.threatLevel.confidence >= thresholds.confidenceThreshold
        ) {
          triggerAutoPanic(analysis.threatLevel.reasons);
        }
      }
    } catch (error) {
      console.error('AI Guardian analysis failed:', error);
      // Fallback to rule-based analysis
      performFallbackAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fallback rule-based analysis when AI is unavailable
  const performFallbackAnalysis = () => {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let level: ThreatLevel['level'] = 'safe';
    let confidence = 0.8;

    // Heart rate analysis
    if (currentReadings.heartRate < thresholds.heartRateMin) {
      reasons.push('Heart rate below normal range');
      level = 'warning';
    } else if (currentReadings.heartRate > thresholds.heartRateMax) {
      reasons.push('Elevated heart rate detected');
      level = 'caution';
    }

    // Motion analysis
    if (currentReadings.motion > thresholds.motionThreshold) {
      reasons.push('Sudden motion detected - possible fall');
      level = 'critical';
      confidence = 0.9;
    }

    // Audio analysis
    if (currentReadings.audioLevel > thresholds.audioLevelMax) {
      reasons.push('Loud noise detected');
      level = level === 'safe' ? 'caution' : level;
    }

    // Light level analysis
    if (currentReadings.lightLevel < thresholds.lightLevelMin) {
      reasons.push('Very low light conditions');
      level = level === 'safe' ? 'caution' : level;
    }

    // Generate recommendations
    if (level === 'safe') {
      recommendations.push('Continue normal activities');
      reasons.push('All vital signs within normal range');
    } else if (level === 'critical') {
      recommendations.push('Consider activating emergency alert');
      recommendations.push('Move to a safe location if possible');
    }

    setThreatLevel({ level, confidence, reasons, recommendations });
  };

  // Trigger automatic panic mode
  const triggerAutoPanic = (reasons: string[]) => {
    if (onPanicTrigger) {
      console.log('AI Guardian triggering auto-panic:', reasons);
      onPanicTrigger();
    }
  };

  // Update sensor readings (simulate real sensor updates)
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCurrentReadings(prev => ({
          ...prev,
          heartRate: realTimeData?.heartRate?.bpm || (prev.heartRate + (Math.random() - 0.5) * 5),
          motion: realTimeData?.motion ? Math.sqrt(
            Math.pow(realTimeData.motion.acceleration.x, 2) +
            Math.pow(realTimeData.motion.acceleration.y, 2) +
            Math.pow(realTimeData.motion.acceleration.z, 2)
          ) : (prev.motion + (Math.random() - 0.5) * 2),
          audioLevel: prev.audioLevel + (Math.random() - 0.5) * 10,
          lightLevel: prev.lightLevel + (Math.random() - 0.5) * 5
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isActive, realTimeData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  const getThreatColor = () => {
    switch (threatLevel.level) {
      case 'safe': return 'text-green-600 bg-green-50 border-green-200';
      case 'caution': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getThreatIcon = () => {
    switch (threatLevel.level) {
      case 'safe': return <Shield className="h-5 w-5" />;
      case 'caution': return <Eye className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-purple-600" />
              <div>
                <CardTitle>AI Guardian</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Intelligent monitoring with automatic threat assessment
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isActive && (
                <Badge variant="outline" className="animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  Monitoring
                </Badge>
              )}
              <Button
                onClick={isActive ? stopGuardian : startGuardian}
                className={isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isActive ? 'Stop Guardian' : 'Start Guardian'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Threat Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getThreatIcon()}
            <span>Current Threat Assessment</span>
            {isAnalyzing && (
              <Badge variant="outline" className="animate-pulse">
                Analyzing...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${getThreatColor()}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg capitalize">{threatLevel.level}</h3>
                <Badge variant="outline">
                  {Math.round(threatLevel.confidence * 100)}% confidence
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium mb-1">Assessment Factors:</h4>
                  <ul className="text-sm space-y-1">
                    {threatLevel.reasons.map((reason, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-current rounded-full" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Recommendations:</h4>
                  <ul className="text-sm space-y-1">
                    {threatLevel.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Target className="h-3 w-3" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {aiAnalysis && (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Analysis:</strong> {aiAnalysis}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sensor Dashboard & Settings */}
      <Tabs defaultValue="sensors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sensors">Live Sensors</TabsTrigger>
          <TabsTrigger value="settings">Threshold Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Heart Rate</span>
                  </div>
                  <span className="text-2xl font-bold">{Math.round(currentReadings.heartRate)}</span>
                </div>
                <div className="text-sm text-muted-foreground">BPM</div>
                <Progress 
                  value={(currentReadings.heartRate / 150) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Motion</span>
                  </div>
                  <span className="text-2xl font-bold">{currentReadings.motion.toFixed(1)}</span>
                </div>
                <div className="text-sm text-muted-foreground">m/s²</div>
                <Progress 
                  value={Math.min((currentReadings.motion / 20) * 100, 100)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Audio Level</span>
                  </div>
                  <span className="text-2xl font-bold">{Math.round(currentReadings.audioLevel)}</span>
                </div>
                <div className="text-sm text-muted-foreground">dB</div>
                <Progress 
                  value={(currentReadings.audioLevel / 100) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Light Level</span>
                  </div>
                  <span className="text-2xl font-bold">{Math.round(currentReadings.lightLevel)}</span>
                </div>
                <div className="text-sm text-muted-foreground">%</div>
                <Progress 
                  value={currentReadings.lightLevel} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Threshold Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Heart Rate Range</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Minimum BPM</label>
                      <Slider
                        value={[thresholds.heartRateMin]}
                        onValueChange={(value) => setThresholds(prev => ({ ...prev, heartRateMin: value[0] }))}
                        max={100}
                        min={30}
                        step={5}
                        className="w-full"
                      />
                      <span className="text-sm">{thresholds.heartRateMin} BPM</span>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Maximum BPM</label>
                      <Slider
                        value={[thresholds.heartRateMax]}
                        onValueChange={(value) => setThresholds(prev => ({ ...prev, heartRateMax: value[0] }))}
                        max={200}
                        min={80}
                        step={5}
                        className="w-full"
                      />
                      <span className="text-sm">{thresholds.heartRateMax} BPM</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Motion Threshold</label>
                  <Slider
                    value={[thresholds.motionThreshold]}
                    onValueChange={(value) => setThresholds(prev => ({ ...prev, motionThreshold: value[0] }))}
                    max={30}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <span className="text-sm">{thresholds.motionThreshold} m/s² (fall detection)</span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Audio Alert Level</label>
                  <Slider
                    value={[thresholds.audioLevelMax]}
                    onValueChange={(value) => setThresholds(prev => ({ ...prev, audioLevelMax: value[0] }))}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <span className="text-sm">{thresholds.audioLevelMax} dB</span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">AI Confidence Threshold</label>
                  <Slider
                    value={[thresholds.confidenceThreshold]}
                    onValueChange={(value) => setThresholds(prev => ({ ...prev, confidenceThreshold: value[0] }))}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <span className="text-sm">{thresholds.confidenceThreshold}% (minimum confidence for auto-actions)</span>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Auto-Trigger Panic Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically activate panic mode when critical threats are detected
                    </p>
                  </div>
                  <Switch
                    checked={thresholds.autoTriggerPanic}
                    onCheckedChange={(checked) => setThresholds(prev => ({ ...prev, autoTriggerPanic: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}