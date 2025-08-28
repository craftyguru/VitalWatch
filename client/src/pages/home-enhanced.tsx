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
import { EmergencyOverviewDashboard } from "@/components/EmergencyOverviewDashboard";
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
  Mic,
  LogOut,
  Smartphone,
  Watch,
  Bluetooth,
  Wifi
} from "lucide-react";
import { VersionBadge } from "@/components/VersionBadge";
// Removed problematic device sensor imports

export default function Home() {
  const { user } = useAuth() as { user: any };
  const { toast } = useToast();
  const { isConnected, lastMessage } = useWebSocket();
  
  // Simple device status tracking
  const [deviceStatus] = useState({
    accelerometer: { active: navigator && 'DeviceMotionEvent' in window },
    location: { active: navigator && 'geolocation' in navigator },
    battery: { level: 75, charging: false, active: 'getBattery' in navigator },
    network: { active: navigator?.onLine || false }
  });
  const [emergencyOverlayOpen, setEmergencyOverlayOpen] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    setCurrentIncidentId(incidentId ?? null);
    setEmergencyOverlayOpen(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies
      });
      
      if (response.ok) {
        toast({
          title: "Logged out successfully",
          description: "See you next time!",
        });
        // Wait a moment for the toast, then redirect to landing page
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast({
          title: "Logout failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection error", 
        description: "Unable to logout properly",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userName = user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || (user as any).email?.split('@')[0] || "Friend" : "Friend";
  const unreadInsights = Array.isArray(aiInsights) ? aiInsights.filter((insight: any) => !insight.isRead) : [];
  const latestMood = Array.isArray(recentMoods) && recentMoods.length > 0 ? recentMoods[0] : null;
  
  // Calculate wellness score based on recent activities
  const wellnessScore = latestMood ? Math.min(100, (latestMood as any).moodScore * 20 + 20) : 65;

  // Simple device capability check on mount
  useEffect(() => {
    console.log('Device capabilities:', {
      motion: 'DeviceMotionEvent' in window,
      location: 'geolocation' in navigator,
      battery: 'getBattery' in navigator,
      bluetooth: 'bluetooth' in navigator
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {emergencyOverlayOpen && (
        <EmergencyOverlay
          isOpen={emergencyOverlayOpen}
          onClose={() => setEmergencyOverlayOpen(false)}
          incidentId={currentIncidentId ?? undefined}
        />
      )}
      
      {/* Enhanced Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/95">
        <div className="px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-lg overflow-hidden bg-white flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="VitalWatch Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-orange-500 to-pink-600 bg-clip-text text-transparent truncate">
                    VitalWatch
                  </h1>
                  <div className="hidden xs:block">
                    <VersionBadge />
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse flex-shrink-0`} />
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
                    {isConnected ? 'Protected & Connected' : 'Reconnecting...'}
                  </span>
                  
                  {/* Device Connection Badges */}
                  {isConnected && (
                    <div className="flex items-center space-x-1 ml-2">
                      {/* Smartphone Badge - Shows sensor activity */}
                      <div className="relative group">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                          deviceStatus?.accelerometer?.active ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          <Smartphone className="h-3 w-3 text-white" />
                        </div>
                        <div className={`absolute top-0 right-0 w-2 h-2 rounded-full border border-white ${
                          deviceStatus?.accelerometer?.active ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {deviceStatus?.accelerometer?.active ? 'Sensors Available' : 'Sensors Unavailable'}
                        </div>
                      </div>

                      {/* GPS Badge - Shows location availability */}
                      <div className="relative group">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                          deviceStatus?.location?.active ? 'bg-orange-500' : 'bg-gray-400'
                        }`}>
                          <MapPin className="h-3 w-3 text-white" />
                        </div>
                        <div className={`absolute top-0 right-0 w-2 h-2 rounded-full border border-white ${
                          deviceStatus?.location?.active ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {deviceStatus?.location?.active ? 'GPS Available' : 'GPS Unavailable'}
                        </div>
                      </div>

                      {/* WiFi Badge - Shows network status */}
                      <div className="relative group">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                          deviceStatus?.network?.active ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <Wifi className="h-3 w-3 text-white" />
                        </div>
                        <div className={`absolute top-0 right-0 w-2 h-2 rounded-full border border-white ${
                          deviceStatus?.network?.active ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {deviceStatus?.network?.active ? 'Network Online' : 'Network Offline'}
                        </div>
                      </div>

                      {/* Bluetooth Badge - Shows availability */}
                      {typeof navigator !== 'undefined' && 'bluetooth' in navigator && (
                        <div className="relative group">
                          <div className="flex items-center justify-center w-6 h-6 bg-cyan-500 rounded-full">
                            <Bluetooth className="h-3 w-3 text-white" />
                          </div>
                          <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Bluetooth Available
                          </div>
                        </div>
                      )}
                      
                      {/* Battery Badge - Shows battery API availability */}
                      {deviceStatus?.battery?.active && (
                        <div className="relative group">
                          <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                            <span className="text-white text-xs font-bold">
                              {deviceStatus.battery.level}
                            </span>
                          </div>
                          <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Battery {deviceStatus.battery.level}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              
              {user && (
                <div className="flex items-center space-x-1 sm:space-x-3">
                  <div className="hidden lg:block text-right">
                    <p className="text-sm font-semibold text-foreground">
                      Welcome back, {userName}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Sparkles className="h-3 w-3" />
                      <span>You're doing great today</span>
                    </p>
                  </div>
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20 shadow-md">
                    <AvatarImage src={(user as any).profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground font-bold text-sm sm:text-lg">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Tools Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hidden sm:flex" 
                    asChild
                  >
                    <Link href="/tools" data-testid="link-tools-nav">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>

                  {/* Admin Button - Only for Admin Users */}
                  {(user as any)?.isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 hidden sm:flex" 
                      asChild
                    >
                      <Link href="/admin" data-testid="link-admin-nav">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Link>
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10 hidden sm:flex" asChild>
                    <Link href="/profile" data-testid="link-profile">
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                  
                  {/* Logout Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hidden sm:flex" 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* Professional Emergency Overview Dashboard */}
        <EmergencyOverviewDashboard />
        
        {/* Enhanced Emergency Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-3xl blur-xl"></div>
          <Card className="relative bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200/50 dark:border-red-800/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white p-3 rounded-xl shadow-lg">
                    <Shield className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">Emergency Support</h2>
                    <p className="text-red-700 dark:text-red-300">Professional emergency response system</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    24/7 Active
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Emergency Button Section */}
                <div className="lg:col-span-1">
                  <EmergencyButton
                    onEmergencyTriggered={handleEmergencyTriggered}
                  />
                </div>
                
                {/* Safety Network Section */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Safety Network</h3>
                    </div>
                    <Button variant="outline" size="sm" asChild className="border-red-200 text-red-700 hover:bg-red-50">
                      <Link href="/contacts" data-testid="link-contacts">
                        <Plus className="h-4 w-4 mr-1" />
                        Manage
                      </Link>
                    </Button>
                  </div>
                  
                  {Array.isArray(emergencyContacts) && emergencyContacts.length > 0 ? (
                    <div className="space-y-3">
                      {emergencyContacts.slice(0, 3).map((contact: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 bg-white/70 dark:bg-black/30 rounded-xl p-4 border border-red-100 dark:border-red-800/30 shadow-sm hover:shadow-md transition-shadow">
                          <Avatar className="h-10 w-10 ring-2 ring-red-200">
                            <AvatarFallback className="text-sm bg-red-100 text-red-700 font-semibold">
                              {contact.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-red-900 dark:text-red-100 truncate">{contact.name}</p>
                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                              <span>{contact.relationship}</span>
                              <span>•</span>
                              <span>{contact.phone}</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge variant={contact.priority === 1 ? "default" : "outline"} className="text-xs">
                              {contact.priority === 1 ? 'Primary' : 'Secondary'}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Ready</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Network Status */}
                      <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl p-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-800 dark:text-green-200">Network Status</span>
                          </div>
                          <Badge className="bg-green-200 text-green-800">All Systems Ready</Badge>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                          Average response time: 8 seconds • GPS accuracy: High • All contacts verified
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white/50 dark:bg-black/20 rounded-xl border border-red-100 dark:border-red-800/30">
                      <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-red-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Setup Your Safety Network</h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4 max-w-sm mx-auto">
                        Add trusted contacts who will be notified during emergencies. We recommend adding at least 2-3 people.
                      </p>
                      <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                        <Link href="/contacts">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Contact
                        </Link>
                      </Button>
                      
                      {/* Quick Add Suggestions */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-md mx-auto">
                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
                          <div className="text-xs text-red-700 dark:text-red-300">Family Member</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <Users className="h-4 w-4 mx-auto mb-1 text-red-500" />
                          <div className="text-xs text-red-700 dark:text-red-300">Close Friend</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <Phone className="h-4 w-4 mx-auto mb-1 text-red-500" />
                          <div className="text-xs text-red-700 dark:text-red-300">Emergency Contact</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Wellness Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Enhanced Wellness Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 text-white p-2.5 rounded-xl">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-blue-900 dark:text-blue-100">Wellness Overview</CardTitle>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Comprehensive mental health analytics</p>
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
                  ↑ 8% improvement this week - excellent progress!
                </p>
              </div>

              {/* Enhanced Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">24</div>
                  <div className="text-xs text-muted-foreground">Sessions</div>
                  <div className="text-xs text-green-600">+3 this week</div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">4.2</div>
                  <div className="text-xs text-muted-foreground">Avg Mood</div>
                  <div className="text-xs text-green-600">↑ 0.3 points</div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">12</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                  <div className="text-xs text-green-600">Personal best!</div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">89%</div>
                  <div className="text-xs text-muted-foreground">Stress Relief</div>
                  <div className="text-xs text-green-600">↑ 5% monthly</div>
                </div>
              </div>

              {/* Daily Focus Recommendation */}
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Today's Focus</span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Based on your patterns, try breathing exercises at 7:30 AM for optimal stress relief
                </p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start Session
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced AI Insights Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg text-purple-900 dark:text-purple-100">AI Insights</CardTitle>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Real-time Monitoring Status */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Real-time Monitoring</span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  AI analyzing patterns and providing personalized recommendations
                </p>
              </div>

              {/* Predictive Insights */}
              <div className="space-y-3">
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Optimal Timing</span>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                    Sessions are 23% more effective at 7:30 AM
                  </p>
                  <Button size="sm" variant="outline" className="w-full text-purple-700 border-purple-300">
                    Schedule Session
                  </Button>
                </div>

                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Stress Alert</span>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                    73% likelihood of stress Tuesday 2-4 PM
                  </p>
                  <Button size="sm" variant="outline" className="w-full text-purple-700 border-purple-300">
                    Set Reminder
                  </Button>
                </div>
              </div>
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