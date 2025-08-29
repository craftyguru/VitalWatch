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
  isInTrial: boolean;
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
        planName: 'Essential',
        isInTrial: false
      };
    }

    // Check trial status based on actual database fields
    const userAny = user as any;
    const isInTrial = userAny.guardianTrialStarted && userAny.subscriptionStatus === 'trial';
    const trialEndDate = userAny.guardianTrialEndDate ? new Date(userAny.guardianTrialEndDate) : null;
    const now = new Date();
    const trialDaysLeft = trialEndDate 
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    // Check if user has active paid subscription (Stripe confirmed)
    const hasPaidSubscription = userAny.subscriptionStatus === 'active' && userAny.stripeSubscriptionId;
    
    // Determine effective plan based on payment status
    let effectivePlan = userAny.subscriptionPlan || 'free';
    
    // If trial expired and no paid subscription, downgrade to free
    const isTrialExpired = isInTrial && trialDaysLeft <= 0;
    if (isTrialExpired && !hasPaidSubscription) {
      effectivePlan = 'free';
    }
    
    // If subscription cancelled or expired, downgrade to free
    if (userAny.subscriptionStatus === 'cancelled' || userAny.subscriptionStatus === 'expired') {
      effectivePlan = 'free';
    }

    // Return features based on actual payment/trial status
    switch (effectivePlan) {
      case 'guardian':
        return {
          smsAlerts: 500, // Guardian plan gets 500 SMS/month
          aiInteractions: 'unlimited',
          emergencyContacts: 'unlimited',
          canUseAdvancedFeatures: true,
          isProTrial: isInTrial && trialDaysLeft > 0,
          trialDaysLeft: isInTrial ? trialDaysLeft : 0,
          planName: (isInTrial && trialDaysLeft > 0) ? 'Pro Trial' : 'Guardian',
          isInTrial: isInTrial && trialDaysLeft > 0
        };
      
      case 'professional':
        return {
          smsAlerts: 'unlimited',
          aiInteractions: 'unlimited',
          emergencyContacts: 'unlimited',
          canUseAdvancedFeatures: true,
          isProTrial: false,
          trialDaysLeft: 0,
          planName: 'Professional',
          isInTrial: false
        };
      
      default: // free
        return {
          smsAlerts: 0, // No SMS alerts on free plan
          aiInteractions: 10, // Limited AI interactions
          emergencyContacts: 3, // Limited emergency contacts
          canUseAdvancedFeatures: false,
          isProTrial: false,
          trialDaysLeft: 0,
          planName: 'Essential',
          isInTrial: false
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