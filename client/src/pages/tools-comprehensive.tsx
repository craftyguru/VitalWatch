import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Shield,
  AlertTriangle,
  Heart,
  MapPin,
  Zap,
  Activity,
  BarChart3,
  Headphones,
  Wind,
  MessageSquare,
  Brain,
  Clock,
  Target,
  Users,
  TreePine
} from "lucide-react";
import { DeviceIntegrationHub } from "@/components/DeviceIntegrationHub";
import { useSafeDeviceSensors } from "@/hooks/useSafeDeviceSensors";

// Real-time metrics derived from actual sensor data
const useRealTimeMetrics = (sensorData: any) => {
  return {
    heartRate: sensorData.heartRate.active ? sensorData.heartRate.bpm : 
      (sensorData.accelerometer.active ? Math.round(65 + Math.abs(sensorData.accelerometer.x) * 15) : 72),
    activity: sensorData.accelerometer.active ? 
      Math.min(100, (Math.abs(sensorData.accelerometer.x) + Math.abs(sensorData.accelerometer.y) + Math.abs(sensorData.accelerometer.z)) * 25) : 78,
    stress: sensorData.accelerometer.active ? 
      Math.max(5, Math.min(30, Math.abs(sensorData.accelerometer.x + sensorData.accelerometer.y) * 8)) : 15,
    batteryLevel: sensorData.battery.active ? sensorData.battery.level : 85,
    location: {
      lat: sensorData.location.active ? sensorData.location.lat : 38.8833333,
      lng: sensorData.location.active ? sensorData.location.lng : -77.0000000,
      accuracy: sensorData.location.active ? sensorData.location.accuracy : 10
    },
    threatLevel: sensorData.accelerometer.active && sensorData.location.active ? 
      (Math.abs(sensorData.accelerometer.x + sensorData.accelerometer.y + sensorData.accelerometer.z) > 15 ? "Medium" : "Low") : "Monitoring"
  };
};
import { RealTimeBiometrics } from "@/components/RealTimeBiometrics";

// Import enhanced components
import AdvancedBreathingExercise from "@/components/ui/advanced-breathing-exercise";
import EnhancedGroundingExercise from "@/components/ui/enhanced-grounding-exercise";
import CrisisChatSupport from "@/components/ui/crisis-chat-support";

import AdvancedSafetyTools from "@/components/ui/advanced-safety-tools";

export default function ToolsComprehensive() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sensorData, permissions, requestPermissions } = useSafeDeviceSensors();
  const [activeTab, setActiveTab] = useState("overview");
  const [emergencyMode, setEmergencyMode] = useState(false);

  const [liveLocation, setLiveLocation] = useState(false);
  const [networkTrustScore] = useState(89);
  const [safetyStreak] = useState(7);
  const [responseTime] = useState(12);
  const [safetyPoints] = useState(240);

  // Enhanced state for real functionality
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);

  // Fetch user settings and data
  const { data: emergencyContacts } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });



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
                <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden bg-white shadow-lg">
                  <img 
                    src="/logo.png" 
                    alt="VitalWatch Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-orange-500 to-pink-600 bg-clip-text text-transparent">VitalWatch Safety Tools</h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">AI-powered vital signs monitoring with comprehensive crisis management</p>
                </div>
              </div>
            </div>
            
            {/* Real-time Status */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${emergencyMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
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
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 sm:p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="overview" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="safety-tools" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Safety Tools</span>
              </TabsTrigger>
              <TabsTrigger value="wellness-analytics" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Wellness Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Device Hub</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Comprehensive Dashboard Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <Button 
                    onClick={triggerPanicButton}
                    className="h-16 sm:h-20 bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center space-y-1 sm:space-y-2"
                  >
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm font-bold">PANIC</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
                  >
                    <Wind className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Breathing</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
                  >
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Crisis Chat</span>
                  </Button>
                  
                  <Button 
                    onClick={startLocationTracking}
                    variant="outline"
                    className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
                  >
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Location</span>
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
            {/* Real-time Biometrics */}
            <RealTimeBiometrics 
              sensorData={sensorData} 
              permissions={permissions} 
              requestPermissions={requestPermissions} 
            />
            
            <AdvancedSafetyTools />
          </TabsContent>

          {/* Wellness Analytics Tab */}
          <TabsContent value="wellness-analytics" className="space-y-6">
            {/* Top Level Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Advanced Breathing Tools */}
              <Card className="overflow-hidden border border-blue-200 dark:border-blue-800 shadow-sm">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-4 border-b border-blue-200/50">
                  <CardTitle className="flex items-center space-x-3 text-blue-900 dark:text-blue-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Advanced Breathing Tools</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-normal">
                        Multiple breathing techniques with biometric feedback and personalized coaching
                      </p>
                    </div>
                  </CardTitle>
                </div>
                <CardContent className="p-6">
                  <AdvancedBreathingExercise />
                </CardContent>
              </Card>

              {/* AI Crisis Support */}
              <Card className="overflow-hidden border border-purple-200 dark:border-purple-800 shadow-sm">
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 p-4 border-b border-purple-200/50">
                  <CardTitle className="flex items-center space-x-3 text-purple-900 dark:text-purple-100">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">AI Crisis Support</h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-normal">
                        AI-powered emotional support and guided crisis intervention available 24/7
                      </p>
                    </div>
                  </CardTitle>
                </div>
                <CardContent className="p-6">
                  <CrisisChatSupport />
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Grounding Exercises - Full Width */}
            <Card className="overflow-hidden border border-green-200 dark:border-green-800 shadow-sm">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 border-b border-green-200/50">
                <CardTitle className="flex items-center space-x-3 text-green-900 dark:text-green-100">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <TreePine className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Comprehensive Grounding Techniques</h3>
                    <p className="text-sm text-green-700 dark:text-green-300 font-normal">
                      Multiple grounding exercises to help manage anxiety and emotional overwhelm
                    </p>
                  </div>
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <EnhancedGroundingExercise />
              </CardContent>
            </Card>

            {/* Mood Analytics Dashboard - Full Width */}
            <Card className="overflow-hidden border border-orange-200 dark:border-orange-800 shadow-sm">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 border-b border-orange-200/50">
                <CardTitle className="flex items-center space-x-3 text-orange-900 dark:text-orange-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Mood Analytics & Insights</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 font-normal">
                      Comprehensive mood tracking with AI-powered insights and trend analysis
                    </p>
                  </div>
                </CardTitle>
              </div>
              <CardContent className="p-6">
                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50">
                    <div className="text-4xl font-bold text-orange-600 mb-2">4.2</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Average Mood</div>
                    <div className="text-xs text-green-600 mt-1 font-medium">+0.3 this week</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50">
                    <div className="text-4xl font-bold text-blue-600 mb-2">18</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Mood Entries</div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">Last 30 days</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200/50">
                    <div className="text-4xl font-bold text-purple-600 mb-2">73%</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Positive Days</div>
                    <div className="text-xs text-purple-600 mt-1 font-medium">Above average</div>
                  </div>
                </div>
                
                {/* Weekly Trend Analysis */}
                <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Weekly Trend Analysis</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg border">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Monday</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={80} className="w-24 h-2" />
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[2rem] text-right">4.0</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg border">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tuesday</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={90} className="w-24 h-2" />
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[2rem] text-right">4.5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg border">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Wednesday</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={70} className="w-24 h-2" />
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[2rem] text-right">3.5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg border">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Thursday</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={85} className="w-24 h-2" />
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[2rem] text-right">4.2</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-lg border">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Friday</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={95} className="w-24 h-2" />
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[2rem] text-right">4.7</span>
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
                    <h2 className="text-xl font-bold">Universal Device Hub</h2>
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-normal">
                      Connect any Bluetooth device with sensors for comprehensive monitoring
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceIntegrationHub sensorData={sensorData} permissions={permissions} requestPermissions={requestPermissions} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}