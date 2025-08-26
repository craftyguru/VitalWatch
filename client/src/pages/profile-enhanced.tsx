import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSettingsSchema } from "@shared/schema";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { 
  User,
  Settings,
  Shield,
  Bell,
  Phone,
  Mail,
  MapPin,
  Clock,
  Brain,
  Heart,
  LogOut,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  ExternalLink,
  ArrowLeft,
  Activity,
  TrendingUp,
  Wind,
  Users,
  Save,
  RefreshCw,
  Smartphone,
  Globe,
  Lock,
  UserCheck,
  Zap,
  Calendar,
  BarChart3,
  Mic,
  Volume2,
  Timer,
  Star,
  Award,
  Target,
  Headphones,
  Camera,
  FileText,
  Database,
  CloudUpload,
  ScanLine,
  Fingerprint,
  CreditCard,
  Wallet,
  Gauge,
  MessageSquare,
  BookOpen,
  GraduationCap,
  LifeBuoy,
  HelpCircle as Help,
  FileQuestion,
  Lightbulb,
  ChevronRight,
  Edit,
  Copy,
  Share2,
  Download as DownloadIcon,
  Upload,
  Trash2,
  Archive,
  AlertCircle,
  XCircle,
  Plus,
  Minus,
  RotateCcw,
  PowerOff,
  Wifi,
  WifiOff,
  Moon,
  Sun,
  Monitor,
  Palette
} from "lucide-react";

export default function ProfileEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user settings
  const { data: userSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/user-settings"],
  });

  // Fetch recent stats for overview
  const { data: moodEntries } = useQuery({
    queryKey: ["/api/mood-entries"],
  });

  const { data: emergencyContacts } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });

  const { data: copingToolsUsage } = useQuery({
    queryKey: ["/api/coping-tools-usage"],
  });

  // Settings form
  const settingsForm = useForm({
    resolver: zodResolver(updateUserSettingsSchema),
    defaultValues: {
      emergencyCountdown: (userSettings as any)?.emergencyCountdown || 180,
      autoDetectionEnabled: (userSettings as any)?.autoDetectionEnabled || true,
      voiceCommandsEnabled: (userSettings as any)?.voiceCommandsEnabled || false,
      locationSharingEnabled: (userSettings as any)?.locationSharingEnabled || true,
      notificationPreferences: (userSettings as any)?.notificationPreferences || {
        sms: true,
        email: true,
        push: true,
      },
      privacyLevel: (userSettings as any)?.privacyLevel || "standard",
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/user-settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send crisis resources mutation
  const sendResourcesMutation = useMutation({
    mutationFn: async (method: string) => {
      const response = await apiRequest("POST", "/api/send-crisis-resources", { method });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Crisis resources sent",
        description: `Resources sent via ${data.method}`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send resources",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSettingsSubmit = (data: any) => {
    updateSettingsMutation.mutate(data);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const userName = user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || (user as any).email?.split('@')[0] || "User" : "User";
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  // Calculate stats
  const totalMoodEntries = Array.isArray(moodEntries) ? moodEntries.length : 0;
  const totalContacts = Array.isArray(emergencyContacts) ? emergencyContacts.length : 0;
  const totalCopingSessions = Array.isArray(copingToolsUsage) ? copingToolsUsage.length : 0;

  // Update form when settings load
  useEffect(() => {
    if (userSettings) {
      settingsForm.reset({
        emergencyCountdown: (userSettings as any).emergencyCountdown,
        autoDetectionEnabled: (userSettings as any).autoDetectionEnabled,
        voiceCommandsEnabled: (userSettings as any).voiceCommandsEnabled,
        locationSharingEnabled: (userSettings as any).locationSharingEnabled,
        notificationPreferences: (userSettings as any).notificationPreferences,
        privacyLevel: (userSettings as any).privacyLevel,
      });
    }
  }, [userSettings, settingsForm]);

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
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile & Settings</h1>
                  <p className="text-slate-600 dark:text-slate-400">Comprehensive account and preference management</p>
                </div>
              </div>
            </div>
            
            {/* User Avatar & Status */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                  </div>
                </div>
                <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-800 shadow-lg">
                  <AvatarImage src={(user as any).profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Enhanced Tab Navigation */}
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-6 h-auto p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="overview" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <UserCheck className="h-5 w-5" />
                <span className="text-sm font-medium">Account</span>
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Emergency</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Bell className="h-5 w-5" />
                <span className="text-sm font-medium">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Lock className="h-5 w-5" />
                <span className="text-sm font-medium">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <LifeBuoy className="h-5 w-5" />
                <span className="text-sm font-medium">Support</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* User Profile Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24 ring-4 ring-blue-200 dark:ring-blue-800 shadow-lg">
                      <AvatarImage src={(user as any)?.profileImageUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{userName}</h2>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">{(user as any)?.email}</p>
                      <div className="flex items-center space-x-3 mt-3">
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Account Active
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 lg:ml-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-center mb-2">
                          <Heart className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalMoodEntries}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Mood Entries</div>
                      </div>
                      <div className="text-center p-4 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-center mb-2">
                          <Users className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalContacts}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Emergency Contacts</div>
                      </div>
                      <div className="text-center p-4 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-center mb-2">
                          <Wind className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCopingSessions}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Coping Sessions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Wellness Score</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">87%</p>
                      <p className="text-xs text-green-600 dark:text-green-400">+5% from last week</p>
                    </div>
                    <div className="bg-green-500 text-white p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Daily Streak</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">14</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">days active</p>
                    </div>
                    <div className="bg-blue-500 text-white p-3 rounded-xl">
                      <Calendar className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Sessions</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">28</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">this month</p>
                    </div>
                    <div className="bg-purple-500 text-white p-3 rounded-xl">
                      <Brain className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Achievements</p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">12</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">unlocked</p>
                    </div>
                    <div className="bg-orange-500 text-white p-3 rounded-xl">
                      <Award className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex items-center space-x-2 h-auto py-4" asChild>
                    <Link href="/tools">
                      <Wind className="h-5 w-5" />
                      <span>Breathing Tools</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2 h-auto py-4" asChild>
                    <Link href="/mood">
                      <Heart className="h-5 w-5" />
                      <span>Log Mood</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2 h-auto py-4" asChild>
                    <Link href="/contacts">
                      <Users className="h-5 w-5" />
                      <span>Emergency Contacts</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2 h-auto py-4" onClick={() => sendResourcesMutation.mutate('email')}>
                    <Mail className="h-5 w-5" />
                    <span>Crisis Resources</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={(user as any)?.firstName || ''} 
                      placeholder="Enter your first name"
                      readOnly
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={(user as any)?.lastName || ''} 
                      placeholder="Enter your last name"
                      readOnly
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={(user as any)?.email || ''} 
                      readOnly
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Personal information is managed through Replit Auth. Contact support for changes.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Account Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Account Verified</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Your account is fully verified</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <Fingerprint className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Two-Factor Authentication</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Managed through Replit Auth</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="destructive" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-6">
                    <Download className="h-6 w-6" />
                    <span className="text-sm">Export Data</span>
                    <span className="text-xs text-muted-foreground">Download your data</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-6">
                    <CloudUpload className="h-6 w-6" />
                    <span className="text-sm">Backup Settings</span>
                    <span className="text-xs text-muted-foreground">Cloud backup</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-6">
                    <Archive className="h-6 w-6" />
                    <span className="text-sm">Archive Data</span>
                    <span className="text-xs text-muted-foreground">Archive old entries</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-6 border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-6 w-6" />
                    <span className="text-sm">Delete Account</span>
                    <span className="text-xs">Permanent deletion</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <Form {...settingsForm}>
              <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Emergency Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Emergency Countdown</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={settingsForm.control}
                        name="emergencyCountdown"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auto-escalation Timer (seconds)</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  max={300}
                                  min={30}
                                  step={30}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>30s</span>
                                  <span className="font-semibold">{field.value}s</span>
                                  <span>5min</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Time before emergency services are automatically contacted if alert isn't cancelled
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Recommended:</strong> 3 minutes (180 seconds) for optimal response time
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* AI Detection Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="h-5 w-5" />
                        <span>AI Detection</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={settingsForm.control}
                        name="autoDetectionEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Crisis Pattern Detection</FormLabel>
                              <FormDescription>
                                Allow AI to analyze mood patterns for crisis indicators
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={settingsForm.control}
                        name="voiceCommandsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Voice Commands</FormLabel>
                              <FormDescription>
                                Enable hands-free emergency activation via voice
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Location Services */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Location Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={settingsForm.control}
                      name="locationSharingEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Share Location in Emergencies</FormLabel>
                            <FormDescription>
                              Automatically share GPS location with emergency contacts and services
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => settingsForm.reset()}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Emergency Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notification Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Methods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive emergency alerts via text message</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive emergency alerts via email</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Get real-time alerts and app notifications</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quiet Hours</Label>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="22:00">
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="From" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="21:00">9:00 PM</SelectItem>
                          <SelectItem value="22:00">10:00 PM</SelectItem>
                          <SelectItem value="23:00">11:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">to</span>
                      <Select defaultValue="07:00">
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="To" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">6:00 AM</SelectItem>
                          <SelectItem value="07:00">7:00 AM</SelectItem>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Emergency Override</Label>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <span className="text-sm">Emergency alerts bypass quiet hours</span>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Sound</Label>
                    <Select defaultValue="alert">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alert">Alert (Default)</SelectItem>
                        <SelectItem value="chime">Gentle Chime</SelectItem>
                        <SelectItem value="urgent">Urgent Tone</SelectItem>
                        <SelectItem value="silent">Silent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Privacy Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Privacy Level</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Collection Level</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal - Emergency & basic wellness analytics</SelectItem>
                        <SelectItem value="standard">Standard - Enhanced insights and analytics</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive - Full AI analysis and predictions</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Controls how much data is collected for AI insights and analytics
                    </p>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      All data remains encrypted and private. Emergency functions always work regardless of privacy level.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Data Sharing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Share2 className="h-5 w-5" />
                    <span>Data Sharing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Anonymous Analytics</p>
                      <p className="text-sm text-muted-foreground">Help improve the app with anonymous usage data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Research Participation</p>
                      <p className="text-sm text-muted-foreground">Contribute anonymized data to mental health research</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Emergency Contact Sharing</p>
                      <p className="text-sm text-muted-foreground">Share basic wellness updates with emergency contacts</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Privacy Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Privacy Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex items-center space-x-2 h-auto py-4">
                    <FileText className="h-5 w-5" />
                    <span>Privacy Policy</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2 h-auto py-4">
                    <Shield className="h-5 w-5" />
                    <span>Data Security</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2 h-auto py-4">
                    <Globe className="h-5 w-5" />
                    <span>Your Rights</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            {/* Crisis Resources */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-950/20">
                <CardTitle className="flex items-center space-x-2 text-red-900 dark:text-red-100">
                  <AlertTriangle className="h-5 w-5" />
                  <span>In Crisis Right Now?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-red-800 dark:text-red-200 mb-4">
                  If you're having thoughts of suicide or are in immediate danger, please reach out immediately:
                </p>
                <div className="space-y-3">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
                    <Phone className="h-5 w-5 mr-2" />
                    Call 988 - Suicide & Crisis Lifeline
                  </Button>
                  <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50" size="lg">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Text HOME to 741741 - Crisis Text Line
                  </Button>
                  <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50" size="lg">
                    <Phone className="h-5 w-5 mr-2" />
                    Call 911 - Emergency Services
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Help & Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5" />
                    <span>Help & Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="/help/getting-started">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Getting Started Guide</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="/help/emergency-features">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>How Emergency Features Work</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="/help/privacy">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Privacy & Data Protection</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Contact Support</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* App Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5" />
                    <span>About VitalWatch</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Version</span>
                      <span className="text-sm font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm font-medium">January 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Build</span>
                      <span className="text-sm font-medium">2025.01.26</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Terms of Service
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Privacy Policy
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Source Licenses
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    VitalWatch provides 24/7 crisis support and mental health resources. If you're in crisis, please call 988 immediately.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Crisis Resources Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LifeBuoy className="h-5 w-5" />
                  <span>Crisis Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get a comprehensive list of crisis support resources sent to you.
                </p>
                <Button 
                  onClick={() => sendResourcesMutation.mutate('email')}
                  disabled={sendResourcesMutation.isPending}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {sendResourcesMutation.isPending ? "Sending..." : "Email me crisis resources"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}