import { useState } from "react";
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
  Zap
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("account");

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
      emergencyCountdown: userSettings?.emergencyCountdown || 180,
      autoDetectionEnabled: userSettings?.autoDetectionEnabled || true,
      voiceCommandsEnabled: userSettings?.voiceCommandsEnabled || false,
      locationSharingEnabled: userSettings?.locationSharingEnabled || true,
      notificationPreferences: userSettings?.notificationPreferences || {
        sms: true,
        email: true,
        push: true,
      },
      privacyLevel: userSettings?.privacyLevel || "standard",
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

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || "Friend" : "Friend";
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2);

  // Calculate stats
  const totalMoodEntries = moodEntries?.length || 0;
  const totalContacts = emergencyContacts?.length || 0;
  const totalCopingSessions = copingToolsUsage?.length || 0;

  // Update form when settings load
  useState(() => {
    if (userSettings) {
      settingsForm.reset({
        emergencyCountdown: userSettings.emergencyCountdown,
        autoDetectionEnabled: userSettings.autoDetectionEnabled,
        voiceCommandsEnabled: userSettings.voiceCommandsEnabled,
        locationSharingEnabled: userSettings.locationSharingEnabled,
        notificationPreferences: userSettings.notificationPreferences,
        privacyLevel: userSettings.privacyLevel,
      });
    }
  });

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
            <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm">
              <img 
                src="/logo.png" 
                alt="VitalWatch Logo" 
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-orange-500 to-pink-600 bg-clip-text text-transparent">Profile & Settings</h1>
              <p className="text-xs text-neutral-500">Manage your account and preferences</p>
            </div>
          </div>
          <Settings className="h-5 w-5 text-primary" />
        </div>
      </header>

      <div className="px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Profile Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                    <AvatarFallback className="bg-primary text-white text-2xl">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-neutral-800">{userName}</h2>
                    <p className="text-neutral-600">{user?.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Account Active
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1 text-blue-500" />
                        Verified
                      </Badge>
                      {user?.isAdmin && (
                        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                          <Settings className="h-3 w-3 mr-1" />
                          Administrator
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Account Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalMoodEntries}</div>
                    <div className="text-sm text-neutral-600">Mood Entries</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{totalContacts}</div>
                    <div className="text-sm text-neutral-600">Emergency Contacts</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{totalCopingSessions}</div>
                    <div className="text-sm text-neutral-600">Coping Sessions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Panel Access - Only for Admin Users */}
            {user?.isAdmin && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <span className="text-purple-800 dark:text-purple-200">Administrator Panel</span>
                  </CardTitle>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Access admin dashboard with user management, analytics, and system monitoring
                  </p>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <Link href="/admin" data-testid="link-admin-dashboard">
                      <Settings className="h-4 w-4 mr-2" />
                      Open Admin Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <span>Account Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-neutral-600" />
                    <div>
                      <div className="font-medium">Export Data</div>
                      <div className="text-sm text-neutral-500">Download your mood and wellness data</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <LogOut className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium text-red-800">Sign Out</div>
                      <div className="text-sm text-red-600">Log out of your account</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These settings control how emergency alerts work. Changes are saved automatically.
              </AlertDescription>
            </Alert>

            <Form {...settingsForm}>
              <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-6">
                {/* Emergency Countdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span>Emergency Countdown</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={settingsForm.control}
                      name="emergencyCountdown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auto-escalation Timer (seconds)</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value.toString()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select countdown duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="120">2 minutes</SelectItem>
                                <SelectItem value="180">3 minutes (recommended)</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                                <SelectItem value="600">10 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Time before emergency services are automatically contacted if alert isn't cancelled
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Detection Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <span>AI Detection</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={settingsForm.control}
                      name="autoDetectionEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Crisis Pattern Detection</FormLabel>
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
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Voice Commands</FormLabel>
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

                {/* Location Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-green-500" />
                      <span>Location Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={settingsForm.control}
                      name="locationSharingEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Share Location in Emergencies</FormLabel>
                            <FormDescription>
                              Automatically share GPS location with emergency contacts
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

                <Button 
                  type="submit" 
                  disabled={updateSettingsMutation.isPending}
                  className="w-full"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Emergency Settings
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Form {...settingsForm}>
              <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-6">
                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-blue-500" />
                      <span>Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={settingsForm.control}
                      name="notificationPreferences.sms"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="h-5 w-5 text-green-500" />
                            <div className="space-y-0.5">
                              <FormLabel>SMS Notifications</FormLabel>
                              <FormDescription>Receive emergency alerts via text message</FormDescription>
                            </div>
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
                      name="notificationPreferences.email"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-blue-500" />
                            <div className="space-y-0.5">
                              <FormLabel>Email Notifications</FormLabel>
                              <FormDescription>Receive emergency alerts via email</FormDescription>
                            </div>
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
                      name="notificationPreferences.push"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Globe className="h-5 w-5 text-purple-500" />
                            <div className="space-y-0.5">
                              <FormLabel>Push Notifications</FormLabel>
                              <FormDescription>Receive browser and app notifications</FormDescription>
                            </div>
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

                {/* Privacy Level */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lock className="h-5 w-5 text-red-500" />
                      <span>Privacy Level</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={settingsForm.control}
                      name="privacyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Collection Level</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select privacy level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minimal">
                                  Minimal - Only essential emergency data
                                </SelectItem>
                                <SelectItem value="standard">
                                  Standard - Emergency + basic wellness analytics
                                </SelectItem>
                                <SelectItem value="full">
                                  Full - Complete analytics for personalized insights
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Controls how much data is collected for AI insights and analytics
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  disabled={updateSettingsMutation.isPending}
                  className="w-full"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Privacy Settings
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            {/* Crisis Resources */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span>In Crisis Right Now?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-4">
                  If you're having thoughts of suicide or are in immediate danger, please reach out immediately:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={() => window.open('tel:988', '_self')}
                    className="bg-red-600 hover:bg-red-700 text-white justify-start"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call 988 - Suicide & Crisis Lifeline
                  </Button>
                  <Button 
                    onClick={() => window.open('tel:911', '_self')}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 justify-start"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call 911 - Emergency Services
                  </Button>
                  <Button 
                    onClick={() => window.open('sms:741741?body=HOME', '_self')}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Text HOME to 741741 - Crisis Text Line
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Send Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-purple-500" />
                  <span>Crisis Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-neutral-600 mb-4">
                  Get a comprehensive list of crisis support resources sent to you:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    onClick={() => sendResourcesMutation.mutate("email")}
                    disabled={sendResourcesMutation.isPending}
                    variant="outline"
                    className="justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email me crisis resources
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help & Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                  <span>Help & Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Info className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">App Guide</div>
                      <div className="text-sm text-neutral-500">Learn how to use VitalWatch</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Privacy Policy</div>
                      <div className="text-sm text-neutral-500">How we protect your data</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Contact Support</div>
                      <div className="text-sm text-neutral-500">Get help with the app</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* App Information */}
            <Card>
              <CardHeader>
                <CardTitle>About VitalWatch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Version</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Last Updated</span>
                  <span>January 2025</span>
                </div>
                <Separator />
                <p className="text-xs text-neutral-500 text-center">
                  VitalWatch provides 24/7 crisis support and mental health resources.
                  If you're in crisis, please call 988 or 911 immediately.
                </p>
              </CardContent>
            </Card>
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
          
          <Link href="/tools" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Wind className="h-5 w-5 mb-1" />
            <span className="text-xs">Tools</span>
          </Link>
          
          <Link href="/contacts" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Network</span>
          </Link>
          
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-blue-50 text-primary">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
