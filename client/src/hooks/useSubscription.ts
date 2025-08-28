import { useAuth } from './useAuth';
import { useMemo } from 'react';

export interface SubscriptionFeatures {
  smsAlerts: number | 'unlimited';
  aiInteractions: number | 'unlimited';
  emergencyContacts: number | 'unlimited';
  canUseAdvancedFeatures: boolean;
  isProTrial: boolean;
  trialDaysLeft: number;
  planName: string;
}

export function useSubscription(): SubscriptionFeatures {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        smsAlerts: 0,
        aiInteractions: 10,
        emergencyContacts: 3,
        canUseAdvancedFeatures: false,
        isProTrial: false,
        trialDaysLeft: 0,
        planName: 'Free'
      };
    }

    // Check if user is in Pro trial
    const isProTrial = user.subscriptionPlan === 'pro' && user.guardianTrialStarted;
    const trialEndDate = user.guardianTrialEndDate ? new Date(user.guardianTrialEndDate) : null;
    const now = new Date();
    const trialDaysLeft = trialEndDate 
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    // If trial expired, treat as free user
    const isTrialExpired = isProTrial && trialDaysLeft <= 0;
    const effectivePlan = isTrialExpired ? 'free' : user.subscriptionPlan;

    switch (effectivePlan) {
      case 'pro':
      case 'guardian':
        return {
          smsAlerts: effectivePlan === 'pro' ? 'unlimited' : 500,
          aiInteractions: 'unlimited',
          emergencyContacts: 'unlimited',
          canUseAdvancedFeatures: true,
          isProTrial: isProTrial && trialDaysLeft > 0,
          trialDaysLeft,
          planName: isProTrial ? 'Pro Trial' : 'Guardian'
        };
      
      case 'professional':
        return {
          smsAlerts: 'unlimited',
          aiInteractions: 'unlimited',
          emergencyContacts: 'unlimited',
          canUseAdvancedFeatures: true,
          isProTrial: false,
          trialDaysLeft: 0,
          planName: 'Professional'
        };
      
      default: // free
        return {
          smsAlerts: 0,
          aiInteractions: 10,
          emergencyContacts: 3,
          canUseAdvancedFeatures: false,
          isProTrial: false,
          trialDaysLeft: 0,
          planName: 'Essential'
        };
    }
  }, [user]);
}

export function useFeatureAccess() {
  const subscription = useSubscription();
  
  return {
    canSendSMSAlerts: subscription.smsAlerts === 'unlimited' || subscription.smsAlerts > 0,
    canUseUnlimitedAI: subscription.aiInteractions === 'unlimited',
    canAddUnlimitedContacts: subscription.emergencyContacts === 'unlimited',
    canUseAdvancedMonitoring: subscription.canUseAdvancedFeatures,
    canUseFamilyDashboard: subscription.planName === 'Professional',
    isInTrial: subscription.isProTrial,
    trialDaysLeft: subscription.trialDaysLeft,
    needsUpgrade: !subscription.canUseAdvancedFeatures && !subscription.isProTrial
  };
}