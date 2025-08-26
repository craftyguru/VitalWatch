import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Phone, 
  Mic, 
  MicOff,
  MapPin, 
  Users, 
  Bell, 
  Volume2, 
  VolumeX,
  Zap,
  Car,
  Watch,
  Home,
  Gamepad2,
  Award,
  Target,
  Timer,
  Radio,
  Bluetooth,
  Wifi,
  Camera,
  Video,
  Cloud,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star
} from "lucide-react";

interface SafetyToolsProps {
  emergencyContacts?: any[];
  userLocation?: GeolocationPosition;
}

export function AdvancedSafetyTools({ emergencyContacts, userLocation }: SafetyToolsProps) {
  const [ghostMode, setGhostMode] = useState(false);
  const [autoRecord, setAutoRecord] = useState(true);
  const [voiceCommands, setVoiceCommands] = useState(true);
  const [geoFencing, setGeoFencing] = useState(false);
  const [liveSharing, setLiveSharing] = useState(false);
  const [breadcrumbTrail, setBreadcrumbTrail] = useState(false);
  const [aiCompanion, setAiCompanion] = useState(true);
  const [wearableSync, setWearableSync] = useState(false);
  const [smartHomeIntegration, setSmartHomeIntegration] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [trustScore, setTrustScore] = useState(85);
  const [dailyCheckIn, setDailyCheckIn] = useState(false);
  const [walkWithMeActive, setWalkWithMeActive] = useState(false);
  const { toast } = useToast();

  // Simulate panic button widget functionality
  const triggerPanicWidget = () => {
    toast({
      title: "Panic Button Activated",
      description: "Silent SOS sent to emergency contacts. Recording started.",
      variant: "destructive"
    });
    setGhostMode(true);
    setAutoRecord(true);
  };

  // Fake call simulation
  const triggerFakeCall = () => {
    if (window.confirm("Start fake incoming call to help you exit this situation?")) {
      // Simulate incoming call interface
      toast({
        title: "Fake Call Activated", 
        description: "Simulating incoming call from 'Mom' - Use this to exit safely",
        variant: "default"
      });
    }
  };

  // Voice command detection
  const activateVoiceCommand = () => {
    if (!voiceCommands) return;
    
    toast({
      title: "Voice Command Active",
      description: "Say 'Help me, friend' to trigger emergency alert",
      variant: "default"
    });
  };

  // Live location sharing
  const toggleLiveSharing = async (enabled: boolean) => {
    setLiveSharing(enabled);
    if (enabled && userLocation) {
      toast({
        title: "Live Sharing Started",
        description: "Your location is now being shared with trusted contacts",
        variant: "default"
      });
    } else {
      toast({
        title: "Live Sharing Stopped", 
        description: "Location sharing has been disabled",
        variant: "default"
      });
    }
  };

  // Geofencing alerts
  const setupGeoFencing = () => {
    setGeoFencing(!geoFencing);
    toast({
      title: geoFencing ? "Geo-Fencing Disabled" : "Geo-Fencing Enabled",
      description: geoFencing ? "Safe zone alerts turned off" : "Set up safe zones in profile to get entry/exit alerts",
      variant: "default"
    });
  };

  // Walk-with-me mode
  const startWalkWithMe = () => {
    setWalkWithMeActive(true);
    setBreadcrumbTrail(true);
    setLiveSharing(true);
    toast({
      title: "Walk With Me Started",
      description: "Friends can now monitor your journey in real-time",
      variant: "default"
    });
  };

  // Daily safety check-in
  const performDailyCheckIn = () => {
    setDailyCheckIn(true);
    setTrustScore(prev => Math.min(100, prev + 2));
    toast({
      title: "Daily Check-In Complete ✓",
      description: "Safety systems tested. Trust score increased +2",
      variant: "default"
    });
  };

  // Emergency drill simulation
  const runEmergencyDrill = () => {
    toast({
      title: "Emergency Drill Started",
      description: "This is a practice alert - testing all emergency systems",
      variant: "default"
    });
    
    // Simulate drill sequence
    setTimeout(() => {
      toast({
        title: "Drill Results",
        description: "All systems operational. 3 contacts would be notified in 12 seconds.",
        variant: "default"
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Panic Button Widget */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-red-500 text-white p-2 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-red-900 dark:text-red-100">Panic Button Widget</CardTitle>
                <p className="text-sm text-red-700 dark:text-red-300">One-tap SOS that works even when app is closed</p>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30">Always Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={triggerPanicWidget}
              className="bg-red-600 hover:bg-red-700 text-white h-16 text-lg font-bold rounded-xl"
              data-testid="button-panic-widget"
            >
              <AlertTriangle className="h-6 w-6 mr-2" />
              PANIC BUTTON
            </Button>
            <Button 
              onClick={triggerFakeCall}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 h-16 rounded-xl"
              data-testid="button-fake-call"
            >
              <Phone className="h-5 w-5 mr-2" />
              Fake Call Exit
            </Button>
          </div>
          
          <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <EyeOff className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Ghost Mode</span>
            </div>
            <Switch 
              checked={ghostMode} 
              onCheckedChange={setGhostMode}
              data-testid="switch-ghost-mode"
            />
          </div>
          
          <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Auto-Record & Cloud Upload</span>
            </div>
            <Switch 
              checked={autoRecord} 
              onCheckedChange={setAutoRecord}
              data-testid="switch-auto-record"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location & Tracking Tools */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Location & Tracking Tools</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Radio className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Live Location Sharing</span>
                </div>
                <Switch 
                  checked={liveSharing} 
                  onCheckedChange={toggleLiveSharing}
                  data-testid="switch-live-sharing"
                />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Secure real-time GPS sharing with trusted friends</p>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Breadcrumb Trail</span>
                </div>
                <Switch 
                  checked={breadcrumbTrail} 
                  onCheckedChange={setBreadcrumbTrail}
                  data-testid="switch-breadcrumb"
                />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Location sent every 30 seconds for rescue tracking</p>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Geo-Fence Alerts</span>
                </div>
                <Switch 
                  checked={geoFencing} 
                  onCheckedChange={setupGeoFencing}
                  data-testid="switch-geofencing"
                />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Alerts when leaving/entering safe zones</p>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <Button 
                onClick={startWalkWithMe}
                variant="outline" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                disabled={walkWithMeActive}
                data-testid="button-walk-with-me"
              >
                <Users className="h-4 w-4 mr-2" />
                {walkWithMeActive ? 'Walk Mode Active' : 'Start Walk-With-Me'}
              </Button>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Friends monitor your journey until you're safe</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI & Smart Tools */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100">AI & Smart Tools</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Voice Command SOS</span>
                </div>
                <Switch 
                  checked={voiceCommands} 
                  onCheckedChange={setVoiceCommands}
                  data-testid="switch-voice-commands"
                />
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">"Help me, friend" triggers SOS even when locked</p>
              {voiceCommands && (
                <Button 
                  onClick={activateVoiceCommand} 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 w-full text-xs border-purple-200"
                >
                  Test Voice Commands
                </Button>
              )}
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">AI Risk Detection</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800 text-xs">Active</Badge>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">Motion + audio analysis for auto-threat detection</p>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">AI Call Responder</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800 text-xs">Ready</Badge>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">AI answers calls and communicates distress for you</p>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">AI Companion Chat</span>
                </div>
                <Switch 
                  checked={aiCompanion} 
                  onCheckedChange={setAiCompanion}
                  data-testid="switch-ai-companion"
                />
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">Calming responses during panic while help arrives</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Tools */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg text-green-900 dark:text-green-100">Communication Tools</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50"
              data-testid="button-multi-channel-alert"
            >
              <Bell className="h-4 w-4 mr-1" />
              Multi-Channel Alert
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50"
              data-testid="button-group-call"
            >
              <Users className="h-4 w-4 mr-1" />
              Emergency Group Call
            </Button>
          </div>
          
          <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Offline Emergency Mode</span>
            </div>
            <Switch 
              checked={offlineMode} 
              onCheckedChange={setOfflineMode}
              data-testid="switch-offline-mode"
            />
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">Uses Bluetooth mesh/peer-to-peer when no internet</p>
        </CardContent>
      </Card>

      {/* Integration Tools */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Watch className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-900 dark:text-orange-100">Device Integration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
              <Watch className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium mb-1">Wearables</div>
              <Switch 
                checked={wearableSync} 
                onCheckedChange={setWearableSync}
                data-testid="switch-wearable"
              />
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Smartwatch, AirTags, Fitbit</p>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
              <Home className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium mb-1">Smart Home</div>
              <Switch 
                checked={smartHomeIntegration} 
                onCheckedChange={setSmartHomeIntegration}
                data-testid="switch-smart-home"
              />
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Lights, alarms, door locks</p>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
              <Car className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium mb-1">Car Integration</div>
              <Badge className="bg-orange-100 text-orange-800 text-xs">Coming Soon</Badge>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">CarPlay/Android Auto</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamification & Engagement */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-5 w-5 text-pink-600" />
            <CardTitle className="text-lg text-pink-900 dark:text-pink-100">Safety Gamification</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Trust Score */}
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-medium">Emergency Network Trust Score</span>
              </div>
              <Badge className="bg-pink-100 text-pink-800">{trustScore}%</Badge>
            </div>
            <Progress value={trustScore} className="mb-2" />
            <p className="text-xs text-pink-600 dark:text-pink-400">Friends gain trust by responding quickly to your alerts</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={performDailyCheckIn}
              variant="outline" 
              size="sm"
              disabled={dailyCheckIn}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
              data-testid="button-daily-checkin"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {dailyCheckIn ? 'Check-In Complete ✓' : 'Daily Safety Check-In'}
            </Button>
            
            <Button 
              onClick={runEmergencyDrill}
              variant="outline" 
              size="sm"
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
              data-testid="button-emergency-drill"
            >
              <Target className="h-4 w-4 mr-1" />
              Emergency Drill
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-pink-100 dark:bg-pink-900/30 rounded-lg p-3">
              <Award className="h-5 w-5 mx-auto mb-1 text-pink-600" />
              <div className="text-xs font-medium">Safety Streaks</div>
              <div className="text-lg font-bold text-pink-700">7 days</div>
            </div>
            <div className="bg-pink-100 dark:bg-pink-900/30 rounded-lg p-3">
              <Timer className="h-5 w-5 mx-auto mb-1 text-pink-600" />
              <div className="text-xs font-medium">Response Time</div>
              <div className="text-lg font-bold text-pink-700">12s</div>
            </div>
            <div className="bg-pink-100 dark:bg-pink-900/30 rounded-lg p-3">
              <Zap className="h-5 w-5 mx-auto mb-1 text-pink-600" />
              <div className="text-xs font-medium">Safety Points</div>
              <div className="text-lg font-bold text-pink-700">240</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}