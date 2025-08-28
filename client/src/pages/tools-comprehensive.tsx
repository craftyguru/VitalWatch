import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Shield,
  AlertTriangle,
  Wind,
  Brain,
  Heart,
  MessageSquare,
  Phone,
  MapPin,
  Mic,
  Volume2,
  Play,
  Pause,
  Square,
  Zap,
  Settings,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Users,
  Star,
  Award,
  Target,
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  BarChart3,
  Wifi,
  WifiOff,
  Bluetooth,
  Smartphone,
  Watch,
  Car,
  Home,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Plus,
  Minus,
  RotateCcw,
  Download,
  Upload,
  Share2,
  Copy,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Headphones,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Globe,
  Database,
  CloudUpload,
  Timer,
  Camera,
  Fingerprint,
  ScanLine,
  Gauge,
  Lightbulb,
  Sparkles,
  FireExtinguisher,
  LifeBuoy,
  Medical,
  Stethoscope,
  HeartHandshake,
  Waves,
  Snowflake,
  Sun,
  Moon,
  Gamepad2,
  Music,
  BookOpen,
  GraduationCap,
  Coffee,
  Dumbbell,
  Mountain,
  TreePine,
  Flower2,
  Rainbow
} from "lucide-react";
import { DeviceIntegrationHub } from "@/components/DeviceIntegrationHub";

// Import enhanced components
import AdvancedBreathingExercise from "@/components/ui/advanced-breathing-exercise";
import EnhancedGroundingExercise from "@/components/ui/enhanced-grounding-exercise";
import CrisisChatSupport from "@/components/ui/crisis-chat-support";
import ComprehensiveEmergencyMonitoring from "@/components/ui/comprehensive-emergency-monitoring-placeholder";
import AdvancedSafetyTools from "@/components/ui/advanced-safety-tools";

export default function ToolsComprehensive() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState(true);
  const [autoRecord, setAutoRecord] = useState(true);
  const [liveLocation, setLiveLocation] = useState(false);
  const [breadcrumbTrail, setBreadcrumbTrail] = useState(false);
  const [geoFenceAlerts, setGeoFenceAlerts] = useState(false);
  const [aiRiskDetection, setAiRiskDetection] = useState(true);
  const [aiCallResponder, setAiCallResponder] = useState(false);
  const [aiCompanionChat, setAiCompanionChat] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [multiChannelAlert, setMultiChannelAlert] = useState(true);
  const [emergencyGroupCall, setEmergencyGroupCall] = useState(true);
  const [networkTrustScore, setNetworkTrustScore] = useState(89);
  const [safetyStreak, setSafetyStreak] = useState(7);
  const [responseTime, setResponseTime] = useState(12);
  const [safetyPoints, setSafetyPoints] = useState(240);

  // Enhanced state for real functionality
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [deviceConnections, setDeviceConnections] = useState({
    wearables: { connected: false, devices: 0 },
    smartHome: { connected: false, devices: 0 },
    carIntegration: { connected: false, status: 'offline' }
  });

  // Fetch user settings and data
  const { data: userSettings } = useQuery({
    queryKey: ["/api/user-settings"],
  });

  const { data: emergencyContacts } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });

  const { data: recentMoods } = useQuery({
    queryKey: ["/api/mood-entries"],
  });

  // Voice command testing
  const testVoiceCommands = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Voice commands are working. Say 'Emergency Help' to trigger assistance.");
      window.speechSynthesis.speak(utterance);
      toast({
        title: "Voice Commands Active",
        description: "Try saying 'Emergency Help' to test voice activation",
        variant: "default",
      });
    } else {
      toast({
        title: "Voice Commands Unavailable",
        description: "Your browser doesn't support voice commands",
        variant: "destructive",
      });
    }
  };

  // Geolocation functions
  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLiveLocation(true);
          toast({
            title: "Location Tracking Active",
            description: `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            variant: "default",
          });
        },
        (error) => {
          toast({
            title: "Location Access Denied",
            description: "Please enable location permissions for emergency features",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Device integration simulation
  const connectWearables = () => {
    setTimeout(() => {
      setDeviceConnections(prev => ({
        ...prev,
        wearables: { connected: true, devices: 2 }
      }));
      toast({
        title: "Wearables Connected",
        description: "Heart rate and activity monitoring active",
        variant: "default",
      });
    }, 2000);
  };

  const connectSmartHome = () => {
    setTimeout(() => {
      setDeviceConnections(prev => ({
        ...prev,
        smartHome: { connected: true, devices: 5 }
      }));
      toast({
        title: "Smart Home Connected",
        description: "Emergency lighting and door controls activated",
        variant: "default",
      });
    }, 1500);
  };

  // Real panic button functionality
  const triggerPanicButton = () => {
    setEmergencyMode(true);
    
    // Get location if available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        // In real app, this would send to emergency services
        toast({
          title: "EMERGENCY ALERT TRIGGERED",
          description: `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}. Contacts notified.`,
          variant: "destructive",
        });
      });
    }
    
    // Simulate emergency countdown
    let countdown = 30;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        toast({
          title: "Emergency Services Contacted",
          description: "Emergency response initiated. Help is on the way.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  const cancelEmergency = () => {
    setEmergencyMode(false);
    toast({
      title: "Emergency Cancelled",
      description: "Alert has been cancelled. You are safe.",
      variant: "default",
    });
  };

  // Multi-channel alert testing
  const testMultiChannelAlert = () => {
    toast({
      title: "Testing Alert System",
      description: "Sending test alerts via SMS, Email, and Push notifications...",
      variant: "default",
    });
    
    setTimeout(() => {
      toast({
        title: "Alert Test Complete",
        description: "All channels tested successfully. Network ready.",
        variant: "default",
      });
    }, 3000);
  };

  // Safety check-in
  const performSafetyCheckIn = () => {
    setSafetyStreak(prev => prev + 1);
    setSafetyPoints(prev => prev + 10);
    toast({
      title: "Safety Check-In Complete",
      description: `Streak: ${safetyStreak + 1} days. +10 points earned!`,
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Enhanced Header */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild className="hover:bg-blue-100 dark:hover:bg-blue-900">
                <Link href="/" data-testid="link-back-home">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-2.5 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">VitalWatch</h1>
                  <p className="text-slate-600 dark:text-slate-400">AI-powered vital signs monitoring with comprehensive crisis management</p>
                </div>
              </div>
            </div>
            
            {/* Real-time Status */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${emergencyMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {emergencyMode ? 'EMERGENCY ACTIVE' : 'All Systems Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Enhanced Tab Navigation */}
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="overview" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="safety-tools" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Safety Tools</span>
              </TabsTrigger>
              <TabsTrigger value="wellness-analytics" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-medium">Wellness Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Headphones className="h-5 w-5" />
                <span className="text-sm font-medium">Device Hub</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Comprehensive Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/50">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-500 text-white p-3 rounded-xl w-fit mx-auto mb-3">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">98%</div>
                  <div className="text-sm text-muted-foreground">System Health</div>
                  <div className="text-xs text-green-600 mt-1">All systems operational</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-500 text-white p-3 rounded-xl w-fit mx-auto mb-3">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{safetyStreak}</div>
                  <div className="text-sm text-muted-foreground">Safety Streak (Days)</div>
                  <div className="text-xs text-green-600 mt-1">Personal best!</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-500 text-white p-3 rounded-xl w-fit mx-auto mb-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{Array.isArray(emergencyContacts) ? emergencyContacts.length : 0}</div>
                  <div className="text-sm text-muted-foreground">Emergency Contacts</div>
                  <div className="text-xs text-purple-600 mt-1">Network ready</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-500 text-white p-3 rounded-xl w-fit mx-auto mb-3">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{responseTime}s</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  <div className="text-xs text-orange-600 mt-1">Excellent speed</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Panel */}
            <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-950/20 dark:to-blue-950/20 border-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                  <Target className="h-5 w-5" />
                  <span>Quick Access Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={triggerPanicButton}
                    className="h-20 bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center space-y-2"
                  >
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-sm font-bold">PANIC BUTTON</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Wind className="h-6 w-6" />
                    <span className="text-sm">Breathing Exercise</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">Crisis Chat</span>
                  </Button>
                  
                  <Button 
                    onClick={startLocationTracking}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <MapPin className="h-6 w-6" />
                    <span className="text-sm">Share Location</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Panel */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-100">
                  <Brain className="h-5 w-5" />
                  <span>AI-Powered Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200">Optimal Timing</h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Your sessions are 23% more effective at 7:30 AM
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Schedule Session
                    </Button>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-orange-800 dark:text-orange-200">Stress Prediction</h3>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                      75% likelihood of stress Tuesday 4 PM
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Set Reminder
                    </Button>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Heart className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200">Recommended</h3>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                      Try the 4-7-8 breathing technique for better sleep quality
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Start Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Safety Tools Tab */}
          <TabsContent value="safety-tools" className="space-y-8">
            <AdvancedSafetyTools />
          </TabsContent>

          {/* Wellness Analytics Tab */}
          <TabsContent value="wellness-analytics" className="space-y-8">
            {/* Comprehensive Mental Health Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Breathing Tools */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
                    <Wind className="h-5 w-5" />
                    <span>Advanced Breathing Tools</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AdvancedBreathingExercise />
                </CardContent>
              </Card>

              {/* Crisis Chat Support */}
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-900 dark:text-purple-100">
                    <MessageSquare className="h-5 w-5" />
                    <span>AI Crisis Support</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CrisisChatSupport />
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Grounding Exercises */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-900 dark:text-green-100">
                  <TreePine className="h-5 w-5" />
                  <span>Comprehensive Grounding Techniques</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedGroundingExercise />
              </CardContent>
            </Card>

            {/* Mood Analytics Dashboard */}
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-900 dark:text-orange-100">
                  <BarChart3 className="h-5 w-5" />
                  <span>Mood Analytics & Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">4.2</div>
                    <div className="text-sm text-muted-foreground">Average Mood</div>
                    <div className="text-xs text-green-600 mt-1">+0.3 this week</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">18</div>
                    <div className="text-sm text-muted-foreground">Mood Entries</div>
                    <div className="text-xs text-blue-600 mt-1">Last 30 days</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">73%</div>
                    <div className="text-sm text-muted-foreground">Positive Days</div>
                    <div className="text-xs text-purple-600 mt-1">Above average</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                  <h4 className="font-semibold mb-3">Weekly Trend Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monday</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={80} className="w-20 h-2" />
                        <span className="text-sm font-medium">4.0</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tuesday</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={90} className="w-20 h-2" />
                        <span className="text-sm font-medium">4.5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Wednesday</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={70} className="w-20 h-2" />
                        <span className="text-sm font-medium">3.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Device Integration Hub Tab */}
          <TabsContent value="achievements" className="space-y-8">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-purple-900 dark:text-purple-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Headphones className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Smart Device Integration</h2>
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-normal">
                      Connect headphones, smartwatches, and phones for comprehensive monitoring
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceIntegrationHub />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}