import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Shield,
  AlertTriangle,
  MapPin,
  Phone,
  Users,
  Zap,
  Activity,
  Settings,
  LogOut,
  Bell
} from "lucide-react";
import { Link } from "wouter";
import { EmergencyOverviewDashboard } from "@/components/EmergencyOverviewDashboard";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VersionBadge } from "@/components/VersionBadge";

export default function SafetyTools() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/95">
        <div className="px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {/* Back Button */}
              <Button variant="ghost" size="icon" asChild className="mr-2">
                <Link href="/userdash">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>

              <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-2xl shadow-lg overflow-hidden bg-white flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="VitalWatch Logo" 
                  className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1 sm:space-x-3">
                  <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-600 bg-clip-text text-transparent truncate">
                    VitalWatch Safety Tools
                  </h1>
                  <div className="hidden md:block">
                    <VersionBadge />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-medium truncate">
                  AI-powered vital signs monitoring with comprehensive crisis management
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
              <Badge className="bg-green-100 text-green-800 border-green-300 hidden sm:flex">
                All Systems Normal
              </Badge>

              {/* User Menu */}
              <div className="flex items-center space-x-1">
                {/* Logout Button */}
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
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Logout
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className="relative group">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center">
                    <ThemeToggle />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Theme
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center space-x-8 overflow-x-auto py-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-red-100 dark:bg-red-950/30 text-red-900 dark:text-red-100 rounded-lg border-b-2 border-red-500 whitespace-nowrap">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Overview</span>
            </button>
            
            <Link href="/userdash" className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors whitespace-nowrap">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Wellness Analytics</span>
            </Link>
            
            <button className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors whitespace-nowrap">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Device Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Welcome back, {userName}! 👋
              </h2>
              <p className="text-muted-foreground">
                Your comprehensive safety and emergency management dashboard
              </p>
            </div>
            <div className="hidden sm:flex space-x-2">
              <Button variant="outline" asChild>
                <Link href="/contacts">
                  <Users className="h-4 w-4 mr-2" />
                  Emergency Contacts
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Emergency Overview Dashboard */}
        <EmergencyOverviewDashboard />

        {/* Quick Actions Footer */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg p-6 border border-red-200/50">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col border-red-200 hover:bg-red-50" asChild>
              <Link href="/contacts">
                <Users className="h-6 w-6 mb-2 text-red-600" />
                <span className="text-sm">Manage Contacts</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col border-orange-200 hover:bg-orange-50" asChild>
              <Link href="/profile">
                <Settings className="h-6 w-6 mb-2 text-orange-600" />
                <span className="text-sm">Safety Settings</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col border-blue-200 hover:bg-blue-50" asChild>
              <Link href="/userdash">
                <Activity className="h-6 w-6 mb-2 text-blue-600" />
                <span className="text-sm">Wellness Dashboard</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col border-purple-200 hover:bg-purple-50" asChild>
              <Link href="/tools">
                <Zap className="h-6 w-6 mb-2 text-purple-600" />
                <span className="text-sm">Coping Tools</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}