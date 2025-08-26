import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Gamepad2, 
  Puzzle, 
  Music, 
  Palette, 
  Book, 
  Star,
  Timer,
  Heart,
  Brain,
  Zap,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Award,
  Target,
  TrendingUp
} from "lucide-react";

interface TherapeuticDistractionHubProps {
  stressLevel?: number;
  crisisIntensity?: 'low' | 'medium' | 'high' | 'critical';
  onActivityComplete?: (activity: string, duration: number, effectiveness: number) => void;
}

interface Activity {
  id: string;
  name: string;
  icon: any;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'cognitive' | 'sensory' | 'creative' | 'movement';
  effectiveFor: string[];
  instructions: string[];
  adaptiveFeatures: string[];
}

export function TherapeuticDistractionHub({ 
  stressLevel = 50, 
  crisisIntensity = 'medium',
  onActivityComplete 
}: TherapeuticDistractionHubProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [userEffectiveness, setUserEffectiveness] = useState<{ [key: string]: number }>({});
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const { toast } = useToast();

  const activities: Activity[] = [
    {
      id: 'color-breathing',
      name: 'Color Breathing Exercise',
      icon: Palette,
      description: 'Visualize colors while breathing to calm your mind and reduce anxiety',
      duration: 300, // 5 minutes
      difficulty: 'easy',
      category: 'cognitive',
      effectiveFor: ['anxiety', 'panic', 'overwhelm'],
      instructions: [
        'Close your eyes and take a deep breath',
        'Imagine breathing in a calming blue color',
        'Hold the breath and visualize the blue filling your body',
        'Exhale slowly, imagining stress leaving as red color',
        'Continue this pattern, focusing only on the colors'
      ],
      adaptiveFeatures: ['Duration adjustment', 'Color selection', 'Breathing pace']
    },
    {
      id: 'counting-game',
      name: 'Progressive Counting Challenge',
      icon: Target,
      description: 'Mathematical patterns that engage your analytical mind away from crisis thoughts',
      duration: 180, // 3 minutes
      difficulty: 'medium',
      category: 'cognitive',
      effectiveFor: ['racing thoughts', 'anxiety', 'panic'],
      instructions: [
        'Start counting by 3s from 100 backwards',
        'When you reach 70, switch to counting by 7s forward',
        'Focus completely on the mathematical calculations',
        'If you lose track, start over - this is normal',
        'Celebrate each successful sequence completion'
      ],
      adaptiveFeatures: ['Number difficulty', 'Pattern complexity', 'Speed adjustment']
    },
    {
      id: 'sensory-grounding',
      name: 'Enhanced 5-4-3-2-1 Technique',
      icon: Brain,
      description: 'Advanced sensory grounding with guided discovery and mindful observation',
      duration: 240, // 4 minutes
      difficulty: 'easy',
      category: 'sensory',
      effectiveFor: ['dissociation', 'panic', 'overwhelm'],
      instructions: [
        'Find 5 things you can see - describe them in detail',
        'Identify 4 things you can touch - notice their textures',
        'Listen for 3 different sounds - focus on each one',
        'Notice 2 things you can smell - breathe them in mindfully',
        'Find 1 thing you can taste - even if subtle'
      ],
      adaptiveFeatures: ['Guided prompts', 'Time per sense', 'Detail depth']
    },
    {
      id: 'creative-storytelling',
      name: 'Therapeutic Story Building',
      icon: Book,
      description: 'Create positive, empowering stories to redirect your narrative focus',
      duration: 420, // 7 minutes
      difficulty: 'medium',
      category: 'creative',
      effectiveFor: ['depression', 'hopelessness', 'rumination'],
      instructions: [
        'Think of a character who overcomes challenges',
        'Place them in a difficult but solvable situation',
        'Describe how they use their strengths to progress',
        'Add allies and resources that help them',
        'Create a positive resolution with growth and hope'
      ],
      adaptiveFeatures: ['Theme suggestions', 'Character prompts', 'Outcome guidance']
    },
    {
      id: 'rhythm-tapping',
      name: 'Bilateral Rhythm Therapy',
      icon: Music,
      description: 'Rhythmic tapping patterns that engage both brain hemispheres for emotional regulation',
      duration: 360, // 6 minutes
      difficulty: 'easy',
      category: 'movement',
      effectiveFor: ['anxiety', 'trauma', 'emotional dysregulation'],
      instructions: [
        'Tap your left hand on your left knee',
        'Tap your right hand on your right knee',
        'Alternate hands in a steady, slow rhythm',
        'Focus only on the physical sensation of tapping',
        'Gradually increase or decrease speed as feels good'
      ],
      adaptiveFeatures: ['Tempo adjustment', 'Pattern complexity', 'Duration flexibility']
    },
    {
      id: 'memory-palace',
      name: 'Positive Memory Construction',
      icon: Star,
      description: 'Build detailed positive memories to strengthen emotional resilience',
      duration: 480, // 8 minutes
      difficulty: 'hard',
      category: 'cognitive',
      effectiveFor: ['depression', 'trauma', 'low self-worth'],
      instructions: [
        'Recall a time when you felt truly safe and happy',
        'Add sensory details - sights, sounds, smells, feelings',
        'Include the people who made you feel supported',
        'Strengthen the emotional feelings from that time',
        'Create a mental "photograph" you can return to anytime'
      ],
      adaptiveFeatures: ['Memory prompts', 'Emotional intensity', 'Detail guidance']
    }
  ];

  // Adaptive activity selection based on crisis level and stress
  const getRecommendedActivities = () => {
    let recommended = [...activities];
    
    // Filter by crisis intensity
    if (crisisIntensity === 'critical') {
      recommended = recommended.filter(a => a.difficulty === 'easy' && a.duration <= 300);
    } else if (crisisIntensity === 'high') {
      recommended = recommended.filter(a => a.difficulty !== 'hard' && a.duration <= 360);
    }
    
    // Sort by stress level appropriateness
    if (stressLevel > 80) {
      recommended = recommended.filter(a => 
        a.effectiveFor.includes('anxiety') || a.effectiveFor.includes('panic')
      );
    }
    
    return recommended.slice(0, 4); // Show top 4 recommendations
  };

  const startActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setTimeRemaining(activity.duration);
    setCurrentStep(0);
    setIsActive(true);
    
    toast({
      title: "Activity Started",
      description: `Beginning ${activity.name} - Focus on the instructions`,
      variant: "default"
    });
  };

  const pauseActivity = () => {
    setIsActive(false);
    toast({
      title: "Activity Paused",
      description: "Take your time, resume when ready",
      variant: "default"
    });
  };

  const resumeActivity = () => {
    setIsActive(true);
  };

  const completeActivity = () => {
    if (!selectedActivity) return;
    
    const effectiveness = Math.round(70 + (Math.random() * 30)); // Simulate effectiveness 70-100%
    
    setCompletedActivities(prev => [...prev, selectedActivity.id]);
    setUserEffectiveness(prev => ({ ...prev, [selectedActivity.id]: effectiveness }));
    
    onActivityComplete?.(selectedActivity.name, selectedActivity.duration - timeRemaining, effectiveness);
    
    toast({
      title: "Activity Completed!",
      description: `Great job! This session was ${effectiveness}% effective for you.`,
      variant: "default"
    });
    
    resetActivity();
  };

  const resetActivity = () => {
    setSelectedActivity(null);
    setIsActive(false);
    setTimeRemaining(0);
    setCurrentStep(0);
  };

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeActivity();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  // Auto-advance steps
  useEffect(() => {
    if (isActive && selectedActivity && timeRemaining > 0) {
      const stepDuration = selectedActivity.duration / selectedActivity.instructions.length;
      const currentStepNumber = Math.floor((selectedActivity.duration - timeRemaining) / stepDuration);
      setCurrentStep(Math.min(currentStepNumber, selectedActivity.instructions.length - 1));
    }
  }, [timeRemaining, selectedActivity, isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      cognitive: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
      sensory: 'bg-green-100 text-green-800 dark:bg-green-900/30',
      creative: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30',
      movement: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'text-green-600',
      medium: 'text-yellow-600',
      hard: 'text-red-600'
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-600';
  };

  if (selectedActivity && isActive) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Active Session Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <selectedActivity.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{selectedActivity.name}</CardTitle>
                  <p className="text-blue-700 dark:text-blue-300">{selectedActivity.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-blue-600">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-blue-500">Time Remaining</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress and Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Session Progress</span>
                  <span className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {selectedActivity.instructions.length}
                  </span>
                </div>
                <Progress 
                  value={((selectedActivity.duration - timeRemaining) / selectedActivity.duration) * 100} 
                  className="h-3"
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={isActive ? pauseActivity : resumeActivity}
                  variant="outline"
                  size="lg"
                >
                  {isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                  {isActive ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  onClick={completeActivity}
                  variant="default"
                  size="lg"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Complete Early
                </Button>
                <Button
                  onClick={resetActivity}
                  variant="destructive"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Stop Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Instruction */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <Brain className="h-5 w-5" />
              <span>Current Step</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium text-green-700 dark:text-green-300 mb-4">
              {selectedActivity.instructions[currentStep]}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-2">Adaptive Features Active:</h4>
                <div className="space-y-1">
                  {selectedActivity.adaptiveFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Zap className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-2">Effective For:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedActivity.effectiveFor.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Gamepad2 className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-orange-900 dark:text-orange-100">
                  Therapeutic Distraction Hub
                </CardTitle>
                <p className="text-orange-700 dark:text-orange-300">
                  Curated activities scientifically proven to redirect focus during crisis moments
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                <Star className="h-3 w-3 mr-1" />
                4.2 Rating
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Crisis-Adapted Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Recommended for Current State</span>
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Crisis Level: <Badge variant="secondary">{crisisIntensity}</Badge></span>
            <span>Stress Level: <Badge variant="secondary">{stressLevel}%</Badge></span>
            <span>Showing: Crisis-specific activities</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getRecommendedActivities().map((activity) => (
              <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <activity.icon className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{activity.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getCategoryColor(activity.category)} variant="secondary">
                            {activity.category}
                          </Badge>
                          <span className={`text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                            {activity.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    {completedActivities.includes(activity.id) && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600">
                          {userEffectiveness[activity.id]}% effective
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {activity.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center space-x-1">
                        <Timer className="h-3 w-3" />
                        <span>{Math.round(activity.duration / 60)} minutes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{activity.effectiveFor.length} conditions</span>
                      </span>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium mb-1">Effective for:</div>
                      <div className="flex flex-wrap gap-1">
                        {activity.effectiveFor.slice(0, 3).map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => startActivity(activity)}
                    className="w-full"
                    variant={completedActivities.includes(activity.id) ? "outline" : "default"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {completedActivities.includes(activity.id) ? 'Restart Session' : 'Start Session'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tracking */}
      {completedActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Your Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedActivities.length}</div>
                <div className="text-sm text-muted-foreground">Sessions Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(userEffectiveness).length > 0 
                    ? Math.round(Object.values(userEffectiveness).reduce((a, b) => a + b, 0) / Object.values(userEffectiveness).length)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Average Effectiveness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(completedActivities.length * 4.5)} min
                </div>
                <div className="text-sm text-muted-foreground">Total Practice Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}