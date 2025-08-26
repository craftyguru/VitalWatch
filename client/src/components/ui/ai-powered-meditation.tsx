import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Heart, 
  Waves, 
  Moon, 
  Sun, 
  Mountain,
  Leaf,
  Star,
  Timer,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  TrendingUp,
  Award,
  CheckCircle2,
  Activity,
  Headphones
} from "lucide-react";

interface AIPoweredMeditationProps {
  heartRate?: number;
  stressLevel?: number;
  moodScore?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  onSessionComplete?: (session: MeditationSession) => void;
}

interface MeditationSession {
  id: string;
  name: string;
  duration: number;
  category: string;
  effectivenessScore: number;
  heartRateChange: number;
  stressReduction: number;
  completedAt: Date;
}

interface MeditationType {
  id: string;
  name: string;
  icon: any;
  description: string;
  category: 'mindfulness' | 'breathing' | 'body-scan' | 'visualization' | 'loving-kindness';
  defaultDuration: number;
  adaptiveFeatures: string[];
  bestFor: string[];
  guidance: string[];
  backgroundSounds?: string[];
}

export function AIPoweredMeditation({ 
  heartRate = 72, 
  stressLevel = 45, 
  moodScore = 65,
  timeOfDay = 'evening',
  onSessionComplete 
}: AIPoweredMeditationProps) {
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationType | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [duration, setDuration] = useState([10]);
  const [isMuted, setIsMuted] = useState(false);
  const [backgroundSound, setBackgroundSound] = useState('nature');
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [biometricData, setBiometricData] = useState({
    initialHeartRate: heartRate,
    currentHeartRate: heartRate,
    initialStress: stressLevel,
    currentStress: stressLevel
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const meditationTypes: MeditationType[] = [
    {
      id: 'adaptive-breathing',
      name: 'Adaptive Breathing',
      icon: Waves,
      description: 'AI-guided breathing that adapts to your heart rate and stress levels in real-time',
      category: 'breathing',
      defaultDuration: 10,
      adaptiveFeatures: ['Heart rate sync', 'Stress-based pacing', 'Biometric feedback'],
      bestFor: ['anxiety', 'stress', 'panic attacks', 'sleep preparation'],
      guidance: [
        'Finding your natural breathing rhythm...',
        'Adjusting breath timing to your heart rate...',
        'Optimizing for maximum stress reduction...',
        'Maintaining synchronized breathing pattern...',
        'Deepening relaxation response...'
      ],
      backgroundSounds: ['ocean waves', 'forest stream', 'soft rain']
    },
    {
      id: 'mood-based-mindfulness',
      name: 'Mood-Based Mindfulness',
      icon: Brain,
      description: 'Mindfulness practices that adapt based on your current emotional state and mood patterns',
      category: 'mindfulness',
      defaultDuration: 15,
      adaptiveFeatures: ['Mood analysis', 'Emotional regulation', 'Thought pattern recognition'],
      bestFor: ['depression', 'emotional instability', 'overthinking', 'mood regulation'],
      guidance: [
        'Acknowledging your current emotional state...',
        'Observing thoughts without judgment...',
        'Guiding attention to present moment awareness...',
        'Strengthening emotional balance...',
        'Cultivating self-compassion and acceptance...'
      ],
      backgroundSounds: ['tibetan bowls', 'ambient tones', 'gentle piano']
    },
    {
      id: 'stress-relief-visualization',
      name: 'Stress Relief Visualization',
      icon: Mountain,
      description: 'Guided imagery that adapts scenarios based on your stress triggers and effective coping mechanisms',
      category: 'visualization',
      defaultDuration: 12,
      adaptiveFeatures: ['Stress trigger analysis', 'Personalized scenarios', 'Coping skill integration'],
      bestFor: ['chronic stress', 'work anxiety', 'overwhelm', 'burnout'],
      guidance: [
        'Creating your personalized peaceful sanctuary...',
        'Engaging multiple senses in the visualization...',
        'Releasing tension from stress points...',
        'Building resilience and inner strength...',
        'Anchoring this calm state for future access...'
      ],
      backgroundSounds: ['mountain breeze', 'gentle water', 'wind chimes']
    },
    {
      id: 'biometric-body-scan',
      name: 'Biometric Body Scan',
      icon: Activity,
      description: 'Progressive relaxation guided by real-time biometric feedback and tension detection',
      category: 'body-scan',
      defaultDuration: 20,
      adaptiveFeatures: ['Tension detection', 'Heart rate variability', 'Progressive relaxation timing'],
      bestFor: ['physical tension', 'chronic pain', 'sleep issues', 'body awareness'],
      guidance: [
        'Scanning for areas of physical tension...',
        'Guiding attention to your body sensations...',
        'Progressive muscle relaxation sequence...',
        'Balancing nervous system responses...',
        'Integrating mind-body connection...'
      ],
      backgroundSounds: ['soft ambient', 'healing frequencies', 'nature sounds']
    },
    {
      id: 'sleep-optimization',
      name: 'AI Sleep Optimization',
      icon: Moon,
      description: 'Sleep-focused meditation that adapts to your circadian rhythm and sleep quality patterns',
      category: 'visualization',
      defaultDuration: 25,
      adaptiveFeatures: ['Circadian timing', 'Sleep quality analysis', 'Dream preparation'],
      bestFor: ['insomnia', 'sleep anxiety', 'restless mind', 'sleep quality'],
      guidance: [
        'Synchronizing with your natural sleep cycle...',
        'Quieting mental activity for rest...',
        'Releasing the day\'s thoughts and worries...',
        'Preparing mind and body for restorative sleep...',
        'Setting intentions for peaceful dreams...'
      ],
      backgroundSounds: ['night sounds', 'soft rain', 'deep space ambient']
    }
  ];

  // AI-powered meditation recommendation
  const getRecommendedMeditation = () => {
    let recommendations = [...meditationTypes];
    
    // Filter by time of day
    if (timeOfDay === 'morning') {
      recommendations = recommendations.filter(m => 
        m.bestFor.includes('anxiety') || m.category === 'mindfulness'
      );
    } else if (timeOfDay === 'night') {
      recommendations = recommendations.filter(m => 
        m.bestFor.includes('sleep') || m.bestFor.includes('insomnia')
      );
    }
    
    // Filter by stress level
    if (stressLevel > 70) {
      recommendations = recommendations.filter(m => 
        m.bestFor.includes('stress') || m.bestFor.includes('anxiety')
      );
    }
    
    // Filter by mood score
    if (moodScore < 40) {
      recommendations = recommendations.filter(m => 
        m.bestFor.includes('depression') || m.bestFor.includes('mood regulation')
      );
    }
    
    return recommendations[0] || meditationTypes[0];
  };

  const startMeditation = (meditation?: MeditationType) => {
    const selected = meditation || getRecommendedMeditation();
    setSelectedMeditation(selected);
    setTimeRemaining(duration[0] * 60);
    setCurrentPhase(0);
    setIsActive(true);
    setBiometricData({
      initialHeartRate: heartRate,
      currentHeartRate: heartRate,
      initialStress: stressLevel,
      currentStress: stressLevel
    });
    
    toast({
      title: "Meditation Started",
      description: `Beginning ${selected.name} - ${duration[0]} minutes`,
      variant: "default"
    });
  };

  const pauseMeditation = () => {
    setIsActive(false);
  };

  const resumeMeditation = () => {
    setIsActive(true);
  };

  const stopMeditation = () => {
    if (selectedMeditation) {
      const session: MeditationSession = {
        id: Date.now().toString(),
        name: selectedMeditation.name,
        duration: (duration[0] * 60) - timeRemaining,
        category: selectedMeditation.category,
        effectivenessScore: Math.round(70 + Math.random() * 30),
        heartRateChange: biometricData.initialHeartRate - biometricData.currentHeartRate,
        stressReduction: biometricData.initialStress - biometricData.currentStress,
        completedAt: new Date()
      };
      
      setSessions(prev => [...prev, session]);
      onSessionComplete?.(session);
      
      toast({
        title: "Session Complete",
        description: `${session.effectivenessScore}% effectiveness achieved`,
        variant: "default"
      });
    }
    
    setSelectedMeditation(null);
    setIsActive(false);
    setTimeRemaining(0);
    setCurrentPhase(0);
  };

  // Timer and biometric simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopMeditation();
            return 0;
          }
          return prev - 1;
        });
        
        // Simulate biometric improvements
        setBiometricData(prev => ({
          ...prev,
          currentHeartRate: Math.max(60, prev.currentHeartRate - 0.2),
          currentStress: Math.max(10, prev.currentStress - 0.3)
        }));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  // Update meditation phase based on time
  useEffect(() => {
    if (isActive && selectedMeditation && timeRemaining > 0) {
      const totalDuration = duration[0] * 60;
      const elapsed = totalDuration - timeRemaining;
      const phaseLength = totalDuration / selectedMeditation.guidance.length;
      const newPhase = Math.floor(elapsed / phaseLength);
      setCurrentPhase(Math.min(newPhase, selectedMeditation.guidance.length - 1));
    }
  }, [timeRemaining, selectedMeditation, duration, isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAdaptiveRecommendations = () => {
    const recommendations = [];
    
    if (heartRate > 80) {
      recommendations.push("Your heart rate is elevated - breathing meditation recommended");
    }
    if (stressLevel > 70) {
      recommendations.push("High stress detected - visualization therapy suggested");
    }
    if (moodScore < 50) {
      recommendations.push("Mood support needed - loving-kindness meditation beneficial");
    }
    if (timeOfDay === 'night') {
      recommendations.push("Evening detected - sleep optimization meditation available");
    }
    
    return recommendations;
  };

  if (selectedMeditation && isActive) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Active Session Header */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <selectedMeditation.icon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-purple-900 dark:text-purple-100">
                    {selectedMeditation.name}
                  </CardTitle>
                  <p className="text-purple-700 dark:text-purple-300">
                    AI-guided meditation adapting to your biometrics
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-purple-600">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-purple-500">Remaining</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Real-time Biometrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-lg font-bold text-red-600">
                {Math.round(biometricData.currentHeartRate)}
              </div>
              <div className="text-xs text-muted-foreground">
                ↓{Math.round(biometricData.initialHeartRate - biometricData.currentHeartRate)} BPM
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold text-blue-600">
                {Math.round(biometricData.currentStress)}%
              </div>
              <div className="text-xs text-muted-foreground">
                ↓{Math.round(biometricData.initialStress - biometricData.currentStress)}% stress
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Waves className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold text-green-600">
                {Math.round(((duration[0] * 60 - timeRemaining) / (duration[0] * 60)) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Guidance */}
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Progress 
                value={((duration[0] * 60 - timeRemaining) / (duration[0] * 60)) * 100} 
                className="h-2 mb-2"
              />
              <div className="text-sm text-muted-foreground">
                Phase {currentPhase + 1} of {selectedMeditation.guidance.length}
              </div>
            </div>
            
            <div className="text-lg font-medium text-green-700 dark:text-green-300 mb-6">
              {selectedMeditation.guidance[currentPhase]}
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button
                onClick={isActive ? pauseMeditation : resumeMeditation}
                variant="outline"
                size="lg"
              >
                {isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                {isActive ? 'Pause' : 'Resume'}
              </Button>
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="outline"
                size="lg"
              >
                {isMuted ? <VolumeX className="h-5 w-5 mr-2" /> : <Volume2 className="h-5 w-5 mr-2" />}
                Sound
              </Button>
              <Button
                onClick={stopMeditation}
                variant="destructive"
                size="lg"
              >
                <Square className="h-5 w-5 mr-2" />
                End Session
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Adaptive Features Active */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>AI Adaptations Active</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedMeditation.adaptiveFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-900 dark:text-purple-100">
                  AI-Powered Meditation
                </CardTitle>
                <p className="text-purple-700 dark:text-purple-300">
                  Personalized meditation sessions that adapt to your mental state and stress levels
                </p>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <Star className="h-3 w-3 mr-1" />
              4.7 Rating
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>AI Analysis & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Current Biometric State</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-sm">Heart Rate</span>
                  <Badge variant="secondary">{heartRate} BPM</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-sm">Stress Level</span>
                  <Badge variant="secondary">{stressLevel}%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-sm">Mood Score</span>
                  <Badge variant="secondary">{moodScore}/100</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <span className="text-sm">Time of Day</span>
                  <Badge variant="secondary">{timeOfDay}</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {getAdaptiveRecommendations().map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <Brain className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Meditation Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Session Duration</label>
            <Slider
              value={duration}
              onValueChange={setDuration}
              max={60}
              min={5}
              step={5}
              className="mb-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5 minutes</span>
              <span className="font-medium">Selected: {duration[0]} minutes</span>
              <span>60 minutes</span>
            </div>
          </div>
          
          <div className="text-center">
            <Button
              onClick={() => startMeditation(getRecommendedMeditation())}
              size="lg"
              className="px-8"
            >
              <Play className="h-5 w-5 mr-2" />
              Start AI-Recommended Meditation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Meditations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Meditation Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meditationTypes.map((meditation) => (
              <Card key={meditation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <meditation.icon className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{meditation.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {meditation.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <Timer className="h-4 w-4 inline mr-1" />
                      {meditation.defaultDuration}min
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {meditation.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-xs font-medium mb-1">Best for:</div>
                      <div className="flex flex-wrap gap-1">
                        {meditation.bestFor.slice(0, 3).map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium mb-1">AI Features:</div>
                      <div className="space-y-1">
                        {meditation.adaptiveFeatures.slice(0, 2).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <Zap className="h-3 w-3 text-purple-600" />
                            <span className="text-xs text-purple-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => startMeditation(meditation)}
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Meditation Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sessions.length}</div>
                <div className="text-sm text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60)}m
                </div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {sessions.length > 0 
                    ? Math.round(sessions.reduce((sum, s) => sum + s.effectivenessScore, 0) / sessions.length)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Effectiveness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {sessions.length > 0 
                    ? Math.round(sessions.reduce((sum, s) => sum + s.stressReduction, 0) / sessions.length)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Stress Reduction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}