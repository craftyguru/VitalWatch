import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Edit, LogOut, Crown } from "lucide-react";
import { VersionBadge } from "@/components/VersionBadge";

interface ProfileHeaderProps {
  user: any;
  userName: string;
  userInitials: string;
  onLogout: () => void;
}

export function ProfileHeader({ user, userName, userInitials, onLogout }: ProfileHeaderProps) {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-blue-100 dark:hover:bg-blue-900">
              <Link href="/home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="VitalWatch Logo" 
                  className="w-7 h-7 object-contain"
                />
              </div>
              <VersionBadge />
            </div>
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800">
                <AvatarImage src={user?.profileImage} alt={userName} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {userName}
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {user?.email}
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Guardian
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}