import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmergencyButton } from "@/components/ui/emergency-button";
import { MoodTracker } from "@/components/ui/mood-tracker";
import { EmergencyOverlay } from "@/components/ui/emergency-overlay";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "wouter";
import { 
  Settings, 
  Wind, 
  Leaf, 
  Waves, 
  Puzzle,
  Phone,
  MessageCircle,
  Video,
  Brain,
  Clock,
  MapPin,
  Users,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowRight,
  Shield,
  Heart,
  Zap,
  Calendar,
  BarChart3,
  Bell,
  Star,
  ChevronRight,
  Sparkles,
  Target,
  Award,
  Eye,
  Mic
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected, lastMessage } = useWebSocket();
  const [emergencyOverlayOpen, setEmergencyOverlayOpen] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState<number | null>(null);

  // Fetch user settings for emergency countdown
  const { data: userSettings } = useQuery({
    queryKey: ["/api/user-settings"],
  });

  // Fetch emergency contacts
  const { data: emergencyContacts } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });

  // Fetch recent mood entries
  const { data: recentMoods } = useQuery({
    queryKey: ["/api/mood-entries"],
  });

  // Fetch AI insights
  const { data: aiInsights } = useQuery({
    queryKey: ["/api/ai-insights"],
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'emergency_alert_sent':
        toast({
          title: "Emergency Alert Sent",
          description: `Notified ${lastMessage.contactsNotified} emergency contacts`,
          variant: "default",
        });
        break;
      
      case 'crisis_risk_detected':
        toast({
          title: "Support Available",
          description: lastMessage.message,
          variant: "default",
        });
        break;
      
      case 'immediate_support_needed':
        toast({
          title: "Immediate Support",
          description: lastMessage.message,
          variant: "destructive",
        });
        break;
    }
  }, [lastMessage, toast]);

  const handleEmergencyTriggered = (incidentId?: number) => {
    setCurrentIncidentId(incidentId || null);
    setEmergencyOverlayOpen(true);
  };

  const userName = user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || (user as any).email?.split('@')[0] || "Friend" : "Friend";
  const unreadInsights = Array.isArray(aiInsights) ? aiInsights.filter((insight: any) => !insight.isRead) : [];
  const latestMood = Array.isArray(recentMoods) && recentMoods.length > 0 ? recentMoods[0] : null;
  
  // Calculate wellness score based on recent activities
  const wellnessScore = latestMood ? Math.min(100, (latestMood as any).moodScore * 20 + 20) : 65;

  return (
    <div className="min-h-screen bg-background">
      {emergencyOverlayOpen && (
        <EmergencyOverlay
          isOpen={emergencyOverlayOpen}
          onClose={() => setEmergencyOverlayOpen(false)}
          incidentId={currentIncidentId}
        />
      )}
      
      {/* Enhanced Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/95">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground p-3 rounded-2xl shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                  Emergency Friend
                </h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-sm text-muted-foreground font-medium">
                    {isConnected ? 'Protected & Connected' : 'Reconnecting...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-foreground">
                      Welcome back, {userName}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Sparkles className="h-3 w-3" />
                      <span>You're doing great today</span>
                    </p>
                  </div>
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-md">
                    <AvatarImage src={(user as any).profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground font-bold text-lg">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10" asChild>
                    <Link href="/profile" data-testid="link-profile">
                      <Settings className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* Emergency Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
          <Card className="relative bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200/50 dark:border-red-800/50 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-500 text-white p-3 rounded-xl shadow-md">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">Emergency Support</h2>
                    <p className="text-red-700 dark:text-red-300">Instant help is just one tap away</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                  24/7 Available
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EmergencyButton
                  onEmergencyTriggered={handleEmergencyTriggered}
                />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Safety Network</h3>
                    <Button variant="outline" size="sm" asChild className="border-red-200 text-red-700 hover:bg-red-50">
                      <Link href="/contacts" data-testid="link-contacts">
                        <Plus className="h-4 w-4 mr-1" />
                        Manage
                      </Link>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(emergencyContacts) && emergencyContacts.length > 0 ? (
                      emergencyContacts.slice(0, 3).map((contact: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 bg-white/50 dark:bg-black/20 rounded-lg p-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-red-100 text-red-700">
                              {contact.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-red-900 dark:text-red-100 truncate">{contact.name}</p>
                            <p className="text-xs text-red-600 dark:text-red-400">{contact.relationship}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {contact.priority === 1 ? 'Primary' : 'Secondary'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 mx-auto mb-2 text-red-400" />
                        <p className="text-sm text-red-700 dark:text-red-300 mb-2">No emergency contacts yet</p>
                        <Button variant="outline" size="sm" asChild className="border-red-200 text-red-700">
                          <Link href="/contacts">Add Your First Contact</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Wellness Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Wellness Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 text-white p-2.5 rounded-xl">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-blue-900 dark:text-blue-100">Wellness Overview</CardTitle>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Your mental health journey</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30">
                  {wellnessScore}% Strong
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-700 dark:text-blue-300">Overall Wellness</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">{wellnessScore}%</span>
                </div>
                <Progress 
                  value={wellnessScore} 
                  className="h-3 bg-blue-100 dark:bg-blue-900/30"
                />
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {wellnessScore >= 80 ? "Excellent progress!" : 
                   wellnessScore >= 60 ? "Good momentum, keep it up!" : 
                   "Focus on self-care today"}
                </p>
              </div>

              {latestMood && (
                <div className="flex items-center space-x-4 bg-white/50 dark:bg-black/20 rounded-xl p-4">
                  <div className="text-3xl">
                    {(latestMood as any).mood === 'very-happy' ? '😊' :
                     (latestMood as any).mood === 'happy' ? '🙂' :
                     (latestMood as any).mood === 'neutral' ? '😐' :
                     (latestMood as any).mood === 'sad' ? '🙁' : '😢'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 capitalize">
                      Latest: {(latestMood as any).mood.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {new Date((latestMood as any).createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="border-blue-200">
                    <Link href="/mood">Track Mood</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg text-purple-900 dark:text-purple-100">AI Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {unreadInsights.length > 0 ? (
                <>
                  <Badge className="w-full justify-center bg-purple-100 text-purple-800 dark:bg-purple-900/30">
                    {unreadInsights.length} New Insight{unreadInsights.length > 1 ? 's' : ''}
                  </Badge>
                  <div className="space-y-3">
                    {unreadInsights.slice(0, 2).map((insight: any, index: number) => (
                      <div key={index} className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-sm">
                        <p className="text-purple-900 dark:text-purple-100 leading-relaxed">
                          {insight.insight}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.isActionable ? 'Actionable' : 'Insight'}
                          </Badge>
                          <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                            <Star className="h-3 w-3 mr-1" />
                            {Math.round(parseFloat(insight.confidence) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-400" />
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">No new insights</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Track your mood to get AI insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Emergency AI Monitoring */}
        <section>
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-500 text-white p-2.5 rounded-xl">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100">AI Emergency Friend</CardTitle>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">Real-time monitoring and threat detection</p>
                  </div>
                </div>
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30">
                  Beta
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-3">
                  Your AI companion that listens during emergencies, transcribes what's happening, 
                  analyzes danger levels, and automatically contacts help with critical information.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                    <Mic className="h-4 w-4 mx-auto mb-1 text-indigo-600" />
                    <div className="text-xs font-medium">Real-time Audio</div>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                    <Brain className="h-4 w-4 mx-auto mb-1 text-indigo-600" />
                    <div className="text-xs font-medium">AI Analysis</div>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                    <Zap className="h-4 w-4 mx-auto mb-1 text-indigo-600" />
                    <div className="text-xs font-medium">Auto Alerts</div>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                    <MapPin className="h-4 w-4 mx-auto mb-1 text-indigo-600" />
                    <div className="text-xs font-medium">Location Sharing</div>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/tools" data-testid="link-emergency-monitoring">
                  <Shield className="h-4 w-4 mr-2" />
                  Access Emergency Monitoring
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Quick Relief Tools */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Quick Relief Tools</h2>
              <p className="text-muted-foreground">AI-enhanced immediate support when you need it most</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/tools" data-testid="link-tools">
                View All Tools
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/tools">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-500 text-white p-3 rounded-2xl w-fit mx-auto mb-3">
                    <Wind className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Breathing</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">4-7-8 Technique</p>
                  <Badge variant="secondary" className="mt-2 text-xs bg-blue-100 text-blue-800">
                    3 min
                  </Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/tools">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-500 text-white p-3 rounded-2xl w-fit mx-auto mb-3">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Grounding</h3>
                  <p className="text-xs text-green-700 dark:text-green-300">5-4-3-2-1 Method</p>
                  <Badge variant="secondary" className="mt-2 text-xs bg-green-100 text-green-800">
                    5 min
                  </Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/tools">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-500 text-white p-3 rounded-2xl w-fit mx-auto mb-3">
                    <Waves className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Meditation</h3>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Guided Session</p>
                  <Badge variant="secondary" className="mt-2 text-xs bg-purple-100 text-purple-800">
                    10 min
                  </Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/tools">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-500 text-white p-3 rounded-2xl w-fit mx-auto mb-3">
                    <Puzzle className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Distraction</h3>
                  <p className="text-xs text-orange-700 dark:text-orange-300">Games & Activities</p>
                  <Badge variant="secondary" className="mt-2 text-xs bg-orange-100 text-orange-800">
                    Varied
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Mood Tracking */}
        <section>
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500 text-white p-2.5 rounded-xl">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-amber-900 dark:text-amber-100">How are you feeling today?</CardTitle>
                    <p className="text-sm text-amber-700 dark:text-amber-300">Track your emotions to understand patterns</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="border-amber-200">
                  <Link href="/mood">View History</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <MoodTracker />
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}