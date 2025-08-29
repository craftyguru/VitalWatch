import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Wind, 
  Heart, 
  Brain, 
  Activity, 
  Play, 
  Pause, 
  Square, 
  Star, 
  Settings, 
  TrendingUp,
  Clock,
  Target,
  Zap,
  Waves,
  Mountain,
  Flame,
  Snowflake,
  BarChart3,
  Award,
  Eye,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronRight,
  Info,
  Smartphone,
  Bluetooth,
  Wifi
} from "lucide-react";

interface BiometricData {
  heartRate: number;
  stressLevel: number;
  breathingRate: number;
  hrvScore: number;
  oxygenSaturation: number;
  timestamp: Date;
}

interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  pattern: {
    inhale: number;
    hold1?: number;
    exhale: number;
    hold2?: number;
  };
  benefits: string[];
  icon: any;
  color: string;
  aiRecommended?: boolean;
}

const breathingTechniques: BreathingTechnique[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing (Navy SEAL)',
    description: 'Military-grade technique for stress control and focus enhancement',
    difficulty: 'intermediate',
    duration: 5,
    pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    benefits: ['Enhances focus', 'Controls stress', 'Improves performance'],
    icon: Target,
    color: 'green'
  },
  {
    id: 'deep-relaxation',
    name: '4-7-8 Deep Relaxation',
    description: 'Powerful technique for anxiety relief and sleep preparation',
    difficulty: 'beginner',
    duration: 4,
    pattern: { inhale: 4, hold1: 7, exhale: 8 },
    benefits: ['Reduces anxiety', 'Promotes sleep', 'Calms nervous system'],
    icon: Wind,
    color: 'blue'
  },
  {
    id: 'wim-hof',
    name: 'Wim Hof Method',
    description: 'Advanced cold exposure and breathing technique for resilience',
    difficulty: 'advanced',
    duration: 2,
    pattern: { inhale: 0, hold1: 15, exhale: 1 },
    benefits: ['Boosts immunity', 'Increases energy', 'Cold tolerance'],
    icon: Snowflake,
    color: 'cyan'
  },
  {
    id: 'triangle-breathing',
    name: 'Triangle Breathing',
    description: 'Balanced technique for emotional regulation and mindfulness',
    difficulty: 'beginner',
    duration: 5,
    pattern: { inhale: 4, hold1: 4, exhale: 4 },
    benefits: ['Emotional balance', 'Mindfulness', 'Steady rhythm'],
    icon: Mountain,
    color: 'purple'
  },
  {
    id: 'coherent-breathing',
    name: 'Coherent Breathing',
    description: 'Heart rate variability optimization for peak performance',
    difficulty: 'intermediate',
    duration: 8,
    pattern: { inhale: 5, exhale: 5 },
    benefits: ['HRV optimization', 'Peak performance', 'Calm alertness'],
    icon: Heart,
    color: 'red'
  },
  {
    id: 'fire-breathing',
    name: 'Fire Breathing (Kapalabhati)',
    description: 'Energizing technique for mental clarity and vitality',
    difficulty: 'advanced',
    duration: 3,
    pattern: { inhale: 1, exhale: 1 },
    benefits: ['Increases energy', 'Mental clarity', 'Detoxification'],
    icon: Flame,
    color: 'orange'
  }
];

export function AdvancedBreathingStudio() {
  const { user } = useAuth() as { user: any };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState<BreathingTechnique>(breathingTechniques[0]);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2' | 'rest'>('rest');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(5);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [biometricTracking, setBiometricTracking] = useState(true);
  
  // Real-time biometric data
  const [biometrics, setBiometrics] = useState<BiometricData>({
    heartRate: 72,
    stressLevel: 35,
    breathingRate: 16,
    hrvScore: 45,
    oxygenSaturation: 98,
    timestamp: new Date()
  });
  
  // Device sensor integration
  const [deviceSensors, setDeviceSensors] = useState({
    heartRateMonitor: false,
    accelerometer: false,
    microphone: false,
    camera: false,
    bluetoothDevices: []
  });

  // Timers and intervals
  const sessionTimerRef = useRef<NodeJS.Timeout>();
  const phaseTimerRef = useRef<NodeJS.Timeout>();
  const biometricTimerRef = useRef<NodeJS.Timeout>();

  // Fetch user's breathing sessions
  const { data: breathingSessions } = useQuery({
    queryKey: ["/api/breathing-sessions"],
  });

  // Fetch AI recommendations
  const { data: aiRecommendations } = useQuery({
    queryKey: ["/api/ai-breathing-recommendations"],
  });

  // Real-time biometric simulation (would connect to actual sensors)
  useEffect(() => {
    if (isSessionActive && biometricTracking) {
      biometricTimerRef.current = setInterval(() => {
        setBiometrics(prev => ({
          heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4)),
          stressLevel: Math.max(0, Math.min(100, prev.stressLevel + (Math.random() - 0.6) * 5)),
          breathingRate: Math.max(8, Math.min(20, prev.breathingRate + (Math.random() - 0.5) * 2)),
          hrvScore: Math.max(20, Math.min(80, prev.hrvScore + (Math.random() - 0.4) * 3)),
          oxygenSaturation: Math.max(95, Math.min(100, prev.oxygenSaturation + (Math.random() - 0.5) * 0.5)),
          timestamp: new Date()
        }));
      }, 2000);
    }

    return () => {
      if (biometricTimerRef.current) {
        clearInterval(biometricTimerRef.current);
      }
    };
  }, [isSessionActive, biometricTracking]);

  // Device sensor detection
  useEffect(() => {
    const detectSensors = async () => {
      const sensors = {
        heartRateMonitor: 'bluetooth' in navigator,
        accelerometer: 'DeviceMotionEvent' in window,
        microphone: 'mediaDevices' in navigator,
        camera: 'mediaDevices' in navigator,
        bluetoothDevices: []
      };
      setDeviceSensors(sensors);
    };
    detectSensors();
  }, []);

  // Breathing session logic
  const startSession = useCallback(() => {
    setIsSessionActive(true);
    setIsPaused(false);
    setSessionProgress(0);
    setCycleCount(0);
    setCurrentPhase('inhale');
    
    const totalCycles = Math.floor((sessionDuration * 60) / getTotalCycleTime(currentTechnique));
    runBreathingCycle(0, totalCycles);
    
    toast({
      title: "Session Started",
      description: `Starting ${currentTechnique.name} for ${sessionDuration} minutes`,
    });
  }, [currentTechnique, sessionDuration]);

  const pauseSession = () => {
    setIsPaused(!isPaused);
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
    }
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
    }
  };

  const stopSession = () => {
    setIsSessionActive(false);
    setIsPaused(false);
    setSessionProgress(0);
    setCurrentPhase('rest');
    setCycleCount(0);
    
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    
    // Save session data
    saveBreatheSession();
  };

  const getTotalCycleTime = (technique: BreathingTechnique) => {
    const { inhale, hold1 = 0, exhale, hold2 = 0 } = technique.pattern;
    return inhale + hold1 + exhale + hold2;
  };

  const runBreathingCycle = (currentCycle: number, totalCycles: number) => {
    if (!isSessionActive || isPaused || currentCycle >= totalCycles) {
      if (currentCycle >= totalCycles) {
        stopSession();
      }
      return;
    }

    const phases: (keyof typeof currentTechnique.pattern)[] = ['inhale'];
    if (currentTechnique.pattern.hold1) phases.push('hold1');
    phases.push('exhale');
    if (currentTechnique.pattern.hold2) phases.push('hold2');

    let phaseIndex = 0;
    
    const runPhase = () => {
      if (phaseIndex >= phases.length) {
        setCycleCount(currentCycle + 1);
        setSessionProgress(((currentCycle + 1) / totalCycles) * 100);
        runBreathingCycle(currentCycle + 1, totalCycles);
        return;
      }

      const phaseName = phases[phaseIndex];
      const phaseDuration = currentTechnique.pattern[phaseName] || 0;
      setCurrentPhase(phaseName as any);
      
      // Haptic feedback
      if (hapticEnabled && 'vibrate' in navigator) {
        navigator.vibrate(100);
      }

      // Visual and audio cues would go here
      
      phaseTimerRef.current = setTimeout(() => {
        phaseIndex++;
        runPhase();
      }, phaseDuration * 1000);
    };

    runPhase();
  };

  // Save breathing session
  const saveSessionMutation = useMutation({
    mutationFn: (sessionData: any) => apiRequest("POST", "/api/breathing-sessions", sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/breathing-sessions"] });
      toast({
        title: "Session Saved",
        description: "Your breathing session has been recorded",
      });
    }
  });

  const saveBreatheSession = () => {
    saveSessionMutation.mutate({
      techniqueId: currentTechnique.id,
      duration: sessionDuration,
      cyclesCompleted: cycleCount,
      avgHeartRate: biometrics.heartRate,
      stressReduction: Math.max(0, 100 - biometrics.stressLevel),
      completedAt: new Date()
    });
  };

  // AI recommendation based on current biometrics
  const getAIRecommendation = () => {
    if (biometrics.stressLevel > 70) {
      return breathingTechniques.find(t => t.id === 'deep-relaxation') || breathingTechniques[0];
    }
    if (biometrics.heartRate > 85) {
      return breathingTechniques.find(t => t.id === 'coherent-breathing') || breathingTechniques[0];
    }
    if (biometrics.hrvScore < 30) {
      return breathingTechniques.find(t => t.id === 'box-breathing') || breathingTechniques[0];
    }
    return currentTechnique;
  };

  const recommendedTechnique = getAIRecommendation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="bg-blue-500 text-white p-3 rounded-2xl w-fit mx-auto mb-3">
              <Wind className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Advanced Breathing</h3>
            <p className="text-xs text-blue-700 dark:text-blue-300">AI-Enhanced Sessions</p>
            <Badge variant="secondary" className="mt-2 text-xs bg-blue-100 text-blue-800">
              Biometric Tracking
            </Badge>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-xl">
              <Wind className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold">Advanced Breathing Studio</span>
              <p className="text-sm text-muted-foreground font-normal">AI-powered biometric breathing with real-time feedback</p>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              4.8 Rating
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Biometric Data & AI Recommendations */}
          <div className="space-y-4">
            {/* Real-time Biometrics */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Live Biometrics</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                    <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
                    <div className="text-lg font-bold text-red-600">{Math.round(biometrics.heartRate)}</div>
                    <div className="text-xs text-muted-foreground">BPM</div>
                  </div>
                  <div className="text-center p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                    <Brain className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                    <div className="text-lg font-bold text-purple-600">{Math.round(biometrics.stressLevel)}%</div>
                    <div className="text-xs text-muted-foreground">Stress</div>
                  </div>
                  <div className="text-center p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                    <Wind className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                    <div className="text-lg font-bold text-blue-600">{biometrics.breathingRate.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">BR/min</div>
                  </div>
                  <div className="text-center p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                    <Waves className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                    <div className="text-lg font-bold text-orange-600">{Math.round(biometrics.hrvScore)}</div>
                    <div className="text-xs text-muted-foreground">HRV Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span>AI Recommendation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                  <div className={`p-2 rounded-lg text-white ${
                    recommendedTechnique.color === 'green' ? 'bg-green-500' :
                    recommendedTechnique.color === 'blue' ? 'bg-blue-500' :
                    recommendedTechnique.color === 'cyan' ? 'bg-cyan-500' :
                    recommendedTechnique.color === 'purple' ? 'bg-purple-500' :
                    recommendedTechnique.color === 'red' ? 'bg-red-500' :
                    recommendedTechnique.color === 'orange' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}>
                    <recommendedTechnique.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{recommendedTechnique.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Optimal for your current biometric state
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => setCurrentTechnique(recommendedTechnique)}
                >
                  Use AI Recommendation
                </Button>
              </CardContent>
            </Card>

            {/* Device Sensors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span>Connected Sensors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Heart Rate Monitor</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${deviceSensors.heartRateMonitor ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Motion Sensors</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${deviceSensors.accelerometer ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bluetooth className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Bluetooth Devices</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Main Breathing Interface */}
          <div className="space-y-4">
            {/* Session Control */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    {/* Breathing visualization circle */}
                    <div 
                      className={`w-40 h-40 rounded-full border-4 transition-all duration-1000 ${
                        currentPhase === 'inhale' ? 'scale-110 border-blue-500 bg-blue-100 dark:bg-blue-900/30' :
                        currentPhase === 'hold1' || currentPhase === 'hold2' ? 'scale-110 border-purple-500 bg-purple-100 dark:bg-purple-900/30' :
                        currentPhase === 'exhale' ? 'scale-90 border-green-500 bg-green-100 dark:bg-green-900/30' :
                        'border-gray-300 bg-gray-100 dark:bg-gray-900/30'
                      }`}
                    >
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-2xl font-bold capitalize">{currentPhase}</div>
                          {isSessionActive && (
                            <div className="text-sm text-muted-foreground">
                              {currentPhase !== 'rest' ? `${currentTechnique.pattern[currentPhase as keyof typeof currentTechnique.pattern]}s` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress ring */}
                    {isSessionActive && (
                      <div className="absolute inset-0">
                        <svg className="w-40 h-40 transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="76"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="76"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 76}`}
                            strokeDashoffset={`${2 * Math.PI * 76 * (1 - sessionProgress / 100)}`}
                            className="text-blue-500 transition-all duration-300"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{currentTechnique.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentTechnique.description}</p>
                  </div>

                  {/* Session Stats */}
                  {isSessionActive && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-white/70 dark:bg-black/20 rounded-lg">
                        <div className="text-lg font-bold">{cycleCount}</div>
                        <div className="text-xs text-muted-foreground">Cycles</div>
                      </div>
                      <div className="text-center p-2 bg-white/70 dark:bg-black/20 rounded-lg">
                        <div className="text-lg font-bold">{Math.round(sessionProgress)}%</div>
                        <div className="text-xs text-muted-foreground">Progress</div>
                      </div>
                      <div className="text-center p-2 bg-white/70 dark:bg-black/20 rounded-lg">
                        <div className="text-lg font-bold">{sessionDuration}m</div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center space-x-3">
                  {!isSessionActive ? (
                    <Button onClick={startSession} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500">
                      <Play className="h-5 w-5 mr-2" />
                      Start Session
                    </Button>
                  ) : (
                    <>
                      <Button onClick={pauseSession} variant="outline" size="lg">
                        {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                      </Button>
                      <Button onClick={stopSession} variant="destructive" size="lg">
                        <Square className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Session Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Duration: {sessionDuration} minutes</Label>
                  <Slider
                    value={[sessionDuration]}
                    onValueChange={(value) => setSessionDuration(value[0])}
                    max={30}
                    min={1}
                    step={1}
                    className="mt-2"
                    disabled={isSessionActive}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Audio Guidance</Label>
                    <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Haptic Feedback</Label>
                    <Switch checked={hapticEnabled} onCheckedChange={setHapticEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Biometric Tracking</Label>
                    <Switch checked={biometricTracking} onCheckedChange={setBiometricTracking} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Techniques & Analytics */}
          <div className="space-y-4">
            {/* Technique Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Breathing Techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {breathingTechniques.map((technique) => (
                  <div
                    key={technique.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      currentTechnique.id === technique.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentTechnique(technique)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg text-white ${
                        technique.color === 'green' ? 'bg-green-500' :
                        technique.color === 'blue' ? 'bg-blue-500' :
                        technique.color === 'cyan' ? 'bg-cyan-500' :
                        technique.color === 'purple' ? 'bg-purple-500' :
                        technique.color === 'red' ? 'bg-red-500' :
                        technique.color === 'orange' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}>
                        <technique.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{technique.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {technique.description}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {technique.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {technique.duration}min
                          </span>
                        </div>
                      </div>
                      {technique.id === recommendedTechnique.id && (
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Session Analytics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-bold text-green-600">
                      {Array.isArray(breathingSessions) ? breathingSessions.length : 0}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">Total Sessions</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-white/70 dark:bg-black/20 rounded-lg">
                      <div className="text-sm font-bold">4.2</div>
                      <div className="text-xs text-muted-foreground">Avg Rating</div>
                    </div>
                    <div className="text-center p-2 bg-white/70 dark:bg-black/20 rounded-lg">
                      <div className="text-sm font-bold">12</div>
                      <div className="text-xs text-muted-foreground">Day Streak</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}