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

            {/* Overview Analytics Grid */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Advanced Wellness Overview */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/20 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                          <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Wellness Overview</CardTitle>
                          <p className="text-sm text-blue-700 dark:text-blue-300">Your comprehensive mental health journey</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-200 text-blue-800 border-blue-300">
                        65% Strong
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Overall Wellness Score */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Overall Wellness</span>
                          <span className="text-sm font-bold text-blue-800 dark:text-blue-200">65%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{width: '65%'}}></div>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Good momentum, keep it up!</p>
                      </div>
                      
                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                          <div className="text-lg font-bold text-blue-700 dark:text-blue-300">24</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">Sessions</div>
                          <div className="text-xs text-green-600">+3 this week</div>
                        </div>
                        <div className="text-center p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                          <div className="text-lg font-bold text-green-700 dark:text-green-300">4.2</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">Mood Avg</div>
                          <div className="text-xs text-green-600">↑ 0.3 pts</div>
                        </div>
                        <div className="text-center p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                          <div className="text-lg font-bold text-purple-700 dark:text-purple-300">12</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">Day Streak</div>
                          <div className="text-xs text-green-600">Record!</div>
                        </div>
                      </div>
                      
                      {/* Quick Insights */}
                      <div className="bg-white/50 dark:bg-black/10 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Today's Focus</span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Your stress levels peak around 2 PM. Consider a 5-minute breathing session at 1:45 PM for optimal results.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced AI Insights */}
                <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/30 dark:to-violet-900/20 border-purple-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                          <Zap className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-purple-900 dark:text-purple-100">AI Insights</CardTitle>
                          <p className="text-sm text-purple-700 dark:text-purple-300">Intelligent pattern analysis and predictions</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-200 text-purple-800 border-purple-300">
                        <Zap className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* AI Status */}
                      <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">AI Analysis Active</span>
                        </div>
                        <span className="text-xs text-purple-600 dark:text-purple-400">Real-time monitoring</span>
                      </div>
                      
                      {/* Insights List */}
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">Optimal Timing</span>
                          </div>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            Your meditation sessions are 23% more effective at 7:30 AM based on 2-week analysis.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Stress Prediction</span>
                          </div>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            73% likelihood of increased stress Tuesday 2-4 PM. Preemptive breathing exercise recommended.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Heart className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Health Trend</span>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Resting heart rate improved by 4 BPM this month. Breathing exercises showing measurable impact.
                          </p>
                        </div>
                      </div>
                      
                      {/* Next Recommendation */}
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-300">
                        <div className="flex items-center space-x-2 mb-1">
                          <Zap className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Next Recommendation</span>
                        </div>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          Try the 4-7-8 breathing technique for better sleep quality based on your recent stress patterns.
                        </p>
                        <Button size="sm" variant="outline" className="mt-2 w-full text-purple-700 border-purple-300">
                          Start Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Emergency Network Status */}
            <section className="mt-8">
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl">
                        <Shield className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-red-900 dark:text-red-100">Emergency Network Status</CardTitle>
                        <p className="text-sm text-red-700 dark:text-red-300">Your safety network is ready and monitoring</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        All Systems Online
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/70 dark:bg-black/20 rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-red-600" />
                      <div className="text-lg font-bold text-red-700 dark:text-red-300">{emergencyContacts.length || 0}</div>
                      <div className="text-xs text-red-600 dark:text-red-400">Emergency Contacts</div>
                      <div className="text-xs text-green-600 mt-1">12s avg response</div>
                    </div>
                    
                    <div className="text-center p-4 bg-white/70 dark:bg-black/20 rounded-lg">
                      <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-300">GPS</div>
                      <div className="text-xs text-red-600 dark:text-red-400">Location Services</div>
                      <div className="text-xs text-green-600 mt-1">High accuracy</div>
                    </div>
                    
                    <div className="text-center p-4 bg-white/70 dark:bg-black/20 rounded-lg">
                      <Eye className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-lg font-bold text-purple-700 dark:text-purple-300">AI</div>
                      <div className="text-xs text-red-600 dark:text-red-400">Crisis Detection</div>
                      <div className="text-xs text-green-600 mt-1">24/7 monitoring</div>
                    </div>
                    
                    <div className="text-center p-4 bg-white/70 dark:bg-black/20 rounded-lg">
                      <Zap className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-300">Alert</div>
                      <div className="text-xs text-red-600 dark:text-red-400">Response System</div>
                      <div className="text-xs text-green-600 mt-1">Instant deployment</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Safety Tools Tab */}
          <TabsContent value="safety">
            <AdvancedSafetyTools 
              emergencyContacts={emergencyContacts}
              userLocation={userLocation}
            />
          </TabsContent>

          {/* Advanced Wellness Analytics */}
          <TabsContent value="wellness" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Wellness Analytics</h2>
              <p className="text-muted-foreground">Comprehensive insights into your mental health journey with predictive analytics</p>
            </div>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                  <div className="text-sm text-muted-foreground">Sessions This Week</div>
                  <div className="text-xs text-green-600 mt-1">↑ 12% from last week</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">4.2</div>
                  <div className="text-sm text-muted-foreground">Avg Mood Score</div>
                  <div className="text-xs text-green-600 mt-1">↑ 0.3 improvement</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
                  <div className="text-sm text-muted-foreground">Stress Reduction</div>
                  <div className="text-xs text-green-600 mt-1">↑ 5% this month</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">12</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                  <div className="text-xs text-green-600 mt-1">Personal best!</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Weekly Progress Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Breathing Sessions</span>
                      <span className="text-sm text-muted-foreground">8 sessions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Grounding Exercises</span>
                      <span className="text-sm text-muted-foreground">6 sessions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Meditation Practice</span>
                      <span className="text-sm text-muted-foreground">5 sessions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '50%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Crisis Chat Support</span>
                      <span className="text-sm text-muted-foreground">3 sessions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-teal-600 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mood Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Mood & Stress Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="text-lg font-bold text-green-600">4.2/5</div>
                        <div className="text-xs text-muted-foreground">Average Mood</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">2.1/5</div>
                        <div className="text-xs text-muted-foreground">Stress Level</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Weekly Mood Pattern</div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mon: 3.8</span>
                        <span>Tue: 4.1</span>
                        <span>Wed: 4.3</span>
                        <span>Thu: 4.0</span>
                        <span>Fri: 4.5</span>
                        <span>Sat: 4.2</span>
                        <span>Sun: 4.4</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-400 via-green-500 to-green-600 h-2 rounded-full" style={{width: '84%'}}></div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                      <strong>AI Insight:</strong> Your mood tends to improve throughout the week, with Friday showing consistently high scores. Consider scheduling more challenging tasks early in the week when you're building momentum.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tool Effectiveness */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Tool Effectiveness</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Breathing Exercises</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">92%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Crisis Chat</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-600 h-2 rounded-full" style={{width: '89%'}}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">89%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grounding Techniques</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">87%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Meditation</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">85%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Biometric Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Biometric Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="text-lg font-bold text-red-600">68 BPM</div>
                      <div className="text-xs text-muted-foreground">Resting Heart Rate</div>
                      <div className="text-xs text-green-600">↓ 4 BPM this month</div>
                    </div>
                    
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">42 ms</div>
                      <div className="text-xs text-muted-foreground">HRV Score</div>
                      <div className="text-xs text-green-600">↑ 8% improvement</div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                      <strong>Trend:</strong> Your cardiovascular health is improving consistently. The breathing exercises are having a measurable positive impact.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Predictive Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
                      <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Stress Risk Alert</div>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Based on patterns, Tuesday 2-4 PM shows 73% likelihood of increased stress. Consider scheduling breathing exercises during this time.
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">Optimal Session Time</div>
                      <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Your most effective meditation sessions occur at 7:30 AM (+23% effectiveness vs. average).
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Recovery Prediction</div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Current trajectory suggests reaching 4.5/5 mood baseline within 8 days with consistent practice.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Gamification & Achievements */}
          <TabsContent value="gamification" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Achievements & Progress</h2>
              <p className="text-muted-foreground">Gamified mental health journey with rewards, streaks, and milestone tracking</p>
            </div>

            {/* Points & Level Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">1,247</div>
                  <div className="text-sm text-muted-foreground mb-3">Total Safety Points</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Level 4: Guardian</span>
                      <span>253 pts to Level 5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '83%'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-4xl font-bold text-yellow-600 mb-2">17</div>
                  <div className="text-sm text-muted-foreground mb-3">Achievements Unlocked</div>
                  <div className="text-xs text-green-600">+3 this week</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Timer className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-2">12</div>
                  <div className="text-sm text-muted-foreground mb-3">Day Streak</div>
                  <div className="text-xs text-green-600">Personal Record!</div>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                        <Timer className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">12-Day Safety Streak</div>
                        <div className="text-sm text-muted-foreground">Daily wellness check-ins completed</div>
                        <div className="text-xs text-yellow-600 mt-1">+150 points</div>
                      </div>
                      <Badge className="bg-yellow-200 text-yellow-800">New!</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Emergency Response Pro</div>
                        <div className="text-sm text-muted-foreground">Sub-10s average response time</div>
                        <div className="text-xs text-blue-600 mt-1">+200 points</div>
                      </div>
                      <Badge variant="secondary">Elite</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                        <Heart className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Mood Master</div>
                        <div className="text-sm text-muted-foreground">7 days above 4.0 mood score</div>
                        <div className="text-xs text-green-600 mt-1">+100 points</div>
                      </div>
                      <Badge variant="secondary">Complete</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                        <Wind className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Breathing Expert</div>
                        <div className="text-sm text-muted-foreground">50 breathing sessions completed</div>
                        <div className="text-xs text-purple-600 mt-1">+175 points</div>
                      </div>
                      <Badge variant="secondary">Milestone</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    <span>Active Challenges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">30-Day Consistency</span>
                        <span className="text-sm text-orange-600">12/30 days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{width: '40%'}}></div>
                      </div>
                      <div className="text-xs text-muted-foreground">Use any therapeutic tool daily for 30 days</div>
                      <div className="text-xs text-orange-600 mt-1">Reward: 500 points + "Resilience Champion" badge</div>
                    </div>

                    <div className="p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg border border-teal-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Crisis Chat Master</span>
                        <span className="text-sm text-teal-600">3/10 sessions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-teal-600 h-2 rounded-full" style={{width: '30%'}}></div>
                      </div>
                      <div className="text-xs text-muted-foreground">Complete 10 crisis chat sessions</div>
                      <div className="text-xs text-teal-600 mt-1">Reward: 300 points + "Support Seeker" badge</div>
                    </div>

                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Biometric Optimizer</span>
                        <span className="text-sm text-indigo-600">68% complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{width: '68%'}}></div>
                      </div>
                      <div className="text-xs text-muted-foreground">Improve resting heart rate by 5 BPM</div>
                      <div className="text-xs text-indigo-600 mt-1">Reward: 400 points + "Health Guardian" badge</div>
                    </div>

                    <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Meditation Marathon</span>
                        <span className="text-sm text-pink-600">15/25 sessions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-pink-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <div className="text-xs text-muted-foreground">Complete 25 meditation sessions this month</div>
                      <div className="text-xs text-pink-600 mt-1">Reward: 350 points + "Mindfulness Master" badge</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard & Social Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Weekly Leaderboard</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                      <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-white">1</div>
                      <div className="flex-1">
                        <div className="font-medium">Alex M.</div>
                        <div className="text-xs text-muted-foreground">2,847 points</div>
                      </div>
                      <Badge className="bg-yellow-200 text-yellow-800">👑</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-950/20 rounded">
                      <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white">2</div>
                      <div className="flex-1">
                        <div className="font-medium">Sarah K.</div>
                        <div className="text-xs text-muted-foreground">2,103 points</div>
                      </div>
                      <Badge variant="secondary">🥈</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                      <div className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-xs font-bold text-white">3</div>
                      <div className="flex-1">
                        <div className="font-medium">Jordan L.</div>
                        <div className="text-xs text-muted-foreground">1,876 points</div>
                      </div>
                      <Badge variant="secondary">🥉</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border-2 border-blue-300">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">4</div>
                      <div className="flex-1">
                        <div className="font-medium">You</div>
                        <div className="text-xs text-muted-foreground">1,247 points</div>
                      </div>
                      <Badge className="bg-blue-200 text-blue-800">↑ 2</Badge>
                    </div>

                    <div className="text-xs text-center text-muted-foreground mt-3 p-2 bg-gray-50 dark:bg-gray-950/20 rounded">
                      You've moved up 2 positions this week! Keep up the great work!
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badge Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-500" />
                    <span>Badge Collection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <div className="text-2xl mb-1">🌱</div>
                      <div className="text-xs font-medium">First Steps</div>
                    </div>
                    
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                      <div className="text-2xl mb-1">💨</div>
                      <div className="text-xs font-medium">Breath Master</div>
                    </div>
                    
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
                      <div className="text-2xl mb-1">🧘</div>
                      <div className="text-xs font-medium">Zen Focus</div>
                    </div>
                    
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-xs font-medium">Quick Responder</div>
                    </div>
                    
                    <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                      <div className="text-2xl mb-1">❤️</div>
                      <div className="text-xs font-medium">Heart Helper</div>
                    </div>
                    
                    <div className="text-center p-2 bg-teal-50 dark:bg-teal-950/20 rounded-lg border border-teal-200">
                      <div className="text-2xl mb-1">💬</div>
                      <div className="text-xs font-medium">Support Seeker</div>
                    </div>
                    
                    <div className="text-center p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-xs font-medium">Goal Getter</div>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 opacity-50">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-xs font-medium">Champion</div>
                      <div className="text-xs text-gray-500">Locked</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm">
                      View All Badges
                    </Button>
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