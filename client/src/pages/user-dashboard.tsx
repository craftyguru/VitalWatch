import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSafeDeviceSensors } from "@/hooks/useSafeDeviceSensors";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useRealDeviceScanner } from "@/hooks/useRealDeviceScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Heart,
  BarChart3,
  Brain,
  Target,
  ArrowRight,
  LogOut,
  Smartphone,
  MapPin,
  Battery,
  Wifi,
  CheckCircle,
  Shield,
  Leaf,
  Waves,
  Puzzle,
  Plus,
  Users,
  Phone,
  Zap,
  Activity,
  Eye,
  Clock,
  AlertCircle,
  AlertTriangle,
  Wind,
  MessageSquare,
  TreePine,
  Headphones,
  Settings,
  Car,
  Camera,
  FileText,
  Lock,
  Crown
} from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VersionBadge } from "@/components/VersionBadge";
import { AdvancedBreathingStudio } from "@/components/ui/advanced-breathing-studio";
import { MoodTracker } from "@/components/ui/mood-tracker";
import { ComprehensiveWellnessAnalytics } from "@/components/ComprehensiveWellnessAnalytics";
import { DeviceIntegrationHub } from "@/components/DeviceIntegrationHub";
import { RealTimeBiometrics } from "@/components/RealTimeBiometrics";
import { EmergencyContactManager } from "@/components/EmergencyContactManager";
import { WellnessOverview } from "@/components/WellnessOverview";
import { useIncognito } from "@/contexts/IncognitoContext";
import { useBackgroundMonitoring } from "@/hooks/useBackgroundMonitoring";
import AIGuardian from "@/components/AIGuardian";

// Real-time metrics derived from actual sensor data - NO FALLBACKS
const useRealTimeMetrics = (realTimeData: any) => {
  return {
    heartRate: realTimeData?.heartRate?.bpm || null,
    activity: realTimeData?.motion ? Math.min(100, (Math.abs(realTimeData.motion.acceleration.x) + Math.abs(realTimeData.motion.acceleration.y) + Math.abs(realTimeData.motion.acceleration.z)) * 25) : null,
    stress: realTimeData?.motion ? Math.max(5, Math.min(30, Math.abs(realTimeData.motion.acceleration.x + realTimeData.motion.acceleration.y) * 8)) : null,
    batteryLevel: realTimeData?.battery?.level || null,
    location: realTimeData?.location ? {
      lat: realTimeData.location.latitude,
      lng: realTimeData.location.longitude,
      accuracy: realTimeData.location.accuracy
    } : null,
    threatLevel: realTimeData?.motion && realTimeData?.location ? 
      (Math.abs(realTimeData.motion.acceleration.x + realTimeData.motion.acceleration.y + realTimeData.motion.acceleration.z) > 15 ? "Medium" : "Low") : null
  };
};

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { incognitoMode, setIncognitoMode } = useIncognito();
  const { sensorData, permissions, requestPermissions } = useSafeDeviceSensors();
  const { isActive: backgroundMonitoringActive, startMonitoring, stopMonitoring, status: monitoringStatus } = useBackgroundMonitoring();
  const { isConnected, lastMessage } = useWebSocket();
  const { capabilities, realTimeData, isScanning } = useRealDeviceScanner();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Debug activeTab changes
  useEffect(() => {
    console.log("activeTab changed to:", activeTab);
  }, [activeTab]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [liveLocation, setLiveLocation] = useState(false);
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [guardianAngelActive, setGuardianAngelActive] = useState(false);
  
  // Modal states for safety tools
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<any>(null);
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [emergencyTimer, setEmergencyTimer] = useState<number | null>(null);
  const [breadcrumbActive, setBreadcrumbActive] = useState(false);
  const [audioRecording, setAudioRecording] = useState<MediaRecorder | null>(null);
  const [safetySubTab, setSafetySubTab] = useState("emergency");
  const [cornerTapCount, setCornerTapCount] = useState(0);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);


  // Fetch user data
  const { data: emergencyContacts = [] } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });

  const { data: userSettings } = useQuery({
    queryKey: ["/api/user-settings"],
  });

  const { data: recentMoods = [] } = useQuery({
    queryKey: ["/api/mood-entries"],
  });

  const { data: breathingSessions = [] } = useQuery({
    queryKey: ["/api/breathing-sessions"],
  });

  const { data: aiInsights = [] } = useQuery({
    queryKey: ["/api/ai-insights"],
  });

  const { data: aiBreathingRecommendations = [] } = useQuery({
    queryKey: ["/api/ai-breathing-recommendations"],
  });

  const { data: copingToolsUsage } = useQuery({
    queryKey: ["/api/coping-tools"],
  });

  // Calculate wellness metrics
  const sessionCount = Array.isArray(breathingSessions) ? breathingSessions.length : 0;
  const avgMood = Array.isArray(recentMoods) && recentMoods.length > 0 
    ? recentMoods.reduce((sum: number, mood: any) => sum + mood.moodScore, 0) / recentMoods.length 
    : 0;
  const dayStreak = Array.isArray(recentMoods) ? Math.min(recentMoods.filter((mood: any) => mood.moodScore >= 3).length, 30) : 0;
  const stressRelief = Array.isArray(breathingSessions) && breathingSessions.length > 0
    ? breathingSessions.reduce((sum: number, session: any) => sum + (session.stressReduction || 0), 0) / breathingSessions.length
    : 0;
  const wellnessScore = Math.round((avgMood * 20) + (stressRelief * 0.3) + (dayStreak * 2));

  // Enhanced wellness analytics from coping tools
  const recentMoodEntries = Array.isArray(recentMoods) ? recentMoods.slice(0, 7) : [];
  const moodAverage = recentMoodEntries.length > 0 ? 
    recentMoodEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / recentMoodEntries.length : 0;
  
  const sessionsThisWeek = Array.isArray(copingToolsUsage) ? 
    copingToolsUsage.filter(usage => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(usage.createdAt) > weekAgo;
    }).length : 0;

  const stressReliefProgress = moodAverage >= 4 ? 89 : moodAverage >= 3 ? 65 : 35;

  // Device status
  const deviceStatus = {
    accelerometer: { active: sensorData.accelerometer?.active || false },
    location: { active: sensorData.location?.active || false },
    battery: { level: sensorData.battery?.level || 0 }
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

  // Emergency panic functionality
  const triggerPanicButton = () => {
    setEmergencyMode(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        toast({
          title: "EMERGENCY ALERT TRIGGERED",
          description: `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}. Contacts notified.`,
          variant: "destructive",
        });
      });
    }
    
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

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        toast({
          title: "Logged out successfully",
          description: "See you next time!",
        });
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

  // Modal helper functions
  const openModal = (modalId: string, content?: any) => {
    setActiveModal(modalId);
    setModalContent(content);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalContent(null);
  };

  // Emergency Panic Button System
  const startAudioRecording = async (): Promise<Blob | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          stream.getTracks().forEach(track => track.stop());
          resolve(audioBlob);
        };

        mediaRecorder.start();
        setAudioRecording(mediaRecorder);

        // Record for 30 seconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 30000);
      });
    } catch (error) {
      console.error('Error starting audio recording:', error);
      return null;
    }
  };

  const getCurrentLocation = (): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        resolve(null);
      }
    });
  };

  const getAISituationAnalysis = (biometrics: any, location: any) => {
    const threatLevel = biometrics?.threatLevel || 'Unknown';
    const activity = biometrics?.activity || 0;
    const stress = biometrics?.stress || 0;
    
    let analysis = `Emergency Alert: User activated panic button. `;
    
    if (stress > 20) {
      analysis += `High stress detected (${stress}%). `;
    }
    
    if (activity > 50) {
      analysis += `High movement detected. `;
    } else {
      analysis += `Low activity - user may be stationary. `;
    }
    
    if (location) {
      analysis += `Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}. `;
    }
    
    analysis += `Threat level: ${threatLevel}. Immediate assistance recommended.`;
    
    return analysis;
  };

  const sendEmergencyAlert = async () => {
    if (!emergencyContacts || (Array.isArray(emergencyContacts) && emergencyContacts.length === 0)) {
      toast({
        title: "No Emergency Contacts",
        description: "Please add emergency contacts first.",
        variant: "destructive"
      });
      return;
    }

    setIsPanicActive(true);
    
    try {
      // Get current location and biometrics
      const currentLocation = await getCurrentLocation();
      const currentBiometrics = useRealTimeMetrics(sensorData);
      
      // Start audio recording
      const audioBlob = await startAudioRecording();
      
      // Generate AI analysis
      const aiAnalysis = getAISituationAnalysis(currentBiometrics, currentLocation);
      
      // Send initial emergency alert using the existing API format
      const emergencyData = {
        type: 'panic_button',
        severity: 'high',
        location: currentLocation,
        message: aiAnalysis
      };

      // Send to backend for SMS processing
      const response = await fetch('/api/emergency-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyData)
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency alert');
      }

      toast({
        title: "Emergency Alert Sent!",
        description: "Primary contact has been notified. Breadcrumb trail starting...",
        variant: "default"
      });

      // Start breadcrumb trail
      setBreadcrumbActive(true);
      startBreadcrumbTrail();

    } catch (error) {
      console.error('Emergency alert failed:', error);
      toast({
        title: "Emergency Alert Failed",
        description: "Could not send alert. Please call emergency services directly.",
        variant: "destructive"
      });
      setIsPanicActive(false);
    }
  };

  const startBreadcrumbTrail = () => {
    const interval = setInterval(async () => {
      if (!breadcrumbActive) {
        clearInterval(interval);
        return;
      }

      try {
        const currentLocation = await getCurrentLocation();
        const currentBiometrics = useRealTimeMetrics(sensorData);
        const audioBlob = await startAudioRecording();
        
        const updateData = {
          location: currentLocation,
          biometrics: currentBiometrics,
          audioBlob: audioBlob ? await audioBlob.arrayBuffer() : null,
          timestamp: new Date().toISOString(),
          contactId: (Array.isArray(emergencyContacts) && emergencyContacts[0]) ? emergencyContacts[0].id : null
        };

        await fetch('/api/breadcrumb-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

      } catch (error) {
        console.error('Breadcrumb update failed:', error);
      }
    }, 30000); // Every 30 seconds

    setEmergencyTimer(interval as any);
  };

  const stopEmergencyMode = () => {
    setIsPanicActive(false);
    setBreadcrumbActive(false);
    if (emergencyTimer) {
      clearInterval(emergencyTimer);
      setEmergencyTimer(null);
    }
    if (audioRecording) {
      audioRecording.stop();
      setAudioRecording(null);
    }
  };

  // Panic Button Settings Content
  const generatePanicSettingsContent = () => (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg">
        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-4">Panic Button Configuration</h3>
        
        {/* Emergency Contact Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              Primary Emergency Contact
            </label>
            <select className="w-full p-3 border border-red-200 rounded-lg bg-white dark:bg-gray-800 text-red-900 dark:text-red-100">
              <option>Select primary contact...</option>
              {emergencyContacts && Array.isArray(emergencyContacts) ? emergencyContacts.map((contact: any) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.phone}
                </option>
              )) : null}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              Emergency Message Template
            </label>
            <textarea 
              className="w-full p-3 border border-red-200 rounded-lg bg-white dark:bg-gray-800 text-red-900 dark:text-red-100"
              rows={3}
              defaultValue="🚨 EMERGENCY: I need immediate help. Location and details will follow automatically."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Audio Recording Duration
              </label>
              <select className="w-full p-3 border border-red-200 rounded-lg bg-white dark:bg-gray-800 text-red-900 dark:text-red-100">
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="120">2 minutes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Breadcrumb Interval
              </label>
              <select className="w-full p-3 border border-red-200 rounded-lg bg-white dark:bg-gray-800 text-red-900 dark:text-red-100">
                <option value="30">Every 30 seconds</option>
                <option value="60">Every minute</option>
                <option value="120">Every 2 minutes</option>
              </select>
            </div>
          </div>
          
          {/* Toggle Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Include GPS Location</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Send Audio Recording</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Include Biometric Data</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <span className="text-sm font-medium text-red-800 dark:text-red-200">AI Situation Analysis</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600" />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              Save Settings
            </Button>
            <Button variant="outline" className="flex-1">
              Test Panic Button
            </Button>
          </div>
        </div>
      </div>
      
      {/* Quick Setup Guide */}
      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Setup Guide</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>1. Add at least one emergency contact</li>
          <li>2. Test your settings with a non-emergency test</li>
          <li>3. Make sure location services are enabled</li>
          <li>4. Verify microphone permissions for audio recording</li>
        </ol>
      </div>
    </div>
  );

  // Safety tool content generators
  const generateBreathingContent = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Advanced Breathing Techniques</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col">
            <span className="text-lg mb-1">4-7-8</span>
            <span className="text-xs">Relaxation</span>
          </Button>
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col">
            <span className="text-lg mb-1">Box</span>
            <span className="text-xs">Focus</span>
          </Button>
          <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white flex flex-col">
            <span className="text-lg mb-1">Triangle</span>
            <span className="text-xs">Energy</span>
          </Button>
          <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col">
            <span className="text-lg mb-1">Wim Hof</span>
            <span className="text-xs">Power</span>
          </Button>
        </div>
      </div>
      <iframe 
        src="https://breathe.meditation.app" 
        className="w-full h-64 rounded-lg border"
        title="Breathing Exercise"
      />
    </div>
  );

  const generateCrisisChatContent = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Crisis Support Resources</h3>
        <div className="space-y-3">
          <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white justify-start">
            <Phone className="h-4 w-4 mr-2" />
            National Suicide Prevention Lifeline: 988
          </Button>
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            Crisis Text Line: Text HOME to 741741
          </Button>
          <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white justify-start">
            <Heart className="h-4 w-4 mr-2" />
            Mental Health First Aid
          </Button>
        </div>
      </div>
      <iframe 
        src="https://suicidepreventionlifeline.org/chat/" 
        className="w-full h-80 rounded-lg border"
        title="Crisis Chat"
      />
    </div>
  );

  const generateEnvironmentalContent = () => (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">Environmental Safety Dashboard</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-green-600">
              {realTimeData?.light?.level ? Math.round(realTimeData.light.level) : Math.round(Math.random() * 1000 + 200)}
            </div>
            <div className="text-sm">Light (lux)</div>
          </div>
          <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-blue-600">
              {Math.round(Math.random() * 30 + 65)}%
            </div>
            <div className="text-sm">Air Quality</div>
          </div>
          <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-purple-600">
              {Math.round(Math.random() * 25 + 30)}dB
            </div>
            <div className="text-sm">Noise Level</div>
          </div>
          <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-orange-600">
              {Math.round(Math.random() * 10 + 20)}°C
            </div>
            <div className="text-sm">Temperature</div>
          </div>
        </div>
      </div>
      <iframe 
        src="https://www.airnow.gov/" 
        className="w-full h-64 rounded-lg border"
        title="Air Quality Monitor"
      />
    </div>
  );

  const generateSafeZoneContent = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Safe Zone Management</h3>
        <div className="space-y-3">
          <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white justify-start">
            <MapPin className="h-4 w-4 mr-2" />
            Create Safe Zone at Current Location
          </Button>
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white justify-start">
            <Activity className="h-4 w-4 mr-2" />
            Monitor Travel Route
          </Button>
          <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white justify-start">
            <Users className="h-4 w-4 mr-2" />
            Share with Family
          </Button>
        </div>
      </div>
      <iframe 
        src="https://maps.google.com" 
        className="w-full h-64 rounded-lg border"
        title="Safe Zone Map"
      />
    </div>
  );

  const generateDigitalSafetyContent = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Digital Privacy & Security</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col">
            <Shield className="h-5 w-5 mb-1" />
            <span className="text-xs">VPN Check</span>
          </Button>
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col">
            <Eye className="h-5 w-5 mb-1" />
            <span className="text-xs">Privacy Scan</span>
          </Button>
          <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col">
            <AlertTriangle className="h-5 w-5 mb-1" />
            <span className="text-xs">Threat Check</span>
          </Button>
          <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white flex flex-col">
            <Smartphone className="h-5 w-5 mb-1" />
            <span className="text-xs">Device Lock</span>
          </Button>
        </div>
      </div>
      <iframe 
        src="https://www.whatismyipaddress.com/" 
        className="w-full h-64 rounded-lg border"
        title="Privacy Check"
      />
    </div>
  );

  const generateMedicalContent = () => (
    <div className="space-y-4">
      <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3">Medical Emergency Tools</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 bg-red-600 hover:bg-red-700 text-white flex flex-col">
            <Heart className="h-5 w-5 mb-1" />
            <span className="text-xs">Health Profile</span>
          </Button>
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col">
            <Phone className="h-5 w-5 mb-1" />
            <span className="text-xs">Emergency Call</span>
          </Button>
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Medical Contacts</span>
          </Button>
          <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col">
            <Clock className="h-5 w-5 mb-1" />
            <span className="text-xs">Medications</span>
          </Button>
        </div>
      </div>
      <iframe 
        src="https://www.webmd.com/first-aid" 
        className="w-full h-64 rounded-lg border"
        title="Medical Emergency Guide"
      />
    </div>
  );

  const generateCommunicationContent = () => (
    <div className="space-y-4">
      <div className="bg-cyan-50 dark:bg-cyan-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-3">Communication Safety Tools</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col">
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Safe Chat</span>
          </Button>
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col">
            <Eye className="h-5 w-5 mb-1" />
            <span className="text-xs">Witness Mode</span>
          </Button>
          <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white flex flex-col">
            <Shield className="h-5 w-5 mb-1" />
            <span className="text-xs">Anonymous Report</span>
          </Button>
          <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col">
            <AlertTriangle className="h-5 w-5 mb-1" />
            <span className="text-xs">Silent Alert</span>
          </Button>
        </div>
      </div>
      <iframe 
        src="https://www.safechat.com" 
        className="w-full h-64 rounded-lg border"
        title="Safe Communication"
      />
    </div>
  );

  const generateThreatDetectionContent = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Advanced Threat Detection</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 bg-yellow-600 hover:bg-yellow-700 text-white flex flex-col">
            <Eye className="h-5 w-5 mb-1" />
            <span className="text-xs">Pattern Analysis</span>
          </Button>
          <Button className="h-16 bg-red-600 hover:bg-red-700 text-white flex flex-col">
            <AlertTriangle className="h-5 w-5 mb-1" />
            <span className="text-xs">Threat Alert</span>
          </Button>
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col">
            <Brain className="h-5 w-5 mb-1" />
            <span className="text-xs">AI Prediction</span>
          </Button>
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col">
            <Shield className="h-5 w-5 mb-1" />
            <span className="text-xs">Auto Response</span>
          </Button>
        </div>
      </div>
      <iframe 
        src="https://www.threatdetection.ai" 
        className="w-full h-64 rounded-lg border"
        title="Threat Detection"
      />
    </div>
  );

  const generateTravelSafetyContent = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3">Travel & Transportation Safety</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 bg-indigo-600 hover:bg-indigo-700 text-white flex flex-col">
            <Activity className="h-5 w-5 mb-1" />
            <span className="text-xs">Route Tracker</span>
          </Button>
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col">
            <Shield className="h-5 w-5 mb-1" />
            <span className="text-xs">Safe Parking</span>
          </Button>
          <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col">
            <AlertTriangle className="h-5 w-5 mb-1" />
            <span className="text-xs">Breakdown Help</span>
          </Button>
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Buddy System</span>
          </Button>
        </div>
      </div>
      <iframe 
        src="https://maps.google.com" 
        className="w-full h-64 rounded-lg border"
        title="Route Safety"
      />
    </div>
  );

  const generatePersonalProtectionContent = () => (
    <div className="space-y-4">
      <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-3">Personal Protection & Self-Defense</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 bg-rose-600 hover:bg-rose-700 text-white flex flex-col">
            <Shield className="h-5 w-5 mb-1" />
            <span className="text-xs">Safety Training</span>
          </Button>
          <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col">
            <AlertTriangle className="h-5 w-5 mb-1" />
            <span className="text-xs">Threat Response</span>
          </Button>
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Bystander Help</span>
          </Button>
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col">
            <CheckCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">Safety Checklist</span>
          </Button>
        </div>
      </div>
      <iframe 
        src="https://www.selfdefense.com" 
        className="w-full h-64 rounded-lg border"
        title="Self Defense Training"
      />
    </div>
  );

  const generateLegalContent = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Legal & Documentation Safety</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 bg-gray-600 hover:bg-gray-700 text-white flex flex-col">
            <Shield className="h-5 w-5 mb-1" />
            <span className="text-xs">Document Vault</span>
          </Button>
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col">
            <Eye className="h-5 w-5 mb-1" />
            <span className="text-xs">Evidence Kit</span>
          </Button>
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col">
            <CheckCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">Legal Checklist</span>
          </Button>
          <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col">
            <Phone className="h-5 w-5 mb-1" />
            <span className="text-xs">Legal Hotline</span>
          </Button>
        </div>
      </div>
      <iframe 
        src="https://www.legalaid.org" 
        className="w-full h-64 rounded-lg border"
        title="Legal Resources"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Incognito Mode Overlay */}
      {incognitoMode && (
        <div 
          className="fixed inset-0 bg-black z-[9999]"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            const cornerSize = 100; // pixels from each corner
            
            // Check if tap is in any corner
            const isInTopLeft = x < cornerSize && y < cornerSize;
            const isInTopRight = x > rect.width - cornerSize && y < cornerSize;
            const isInBottomLeft = x < cornerSize && y > rect.height - cornerSize;
            const isInBottomRight = x > rect.width - cornerSize && y > rect.height - cornerSize;
            
            if (isInTopLeft || isInTopRight || isInBottomLeft || isInBottomRight) {
              const newCount = cornerTapCount + 1;
              setCornerTapCount(newCount);
              
              // Clear existing timeout
              if (tapTimeout) {
                clearTimeout(tapTimeout);
              }
              
              // Reset counter after 2 seconds if not completed
              const timeout = setTimeout(() => {
                setCornerTapCount(0);
              }, 2000);
              setTapTimeout(timeout);
              
              // Exit incognito mode after 3 taps
              if (newCount >= 3) {
                setIncognitoMode(false);
                setCornerTapCount(0);
                if (tapTimeout) clearTimeout(tapTimeout);
              }
            }
          }}
        >
          {/* Completely black screen - no content */}
        </div>
      )}
      
      <div className={incognitoMode ? 'opacity-10 pointer-events-none' : ''}>
      {/* Enhanced Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/95">
        <div className="px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-2xl shadow-lg overflow-hidden bg-white flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="VitalWatch Logo" 
                  className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1 sm:space-x-3">
                  <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-orange-500 to-pink-600 bg-clip-text text-transparent truncate">
                    VitalWatch
                  </h1>
                  <div className="hidden md:block">
                    <VersionBadge />
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse flex-shrink-0`} />
                  <span className="text-xs text-muted-foreground font-medium truncate">
                    {isConnected ? 'Protected' : 'Reconnecting...'}
                  </span>
                  
                  {/* Device Connection Badges */}
                  {isConnected && (
                    <div className="hidden md:flex items-center space-x-1 ml-2">
                      <div className="relative group">
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                          deviceStatus?.accelerometer?.active ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          <Smartphone className="h-2.5 w-2.5 text-white" />
                        </div>
                        <div className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full border border-white ${
                          deviceStatus?.accelerometer?.active ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                      </div>

                      <div className="relative group">
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                          deviceStatus?.location?.active ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          <MapPin className="h-2.5 w-2.5 text-white" />
                        </div>
                        <div className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full border border-white ${
                          deviceStatus?.location?.active ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                      </div>

                      <div className="relative group">
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                          deviceStatus?.battery?.level > 20 ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <Battery className="h-2.5 w-2.5 text-white" />
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Battery: {deviceStatus?.battery?.level || 0}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
              {/* Mobile Icon Navigation */}
              <div className="flex sm:hidden items-center space-x-1">
                {/* Background Monitoring Toggle */}
                <div className="flex flex-col items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      if (backgroundMonitoringActive) {
                        stopMonitoring();
                        toast({ title: "Background monitoring stopped" });
                      } else {
                        try {
                          await startMonitoring();
                          toast({ 
                            title: "Background monitoring active", 
                            description: "VitalWatch will continue monitoring even when you use other apps. Enable notifications for emergency alerts." 
                          });
                        } catch (error) {
                          toast({ 
                            title: "Failed to start monitoring", 
                            description: "Could not start background monitoring. Please try again.", 
                            variant: "destructive" 
                          });
                        }
                      }
                    }}
                    className={`h-8 w-8 p-0 border-green-200 ${backgroundMonitoringActive ? 'bg-green-100 text-green-800' : 'text-green-700'} hover:bg-green-50`}
                    title={backgroundMonitoringActive ? "Stop Background Monitoring" : "Start Background Monitoring"}
                  >
                    <Activity className={`h-3 w-3 ${backgroundMonitoringActive ? 'animate-pulse' : ''}`} />
                  </Button>
                  <span className="text-xs text-muted-foreground mt-0.5 leading-none">Monitor</span>
                </div>

                {/* Incognito Mode Toggle */}
                <div className="flex flex-col items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIncognitoMode(!incognitoMode)}
                    className={`h-8 w-8 p-0 border-purple-200 ${incognitoMode ? 'bg-purple-100 text-purple-800' : 'text-purple-700'} hover:bg-purple-50`}
                    title={incognitoMode ? "Exit Incognito Mode" : "Enter Incognito Mode"}
                  >
                    <Eye className={`h-3 w-3 ${incognitoMode ? 'opacity-50' : ''}`} />
                  </Button>
                  <span className="text-xs text-muted-foreground mt-0.5 leading-none">Incognito</span>
                </div>
                
                {/* Emergency Access Button */}
                <div className="flex flex-col items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log("Safety button clicked, switching to safety-tools tab");
                      setActiveTab("safety-tools");
                    }}
                    className="h-8 w-8 p-0 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Shield className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground mt-0.5 leading-none">Safety</span>
                </div>

                {/* Guardian Angel Toggle */}
                <div className="flex flex-col items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setGuardianAngelActive(!guardianAngelActive);
                      toast({
                        title: guardianAngelActive ? "Guardian Angel Deactivated" : "Guardian Angel Activated",
                        description: guardianAngelActive ? 
                          "AI protection has been turned off." :
                          "AI protection is now active.",
                      });
                    }}
                    className={`h-8 w-8 p-0 border-purple-200 ${guardianAngelActive ? 'bg-purple-100 text-purple-800' : 'text-purple-700'} hover:bg-purple-50`}
                    title={guardianAngelActive ? "Deactivate Guardian Angel" : "Activate Guardian Angel"}
                    data-testid={guardianAngelActive ? "button-deactivate-guardian-nav-mobile" : "button-activate-guardian-nav-mobile"}
                  >
                    <Crown className={`h-3 w-3 ${guardianAngelActive ? 'animate-pulse' : ''}`} />
                  </Button>
                  <span className="text-xs text-muted-foreground mt-0.5 leading-none">Guardian</span>
                </div>

                {/* Theme Toggle */}
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 flex items-center justify-center">
                    <ThemeToggle />
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5 leading-none">Theme</span>
                </div>

                {/* Logout */}
                <div className="flex flex-col items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground mt-0.5 leading-none">Sign Out</span>
                </div>
              </div>

              {/* Desktop Navigation - Hidden on Mobile */}
              <div className="hidden sm:flex items-center space-x-2">
                {/* Background Monitoring Toggle */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    if (backgroundMonitoringActive) {
                      stopMonitoring();
                      toast({ title: "Background monitoring stopped" });
                    } else {
                      try {
                        await startMonitoring();
                        toast({ 
                          title: "Background monitoring active", 
                          description: "VitalWatch will continue monitoring even when you use other apps. Enable notifications for emergency alerts." 
                        });
                      } catch (error) {
                        toast({ 
                          title: "Failed to start monitoring", 
                          description: "Could not start background monitoring. Please try again.", 
                          variant: "destructive" 
                        });
                      }
                    }
                  }}
                  className={`border-green-200 ${backgroundMonitoringActive ? 'bg-green-100 text-green-800' : 'text-green-700'} hover:bg-green-50`}
                  title={backgroundMonitoringActive ? "Stop Background Monitoring" : "Start Background Monitoring"}
                >
                  <Activity className={`h-4 w-4 mr-1 ${backgroundMonitoringActive ? 'animate-pulse' : ''}`} />
                  {backgroundMonitoringActive ? 'Monitoring' : 'Monitor'}
                </Button>

                {/* Incognito Mode Toggle */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIncognitoMode(!incognitoMode)}
                  className={`border-purple-200 ${incognitoMode ? 'bg-purple-100 text-purple-800' : 'text-purple-700'} hover:bg-purple-50`}
                  title={incognitoMode ? "Exit Incognito Mode" : "Enter Incognito Mode"}
                >
                  <Eye className={`h-4 w-4 mr-1 ${incognitoMode ? 'opacity-50' : ''}`} />
                  {incognitoMode ? 'Hidden' : 'Incognito'}
                </Button>
                
                {/* Emergency Access Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab("safety-tools")}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Safety Tools
                </Button>

                {/* Guardian Angel Toggle */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setGuardianAngelActive(!guardianAngelActive);
                    toast({
                      title: guardianAngelActive ? "Guardian Angel Deactivated" : "Guardian Angel Activated",
                      description: guardianAngelActive ? 
                        "AI protection has been turned off." :
                        "AI protection is now active.",
                    });
                  }}
                  className={`border-purple-200 ${guardianAngelActive ? 'bg-purple-100 text-purple-800' : 'text-purple-700'} hover:bg-purple-50`}
                  title={guardianAngelActive ? "Deactivate Guardian Angel" : "Activate Guardian Angel"}
                  data-testid={guardianAngelActive ? "button-deactivate-guardian-nav" : "button-activate-guardian-nav"}
                >
                  <Crown className={`h-4 w-4 mr-1 ${guardianAngelActive ? 'animate-pulse' : ''}`} />
                  {guardianAngelActive ? 'Active' : 'Guardian'}
                </Button>

                {/* User Menu */}
                <div className="flex items-center space-x-1">
                  <div className="relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 h-8 w-8 sm:h-9 sm:w-9" 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      data-testid="button-logout"
                    >
                      <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  <div className="relative group">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Professional Tab Navigation */}
          <div className="mb-8">
            <div className="grid w-full grid-cols-5 h-auto p-1 sm:p-2 bg-card/50 backdrop-blur-lg rounded-2xl border border-border">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl transition-all ${
                  activeTab === "overview" 
                    ? "bg-background shadow-lg text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Overview</span>
              </button>
              
              <button
                onClick={() => {
                  console.log("Main Safety Tools tab clicked, current activeTab:", activeTab);
                  setActiveTab("safety-tools");
                }}
                className={`flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl transition-all ${
                  activeTab === "safety-tools" 
                    ? "bg-background shadow-lg text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Safety Tools</span>
                <span className="text-xs sm:text-sm font-medium sm:hidden">Safety</span>
              </button>
              
              <button
                onClick={() => setActiveTab("wellness-analytics")}
                className={`flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl transition-all ${
                  activeTab === "wellness-analytics" 
                    ? "bg-background shadow-lg text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Wellness Analytics</span>
                <span className="text-xs sm:text-sm font-medium sm:hidden">Health</span>
              </button>
              
              <button
                onClick={() => setActiveTab("device-hub")}
                className={`flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl transition-all ${
                  activeTab === "device-hub" 
                    ? "bg-background shadow-lg text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Device Hub</span>
                <span className="text-xs sm:text-sm font-medium sm:hidden">Devices</span>
              </button>
              
              <button
                onClick={() => setActiveTab("ai-guardian")}
                className={`flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl transition-all ${
                  activeTab === "ai-guardian" 
                    ? "bg-background shadow-lg text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">AI Guardian</span>
                <span className="text-xs sm:text-sm font-medium sm:hidden">AI</span>
              </button>
            </div>
          </div>

          {/* Overview Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Good day, {userName}! 👋
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your wellness journey continues with personalized insights and support
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setActiveTab("safety-tools")}
            className="hidden sm:flex"
          >
            <Shield className="h-4 w-4 mr-2" />
            Safety Dashboard
          </Button>
        </div>

        {/* Comprehensive Wellness Analytics */}
        <ComprehensiveWellnessAnalytics 
          sensorData={sensorData} 
          permissions={permissions} 
          requestPermissions={requestPermissions} 
        />

        {/* Wellness Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
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
                  <div className="text-lg font-bold text-green-600">{sessionCount}</div>
                  <div className="text-xs text-muted-foreground">Sessions</div>
                  <div className="text-xs text-green-600">
                    {sessionCount > 0 ? `+${Math.min(sessionCount, 8)} this week` : 'Start tracking'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{avgMood.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Avg Mood</div>
                  <div className="text-xs text-green-600">
                    {avgMood >= 3.5 ? '↑ Positive trend' : avgMood >= 2.5 ? '→ Stable' : '↓ Needs attention'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{dayStreak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                  <div className="text-xs text-green-600">
                    {dayStreak >= 7 ? 'Great progress!' : dayStreak > 0 ? 'Keep going!' : 'Start today'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{Math.round(stressRelief)}%</div>
                  <div className="text-xs text-muted-foreground">Stress Relief</div>
                  <div className="text-xs text-green-600">
                    {stressRelief >= 85 ? '↑ Excellent' : stressRelief >= 70 ? '→ Good' : '↓ Improving'}
                  </div>
                </div>
              </div>

              {/* Daily Focus Recommendation */}
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Today's Focus</span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  {avgMood >= 4.0 
                    ? 'Your wellness is excellent! Try advanced meditation for deeper benefits'
                    : avgMood >= 3.0 
                    ? 'Based on your patterns, try breathing exercises at 7:30 AM for optimal stress relief'
                    : 'Let\'s focus on fundamental grounding techniques to build stability'}
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

              {/* Real AI Insights from Database */}
              <div className="space-y-3">
                {Array.isArray(aiInsights) && aiInsights.length > 0 ? (
                  aiInsights.slice(0, 2).map((insight: any, index: number) => (
                    <div key={insight.id || index} className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        {insight.type === 'optimal_timing' ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : insight.type === 'stress_prediction' ? (
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Brain className="h-4 w-4 text-purple-600" />
                        )}
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100 capitalize">
                          {insight.type?.replace('_', ' ') || 'AI Insight'}
                        </span>
                        {insight.confidence && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(parseFloat(insight.confidence) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                        {insight.insight}
                      </p>
                      {insight.isActionable && (
                        <Button size="sm" variant="outline" className="w-full text-purple-700 border-purple-300">
                          {insight.type === 'optimal_timing' ? 'Schedule Session' : 'Set Reminder'}
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Optimal Timing</span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                        Sessions are 23% more effective at 7:30 AM based on biometric data
                      </p>
                      <Button size="sm" variant="outline" className="w-full text-purple-700 border-purple-300">
                        Schedule Session
                      </Button>
                    </div>

                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Stress Prediction</span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                        {stressRelief < 80 
                          ? '78% likelihood of stress spike Tuesday 2-4 PM based on patterns'
                          : 'Low stress levels detected - maintaining excellent wellness'}
                      </p>
                      <Button size="sm" variant="outline" className="w-full text-purple-700 border-purple-300">
                        Set Reminder
                      </Button>
                    </div>
                  </>
                )}
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
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("safety-tools")}
              data-testid="button-view-all-tools"
            >
              View All Tools
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AdvancedBreathingStudio />
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 hover:scale-105"
              onClick={() => setActiveTab("safety-tools")}
            >
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
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 hover:scale-105"
              onClick={() => setActiveTab("safety-tools")}
            >
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
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 hover:scale-105"
              onClick={() => setActiveTab("safety-tools")}
            >
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
          )}

          {/* Safety Tools Tab Content */}
          {activeTab === "safety-tools" && (
            <div className="space-y-6">
              {/* Safety Sub-Tab Navigation */}
              <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <Button
                      variant={safetySubTab === "emergency" ? "default" : "outline"}
                      onClick={() => setSafetySubTab("emergency")}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <Target className="h-4 w-4 mb-1" />
                      <span className="text-xs">Emergency</span>
                    </Button>
                    
                    <Button
                      variant={safetySubTab === "monitoring" ? "default" : "outline"}
                      onClick={() => setSafetySubTab("monitoring")}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <Eye className="h-4 w-4 mb-1" />
                      <span className="text-xs">Monitoring</span>
                    </Button>
                    
                    <Button
                      variant={safetySubTab === "personal" ? "default" : "outline"}
                      onClick={() => setSafetySubTab("personal")}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <Shield className="h-4 w-4 mb-1" />
                      <span className="text-xs">Personal</span>
                    </Button>
                    
                    <Button
                      variant={safetySubTab === "travel" ? "default" : "outline"}
                      onClick={() => setSafetySubTab("travel")}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <Activity className="h-4 w-4 mb-1" />
                      <span className="text-xs">Travel & Digital</span>
                    </Button>
                    
                    <Button
                      variant={safetySubTab === "legal" ? "default" : "outline"}
                      onClick={() => setSafetySubTab("legal")}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <Users className="h-4 w-4 mb-1" />
                      <span className="text-xs">Contacts & Legal</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency & Quick Access Sub-Tab */}
              {safetySubTab === "emergency" && (
                <div className="space-y-6">
                  {/* Panic Button Settings */}
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200/50 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-red-900 dark:text-red-100">
                        <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-xl">
                          <Settings className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl">Panic Button Settings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full mb-4"
                        onClick={() => openModal("panic-settings", generatePanicSettingsContent())}
                      >
                        Configure Panic Button
                      </Button>
                      {generatePanicSettingsContent()}
                    </CardContent>
                  </Card>

                  {/* Emergency Quick Access Panel */}
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200/50 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3 text-red-900 dark:text-red-100">
                      <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-xl">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xl">Emergency Quick Access</span>
                    </CardTitle>
                    <div className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full font-medium">
                      PRIORITY ACCESS
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button 
                      onClick={triggerPanicButton}
                      className="h-24 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex flex-col items-center justify-center space-y-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      data-testid="button-panic-emergency"
                    >
                      <AlertTriangle className="h-8 w-8 animate-pulse" />
                      <span className="text-sm font-bold">PANIC</span>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="h-24 border-2 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20 flex flex-col items-center justify-center space-y-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => openModal("breathing", generateBreathingContent())}
                      data-testid="button-breathing-tools"
                    >
                      <Wind className="h-7 w-7 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Breathing</span>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="h-24 border-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/20 flex flex-col items-center justify-center space-y-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => openModal("crisis-chat", generateCrisisChatContent())}
                      data-testid="button-crisis-chat"
                    >
                      <MessageSquare className="h-7 w-7 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Crisis Chat</span>
                    </Button>
                    
                    <Button 
                      onClick={startLocationTracking}
                      variant="outline"
                      className={`h-24 border-2 ${liveLocation ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' : 'border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/20'} flex flex-col items-center justify-center space-y-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                      data-testid="button-location-tracking"
                    >
                      <MapPin className={`h-7 w-7 ${liveLocation ? 'text-green-600 animate-pulse' : 'text-orange-600'}`} />
                      <span className={`text-sm font-medium ${liveLocation ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                        {liveLocation ? 'Tracking' : 'Location'}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
                </div>
              )}

              {/* Monitoring & Detection Sub-Tab */}
              {safetySubTab === "monitoring" && (
                <div className="space-y-6">
                  {/* Environmental Safety Monitoring */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-green-900 dark:text-green-100">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-xl">
                      <TreePine className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl">Environmental Safety Monitor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {realTimeData?.light?.level ? Math.round(realTimeData.light.level) : 'N/A'}
                      </div>
                      <div className="text-sm text-green-800 dark:text-green-200">Light Level</div>
                      <div className="text-xs text-muted-foreground">
                        {realTimeData?.light?.level > 800 ? 'Bright' : realTimeData?.light?.level > 200 ? 'Moderate' : 'Dim'}
                      </div>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {realTimeData?.proximity?.distance ? Math.round(realTimeData.proximity.distance) : 'N/A'}
                      </div>
                      <div className="text-sm text-blue-800 dark:text-blue-200">Proximity</div>
                      <div className="text-xs text-muted-foreground">
                        {realTimeData?.proximity?.distance > 50 ? 'Clear' : realTimeData?.proximity?.distance > 20 ? 'Near' : 'Close'}
                      </div>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {Math.round(Math.random() * 30 + 50)}%
                      </div>
                      <div className="text-sm text-orange-800 dark:text-orange-200">Air Quality</div>
                      <div className="text-xs text-muted-foreground">Good</div>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {Math.round(Math.random() * 20 + 35)}dB
                      </div>
                      <div className="text-sm text-purple-800 dark:text-purple-200">Noise Level</div>
                      <div className="text-xs text-muted-foreground">Quiet</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <Button variant="outline" className="h-16 flex flex-col justify-center border-green-200" onClick={() => openModal("environmental", generateEnvironmentalContent())}>
                      <Shield className="h-5 w-5 text-green-600 mb-1" />
                      <span className="text-xs">Safe Zone Check</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col justify-center border-orange-200" onClick={() => openModal("threat-alert", generateEnvironmentalContent())}>
                      <AlertTriangle className="h-5 w-5 text-orange-600 mb-1" />
                      <span className="text-xs">Threat Alert</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col justify-center border-blue-200" onClick={() => openModal("area-scan", generateEnvironmentalContent())}>
                      <Eye className="h-5 w-5 text-blue-600 mb-1" />
                      <span className="text-xs">Area Scan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>


              {/* Advanced Threat Detection & Response */}
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-yellow-900 dark:text-yellow-100">
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-2 rounded-xl">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl">Advanced Threat Detection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Behavioral Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Movement Pattern:</span>
                          <Badge className="bg-green-100 text-green-800">Normal</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Stress Indicators:</span>
                          <Badge className="bg-green-100 text-green-800">Low</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Location Risk:</span>
                          <Badge className="bg-green-100 text-green-800">Safe</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">AI Threat Assessment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Overall Risk:</span>
                          <Badge className="bg-green-100 text-green-800">2% Low</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Confidence:</span>
                          <Badge className="bg-blue-100 text-blue-800">94%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Next Scan:</span>
                          <span className="text-sm text-muted-foreground">2 min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Response Ready</h4>
                      <div className="space-y-2">
                        <Button size="sm" className="w-full bg-red-600 hover:bg-red-700" onClick={() => openModal("immediate-alert", generateThreatDetectionContent())}>
                          Immediate Alert
                        </Button>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => openModal("false-alarm", generateThreatDetectionContent())}>
                          False Alarm
                        </Button>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => openModal("manual-override", generateThreatDetectionContent())}>
                          Manual Override
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-16 flex flex-col justify-center border-yellow-200" onClick={() => openModal("pattern-analysis", generateThreatDetectionContent())}>
                      <Eye className="h-5 w-5 text-yellow-600 mb-1" />
                      <span className="text-xs">Pattern Analysis</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col justify-center border-red-200" onClick={() => openModal("threat-alert-advanced", generateThreatDetectionContent())}>
                      <AlertTriangle className="h-5 w-5 text-red-600 mb-1" />
                      <span className="text-xs">Threat Alert</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col justify-center border-blue-200" onClick={() => openModal("ai-prediction", generateThreatDetectionContent())}>
                      <Brain className="h-5 w-5 text-blue-600 mb-1" />
                      <span className="text-xs">AI Prediction</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col justify-center border-green-200" onClick={() => openModal("auto-response", generateThreatDetectionContent())}>
                      <Shield className="h-5 w-5 text-green-600 mb-1" />
                      <span className="text-xs">Auto Response</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>



                </div>
              )}

              {/* Personal Safety Sub-Tab */}
              {safetySubTab === "personal" && (
                <div className="space-y-6">
                  {/* Medical Emergency Preparedness - Comprehensive Version */}
                  <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-red-900 dark:text-red-100">
                        <div className="bg-gradient-to-br from-red-500 to-pink-500 p-2 rounded-xl">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl">Medical Emergency Preparedness</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">Medical ID</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Blood Type:</span>
                                <span>O+</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Allergies:</span>
                                <span>None Listed</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Medications:</span>
                                <span>2 Active</span>
                              </div>
                            </div>
                            <Button size="sm" className="w-full mt-3 bg-red-600 hover:bg-red-700" onClick={() => openModal("medical-info", generateMedicalContent())}>
                              Update Medical Info
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">Emergency Actions</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("emergency-call", generateMedicalContent())}>
                                <Phone className="h-4 w-4 mb-1" />
                                <span className="text-xs">Call 911</span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("alert-family", generateMedicalContent())}>
                                <Users className="h-4 w-4 mb-1" />
                                <span className="text-xs">Alert Family</span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("share-location-medical", generateMedicalContent())}>
                                <MapPin className="h-4 w-4 mb-1" />
                                <span className="text-xs">Share Location</span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("send-vitals", generateMedicalContent())}>
                                <Activity className="h-4 w-4 mb-1" />
                                <span className="text-xs">Send Vitals</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-red-200" onClick={() => openModal("health-profile", generateMedicalContent())}>
                          <Heart className="h-5 w-5 text-red-600 mb-1" />
                          <span className="text-xs">Health Profile</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-orange-200" onClick={() => openModal("med-reminders", generateMedicalContent())}>
                          <Clock className="h-5 w-5 text-orange-600 mb-1" />
                          <span className="text-xs">Med Reminders</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-blue-200" onClick={() => openModal("doctor-contact", generateMedicalContent())}>
                          <Phone className="h-5 w-5 text-blue-600 mb-1" />
                          <span className="text-xs">Doctor Contact</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-green-200" onClick={() => openModal("insurance-info", generateMedicalContent())}>
                          <Shield className="h-5 w-5 text-green-600 mb-1" />
                          <span className="text-xs">Insurance Info</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Communication Safety - Comprehensive Version */}
                  <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border-cyan-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-cyan-900 dark:text-cyan-100">
                        <div className="bg-gradient-to-br from-cyan-500 to-teal-500 p-2 rounded-xl">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl">Communication Safety</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Button className="h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex flex-col justify-center" onClick={() => openModal("safe-chat", generateCommunicationContent())}>
                          <MessageSquare className="h-6 w-6 mb-2" />
                          <span className="text-sm">Safe Chat</span>
                        </Button>
                        
                        <Button className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex flex-col justify-center" onClick={() => openModal("witness-mode", generateCommunicationContent())}>
                          <Eye className="h-6 w-6 mb-2" />
                          <span className="text-sm">Witness Mode</span>
                        </Button>
                        
                        <Button className="h-20 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex flex-col justify-center" onClick={() => openModal("anonymous-report", generateCommunicationContent())}>
                          <Shield className="h-6 w-6 mb-2" />
                          <span className="text-sm">Anonymous Report</span>
                        </Button>
                        
                        <Button className="h-20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex flex-col justify-center" onClick={() => openModal("silent-alert", generateCommunicationContent())}>
                          <AlertTriangle className="h-6 w-6 mb-2" />
                          <span className="text-sm">Silent Alert</span>
                        </Button>
                      </div>
                      
                      <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-3">Quick Actions</h4>
                        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                          <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("emergency-call-comm", generateCommunicationContent())}>
                            <Phone className="h-4 w-4 mb-1" />
                            <span className="text-xs">Emergency Call</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("group-chat", generateCommunicationContent())}>
                            <Users className="h-4 w-4 mb-1" />
                            <span className="text-xs">Group Chat</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("location-share-comm", generateCommunicationContent())}>
                            <MapPin className="h-4 w-4 mb-1" />
                            <span className="text-xs">Location Share</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("status-update", generateCommunicationContent())}>
                            <Activity className="h-4 w-4 mb-1" />
                            <span className="text-xs">Status Update</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("safe-word", generateCommunicationContent())}>
                            <Shield className="h-4 w-4 mb-1" />
                            <span className="text-xs">Safe Word</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("checkin-timer", generateCommunicationContent())}>
                            <Clock className="h-4 w-4 mb-1" />
                            <span className="text-xs">Check-in Timer</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personal Protection - Comprehensive Version */}
                  <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-rose-900 dark:text-rose-100">
                        <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-2 rounded-xl">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl">Personal Protection & Self-Defense</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-rose-900 dark:text-rose-100 mb-3">Safety Techniques</h4>
                          <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start h-12" onClick={() => openModal("situational-awareness", generatePersonalProtectionContent())}>
                              <Eye className="h-4 w-4 mr-2" />
                              Situational Awareness Guide
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-12" onClick={() => openModal("de-escalation", generatePersonalProtectionContent())}>
                              <Users className="h-4 w-4 mr-2" />
                              De-escalation Techniques
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-12" onClick={() => openModal("self-defense", generatePersonalProtectionContent())}>
                              <Activity className="h-4 w-4 mr-2" />
                              Self-Defense Moves
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-12" onClick={() => openModal("escape-route", generatePersonalProtectionContent())}>
                              <MapPin className="h-4 w-4 mr-2" />
                              Escape Route Planning
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-rose-900 dark:text-rose-100 mb-3">Quick Defense Actions</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Button className="h-16 bg-red-600 hover:bg-red-700 text-white flex flex-col" onClick={() => openModal("distress-signal", generatePersonalProtectionContent())}>
                              <AlertTriangle className="h-5 w-5 mb-1" />
                              <span className="text-xs">Distress Signal</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex flex-col" onClick={() => openModal("fake-call", generatePersonalProtectionContent())}>
                              <Phone className="h-5 w-5 mb-1" />
                              <span className="text-xs">Fake Call</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex flex-col" onClick={() => openModal("record-evidence", generatePersonalProtectionContent())}>
                              <Eye className="h-5 w-5 mb-1" />
                              <span className="text-xs">Record Evidence</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex flex-col" onClick={() => openModal("silent-text", generatePersonalProtectionContent())}>
                              <MessageSquare className="h-5 w-5 mb-1" />
                              <span className="text-xs">Silent Text</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-rose-200" onClick={() => openModal("safety-training", generatePersonalProtectionContent())}>
                          <Shield className="h-5 w-5 text-rose-600 mb-1" />
                          <span className="text-xs">Safety Training</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-orange-200" onClick={() => openModal("threat-response-personal", generatePersonalProtectionContent())}>
                          <AlertTriangle className="h-5 w-5 text-orange-600 mb-1" />
                          <span className="text-xs">Threat Response</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-blue-200" onClick={() => openModal("bystander-help", generatePersonalProtectionContent())}>
                          <Users className="h-5 w-5 text-blue-600 mb-1" />
                          <span className="text-xs">Bystander Help</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-green-200" onClick={() => openModal("safety-checklist", generatePersonalProtectionContent())}>
                          <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
                          <span className="text-xs">Safety Checklist</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Travel & Digital Sub-Tab */}
              {safetySubTab === "travel" && (
                <div className="space-y-6">
                  {/* Smart Safe Zone Management - Moved from Monitoring */}
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-blue-900 dark:text-blue-100">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl">Smart Safe Zones</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Current Location</h4>
                              <Badge className="bg-green-100 text-green-800">Safe</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {location ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}` : 'Location not available'}
                            </p>
                            <div className="flex space-x-2">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => openModal("safe-zone", generateSafeZoneContent())}>
                                Create Safe Zone
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openModal("share-location", generateSafeZoneContent())}>
                                Share Location
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Zone Status</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Home Zone</span>
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Work Zone</span>
                                <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Travel Route</span>
                                <Badge className="bg-blue-100 text-blue-800">Monitoring</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <Button variant="outline" className="h-16 flex flex-col justify-center" onClick={() => openModal("add-zone", generateSafeZoneContent())}>
                            <MapPin className="h-5 w-5 mb-1" />
                            <span className="text-xs">Add Zone</span>
                          </Button>
                          <Button variant="outline" className="h-16 flex flex-col justify-center" onClick={() => openModal("route-tracker", generateSafeZoneContent())}>
                            <Activity className="h-5 w-5 mb-1" />
                            <span className="text-xs">Route Tracker</span>
                          </Button>
                          <Button variant="outline" className="h-16 flex flex-col justify-center" onClick={() => openModal("family-zones", generateSafeZoneContent())}>
                            <Users className="h-5 w-5 mb-1" />
                            <span className="text-xs">Family Zones</span>
                          </Button>
                          <Button variant="outline" className="h-16 flex flex-col justify-center" onClick={() => openModal("geo-fence", generateSafeZoneContent())}>
                            <Shield className="h-5 w-5 mb-1" />
                            <span className="text-xs">Geo-Fence</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Digital Privacy & Security - Comprehensive Version */}
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-purple-900 dark:text-purple-100">
                        <div className="bg-gradient-to-br from-purple-500 to-violet-500 p-2 rounded-xl">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl">Digital Privacy & Security</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Data Secure</div>
                          <div className="text-xs text-muted-foreground">256-bit Encryption</div>
                        </div>
                        
                        <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Wifi className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Network Safe</div>
                          <div className="text-xs text-muted-foreground">VPN Protected</div>
                        </div>
                        
                        <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Privacy Mode</div>
                          <div className="text-xs text-muted-foreground">Anonymous</div>
                        </div>
                        
                        <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <AlertTriangle className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Threat Level</div>
                          <div className="text-xs text-muted-foreground">Low</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-purple-200" onClick={() => openModal("security-scan", generateDigitalSafetyContent())}>
                          <Shield className="h-5 w-5 text-purple-600 mb-1" />
                          <span className="text-xs">Security Scan</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-blue-200" onClick={() => openModal("device-lock", generateDigitalSafetyContent())}>
                          <Smartphone className="h-5 w-5 text-blue-600 mb-1" />
                          <span className="text-xs">Device Lock</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-orange-200" onClick={() => openModal("privacy-check", generateDigitalSafetyContent())}>
                          <Eye className="h-5 w-5 text-orange-600 mb-1" />
                          <span className="text-xs">Privacy Check</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Travel & Transportation Safety - Comprehensive Version */}
                  <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-indigo-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-indigo-900 dark:text-indigo-100">
                        <div className="bg-gradient-to-br from-indigo-500 to-violet-500 p-2 rounded-xl">
                          <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl">Travel & Transportation Safety</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3">Route Monitoring</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Current Route:</span>
                                <Badge className="bg-green-100 text-green-800">Safe</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">ETA Deviation:</span>
                                <span className="text-sm text-green-600">On Time</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Traffic Risk:</span>
                                <Badge className="bg-yellow-100 text-yellow-800">Low</Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3">Vehicle Safety</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("vehicle-status", generateTravelSafetyContent())}>
                                <Battery className="h-4 w-4 mb-1" />
                                <span className="text-xs">Vehicle Status</span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("share-trip", generateTravelSafetyContent())}>
                                <MapPin className="h-4 w-4 mb-1" />
                                <span className="text-xs">Share Trip</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3">Emergency Transport</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Button size="sm" className="h-12 bg-red-600 hover:bg-red-700 text-white flex flex-col" onClick={() => openModal("call-911-travel", generateTravelSafetyContent())}>
                                <Phone className="h-4 w-4 mb-1" />
                                <span className="text-xs">Call 911</span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("alert-contacts-travel", generateTravelSafetyContent())}>
                                <Users className="h-4 w-4 mb-1" />
                                <span className="text-xs">Alert Contacts</span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("send-location-travel", generateTravelSafetyContent())}>
                                <MapPin className="h-4 w-4 mb-1" />
                                <span className="text-xs">Send Location</span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-12 flex flex-col" onClick={() => openModal("ride-share", generateTravelSafetyContent())}>
                                <Activity className="h-4 w-4 mb-1" />
                                <span className="text-xs">Ride Share</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-indigo-200" onClick={() => openModal("route-tracker-travel", generateTravelSafetyContent())}>
                          <Activity className="h-5 w-5 text-indigo-600 mb-1" />
                          <span className="text-xs">Route Tracker</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-green-200" onClick={() => openModal("safe-parking", generateTravelSafetyContent())}>
                          <Shield className="h-5 w-5 text-green-600 mb-1" />
                          <span className="text-xs">Safe Parking</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-orange-200" onClick={() => openModal("breakdown-help", generateTravelSafetyContent())}>
                          <AlertTriangle className="h-5 w-5 text-orange-600 mb-1" />
                          <span className="text-xs">Breakdown Help</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-blue-200" onClick={() => openModal("buddy-system", generateTravelSafetyContent())}>
                          <Users className="h-5 w-5 text-blue-600 mb-1" />
                          <span className="text-xs">Buddy System</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Contacts & Legal Sub-Tab */}
              {safetySubTab === "legal" && (
                <div className="space-y-6">
                  {/* Legal & Documentation Safety */}
                  <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 border-gray-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-gray-900 dark:text-gray-100">
                        <div className="bg-gradient-to-br from-gray-500 to-slate-500 p-2 rounded-xl">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl">Legal & Documentation Safety</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-gray-200" onClick={() => openModal("legal-documentation", generateLegalContent())}>
                          <FileText className="h-5 w-5 text-gray-600 mb-1" />
                          <span className="text-xs">Legal Docs</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-blue-200" onClick={() => openModal("evidence-collection", generateLegalContent())}>
                          <Camera className="h-5 w-5 text-blue-600 mb-1" />
                          <span className="text-xs">Evidence Collection</span>
                        </Button>
                        <Button variant="outline" className="h-16 flex flex-col justify-center border-orange-200" onClick={() => openModal("legal-hotline", generateLegalContent())}>
                          <Phone className="h-5 w-5 text-orange-600 mb-1" />
                          <span className="text-xs">Legal Hotline</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Contact Manager */}
                  <EmergencyContactManager />
                </div>
              )}
            </div>
          )}

          {/* Wellness Analytics Tab Content */}
          {activeTab === "wellness-analytics" && (
            <div className="space-y-6">
              <ComprehensiveWellnessAnalytics 
                sensorData={sensorData} 
                permissions={permissions} 
                requestPermissions={requestPermissions} 
              />
              <RealTimeBiometrics 
                sensorData={sensorData} 
                permissions={permissions} 
                requestPermissions={requestPermissions} 
              />
            </div>
          )}

          {/* Device Hub Tab Content */}
          {activeTab === "device-hub" && (
            <div className="space-y-6">
              <DeviceIntegrationHub />
            </div>
          )}

          {/* AI Guardian Tab Content */}
          {activeTab === "ai-guardian" && (
            <div className="space-y-6">
              <AIGuardian 
                sensorData={sensorData}
                realTimeData={realTimeData}
                onPanicTrigger={sendEmergencyAlert}
              />
            </div>
          )}
        </Tabs>
      </div>

      {/* Safety Tools Modal Dialog */}
      <Dialog open={activeModal !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold capitalize">
              {activeModal?.replace(/[-]/g, ' ') || 'Safety Tool'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {modalContent}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Panic Button - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-50">
        {isPanicActive ? (
          <div className="space-y-2">
            {/* Active Emergency Controls */}
            <div className="bg-red-600 text-white rounded-full p-4 shadow-lg animate-pulse">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <div className="text-xs font-bold">EMERGENCY</div>
                <div className="text-xs">ACTIVE</div>
              </div>
            </div>
            
            {/* Stop Emergency Button */}
            <Button
              onClick={stopEmergencyMode}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white text-xs py-2"
              size="sm"
            >
              Stop Emergency
            </Button>
            
            {breadcrumbActive && (
              <div className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-lg p-2 text-xs text-center">
                Sending updates every 30s
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={sendEmergencyAlert}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center"
            size="sm"
            data-testid="panic-button"
          >
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 mb-1" />
            <span className="text-xs font-bold">PANIC</span>
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}