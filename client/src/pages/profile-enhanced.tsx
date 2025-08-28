import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSettingsSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { SecuritySettings } from "@/components/profile/SecuritySettings";
import { NotificationSettings } from "@/components/profile/NotificationSettings";
import { SubscriptionManagement } from "@/components/profile/SubscriptionManagement";
import { DataExport } from "@/components/profile/DataExport";
import { 
  User,
  Shield,
  Bell,
  Lock,
  UserCheck,
  LifeBuoy,
  Settings,
  CreditCard,
  Download
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
      {/* Header Component */}
      <ProfileHeader 
        user={user}
        userName={userName}
        userInitials={userInitials}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Enhanced Tab Navigation - Mobile Responsive */}
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="overview" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden xs:block">Alerts</span>
                <span className="text-xs sm:text-sm font-medium xs:hidden">📱</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden xs:block">Pro</span>
                <span className="text-xs sm:text-sm font-medium xs:hidden">💳</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden xs:block">Data</span>
                <span className="text-xs sm:text-sm font-medium xs:hidden">📊</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex flex-col items-center space-y-1 sm:space-y-2 py-2 sm:py-4 px-2 sm:px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
                <LifeBuoy className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium hidden xs:block">Help</span>
                <span className="text-xs sm:text-sm font-medium xs:hidden">🆘</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <ProfileStats 
              totalMoodEntries={totalMoodEntries}
              totalContacts={totalContacts}
              totalCopingSessions={totalCopingSessions}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-8">
            <SecuritySettings 
              form={settingsForm}
              isLoading={updateSettingsMutation.isPending}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-8">
            <NotificationSettings 
              form={settingsForm}
              isLoading={updateSettingsMutation.isPending}
            />
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-8">
            <SubscriptionManagement />
          </TabsContent>

          {/* Data Export Tab */}
          <TabsContent value="data" className="space-y-8">
            <DataExport />
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-8">
            <div className="text-center py-12">
              <LifeBuoy className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Support Center
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Coming soon - comprehensive help and support resources
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}