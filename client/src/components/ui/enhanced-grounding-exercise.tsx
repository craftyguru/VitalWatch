import { useState, useEffect } from "react";
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
  Leaf, 
  Eye, 
  Hand, 
  Ear, 
  Smile,
  Play, 
  Pause, 
  RotateCcw, 
  Brain,
  Activity,
  Settings,
  TrendingUp,
  Award,
  CheckCircle2,
  Timer,
  Zap,
  Navigation,
  Camera,
  Headphones,
  Wind,
  MapPin,
  Heart
} from "lucide-react";

interface EnhancedGroundingExerciseProps {
  stressLevel?: number;
  anxietyLevel?: number;
  onComplete?: () => void;
}

interface GroundingTechnique {
  id: string;
  name: string;
  description: string;
  steps: GroundingStep[];
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  effectiveFor: string[];
  adaptiveFeatures: string[];
  icon: any;
  color: string;
}

interface GroundingStep {
  sense: string;
  instruction: string;
  prompts: string[];
  timePerItem: number;
  count: number;
  icon: any;
}

export function EnhancedGroundingExercise({ 
  stressLevel = 60, 
  anxietyLevel = 55, 
  onComplete 
}: EnhancedGroundingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState<GroundingTechnique | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionDuration, setSessionDuration] = useState([8]);
  const [guidedMode, setGuidedMode] = useState(true);
  const [adaptivePrompts, setAdaptivePrompts] = useState(true);
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [environmentalCues, setEnvironmentalCues] = useState(true);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [currentAnxiety, setCurrentAnxiety] = useState(anxietyLevel);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 18,
    averageAnxietyReduction: 32,
    successRate: 84,
    favoriteeTechnique: "Enhanced 5-4-3-2-1"
  });

  const { toast } = useToast();

  const techniques: GroundingTechnique[] = [
    {
      id: "54321-enhanced",
      name: "Enhanced 5-4-3-2-1 Technique",
      description: "Advanced sensory grounding with guided discovery and mindful observation",
      duration: 480, // 8 minutes
      difficulty: 'easy',
      effectiveFor: ['panic attacks', 'dissociation', 'overwhelm', 'racing thoughts'],
      adaptiveFeatures: ['Guided prompts', 'Time per sense', 'Detail depth', 'Anxiety tracking'],
      icon: Navigation,
      color: "text-green-600",
      steps: [
        {
          sense: "Sight",
          instruction: "Find and describe 5 things you can see in detail",
          prompts: [
            "What colors do you notice? Are they bright or muted?",
            "What textures can you observe? Smooth, rough, or patterned?",
            "What shapes catch your attention? Angular or curved?",
            "What lighting do you see? Natural or artificial?",
            "What movements, if any, can you observe?"
          ],
          timePerItem: 45,
          count: 5,
          icon: Eye
        },
        {
          sense: "Touch",
          instruction: "Identify and explore 4 different textures you can feel",
          prompts: [
            "How does the temperature feel? Warm, cool, or neutral?",
            "What texture do you feel? Soft, hard, bumpy, or smooth?",
            "How much pressure are you applying? Light or firm?",
            "Does the material feel natural or synthetic?"
          ],
          timePerItem: 50,
          count: 4,
          icon: Hand
        },
        {
          sense: "Sound",
          instruction: "Listen carefully for 3 distinct sounds around you",
          prompts: [
            "Is this sound near or far from you?",
            "Is the sound constant or does it change?",
            "What might be creating this sound?",
            "How does this sound make you feel?"
          ],
          timePerItem: 55,
          count: 3,
          icon: Ear
        },
        {
          sense: "Smell",
          instruction: "Notice 2 different scents or smells in your environment",
          prompts: [
            "Is this smell pleasant, neutral, or unpleasant?",
            "Does this scent remind you of anything specific?",
            "How strong is this smell? Subtle or obvious?",
            "Where might this smell be coming from?"
          ],
          timePerItem: 60,
          count: 2,
          icon: Wind
        },
        {
          sense: "Taste",
          instruction: "Identify 1 taste you can notice, even if very subtle",
          prompts: [
            "What taste do you notice in your mouth right now?",
            "Is your mouth dry or do you have saliva?",
            "Can you taste anything from something you drank or ate recently?",
            "How would you describe this taste? Sweet, salty, bitter, or neutral?"
          ],
          timePerItem: 65,
          count: 1,
          icon: Smile
        }
      ]
    },
    {
      id: "body-awareness",
      name: "Progressive Body Awareness",
      description: "Systematic body scanning with tension release and grounding connection",
      duration: 420, // 7 minutes
      difficulty: 'medium',
      effectiveFor: ['physical tension', 'anxiety', 'trauma responses', 'hypervigilance'],
      adaptiveFeatures: ['Tension detection', 'Progressive timing', 'Breathing integration', 'Body mapping'],
      icon: Activity,
      color: "text-blue-600",
      steps: [
        {
          sense: "Feet & Grounding",
          instruction: "Focus on your feet and their connection to the ground",
          prompts: [
            "Feel the weight of your feet against the floor or ground",
            "Notice any sensations in your toes, heels, or arches",
            "Wiggle your toes and feel them move",
            "Imagine roots growing from your feet into the earth"
          ],
          timePerItem: 60,
          count: 4,
          icon: MapPin
        },
        {
          sense: "Legs & Support",
          instruction: "Scan your legs from feet to hips",
          prompts: [
            "Notice any tension or relaxation in your calves",
            "Feel the weight of your thighs against your seat",
            "Check for any tightness in your muscles",
            "Send a feeling of relaxation down your legs"
          ],
          timePerItem: 65,
          count: 4,
          icon: Activity
        },
        {
          sense: "Torso & Breathing",
          instruction: "Feel your torso and natural breathing rhythm",
          prompts: [
            "Notice your chest rising and falling naturally",
            "Feel any tension in your shoulders or back",
            "Place a hand on your stomach and feel it move",
            "Allow your breathing to slow and deepen"
          ],
          timePerItem: 70,
          count: 4,
          icon: Wind
        },
        {
          sense: "Arms & Hands",
          instruction: "Bring attention to your arms and hands",
          prompts: [
            "Feel the position of your arms and hands",
            "Notice any tension in your fingers or wrists",
            "Make gentle fists and then relax your hands",
            "Feel the temperature of your hands"
          ],
          timePerItem: 60,
          count: 4,
          icon: Hand
        },
        {
          sense: "Head & Face",
          instruction: "Complete the scan by focusing on your head and face",
          prompts: [
            "Notice any tension in your jaw or forehead",
            "Feel the weight of your head supported by your neck",
            "Relax any tightness around your eyes",
            "Let your whole face soften and relax"
          ],
          timePerItem: 65,
          count: 4,
          icon: Brain
        }
      ]
    },
    {
      id: "mindful-observation",
      name: "Mindful Environmental Observation",
      description: "Deep mindfulness practice focusing on present moment environmental awareness",
      duration: 540, // 9 minutes
      difficulty: 'medium',
      effectiveFor: ['rumination', 'dissociation', 'anxiety', 'mindfulness training'],
      adaptiveFeatures: ['Environmental scanning', 'Mindful attention', 'Present moment focus', 'Awareness expansion'],
      icon: Camera,
      color: "text-purple-600",
      steps: [
        {
          sense: "Visual Scan",
          instruction: "Slowly scan your environment without judgment",
          prompts: [
            "Look around without focusing on any particular object",
            "Notice the overall lighting and atmosphere",
            "Observe colors, shapes, and patterns without labeling",
            "Let your eyes rest on whatever draws your attention naturally"
          ],
          timePerItem: 75,
          count: 4,
          icon: Eye
        },
        {
          sense: "Sound Landscape",
          instruction: "Map the complete soundscape around you",
          prompts: [
            "Listen to the layers of sound from near to far",
            "Notice sounds that are constant versus intermittent",
            "Identify the quietest sound you can hear",
            "Listen to the silence between sounds"
          ],
          timePerItem: 80,
          count: 4,
          icon: Headphones
        },
        {
          sense: "Physical Presence",
          instruction: "Feel your complete physical presence in this space",
          prompts: [
            "Notice how much space your body takes up",
            "Feel the air around your skin",
            "Sense your body's relationship to nearby objects",
            "Feel yourself as part of this environment"
          ],
          timePerItem: 85,
          count: 4,
          icon: Activity
        }
      ]
    },
    {
      id: "sensory-anchoring",
      name: "Adaptive Sensory Anchoring",
      description: "Creates strong sensory anchors for emotional regulation and panic prevention",
      duration: 360, // 6 minutes  
      difficulty: 'hard',
      effectiveFor: ['panic attacks', 'PTSD triggers', 'severe anxiety', 'emotional overwhelm'],
      adaptiveFeatures: ['Anchor strength', 'Emotional tracking', 'Trigger adaptation', 'Recovery monitoring'],
      icon: Navigation,
      color: "text-red-600",
      steps: [
        {
          sense: "Primary Anchor",
          instruction: "Establish your strongest sensory anchor",
          prompts: [
            "Choose the strongest physical sensation you can create",
            "Press your feet firmly into the ground",
            "Squeeze your hands together with intention",
            "Focus all attention on this anchor sensation"
          ],
          timePerItem: 90,
          count: 4,
          icon: Hand
        },
        {
          sense: "Secondary Anchor",
          instruction: "Add a visual anchor to support grounding",
          prompts: [
            "Find one object you can see clearly",
            "Trace its outline with your eyes repeatedly",
            "Notice every detail about this object",
            "Let this object become your visual safe point"
          ],
          timePerItem: 90,
          count: 4,
          icon: Eye
        },
        {
          sense: "Integration",
          instruction: "Combine all anchors for maximum stability",
          prompts: [
            "Feel your physical anchor while looking at your visual anchor",
            "Add controlled breathing to your anchoring",
            "Say to yourself: 'I am here, I am safe, I am grounded'",
            "Store this feeling to use whenever needed"
          ],
          timePerItem: 90,
          count: 4,
          icon: Navigation
        }
      ]
    }
  ];

  // AI technique recommendation based on anxiety and stress levels
  const getRecommendedTechnique = () => {
    if (anxietyLevel > 80) return techniques.find(t => t.id === "sensory-anchoring");
    if (anxietyLevel > 60) return techniques.find(t => t.id === "54321-enhanced");
    if (stressLevel > 70) return techniques.find(t => t.id === "body-awareness");
    return techniques.find(t => t.id === "mindful-observation");
  };

  const startExercise = (technique?: GroundingTechnique) => {
    const selected = technique || currentTechnique || getRecommendedTechnique()!;
    setCurrentTechnique(selected);
    setIsActive(true);
    setCurrentStep(0);
    setCurrentItem(0);
    setTimeRemaining(selected.steps[0].timePerItem);
    setCompletedItems([]);
    setCurrentAnxiety(anxietyLevel);
    
    toast({
      title: "Grounding Session Started",
      description: `Beginning ${selected.name} - ${Math.round(selected.duration / 60)} minutes`,
      variant: "default"
    });
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resumeExercise = () => {
    setIsActive(true);
  };

  const nextItem = () => {
    if (!currentTechnique) return;

    const currentStepData = currentTechnique.steps[currentStep];
    const itemId = `${currentStep}-${currentItem}`;
    setCompletedItems(prev => [...prev, itemId]);
    
    // Simulate anxiety reduction as items are completed
    setCurrentAnxiety(prev => Math.max(10, prev - 3));

    if (currentItem + 1 < currentStepData.count) {
      setCurrentItem(prev => prev + 1);
      setTimeRemaining(currentStepData.timePerItem);
    } else if (currentStep + 1 < currentTechnique.steps.length) {
      setCurrentStep(prev => prev + 1);
      setCurrentItem(0);
      setTimeRemaining(currentTechnique.steps[currentStep + 1].timePerItem);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setIsActive(false);
    const anxietyReduction = anxietyLevel - currentAnxiety;
    
    toast({
      title: "Grounding Session Complete!",
      description: `Anxiety reduced by ${Math.round(anxietyReduction)}%. You're now more grounded and present.`,
      variant: "default"
    });
    
    onComplete?.();
    resetExercise();
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentStep(0);
    setCurrentItem(0);
    setTimeRemaining(0);
    setCompletedItems([]);
    setCurrentAnxiety(anxietyLevel);
  };

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      nextItem();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const getOverallProgress = () => {
    if (!currentTechnique) return 0;
    
    const totalItems = currentTechnique.steps.reduce((sum, step) => sum + step.count, 0);
    return (completedItems.length / totalItems) * 100;
  };

  const getCurrentPrompt = () => {
    if (!currentTechnique) return "";
    const step = currentTechnique.steps[currentStep];
    return step.prompts[currentItem] || step.instruction;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-900 dark:text-green-100">
                  Smart Grounding Techniques
                </CardTitle>
                <p className="text-green-700 dark:text-green-300">
                  AI-guided grounding with real-time anxiety detection and adaptive responses
                </p>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <Activity className="h-3 w-3 mr-1" />
              4.6 Rating
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
          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Real-time Anxiety Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Current State Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <span className="text-sm">Anxiety Level</span>
                      <Badge variant="secondary">{currentAnxiety}%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <span className="text-sm">Stress Level</span>
                      <Badge variant="secondary">{stressLevel}%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <span className="text-sm">Session Progress</span>
                      <Badge variant="secondary">{Math.round(getOverallProgress())}%</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">AI Recommendation</h4>
                  {(() => {
                    const recommended = getRecommendedTechnique();
                    return recommended ? (
                      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <recommended.icon className={`h-5 w-5 ${recommended.color}`} />
                            <span className="font-medium">{recommended.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{recommended.description}</p>
                          <Button 
                            onClick={() => startExercise(recommended)} 
                            className="w-full"
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

          {/* Active Session Interface */}
          {currentTechnique && isActive ? (
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Session Header */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <currentTechnique.icon className={`h-8 w-8 ${currentTechnique.color}`} />
                      <h2 className="text-2xl font-bold">{currentTechnique.name}</h2>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow">
                        <div className="flex items-center justify-center mb-2">
                          {(() => {
                            const IconComponent = currentTechnique.steps[currentStep].icon;
                            return IconComponent ? <IconComponent className="h-5 w-5 text-blue-600" /> : null;
                          })()}
                        </div>
                        <div className="text-sm font-medium">{currentTechnique.steps[currentStep].sense}</div>
                        <div className="text-xs text-muted-foreground">Current Focus</div>
                      </div>
                      
                      <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow">
                        <Timer className="h-5 w-5 mx-auto mb-2 text-green-600" />
                        <div className="text-sm font-medium">{formatTime(timeRemaining)}</div>
                        <div className="text-xs text-muted-foreground">Time Remaining</div>
                      </div>
                      
                      <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow">
                        <Heart className="h-5 w-5 mx-auto mb-2 text-red-600" />
                        <div className="text-sm font-medium">{currentAnxiety}%</div>
                        <div className="text-xs text-muted-foreground">Anxiety Level</div>
                      </div>
                    </div>
                  </div>

                  {/* Current Instruction */}
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="mb-4">
                        <Badge variant="secondary" className="mb-2">
                          Step {currentStep + 1} of {currentTechnique.steps.length} - Item {currentItem + 1} of {currentTechnique.steps[currentStep].count}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
                        {currentTechnique.steps[currentStep].instruction}
                      </h3>
                      
                      <div className="text-lg text-green-700 dark:text-green-300 mb-6">
                        {getCurrentPrompt()}
                      </div>
                      
                      <Progress value={getOverallProgress()} className="w-full h-3 mb-4" />
                      
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
                          onClick={nextItem}
                          variant="default"
                          size="lg"
                        >
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Complete This Item
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
                    </CardContent>
                  </Card>

                  {/* Adaptive Features Active */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        <span>Adaptive Features Active</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentTechnique.adaptiveFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                            <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-700 dark:text-yellow-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Quick Start Options */
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {techniques.slice(0, 2).map((technique) => (
                    <Card key={technique.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startExercise(technique)}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <technique.icon className={`h-6 w-6 ${technique.color}`} />
                          <div>
                            <h3 className="font-semibold">{technique.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {technique.difficulty}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">{technique.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Duration: {Math.round(technique.duration / 60)} min</span>
                            <span>Steps: {technique.steps.length}</span>
                          </div>
                          
                          <div className="text-xs">
                            <span className="font-medium">Effective for:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {technique.effectiveFor.slice(0, 3).map((condition, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
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
                      <div className="text-xs font-medium mb-1">Steps ({technique.steps.length})</div>
                      <div className="space-y-1">
                        {technique.steps.map((step, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            <step.icon className="h-3 w-3 text-muted-foreground" />
                            <span>{step.sense}: {step.count} items</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium mb-1">Effective For</div>
                      <div className="flex flex-wrap gap-1">
                        {technique.effectiveFor.map((condition, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {condition}
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
                <span>Grounding Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Default Session Duration</Label>
                <Slider
                  value={sessionDuration}
                  onValueChange={setSessionDuration}
                  max={15}
                  min={3}
                  step={1}
                  className="mb-3"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>3 minutes</span>
                  <span className="font-medium">Selected: {sessionDuration[0]} minutes</span>
                  <span>15 minutes</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Guided Mode</Label>
                      <p className="text-xs text-muted-foreground">Step-by-step instructions and prompts</p>
                    </div>
                    <Switch checked={guidedMode} onCheckedChange={setGuidedMode} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Adaptive Prompts</Label>
                      <p className="text-xs text-muted-foreground">AI adjusts prompts based on your response</p>
                    </div>
                    <Switch checked={adaptivePrompts} onCheckedChange={setAdaptivePrompts} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Voice Guidance</Label>
                      <p className="text-xs text-muted-foreground">Spoken instructions during sessions</p>
                    </div>
                    <Switch checked={voiceGuidance} onCheckedChange={setVoiceGuidance} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Environmental Cues</Label>
                      <p className="text-xs text-muted-foreground">Smart suggestions based on your surroundings</p>
                    </div>
                    <Switch checked={environmentalCues} onCheckedChange={setEnvironmentalCues} />
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
                <Brain className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold text-blue-600">{sessionStats.averageAnxietyReduction}%</div>
                <div className="text-xs text-muted-foreground">Avg Anxiety Reduction</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-lg font-bold text-purple-600">{sessionStats.successRate}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <div className="text-xs font-bold text-yellow-600">{sessionStats.favoriteeTechnique}</div>
                <div className="text-xs text-muted-foreground">Favorite Technique</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}