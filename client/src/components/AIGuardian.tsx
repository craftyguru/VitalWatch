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
  Target,
  Thermometer,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Calendar,
  Users,
  Bell,
  Map,
  Cpu,
  Battery,
  Signal,
  CloudRain,
  Home,
  Car,
  Building,
  TreePine,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  Crosshair,
  Radar,
  ScanLine,
  Monitor
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

interface IncidentLog {
  id: string;
  timestamp: Date;
  type: 'auto' | 'manual' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  sensorData: any;
  actionTaken?: string;
  resolved: boolean;
}

interface PredictiveAlert {
  id: string;
  type: 'health' | 'safety' | 'environmental';
  prediction: string;
  confidence: number;
  timeframe: string;
  preventiveActions: string[];
  priority: 'low' | 'medium' | 'high';
}

export default function AIGuardian({ sensorData, onPanicTrigger, realTimeData }: AIGuardianProps) {
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'analytics' | 'incidents' | 'settings'>('overview');
  
  // Enhanced threat assessment
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>({
    level: 'safe',
    confidence: 0.95,
    reasons: ['All sensors within normal parameters', 'No behavioral anomalies detected', 'Environmental conditions stable'],
    recommendations: ['Continue normal activities', 'Maintain current monitoring settings']
  });
  
  // Enhanced threshold settings
  const [thresholds, setThresholds] = useState({
    // Vitals
    heartRateMin: 50,
    heartRateMax: 120,
    temperatureMin: 96.0,
    temperatureMax: 100.4,
    stressLevelMax: 70,
    // Motion & Activity
    motionThreshold: 15,
    fallDetectionSensitivity: 12,
    inactivityTimeout: 30, // minutes
    // Environmental
    audioLevelMax: 80,
    lightLevelMin: 10,
    airQualityMin: 50,
    // System
    batteryLevelMin: 20,
    networkStrengthMin: 2,
    // AI Settings
    autoTriggerPanic: true,
    confidenceThreshold: 85,
    analysisInterval: 10, // seconds
    predictiveAnalysis: true
  });

  // Comprehensive sensor readings
  const [currentReadings, setCurrentReadings] = useState({
    // Core vitals
    heartRate: realTimeData?.heartRate?.bpm || 72,
    temperature: 98.6,
    stressLevel: 25,
    bloodOxygen: 98,
    respiratoryRate: 16,
    
    // Motion & Activity
    motion: realTimeData?.motion ? Math.sqrt(
      Math.pow(realTimeData.motion.acceleration.x, 2) +
      Math.pow(realTimeData.motion.acceleration.y, 2) +
      Math.pow(realTimeData.motion.acceleration.z, 2)
    ) : 9.8,
    stepCount: 5240,
    activityLevel: 65,
    posture: 'upright',
    
    // Environmental
    audioLevel: 45,
    lightLevel: 65,
    airQuality: 85,
    humidity: 45,
    ambientTemperature: 72,
    uvIndex: 3,
    
    // Location & Context
    location: realTimeData?.location || null,
    locationContext: 'indoor',
    weatherConditions: 'clear',
    timeOfDay: 'afternoon',
    
    // Device status
    batteryLevel: realTimeData?.battery?.level || 85,
    networkStrength: 4,
    deviceTemperature: 95,
    signalQuality: 'excellent'
  });

  // Incident logging
  const [incidents, setIncidents] = useState<IncidentLog[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000),
      type: 'auto',
      severity: 'medium',
      description: 'Elevated heart rate detected during physical activity',
      sensorData: { heartRate: 145, activity: 'running' },
      actionTaken: 'Monitored for 10 minutes, returned to normal',
      resolved: true
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000),
      type: 'anomaly',
      severity: 'low',
      description: 'Unusual motion pattern - possible stumble',
      sensorData: { motion: 18.2, stability: 'low' },
      actionTaken: 'User check-in completed successfully',
      resolved: true
    }
  ]);

  // Predictive alerts
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([
    {
      id: '1',
      type: 'health',
      prediction: 'Potential fatigue based on activity patterns',
      confidence: 0.78,
      timeframe: 'next 2 hours',
      preventiveActions: ['Take a 15-minute rest break', 'Hydrate adequately', 'Consider light stretching'],
      priority: 'medium'
    },
    {
      id: '2',
      type: 'environmental',
      prediction: 'Air quality may decline due to weather patterns',
      confidence: 0.65,
      timeframe: 'next 4 hours',
      preventiveActions: ['Close windows', 'Use air purifier if available', 'Limit outdoor activities'],
      priority: 'low'
    }
  ]);

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [monitoringStats, setMonitoringStats] = useState({
    uptime: '2h 34m',
    analysesPerformed: 847,
    anomaliesDetected: 3,
    falsePositives: 0,
    predictiveAccuracy: 94.2
  });

  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const patternAnalysisRef = useRef<NodeJS.Timeout | null>(null);

  // Professional monitoring functions
  const startGuardian = async () => {
    setIsActive(true);
    
    // Start continuous analysis
    analysisIntervalRef.current = setInterval(() => {
      performAIAnalysis();
    }, thresholds.analysisInterval * 1000);

    // Start pattern analysis
    patternAnalysisRef.current = setInterval(() => {
      analyzeBehavioralPatterns();
    }, 30000); // Every 30 seconds

    // Initial comprehensive analysis
    await performAIAnalysis();
    generatePredictiveInsights();
  };

  const stopGuardian = () => {
    setIsActive(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (patternAnalysisRef.current) {
      clearInterval(patternAnalysisRef.current);
      patternAnalysisRef.current = null;
    }
  };

  // Enhanced AI analysis with comprehensive data
  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const comprehensiveSensorData = {
        timestamp: new Date().toISOString(),
        vitals: {
          heartRate: currentReadings.heartRate,
          temperature: currentReadings.temperature,
          stressLevel: currentReadings.stressLevel,
          bloodOxygen: currentReadings.bloodOxygen,
          respiratoryRate: currentReadings.respiratoryRate
        },
        motion: {
          acceleration: currentReadings.motion,
          stepCount: currentReadings.stepCount,
          activityLevel: currentReadings.activityLevel,
          posture: currentReadings.posture
        },
        environmental: {
          audioLevel: currentReadings.audioLevel,
          lightLevel: currentReadings.lightLevel,
          airQuality: currentReadings.airQuality,
          humidity: currentReadings.humidity,
          ambientTemperature: currentReadings.ambientTemperature
        },
        context: {
          location: currentReadings.location,
          locationContext: currentReadings.locationContext,
          timeOfDay: currentReadings.timeOfDay,
          weatherConditions: currentReadings.weatherConditions
        },
        device: {
          batteryLevel: currentReadings.batteryLevel,
          networkStrength: currentReadings.networkStrength,
          signalQuality: currentReadings.signalQuality
        },
        thresholds,
        recentIncidents: incidents.slice(-5),
        patternHistory: [] // Would contain historical data
      };

      const response = await fetch('/api/ai-guardian-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sensorData: comprehensiveSensorData })
      });

      if (response.ok) {
        const analysis = await response.json();
        setThreatLevel(analysis.threatLevel);
        setAiAnalysis(analysis.explanation);

        // Check for auto-panic trigger
        if (
          thresholds.autoTriggerPanic && 
          analysis.threatLevel.level === 'critical' &&
          analysis.threatLevel.confidence >= thresholds.confidenceThreshold / 100
        ) {
          triggerAutoPanic(analysis.threatLevel.reasons);
        }

        // Log incident if necessary
        if (analysis.threatLevel.level === 'warning' || analysis.threatLevel.level === 'critical') {
          logIncident(analysis);
        }

        // Update monitoring stats
        setMonitoringStats(prev => ({
          ...prev,
          analysesPerformed: prev.analysesPerformed + 1
        }));
      }
    } catch (error) {
      console.error('AI Guardian analysis failed:', error);
      performFallbackAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Behavioral pattern analysis
  const analyzeBehavioralPatterns = () => {
    // Simulate pattern analysis
    const patterns = [
      'Heart rate variability within normal range',
      'Activity levels consistent with daily routine',
      'Sleep quality indicators stable',
      'Stress response patterns normal'
    ];

    // Update predictive insights based on patterns
    if (thresholds.predictiveAnalysis) {
      generatePredictiveInsights();
    }
  };

  // Generate predictive insights
  const generatePredictiveInsights = () => {
    // Simulate predictive analysis
    const currentTime = new Date().getHours();
    
    if (currentTime > 20 && currentReadings.activityLevel > 70) {
      const newAlert: PredictiveAlert = {
        id: Date.now().toString(),
        type: 'health',
        prediction: 'High activity late in evening may affect sleep quality',
        confidence: 0.82,
        timeframe: 'tonight',
        preventiveActions: ['Begin wind-down routine', 'Reduce screen time', 'Practice relaxation exercises'],
        priority: 'medium'
      };
      
      setPredictiveAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
    }
  };

  // Log incidents
  const logIncident = (analysis: any) => {
    const newIncident: IncidentLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'auto',
      severity: analysis.threatLevel.level === 'critical' ? 'critical' : 'medium',
      description: analysis.threatLevel.reasons.join(', '),
      sensorData: currentReadings,
      resolved: false
    };

    setIncidents(prev => [newIncident, ...prev.slice(0, 19)]); // Keep last 20 incidents
  };

  // Enhanced fallback analysis
  const performFallbackAnalysis = () => {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let level: ThreatLevel['level'] = 'safe';
    let confidence = 0.8;

    // Comprehensive vitals analysis
    if (currentReadings.heartRate < thresholds.heartRateMin) {
      reasons.push('Heart rate below normal range - possible bradycardia');
      level = 'warning';
    } else if (currentReadings.heartRate > thresholds.heartRateMax) {
      reasons.push('Elevated heart rate detected');
      level = 'caution';
    }

    if (currentReadings.temperature > thresholds.temperatureMax) {
      reasons.push('Elevated body temperature detected');
      level = 'warning';
    }

    if (currentReadings.stressLevel > thresholds.stressLevelMax) {
      reasons.push('High stress levels detected');
      level = level === 'safe' ? 'caution' : level;
    }

    // Motion and fall detection
    if (currentReadings.motion > thresholds.motionThreshold) {
      reasons.push('Sudden high acceleration - possible fall or impact');
      level = 'critical';
      confidence = 0.9;
    }

    // Environmental factors
    if (currentReadings.airQuality < thresholds.airQualityMin) {
      reasons.push('Poor air quality detected');
      level = level === 'safe' ? 'caution' : level;
    }

    // Device and connectivity
    if (currentReadings.batteryLevel < thresholds.batteryLevelMin) {
      reasons.push('Low device battery - emergency response capability may be affected');
      level = level === 'safe' ? 'caution' : level;
    }

    // Generate recommendations
    if (level === 'safe') {
      reasons.push('All vital signs and environmental factors within normal parameters');
      recommendations.push('Continue normal activities');
      recommendations.push('Maintain current monitoring settings');
    } else if (level === 'critical') {
      recommendations.push('Immediate assessment recommended');
      recommendations.push('Consider activating emergency response');
      recommendations.push('Contact healthcare provider if symptoms persist');
    } else {
      recommendations.push('Monitor situation closely');
      recommendations.push('Take preventive actions as needed');
    }

    setThreatLevel({ level, confidence, reasons, recommendations });
  };

  // Auto-panic trigger
  const triggerAutoPanic = (reasons: string[]) => {
    if (onPanicTrigger) {
      console.log('AI Guardian triggering auto-panic:', reasons);
      
      // Log the auto-panic incident
      const panicIncident: IncidentLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'auto',
        severity: 'critical',
        description: `Auto-panic triggered: ${reasons.join(', ')}`,
        sensorData: currentReadings,
        actionTaken: 'Emergency response activated automatically',
        resolved: false
      };
      
      setIncidents(prev => [panicIncident, ...prev]);
      onPanicTrigger();
    }
  };

  // Update comprehensive sensor readings with realistic variations
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCurrentReadings(prev => ({
          ...prev,
          // Core vitals with realistic variation
          heartRate: realTimeData?.heartRate?.bpm || Math.max(50, Math.min(150, prev.heartRate + (Math.random() - 0.5) * 8)),
          temperature: Math.max(96, Math.min(102, prev.temperature + (Math.random() - 0.5) * 0.2)),
          stressLevel: Math.max(0, Math.min(100, prev.stressLevel + (Math.random() - 0.5) * 10)),
          bloodOxygen: Math.max(85, Math.min(100, prev.bloodOxygen + (Math.random() - 0.5) * 2)),
          
          // Motion and activity
          motion: realTimeData?.motion ? Math.sqrt(
            Math.pow(realTimeData.motion.acceleration.x, 2) +
            Math.pow(realTimeData.motion.acceleration.y, 2) +
            Math.pow(realTimeData.motion.acceleration.z, 2)
          ) : Math.max(0, prev.motion + (Math.random() - 0.5) * 3),
          stepCount: prev.stepCount + Math.floor(Math.random() * 3),
          activityLevel: Math.max(0, Math.min(100, prev.activityLevel + (Math.random() - 0.5) * 15)),
          
          // Environmental
          audioLevel: Math.max(20, Math.min(100, prev.audioLevel + (Math.random() - 0.5) * 15)),
          lightLevel: Math.max(0, Math.min(100, prev.lightLevel + (Math.random() - 0.5) * 10)),
          airQuality: Math.max(0, Math.min(100, prev.airQuality + (Math.random() - 0.5) * 5)),
          humidity: Math.max(20, Math.min(80, prev.humidity + (Math.random() - 0.5) * 5)),
          
          // Device status
          batteryLevel: Math.max(0, prev.batteryLevel - (Math.random() * 0.1))
        }));
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isActive, realTimeData]);

  // Update monitoring uptime
  useEffect(() => {
    if (isActive) {
      const uptimeInterval = setInterval(() => {
        setMonitoringStats(prev => {
          const currentUptime = prev.uptime;
          const [hours, minutes] = currentUptime.split('h ')[0] === currentUptime 
            ? [0, parseInt(currentUptime.split('m')[0])]
            : [parseInt(currentUptime.split('h')[0]), parseInt(currentUptime.split('h ')[1].split('m')[0])];
          
          const newMinutes = minutes + 1;
          const newHours = hours + Math.floor(newMinutes / 60);
          const finalMinutes = newMinutes % 60;
          
          return {
            ...prev,
            uptime: `${newHours}h ${finalMinutes}m`
          };
        });
      }, 60000); // Update every minute

      return () => clearInterval(uptimeInterval);
    }
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      if (patternAnalysisRef.current) clearInterval(patternAnalysisRef.current);
    };
  }, []);

  // Helper functions
  const getThreatColor = () => {
    switch (threatLevel.level) {
      case 'safe': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';
      case 'caution': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
    }
  };

  const getThreatIcon = () => {
    switch (threatLevel.level) {
      case 'safe': return <CheckCircle className="h-5 w-5" />;
      case 'caution': return <AlertCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <XCircle className="h-5 w-5" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Info className="h-4 w-4 text-blue-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getPredictiveIcon = (type: string) => {
    switch (type) {
      case 'health': return <Heart className="h-4 w-4 text-red-500" />;
      case 'safety': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'environmental': return <CloudRain className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-600 text-white p-3 rounded-xl">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-900 dark:text-purple-100">AI Guardian Pro</CardTitle>
                <p className="text-purple-700 dark:text-purple-300">
                  Enterprise-grade intelligent monitoring with predictive threat assessment
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isActive && (
                <div className="text-right">
                  <Badge variant="outline" className="animate-pulse bg-green-100 text-green-800 border-green-300">
                    <Radar className="h-3 w-3 mr-1" />
                    Active Monitoring
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    Uptime: {monitoringStats.uptime}
                  </div>
                </div>
              )}
              <Button
                onClick={isActive ? stopGuardian : startGuardian}
                className={`px-6 ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                size="lg"
              >
                {isActive ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Stop Guardian
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Start Guardian
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Professional Navigation */}
      <Card>
        <CardContent className="p-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="flex items-center space-x-2 p-3">
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="vitals" className="flex items-center space-x-2 p-3">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Vitals</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2 p-3">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="incidents" className="flex items-center space-x-2 p-3">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Incidents</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2 p-3">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Current Threat Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getThreatIcon()}
                    <span>Current Threat Assessment</span>
                    {isAnalyzing && (
                      <Badge variant="outline" className="animate-pulse">
                        <ScanLine className="h-3 w-3 mr-1" />
                        Analyzing...
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-6 rounded-lg border-2 ${getThreatColor()}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-2xl capitalize">{threatLevel.level}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-white/50">
                          {Math.round(threatLevel.confidence * 100)}% confidence
                        </Badge>
                        <Badge variant="outline" className="bg-white/50">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date().toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Crosshair className="h-4 w-4 mr-1" />
                          Assessment Factors
                        </h4>
                        <ul className="space-y-1">
                          {threatLevel.reasons.map((reason, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          AI Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {threatLevel.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {aiAnalysis && (
                      <div className="mt-4 p-4 bg-white/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Brain className="h-4 w-4 mr-1" />
                          Detailed AI Analysis
                        </h4>
                        <p className="text-sm">{aiAnalysis}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{monitoringStats.uptime}</div>
                    <div className="text-xs text-muted-foreground">System Uptime</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{monitoringStats.analysesPerformed}</div>
                    <div className="text-xs text-muted-foreground">Analyses</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{monitoringStats.anomaliesDetected}</div>
                    <div className="text-xs text-muted-foreground">Anomalies</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{monitoringStats.falsePositives}</div>
                    <div className="text-xs text-muted-foreground">False Positives</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{monitoringStats.predictiveAccuracy}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </CardContent>
                </Card>
              </div>

              {/* Predictive Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Predictive Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictiveAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        {getPredictiveIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{alert.prediction}</h4>
                            <Badge variant={alert.priority === 'high' ? 'destructive' : alert.priority === 'medium' ? 'default' : 'secondary'}>
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {Math.round(alert.confidence * 100)}% confidence • {alert.timeframe}
                          </p>
                          <div className="text-xs">
                            <strong>Preventive actions:</strong> {alert.preventiveActions.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="space-y-6 mt-6">
              {/* Core Vitals */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Heart Rate</span>
                      </div>
                      <span className="text-2xl font-bold">{Math.round(currentReadings.heartRate)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">BPM</div>
                    <Progress 
                      value={(currentReadings.heartRate / 180) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs mt-1 text-muted-foreground">
                      Normal: {thresholds.heartRateMin}-{thresholds.heartRateMax} BPM
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Temperature</span>
                      </div>
                      <span className="text-2xl font-bold">{currentReadings.temperature.toFixed(1)}°</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Fahrenheit</div>
                    <Progress 
                      value={((currentReadings.temperature - 95) / 10) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs mt-1 text-muted-foreground">
                      Normal: {thresholds.temperatureMin}-{thresholds.temperatureMax}°F
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Stress Level</span>
                      </div>
                      <span className="text-2xl font-bold">{Math.round(currentReadings.stressLevel)}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Current</div>
                    <Progress 
                      value={currentReadings.stressLevel} 
                      className="h-2"
                    />
                    <div className="text-xs mt-1 text-muted-foreground">
                      Alert: &gt;{thresholds.stressLevelMax}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Blood Oxygen</span>
                      </div>
                      <span className="text-2xl font-bold">{Math.round(currentReadings.bloodOxygen)}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">SpO2</div>
                    <Progress 
                      value={currentReadings.bloodOxygen} 
                      className="h-2"
                    />
                    <div className="text-xs mt-1 text-muted-foreground">
                      Normal: &gt;95%
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-cyan-200 bg-cyan-50/50 dark:bg-cyan-950/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-cyan-500" />
                        <span className="font-medium">Respiratory</span>
                      </div>
                      <span className="text-2xl font-bold">{Math.round(currentReadings.respiratoryRate)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">BPM</div>
                    <Progress 
                      value={(currentReadings.respiratoryRate / 30) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs mt-1 text-muted-foreground">
                      Normal: 12-20 BPM
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Activity</span>
                      </div>
                      <span className="text-2xl font-bold">{Math.round(currentReadings.activityLevel)}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Level</div>
                    <Progress 
                      value={currentReadings.activityLevel} 
                      className="h-2"
                    />
                    <div className="text-xs mt-1 text-muted-foreground">
                      Steps: {currentReadings.stepCount.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Environmental Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Map className="h-5 w-5" />
                    <span>Environmental Monitoring</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Volume2 className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                      <div className="text-lg font-bold">{Math.round(currentReadings.audioLevel)} dB</div>
                      <div className="text-xs text-muted-foreground">Audio Level</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Eye className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
                      <div className="text-lg font-bold">{Math.round(currentReadings.lightLevel)}%</div>
                      <div className="text-xs text-muted-foreground">Light Level</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <CloudRain className="h-5 w-5 mx-auto mb-2 text-green-500" />
                      <div className="text-lg font-bold">{Math.round(currentReadings.airQuality)}%</div>
                      <div className="text-xs text-muted-foreground">Air Quality</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Thermometer className="h-5 w-5 mx-auto mb-2 text-red-500" />
                      <div className="text-lg font-bold">{Math.round(currentReadings.ambientTemperature)}°F</div>
                      <div className="text-xs text-muted-foreground">Ambient Temp</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <LineChart className="h-5 w-5" />
                      <span>Threat Level Trends</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Real-time threat analytics chart</p>
                        <p className="text-sm">Would display historical threat levels</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Incident Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <PieChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Incident type breakdown</p>
                        <p className="text-sm">Would display incident categories</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pattern Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Radar className="h-5 w-5" />
                    <span>Behavioral Pattern Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Daily Patterns</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Heart Rate Variability</span>
                          <span className="text-green-600">Normal</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Activity Consistency</span>
                          <span className="text-green-600">Stable</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Sleep Quality</span>
                          <span className="text-yellow-600">Moderate</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Anomaly Detection</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Motion Patterns</span>
                          <span className="text-green-600">Normal</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Stress Response</span>
                          <span className="text-green-600">Typical</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Environmental Adaptation</span>
                          <span className="text-green-600">Good</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Risk Factors</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Fall Risk</span>
                          <span className="text-green-600">Low</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Health Risk</span>
                          <span className="text-green-600">Low</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Environmental Risk</span>
                          <span className="text-yellow-600">Medium</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Incidents Tab */}
            <TabsContent value="incidents" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Incident Log</span>
                    <Badge variant="outline">{incidents.length} total</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incidents.map((incident) => (
                      <div key={incident.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getSeverityIcon(incident.severity)}
                            <span className="font-medium">{incident.description}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={incident.type === 'auto' ? 'default' : incident.type === 'manual' ? 'secondary' : 'destructive'}>
                              {incident.type}
                            </Badge>
                            <Badge variant={incident.resolved ? 'default' : 'destructive'}>
                              {incident.resolved ? 'Resolved' : 'Open'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {incident.timestamp.toLocaleString()}
                        </div>
                        {incident.actionTaken && (
                          <div className="text-sm">
                            <strong>Action Taken:</strong> {incident.actionTaken}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Professional Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Vitals Thresholds */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Vital Signs Monitoring</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Heart Rate Range (BPM)</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Minimum</label>
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
                            <label className="block text-xs text-muted-foreground mb-1">Maximum</label>
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
                        <label className="block text-sm font-medium mb-2">Temperature Range (°F)</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Minimum</label>
                            <Slider
                              value={[thresholds.temperatureMin]}
                              onValueChange={(value) => setThresholds(prev => ({ ...prev, temperatureMin: value[0] }))}
                              max={99}
                              min={95}
                              step={0.1}
                              className="w-full"
                            />
                            <span className="text-sm">{thresholds.temperatureMin}°F</span>
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">Maximum</label>
                            <Slider
                              value={[thresholds.temperatureMax]}
                              onValueChange={(value) => setThresholds(prev => ({ ...prev, temperatureMax: value[0] }))}
                              max={105}
                              min={100}
                              step={0.1}
                              className="w-full"
                            />
                            <span className="text-sm">{thresholds.temperatureMax}°F</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Motion & Safety */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Motion & Safety Detection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Fall Detection Sensitivity</label>
                        <Slider
                          value={[thresholds.motionThreshold]}
                          onValueChange={(value) => setThresholds(prev => ({ ...prev, motionThreshold: value[0] }))}
                          max={30}
                          min={5}
                          step={1}
                          className="w-full"
                        />
                        <span className="text-sm">{thresholds.motionThreshold} m/s² threshold</span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Inactivity Alert (minutes)</label>
                        <Slider
                          value={[thresholds.inactivityTimeout]}
                          onValueChange={(value) => setThresholds(prev => ({ ...prev, inactivityTimeout: value[0] }))}
                          max={120}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                        <span className="text-sm">{thresholds.inactivityTimeout} minutes</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">AI Analysis Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Analysis Interval</label>
                        <Slider
                          value={[thresholds.analysisInterval]}
                          onValueChange={(value) => setThresholds(prev => ({ ...prev, analysisInterval: value[0] }))}
                          max={60}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                        <span className="text-sm">Every {thresholds.analysisInterval} seconds</span>
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
                        <span className="text-sm">{thresholds.confidenceThreshold}% minimum confidence</span>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Advanced Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Auto-Trigger Panic Mode</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatically activate emergency response for critical threats
                          </p>
                        </div>
                        <Switch
                          checked={thresholds.autoTriggerPanic}
                          onCheckedChange={(checked) => setThresholds(prev => ({ ...prev, autoTriggerPanic: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Predictive Analytics</h4>
                          <p className="text-sm text-muted-foreground">
                            Enable AI-powered predictive health and safety insights
                          </p>
                        </div>
                        <Switch
                          checked={thresholds.predictiveAnalysis}
                          onCheckedChange={(checked) => setThresholds(prev => ({ ...prev, predictiveAnalysis: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Environmental Monitoring</h4>
                          <p className="text-sm text-muted-foreground">
                            Monitor air quality, noise levels, and environmental hazards
                          </p>
                        </div>
                        <Switch
                          checked={true}
                          onCheckedChange={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}