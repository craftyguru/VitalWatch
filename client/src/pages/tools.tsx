import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BreathingExercise } from "@/components/ui/breathing-exercise";
import { GroundingExercise } from "@/components/ui/grounding-exercise";
import { Link } from "wouter";
import { 
  Wind, 
  Leaf, 
  Waves, 
  Puzzle, 
  Activity,
  Users,
  TrendingUp,
  Settings,
  ArrowLeft,
  Play,
  Clock,
  Star,
  Zap,
  Heart,
  Music,
  Book,
  Gamepad2,
  Palette
} from "lucide-react";

const copingTools = [
  {
    id: "breathing",
    name: "Breathing Exercises",
    description: "Guided breathing techniques for anxiety and stress relief",
    icon: Wind,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    component: BreathingExercise,
    techniques: ["4-7-8 Relaxation", "Box Breathing", "Calm Breathing"],
    duration: "3-5 minutes",
    effectiveness: 4.8,
  },
  {
    id: "grounding",
    name: "Grounding Techniques",
    description: "5-4-3-2-1 method to reconnect with the present moment",
    icon: Leaf,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    component: GroundingExercise,
    techniques: ["5-4-3-2-1 Method", "Body Awareness", "Mindful Observation"],
    duration: "5-10 minutes",
    effectiveness: 4.6,
  },
  {
    id: "meditation",
    name: "Guided Meditation",
    description: "Mindfulness and relaxation sessions for mental clarity",
    icon: Waves,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    component: null, // To be implemented
    techniques: ["Body Scan", "Loving Kindness", "Mindful Breathing"],
    duration: "10-20 minutes",
    effectiveness: 4.7,
  },
  {
    id: "distraction",
    name: "Distraction Activities",
    description: "Engaging activities to redirect focus during difficult moments",
    icon: Puzzle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    component: null, // To be implemented
    techniques: ["Word Games", "Creative Tasks", "Memory Exercises"],
    duration: "5-15 minutes",
    effectiveness: 4.2,
  },
];

const quickDistractors = [
  { name: "Calming Music", icon: Music, action: () => window.open('https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZP0gtP', '_blank') },
  { name: "Guided Stories", icon: Book, action: () => window.open('https://www.calm.com/sleep-stories', '_blank') },
  { name: "Simple Games", icon: Gamepad2, action: () => window.open('https://www.nytimes.com/games/wordle/index.html', '_blank') },
  { name: "Art Therapy", icon: Palette, action: () => window.open('https://www.thecoloringbook.co/', '_blank') },
];

export default function Tools() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch coping tools usage
  const { data: toolsUsage, isLoading } = useQuery({
    queryKey: ["/api/coping-tools-usage"],
  });

  const getUsageStats = (toolType: string) => {
    if (!toolsUsage) return null;
    
    const toolUsages = toolsUsage.filter((usage: any) => usage.toolType === toolType);
    const totalSessions = toolUsages.length;
    const completedSessions = toolUsages.filter((usage: any) => usage.completed).length;
    const avgEffectiveness = toolUsages.length > 0 
      ? toolUsages.reduce((sum: number, usage: any) => sum + (usage.effectiveness || 0), 0) / toolUsages.length 
      : 0;

    return {
      totalSessions,
      completedSessions,
      avgEffectiveness,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    };
  };

  if (selectedTool) {
    const tool = copingTools.find(t => t.id === selectedTool);
    if (tool && tool.component) {
      const ToolComponent = tool.component;
      return (
        <div className="min-h-screen bg-neutral-50">
          <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-40">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedTool(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-neutral-700">{tool.name}</h1>
                  <p className="text-xs text-neutral-500">{tool.description}</p>
                </div>
              </div>
              <tool.icon className={`h-5 w-5 ${tool.color}`} />
            </div>
          </header>

          <div className="px-4 py-6">
            <ToolComponent onComplete={() => {
              // Tool completion handled by the component
            }} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-700">Coping Tools</h1>
              <p className="text-xs text-neutral-500">Mental wellness activities</p>
            </div>
          </div>
          <Wind className="h-5 w-5 text-primary" />
        </div>
      </header>

      <div className="px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quick">Quick Help</TabsTrigger>
            <TabsTrigger value="stats">My Usage</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Coping Techniques</span>
                </CardTitle>
                <p className="text-sm text-neutral-600">
                  Evidence-based tools to help manage anxiety, stress, and difficult emotions
                </p>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {copingTools.map((tool) => {
                const usage = getUsageStats(tool.id);
                const ToolIcon = tool.icon;
                
                return (
                  <Card 
                    key={tool.id}
                    className={`${tool.borderColor} hover:shadow-lg transition-all cursor-pointer`}
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center`}>
                          <ToolIcon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-neutral-800">{tool.name}</h3>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-neutral-600">{tool.effectiveness}</span>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-600 mb-3">{tool.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-neutral-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{tool.duration}</span>
                              </div>
                              {usage && usage.totalSessions > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Zap className="h-3 w-3" />
                                  <span>{usage.totalSessions} sessions</span>
                                </div>
                              )}
                            </div>
                            
                            <Button size="sm" className={`${tool.color.replace('text-', 'bg-').replace('600', '500')} text-white hover:opacity-90`}>
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-neutral-100">
                            <div className="flex flex-wrap gap-1">
                              {tool.techniques.slice(0, 3).map((technique, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {technique}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Quick Help Tab */}
          <TabsContent value="quick" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Immediate Relief</span>
                </CardTitle>
                <p className="text-sm text-neutral-600">
                  Quick activities for when you need instant support
                </p>
              </CardHeader>
            </Card>

            {/* Emergency Coping */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-red-800 mb-2">In Crisis Right Now?</h3>
                <p className="text-sm text-red-700 mb-3">
                  Try these immediate techniques or reach out for help
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm"
                    onClick={() => setSelectedTool("breathing")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Wind className="h-3 w-3 mr-1" />
                    Quick Breathing
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setSelectedTool("grounding")}
                    variant="outline"
                    className="border-red-600 text-red-600"
                  >
                    <Leaf className="h-3 w-3 mr-1" />
                    Grounding
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Distractors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Distractors</CardTitle>
                <p className="text-sm text-neutral-600">
                  Healthy ways to redirect your focus
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickDistractors.map((distractor, index) => {
                    const Icon = distractor.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-16 flex flex-col items-center justify-center space-y-1"
                        onClick={distractor.action}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{distractor.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Guided Activities */}
            <div className="grid gap-3">
              {copingTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant="outline"
                    className={`h-16 flex items-center space-x-3 justify-start p-4 ${tool.borderColor} hover:${tool.bgColor}`}
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <div className={`w-8 h-8 rounded-lg ${tool.bgColor} flex items-center justify-center`}>
                      <ToolIcon className={`h-4 w-4 ${tool.color}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs text-neutral-500">{tool.duration}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded-lg bg-neutral-200 h-12 w-12"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                          <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span>Your Wellness Journey</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {toolsUsage && toolsUsage.length > 0 ? (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{toolsUsage.length}</div>
                        <div className="text-sm text-neutral-600">Total Coping Sessions</div>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-neutral-50 rounded-lg">
                        <div className="text-2xl font-bold text-neutral-400">0</div>
                        <div className="text-sm text-neutral-500">No sessions yet</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  {copingTools.map((tool) => {
                    const usage = getUsageStats(tool.id);
                    const ToolIcon = tool.icon;
                    
                    return (
                      <Card key={tool.id} className={tool.borderColor}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-10 h-10 rounded-lg ${tool.bgColor} flex items-center justify-center`}>
                              <ToolIcon className={`h-5 w-5 ${tool.color}`} />
                            </div>
                            <div>
                              <h3 className="font-medium">{tool.name}</h3>
                              <p className="text-xs text-neutral-500">
                                {usage ? `${usage.totalSessions} sessions` : 'Not used yet'}
                              </p>
                            </div>
                          </div>

                          {usage && usage.totalSessions > 0 ? (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-neutral-500">Completion Rate</div>
                                <div className="font-semibold">{usage.completionRate.toFixed(0)}%</div>
                              </div>
                              <div>
                                <div className="text-neutral-500">Avg. Effectiveness</div>
                                <div className="font-semibold">
                                  {usage.avgEffectiveness > 0 ? `${usage.avgEffectiveness.toFixed(1)}/5` : 'Not rated'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <Button 
                                size="sm" 
                                onClick={() => setSelectedTool(tool.id)}
                                className={`${tool.color.replace('text-', 'bg-').replace('600', '500')} text-white`}
                              >
                                Try {tool.name}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-neutral-100 px-4 py-3 fixed bottom-0 left-0 right-0 z-30">
        <div className="grid grid-cols-5 gap-1">
          <Link href="/" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Activity className="h-5 w-5 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
          
          <Link href="/mood" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs">Mood</span>
          </Link>
          
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-blue-50 text-primary">
            <Wind className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Tools</span>
          </div>
          
          <Link href="/contacts" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Network</span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
