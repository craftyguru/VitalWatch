import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Wind, 
  Play, 
  Pause, 
  RotateCcw, 
  Heart, 
  Timer, 
  Activity,
  Brain,
  Zap,
  Settings,
  TrendingUp,
  Award,
  Target,
  Volume2,
  VolumeX,
  Waves,
  Mountain,
  Sun,
  Moon,
  Snowflake,
  Flame
} from "lucide-react";

interface AdvancedBreathingExerciseProps {
  heartRate?: number;
  stressLevel?: number;
  onComplete?: () => void;
}

interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  pattern: number[];
  phases: string[];
  defaultCycles: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  icon: any;
  color: string;
}

export function AdvancedBreathingExercise({ heartRate = 75, stressLevel = 50, onComplete }: AdvancedBreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState<BreathingTechnique | null>(null);
  const [phase, setPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalCycles, setTotalCycles] = useState(8);
  const [sessionDuration, setSessionDuration] = useState([5]);
  const [biometricFeedback, setBiometricFeedback] = useState(true);
  const [audioGuidance, setAudioGuidance] = useState(true);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [currentHeartRate, setCurrentHeartRate] = useState(heartRate);
  const [breathingPace, setBreathingPace] = useState(1.0);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 12,
    averageHeartRateReduction: 8,
    stressReductionRate: 73,
    streakDays: 5
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const techniques: BreathingTechnique[] = [
    {
      id: "478",
      name: "4-7-8 Deep Relaxation",
      description: "Powerful technique for anxiety relief and sleep preparation",
      pattern: [4, 7, 8],
      phases: ["Inhale", "Hold", "Exhale"],
      defaultCycles: 8,
      difficulty: 'beginner',
      benefits: ["Reduces anxiety", "Promotes sleep", "Calms nervous system"],
      icon: Moon,
      color: "text-blue-600"
    },
    {
      id: "box",
      name: "Box Breathing (Navy SEAL)",
      description: "Military-grade technique for stress control and focus enhancement",
      pattern: [4, 4, 4, 4],
      phases: ["Inhale", "Hold", "Exhale", "Rest"],
      defaultCycles: 10,
      difficulty: 'intermediate',
      benefits: ["Enhances focus", "Controls stress", "Improves performance"],
      icon: Target,
      color: "text-green-600"
    },
    {
      id: "wim-hof",
      name: "Wim Hof Method",
      description: "Advanced cold exposure and breathing technique for resilience",
      pattern: [2, 0, 1, 15],
      phases: ["Power Breath", "Inhale", "Exhale", "Hold"],
      defaultCycles: 3,
      difficulty: 'advanced',
      benefits: ["Boosts immunity", "Increases energy", "Cold tolerance"],
      icon: Snowflake,
      color: "text-cyan-600"
    },
    {
      id: "triangle",
      name: "Triangle Breathing",
      description: "Balanced technique for emotional regulation and mindfulness",
      pattern: [4, 4, 4],
      phases: ["Inhale", "Hold", "Exhale"],
      defaultCycles: 12,
      difficulty: 'beginner',
      benefits: ["Emotional balance", "Mindfulness", "Steady rhythm"],
      icon: Mountain,
      color: "text-purple-600"
    },
    {
      id: "coherent",
      name: "Coherent Breathing",
      description: "Heart rate variability optimization for peak performance",
      pattern: [5, 5],
      phases: ["Inhale", "Exhale"],
      defaultCycles: 20,
      difficulty: 'intermediate',
      benefits: ["HRV optimization", "Peak performance", "Calm alertness"],
      icon: Heart,
      color: "text-red-600"
    },
    {
      id: "fire",
      name: "Fire Breathing (Kapalabhati)",
      description: "Energizing technique for mental clarity and vitality",
      pattern: [1, 1],
      phases: ["Sharp Inhale", "Sharp Exhale"],
      defaultCycles: 30,
      difficulty: 'advanced',
      benefits: ["Increases energy", "Mental clarity", "Detoxification"],
      icon: Flame,
      color: "text-orange-600"
    }
  ];

  // AI-powered technique recommendation
  const getRecommendedTechnique = () => {
    if (stressLevel > 80) return techniques.find(t => t.id === "478"); // High stress -> calming
    if (stressLevel < 30) return techniques.find(t => t.id === "fire"); // Low energy -> energizing
    if (heartRate > 90) return techniques.find(t => t.id === "coherent"); // High HR -> HRV
    return techniques.find(t => t.id === "box"); // Default balanced technique
  };

  // Adaptive breathing pace based on biometrics
  useEffect(() => {
    if (adaptiveMode && isActive) {
      const targetHeartRate = 65;
      const difference = currentHeartRate - targetHeartRate;
      const newPace = Math.max(0.7, Math.min(1.5, 1.0 - (difference * 0.01)));
      setBreathingPace(newPace);
    }
  }, [currentHeartRate, adaptiveMode, isActive]);

  // Heart rate simulation during breathing
  useEffect(() => {
    if (isActive && biometricFeedback) {
      const interval = setInterval(() => {
        setCurrentHeartRate(prev => {
          const reduction = phase === 2 ? 0.5 : 0.2; // More reduction during exhale
          return Math.max(60, prev - reduction);
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive, phase, biometricFeedback]);

  const startExercise = (technique?: BreathingTechnique) => {
    const selected = technique || currentTechnique || getRecommendedTechnique()!;
    setCurrentTechnique(selected);
    setIsActive(true);
    setCycleCount(0);
    setPhase(0);
    setTimeLeft(Math.round(selected.pattern[0] / breathingPace));
    setCurrentHeartRate(heartRate);
    
    toast({
      title: "Breathing Session Started",
      description: `Beginning ${selected.name} - ${sessionDuration[0]} minutes`,
      variant: "default"
    });
  };

  const pauseExercise = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeExercise = () => {
    setIsActive(true);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCycleCount(0);
    setPhase(0);
    if (currentTechnique) {
      setTimeLeft(Math.round(currentTechnique.pattern[0] / breathingPace));
    }
    setCurrentHeartRate(heartRate);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const completeSession = () => {
    setIsActive(false);
    const heartRateReduction = heartRate - currentHeartRate;
    toast({
      title: "Session Complete!",
      description: `Heart rate reduced by ${Math.round(heartRateReduction)} BPM. Great work!`,
      variant: "default"
    });
    onComplete?.();
    resetExercise();
  };

  // Main breathing timer
  useEffect(() => {
    if (isActive && currentTechnique && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && currentTechnique && timeLeft === 0) {
      // Move to next phase
      const nextPhase = (phase + 1) % currentTechnique.phases.length;
      
      if (nextPhase === 0) {
        // Completed a full cycle
        setCycleCount(prev => prev + 1);
        if (cycleCount + 1 >= totalCycles) {
          completeSession();
          return;
        }
      }
      
      setPhase(nextPhase);
      setTimeLeft(Math.round(currentTechnique.pattern[nextPhase] / breathingPace));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, phase, currentTechnique, cycleCount, totalCycles, breathingPace]);

  const progress = currentTechnique ? (cycleCount / totalCycles) * 100 : 0;
  const currentPhase = currentTechnique?.phases[phase] || "Ready";

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Wind className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                  Advanced Breathing Exercises
                </CardTitle>
                <p className="text-blue-700 dark:text-blue-300">
                  Multiple breathing techniques with biometric feedback and personalized coaching
                </p>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <Activity className="h-3 w-3 mr-1" />
              4.8 Rating
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="practice" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="techniques">Techniques</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>AI-Powered Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Biometric State</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <span className="text-sm">Heart Rate</span>
                      <Badge variant="secondary">{currentHeartRate} BPM</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <span className="text-sm">Stress Level</span>
                      <Badge variant="secondary">{stressLevel}%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <span className="text-sm">Breathing Pace</span>
                      <Badge variant="secondary">{breathingPace.toFixed(1)}x</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">AI Recommendation</h4>
                  {(() => {
                    const recommended = getRecommendedTechnique();
                    return recommended ? (
                      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <recommended.icon className={`h-5 w-5 ${recommended.color}`} />
                            <span className="font-medium">{recommended.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{recommended.description}</p>
                          <Button 
                            onClick={() => startExercise(recommended)} 
                            className="mt-3 w-full"
                            size="sm"
                          >
                            Start Recommended Session
                          </Button>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Breathing Interface */}
          {currentTechnique && isActive ? (
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200">
              <CardContent className="p-8">
                {/* Breathing Visualization */}
                <div className="text-center space-y-6">
                  <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
                    <div 
                      className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
                        phase === 0 ? "scale-125 bg-blue-100 border-blue-500 shadow-lg shadow-blue-200" : 
                        phase === 1 ? "scale-125 bg-yellow-100 border-yellow-500 shadow-lg shadow-yellow-200" : 
                        phase === 2 ? "scale-75 bg-green-100 border-green-500 shadow-lg shadow-green-200" :
                        "scale-100 bg-purple-100 border-purple-500 shadow-lg shadow-purple-200"
                      }`}
                      style={{
                        transform: `scale(${phase === 0 ? 1.25 : phase === 2 ? 0.75 : 1})`,
                        transition: `transform ${timeLeft > 1 ? timeLeft : 1}s ease-in-out`
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-700 mb-2">{timeLeft}</div>
                        <div className="text-lg font-medium text-gray-600">{currentPhase}</div>
                        <div className="text-sm text-gray-500">{currentTechnique.name}</div>
                      </div>
                    </div>
                    
                    {/* Breathing Guide Rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-56 h-56 rounded-full border-2 border-dashed ${currentTechnique.color.replace('text-', 'border-')} opacity-30 animate-pulse`}></div>
                    </div>
                  </div>
                  
                  {/* Real-time Biometrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow">
                      <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                      <div className="text-lg font-bold text-red-600">{currentHeartRate}</div>
                      <div className="text-xs text-muted-foreground">BPM</div>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow">
                      <Waves className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <div className="text-lg font-bold text-blue-600">{cycleCount + 1}/{totalCycles}</div>
                      <div className="text-xs text-muted-foreground">Cycles</div>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow">
                      <Timer className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <div className="text-lg font-bold text-green-600">{Math.round(progress)}%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </div>
                  
                  <Progress value={progress} className="w-full h-3" />
                  
                  {/* Session Controls */}
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={isActive ? pauseExercise : resumeExercise}
                      variant="outline"
                      size="lg"
                    >
                      {isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                      {isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      onClick={completeSession}
                      variant="default"
                      size="lg"
                    >
                      Complete Session
                    </Button>
                    <Button
                      onClick={resetExercise}
                      variant="destructive"
                      size="lg"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Technique Selection for Quick Start */
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {techniques.slice(0, 3).map((technique) => (
                    <Card key={technique.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startExercise(technique)}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <technique.icon className={`h-6 w-6 ${technique.color}`} />
                          <div>
                            <h3 className="font-semibold text-sm">{technique.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {technique.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{technique.description}</p>
                        <div className="flex justify-between text-xs">
                          <span>{technique.defaultCycles} cycles</span>
                          <span>{Math.round(technique.defaultCycles * 0.5)} min</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Techniques Tab */}
        <TabsContent value="techniques" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {techniques.map((technique) => (
              <Card key={technique.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <technique.icon className={`h-6 w-6 ${technique.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{technique.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {technique.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => startExercise(technique)}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {technique.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium mb-1">Breathing Pattern</div>
                      <div className="flex space-x-1 text-xs">
                        {technique.pattern.map((count, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {technique.phases[index]}: {count}s
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium mb-1">Benefits</div>
                      <div className="flex flex-wrap gap-1">
                        {technique.benefits.map((benefit, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Session Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Session Duration</Label>
                <Slider
                  value={sessionDuration}
                  onValueChange={setSessionDuration}
                  max={30}
                  min={3}
                  step={1}
                  className="mb-3"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>3 minutes</span>
                  <span className="font-medium">Selected: {sessionDuration[0]} minutes</span>
                  <span>30 minutes</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Biometric Feedback</Label>
                      <p className="text-xs text-muted-foreground">Real-time heart rate monitoring</p>
                    </div>
                    <Switch checked={biometricFeedback} onCheckedChange={setBiometricFeedback} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Audio Guidance</Label>
                      <p className="text-xs text-muted-foreground">Spoken breathing instructions</p>
                    </div>
                    <Switch checked={audioGuidance} onCheckedChange={setAudioGuidance} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Adaptive Mode</Label>
                      <p className="text-xs text-muted-foreground">AI adjusts pace to your biometrics</p>
                    </div>
                    <Switch checked={adaptiveMode} onCheckedChange={setAdaptiveMode} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Sound Effects</Label>
                      <p className="text-xs text-muted-foreground">Background nature sounds</p>
                    </div>
                    <Switch checked={audioGuidance} onCheckedChange={setAudioGuidance} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-lg font-bold text-green-600">{sessionStats.totalSessions}</div>
                <div className="text-xs text-muted-foreground">Total Sessions</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-lg font-bold text-red-600">{sessionStats.averageHeartRateReduction}</div>
                <div className="text-xs text-muted-foreground">Avg HR Reduction</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Brain className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-lg font-bold text-purple-600">{sessionStats.stressReductionRate}%</div>
                <div className="text-xs text-muted-foreground">Stress Reduction</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <div className="text-lg font-bold text-yellow-600">{sessionStats.streakDays}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}