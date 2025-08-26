import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AdvancedBreathingExercise } from "@/components/ui/advanced-breathing-exercise";
import { EnhancedGroundingExercise } from "@/components/ui/enhanced-grounding-exercise";
import { ComprehensiveEmergencyMonitoring } from "@/components/ui/comprehensive-emergency-monitoring";
import { AdvancedSafetyTools } from "@/components/ui/advanced-safety-tools";
import { TherapeuticDistractionHub } from "@/components/ui/therapeutic-distraction-hub";
import { AIPoweredMeditation } from "@/components/ui/ai-powered-meditation";
import { CrisisChatSupport } from "@/components/ui/crisis-chat-support";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Shield,
  Wind, 
  Leaf, 
  Waves, 
  Puzzle, 
  Activity,
  Users,
  Settings,
  Zap,
  Eye,
  MapPin,
  Bell,
  Gamepad2,
  Star,
  Play,
  Clock,
  Heart,
  Music,
  Book,
  Palette,
  Target,
  Timer,
  Award,
  MessageCircle
} from "lucide-react";

const enhancedCopingTools = [
  {
    id: "breathing",
    name: "Advanced Breathing Exercises",
    description: "Multiple breathing techniques with biometric feedback and personalized coaching",
    icon: Wind,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200",
    component: AdvancedBreathingExercise,
    techniques: ["4-7-8 Deep Relaxation", "Box Breathing (Navy SEAL)", "Wim Hof Method", "Triangle Breathing", "Coherent Breathing", "Fire Breathing"],
    duration: "3-15 minutes",
    effectiveness: 4.8,
    features: ["Heart rate monitoring", "Stress level tracking", "Personalized pace", "Progress analytics"]
  },
  {
    id: "grounding",
    name: "Smart Grounding Techniques", 
    description: "AI-guided grounding with real-time anxiety detection and adaptive responses",
    icon: Leaf,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200",
    component: EnhancedGroundingExercise,
    techniques: ["Enhanced 5-4-3-2-1", "Progressive Body Awareness", "Mindful Environmental Observation", "Adaptive Sensory Anchoring"],
    duration: "5-20 minutes",
    effectiveness: 4.6,
    features: ["Anxiety level detection", "Adaptive guidance", "Environmental cues", "Voice coaching"]
  },
  {
    id: "meditation",
    name: "AI-Powered Meditation",
    description: "Personalized meditation sessions that adapt to your mental state and stress levels",
    icon: Waves,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200",
    component: AIPoweredMeditation,
    techniques: ["Adaptive Breathing", "Mood-Based Mindfulness", "Stress Relief Visualization", "Biometric Body Scan", "Sleep Optimization"],
    duration: "5-60 minutes",
    effectiveness: 4.7,
    features: ["Biometric analysis", "Mood-based selection", "Progress tracking", "AI adaptation"]
  },
  {
    id: "distraction",
    name: "Therapeutic Distraction Hub",
    description: "Curated activities scientifically proven to redirect focus during crisis moments",
    icon: Puzzle,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200",
    component: TherapeuticDistractionHub,
    techniques: ["Color Breathing", "Counting Games", "Sensory Grounding", "Creative Storytelling", "Rhythm Therapy"],
    duration: "2-30 minutes",
    effectiveness: 4.2,
    features: ["Crisis-specific selection", "Difficulty adaptation", "Real-time adaptation", "Progress tracking"]
  },
  {
    id: "emergency-monitoring",
    name: "AI Emergency Monitoring",
    description: "Real-time audio analysis that detects danger and automatically alerts your support network",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200",
    component: ComprehensiveEmergencyMonitoring,
    techniques: ["Voice Pattern Analysis", "Threat Detection", "Auto-Alert System", "Location Tracking"],
    duration: "Always Active",
    effectiveness: 4.9,
    features: ["Real-time transcription", "AI threat analysis", "Instant alerts", "Evidence recording"]
  },
  {
    id: "crisis-chat",
    name: "Crisis Chat Support",
    description: "AI-powered emotional support and guided crisis intervention available 24/7",
    icon: MessageCircle,
    color: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200",
    component: CrisisChatSupport,
    techniques: ["Crisis conversation", "Emotional support", "Resource connection", "Risk assessment"],
    duration: "24/7 Available",
    effectiveness: 4.9,
    features: ["24/7 availability", "Crisis detection", "Emergency escalation", "Professional resources"]
  }
];

const quickDistractors = [
  { name: "Calming Music Playlists", icon: Music, action: () => window.open('https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZP0gtP', '_blank'), description: "Scientifically curated for anxiety relief" },
  { name: "Interactive Art Therapy", icon: Palette, action: () => window.open('https://www.thecoloringbook.co/', '_blank'), description: "Digital art creation for mindfulness" },
  { name: "Guided Sleep Stories", icon: Book, action: () => window.open('https://www.calm.com/sleep-stories', '_blank'), description: "Narrated stories to ease racing thoughts" },
  { name: "Cognitive Training Games", icon: Target, action: () => window.open('https://www.nytimes.com/games/wordle/index.html', '_blank'), description: "Focus-building puzzles and exercises" },
];

export default function ToolsEnhanced() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [biometricData, setBiometricData] = useState({
    heartRate: 72,
    stressLevel: 45,
    moodScore: 65
  });

  // Fetch coping tools usage and emergency contacts
  const { data: toolsUsage, isLoading } = useQuery({
    queryKey: ["/api/coping-tools-usage"],
  });

  const { data: emergencyContacts } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });

  const { data: userLocation } = useQuery({
    queryKey: ["/api/user-location"],
    enabled: false, // Only fetch when needed
  });

  const renderToolComponent = (tool: any) => {
    const ToolComponent = tool.component;
    if (!ToolComponent) {
      return (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              This advanced {tool.name.toLowerCase()} feature is currently in development.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Planned Features:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {tool.features?.map((feature: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="mt-6">
        <ToolComponent 
          emergencyContacts={emergencyContacts}
          userLocation={userLocation}
          heartRate={biometricData.heartRate}
          stressLevel={biometricData.stressLevel}
          moodScore={biometricData.moodScore}
          crisisIntensity={biometricData.stressLevel > 80 ? 'critical' : 
                          biometricData.stressLevel > 60 ? 'high' : 
                          biometricData.stressLevel > 40 ? 'medium' : 'low'}
          timeOfDay={new Date().getHours() < 12 ? 'morning' : 
                    new Date().getHours() < 17 ? 'afternoon' : 
                    new Date().getHours() < 21 ? 'evening' : 'night'}
          onSessionComplete={(session: any) => {
            console.log('Session completed:', session);
            // Update biometric data based on session effectiveness
            setBiometricData(prev => ({
              ...prev,
              stressLevel: Math.max(10, prev.stressLevel - (session.effectivenessScore || 0) * 0.3),
              heartRate: Math.max(60, prev.heartRate - (session.heartRateChange || 0))
            }));
          }}
          onActivityComplete={(activity: string, duration: number, effectiveness: number) => {
            console.log('Activity completed:', { activity, duration, effectiveness });
            // Update stress and mood based on activity effectiveness
            setBiometricData(prev => ({
              ...prev,
              stressLevel: Math.max(10, prev.stressLevel - effectiveness * 0.2),
              moodScore: Math.min(100, prev.moodScore + effectiveness * 0.15)
            }));
          }}
        />
      </div>
    );
  };

  if (selectedTool) {
    const tool = enhancedCopingTools.find(t => t.id === selectedTool);
    if (!tool) return <div>Tool not found</div>;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedTool(null)}
                  className="mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className={`p-2.5 rounded-xl ${tool.bgColor}`}>
                  <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
                  <p className="text-muted-foreground">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Badge className="bg-primary text-primary-foreground">
                  {tool.effectiveness}/5.0 ⭐
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {renderToolComponent(tool)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" asChild className="mr-2">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground p-2.5 rounded-xl">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Comprehensive Safety Tools</h1>
                <p className="text-muted-foreground">Advanced crisis prevention and mental health support</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Safety Tools</span>
            </TabsTrigger>
            <TabsTrigger value="wellness" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Wellness</span>
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center space-x-2">
              <Gamepad2 className="h-4 w-4" />
              <span>Achievements</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            
            {/* Enhanced Coping Tools Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">AI-Enhanced Coping Tools</h2>
                  <p className="text-muted-foreground">Personalized mental health tools powered by artificial intelligence</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enhancedCopingTools.map((tool) => (
                  <Card 
                    key={tool.id}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${tool.bgColor} ${tool.borderColor} hover:scale-105`}
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl bg-white/70 dark:bg-black/30`}>
                          <tool.icon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                            <span className="text-sm font-bold">{tool.effectiveness}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-2">{tool.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{tool.duration}</span>
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {tool.techniques.length} Techniques
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Key Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {tool.features?.slice(0, 2).map((feature: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {tool.features && tool.features.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{tool.features.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-3"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Quick Distraction Tools */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Quick Relief Activities</h2>
                  <p className="text-muted-foreground">Immediate distraction tools for acute stress</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickDistractors.map((distractor, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/30 hover:scale-105"
                    onClick={distractor.action}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="bg-primary/10 text-primary p-3 rounded-xl w-fit mx-auto mb-3">
                        <distractor.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-sm mb-2">{distractor.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{distractor.description}</p>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Open External
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Safety Tools Tab */}
          <TabsContent value="safety">
            <AdvancedSafetyTools 
              emergencyContacts={emergencyContacts}
              userLocation={userLocation}
            />
          </TabsContent>

          {/* Wellness Tab */}
          <TabsContent value="wellness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Wellness Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">24</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Sessions This Week</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">4.2</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Avg Mood Score</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Stress Reduction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                        <Timer className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">7-Day Safety Streak</div>
                        <div className="text-sm text-muted-foreground">Daily check-ins completed</div>
                      </div>
                      <Badge className="ml-auto">New!</Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Emergency Response Pro</div>
                        <div className="text-sm text-muted-foreground">Sub-15s average response time</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-purple-500" />
                    <span>Safety Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">1,247</div>
                    <div className="text-muted-foreground mb-4">Total Points Earned</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Next Level</span>
                        <span>1,500 pts</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '83%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}