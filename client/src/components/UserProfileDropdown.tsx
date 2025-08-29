import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription, useFeatureAccess } from '@/hooks/useSubscription';
import {
  User,
  Settings,
  CreditCard,
  Crown,
  LogOut,
  ChevronRight,
  Star,
  Clock
} from 'lucide-react';

interface UserProfileDropdownProps {
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function UserProfileDropdown({ onLogout, isLoggingOut }: UserProfileDropdownProps) {
  const { user } = useAuth();
  const subscription = useSubscription();
  const features = useFeatureAccess();
  
  if (!user) return null;

  const userInitials = ((user.firstName?.[0] || '') + (user.lastName?.[0] || '') || user.username?.[0] || user.email?.[0] || 'U').toUpperCase();
  const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'User';
  
  const planDetails = {
    name: subscription.planName,
    price: subscription.planName === 'Essential' ? 'Free' : 
           subscription.planName === 'Guardian' || subscription.planName === 'Pro Trial' ? '$9.99/month' : 
           '$24.99/month',
    color: subscription.planName === 'Essential' ? 'gray' : 
           subscription.planName === 'Guardian' || subscription.planName === 'Pro Trial' ? 'blue' : 'purple'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          data-testid="button-user-menu"
        >
          <Avatar className="h-8 w-8 border-2 border-gray-200 dark:border-gray-700">
            <AvatarImage src={user.profileImage} alt={userName} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          {/* Plan indicator badge */}
          {subscription.planName !== 'Essential' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Crown className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
        {/* User Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={user.profileImage} alt={userName} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {userName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
              <div className="flex items-center mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs font-medium ${
                    planDetails.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    planDetails.color === 'purple' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {subscription.planName !== 'Essential' && <Crown className="h-3 w-3 mr-1" />}
                  {planDetails.name}
                </Badge>
                
                {/* Trial indicator */}
                {features.isInTrial && (
                  <Badge 
                    variant="outline" 
                    className={`ml-2 text-xs ${
                      features.trialDaysLeft <= 3 ? 'border-orange-200 text-orange-700 bg-orange-50' : 'border-green-200 text-green-700 bg-green-50'
                    }`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {features.trialDaysLeft}d trial
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Trial Banner (if active) */}
        {features.isInTrial && (
          <div className={`p-3 m-3 rounded-lg border ${
            features.trialDaysLeft <= 3 
              ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800' 
              : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  features.trialDaysLeft <= 3 ? 'text-orange-800 dark:text-orange-200' : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {features.trialDaysLeft <= 3 ? 'Trial ending soon!' : 'Trial active'}
                </p>
                <p className={`text-xs ${
                  features.trialDaysLeft <= 3 ? 'text-orange-600 dark:text-orange-300' : 'text-blue-600 dark:text-blue-300'
                }`}>
                  {features.trialDaysLeft} days remaining
                </p>
              </div>
              {features.needsUpgrade && (
                <Link href="/billing">
                  <Button size="sm" className="text-xs h-7">
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <div className="p-1">
          <Link href="/profile">
            <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <User className="mr-3 h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">Personal Profile</div>
                <div className="text-xs text-gray-500">Manage your account settings</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </DropdownMenuItem>
          </Link>
          
          <Link href="/billing">
            <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <CreditCard className="mr-3 h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">Billing & Subscription</div>
                <div className="text-xs text-gray-500">
                  {subscription.planName === 'Essential' ? 'Upgrade to unlock features' : `${planDetails.price} • Active`}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-800" asChild>
            <Link href="/app-settings">
              <Settings className="mr-3 h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">App Settings</div>
                <div className="text-xs text-gray-500">Notifications, privacy & more</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <div className="p-1">
          <DropdownMenuItem 
            onClick={onLogout}
            disabled={isLoggingOut}
            className="cursor-pointer p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <div className="text-sm font-medium">
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}