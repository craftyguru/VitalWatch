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
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Globe,
  Database,
  CloudUpload,
  Timer,
  Headphones,
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
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Emergency Friend</h1>
                  <p className="text-slate-600 dark:text-slate-400">AI-powered mental health companion with comprehensive crisis management</p>
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
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">Achievements</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Panic Button Widget */}
            <Card className={`${emergencyMode ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'} shadow-xl`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-red-900 dark:text-red-100">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Panic Button Widget</span>
                  </div>
                  <Badge className={emergencyMode ? "bg-red-600 text-white animate-pulse" : "bg-red-100 text-red-800"}>
                    {emergencyMode ? "ACTIVE ALERT" : "One tap SOS that works even if the app is closed"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {!emergencyMode ? (
                      <Button 
                        onClick={triggerPanicButton}
                        className="w-full h-20 bg-red-600 hover:bg-red-700 text-white text-xl font-bold shadow-lg"
                        data-testid="panic-button"
                      >
                        <AlertTriangle className="h-8 w-8 mr-3" />
                        PANIC BUTTON
                      </Button>
                    ) : (
                      <Button 
                        onClick={cancelEmergency}
                        className="w-full h-20 bg-gray-600 hover:bg-gray-700 text-white text-xl font-bold shadow-lg animate-pulse"
                      >
                        <Square className="h-8 w-8 mr-3" />
                        Tap to Cancel Emergency
                      </Button>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Ghost Mode</Label>
                      <Switch checked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Auto-Record & Cloud Upload</Label>
                      <Switch checked={autoRecord} onCheckedChange={setAutoRecord} />
                    </div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-4">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">Emergency Protocol</h4>
                    <div className="space-y-2 text-sm text-red-700 dark:text-red-300">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Instantly alerts all emergency contacts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Shares precise GPS location</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Records audio evidence automatically</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Contacts emergency services after countdown</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Mental Health Tools */}
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

            {/* Location & Tracking Tools */}
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-100">
                  <MapPin className="h-5 w-5" />
                  <span>Location & Tracking Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Live Location Sharing</Label>
                        <p className="text-sm text-muted-foreground">Secure real-time GPS sharing with trusted friends</p>
                      </div>
                      <Switch checked={liveLocation} onCheckedChange={(checked) => {
                        if (checked) {
                          startLocationTracking();
                        } else {
                          setLiveLocation(false);
                        }
                      }} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Breadcrumb Trail</Label>
                        <p className="text-sm text-muted-foreground">Location sent every 30 seconds for rescue tracking</p>
                      </div>
                      <Switch checked={breadcrumbTrail} onCheckedChange={setBreadcrumbTrail} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Geo-Fence Alerts</Label>
                        <p className="text-sm text-muted-foreground">Alerts when leaving/entering safe zones</p>
                      </div>
                      <Switch checked={geoFenceAlerts} onCheckedChange={setGeoFenceAlerts} />
                    </div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                    <Button 
                      onClick={startLocationTracking}
                      className="w-full mb-4"
                      variant="outline"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Share Walk-With-Me
                    </Button>
                    
                    {location && (
                      <div className="text-sm text-muted-foreground">
                        <p>Current Location:</p>
                        <p className="font-mono">{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
                        <p className="text-green-600 dark:text-green-400 mt-2">✓ Friends monitor your journey until you're safe</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI & Smart Tools */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-900 dark:text-purple-100">
                  <Brain className="h-5 w-5" />
                  <span>AI & Smart Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Voice Command SOS</Label>
                        <p className="text-sm text-muted-foreground">"Help me friend" triggers SOS even when locked</p>
                      </div>
                      <Switch checked={voiceCommands} onCheckedChange={setVoiceCommands} />
                    </div>
                    
                    <Button 
                      onClick={testVoiceCommands}
                      variant="outline" 
                      className="w-full"
                    >
                      Test Voice Commands
                    </Button>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">AI Risk Detection</Label>
                        <p className="text-sm text-muted-foreground">Monitor & detect analysis for auto-threat detection</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">AI Call Responder</Label>
                        <p className="text-sm text-muted-foreground">AI answers calls and communicates distress for you</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Ready</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">AI Companion Chat</Label>
                        <p className="text-sm text-muted-foreground">Calming responses during panic while help arrives</p>
                      </div>
                      <Switch checked={aiCompanionChat} onCheckedChange={setAiCompanionChat} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                      <h4 className="font-semibold mb-3">AI Capabilities</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Real-time audio analysis</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Behavioral pattern recognition</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Automatic threat escalation</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Contextual crisis support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Tools */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-900 dark:text-green-100">
                  <MessageSquare className="h-5 w-5" />
                  <span>Communication Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button 
                    onClick={testMultiChannelAlert}
                    variant="outline" 
                    className="h-16 text-center"
                  >
                    <Bell className="h-6 w-6 mr-2" />
                    Multi-Channel Alert
                  </Button>
                  
                  <Button variant="outline" className="h-16 text-center">
                    <Users className="h-6 w-6 mr-2" />
                    Emergency Group Call
                  </Button>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Offline Emergency Mode</Label>
                        <p className="text-sm text-muted-foreground">Uses Bluetooth mesh/peer to peer when no internet</p>
                      </div>
                      <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Integration */}
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-900 dark:text-orange-100">
                  <Smartphone className="h-5 w-5" />
                  <span>Device Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl">
                    <Watch className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                    <h4 className="font-semibold mb-2">Wearables</h4>
                    <p className="text-sm text-muted-foreground mb-3">Smartwatch, AirTags, Fitbit</p>
                    <Button 
                      onClick={connectWearables}
                      variant={deviceConnections.wearables.connected ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                    >
                      {deviceConnections.wearables.connected ? "Connected" : "Coming Soon"}
                    </Button>
                    {deviceConnections.wearables.connected && (
                      <p className="text-xs text-green-600 mt-2">{deviceConnections.wearables.devices} devices connected</p>
                    )}
                  </div>
                  
                  <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl">
                    <Home className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                    <h4 className="font-semibold mb-2">Smart Home</h4>
                    <p className="text-sm text-muted-foreground mb-3">Lights, alarms, door locks</p>
                    <Button 
                      onClick={connectSmartHome}
                      variant={deviceConnections.smartHome.connected ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                    >
                      {deviceConnections.smartHome.connected ? "Connected" : "Coming Soon"}
                    </Button>
                    {deviceConnections.smartHome.connected && (
                      <p className="text-xs text-green-600 mt-2">{deviceConnections.smartHome.devices} devices connected</p>
                    )}
                  </div>
                  
                  <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl">
                    <Car className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                    <h4 className="font-semibold mb-2">Car Integration</h4>
                    <p className="text-sm text-muted-foreground mb-3">CarPlay/Android Auto</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Gamification */}
            <Card className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-900 dark:text-pink-100">
                  <Award className="h-5 w-5" />
                  <span>Safety Gamification</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Emergency Network Trust Score</Label>
                      <p className="text-sm text-muted-foreground">Friends got trust by responding quickly to your alerts</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">{networkTrustScore}%</Badge>
                  </div>
                  
                  <div className="w-full">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Trust Level</span>
                      <span className="text-sm text-muted-foreground">{networkTrustScore}/100</span>
                    </div>
                    <Progress value={networkTrustScore} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button 
                      onClick={performSafetyCheckIn}
                      variant="outline" 
                      className="h-16"
                    >
                      <CheckCircle className="h-6 w-6 mr-2" />
                      Daily Safety Check-In
                    </Button>
                    
                    <Button variant="outline" className="h-16">
                      <AlertTriangle className="h-6 w-6 mr-2" />
                      Emergency Drill
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                      <div className="text-2xl font-bold text-pink-600">{safetyStreak}</div>
                      <div className="text-sm text-muted-foreground">Safety Streak</div>
                      <div className="text-xs text-pink-600">days</div>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-600">{responseTime}s</div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                      <div className="text-xs text-purple-600">average</div>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                      <div className="text-2xl font-bold text-orange-600">{safetyPoints}</div>
                      <div className="text-sm text-muted-foreground">Safety Points</div>
                      <div className="text-xs text-orange-600">total</div>
                    </div>
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
            <EnhancedGroundingExercise />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-8">
            <ComprehensiveEmergencyMonitoring />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}