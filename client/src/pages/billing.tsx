import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription, useFeatureAccess } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Crown,
  Check,
  X,
  ArrowLeft,
  Star,
  Shield,
  AlertTriangle,
  Clock,
  CreditCard
} from 'lucide-react';

export default function BillingPage() {
  const { user } = useAuth();
  const subscription = useSubscription();
  const features = useFeatureAccess();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: 'guardian' | 'professional') => {
    setLoading(plan);
    try {
      const response = await apiRequest('POST', '/api/create-subscription', { plan });
      const data = await response.json();
      
      if (data.clientSecret) {
        // Redirect to Stripe Checkout or handle payment
        window.location.href = `/checkout?plan=${plan}&client_secret=${data.clientSecret}`;
      }
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Essential',
      price: 'Free',
      description: 'Basic emergency features for personal safety',
      features: [
        'Manual panic button',
        '5 emergency contacts',
        'Basic location sharing',
        'Community support',
        'Limited AI interactions (10/month)'
      ],
      limitations: [
        'No advanced AI monitoring',
        'Basic location accuracy',
        'Limited sensor integration'
      ]
    },
    {
      id: 'guardian',
      name: 'Guardian',
      price: '$9.99',
      period: '/month',
      description: 'Advanced AI monitoring with comprehensive safety features',
      popular: true,
      features: [
        'Real-time AI threat detection',
        'Unlimited emergency contacts',
        'High-accuracy GPS tracking',
        'Advanced biometric monitoring',
        '24/7 AI crisis counselor',
        'Audio/video evidence recording',
        'Geofencing and safe zones',
        'Priority emergency response'
      ],
      limitations: []
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$24.99',
      period: '/month',
      description: 'Enterprise-grade security with family monitoring',
      features: [
        'Everything in Guardian',
        'Multi-device family monitoring',
        'Advanced analytics dashboard',
        'Custom AI training',
        'Professional mental health integration',
        'Enterprise-grade encryption',
        'Dedicated support specialist',
        'Custom integrations'
      ],
      limitations: []
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 dark:hover:bg-blue-900">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Billing & Subscription
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your VitalWatch subscription and billing
              </p>
            </div>
          </div>
        </div>

        {/* Current Plan Status */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-blue-900 dark:text-blue-100">
                    Current Plan: {subscription.planName}
                  </CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    {features.isInTrial && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {features.trialDaysLeft} days remaining in trial
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              
              {features.isInTrial && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <Star className="h-3 w-3 mr-1" />
                  Free Trial Active
                </Badge>
              )}
            </div>
          </CardHeader>
          
          {features.isInTrial && features.trialDaysLeft <= 3 && (
            <CardContent>
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
                  <div>
                    <h4 className="font-medium text-orange-800 dark:text-orange-200">
                      Your trial is ending soon!
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Upgrade now to continue enjoying all VitalWatch features without interruption.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrentPlan = (plan.id === 'free' && subscription.planName === 'Essential') ||
                                 (plan.id === 'guardian' && (subscription.planName === 'Guardian' || subscription.planName === 'Pro Trial')) ||
                                 (plan.id === 'professional' && subscription.planName === 'Professional');
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.popular ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                } ${isCurrentPlan ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    {plan.id === 'free' && <Shield className="h-6 w-6 text-white" />}
                    {plan.id === 'guardian' && <Crown className="h-6 w-6 text-white" />}
                    {plan.id === 'professional' && <Star className="h-6 w-6 text-white" />}
                  </div>
                  
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    {plan.period && <span className="text-lg text-gray-600 dark:text-gray-400">{plan.period}</span>}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start">
                        <X className="h-4 w-4 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{limitation}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : (plan.popular ? "default" : "outline")}
                    disabled={isCurrentPlan || loading === plan.id}
                    onClick={() => plan.id !== 'free' && handleUpgrade(plan.id as 'guardian' | 'professional')}
                  >
                    {loading === plan.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : plan.id === 'free' ? (
                      'Downgrade'
                    ) : (
                      'Upgrade Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>
              Track your feature usage and remaining allowances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {subscription.smsAlerts === 'unlimited' ? '∞' : '0'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  SMS Alerts {subscription.smsAlerts !== 'unlimited' && `/ ${subscription.smsAlerts}`}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {subscription.aiInteractions === 'unlimited' ? '∞' : '10+'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  AI Interactions {subscription.aiInteractions !== 'unlimited' && '/ 10'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {subscription.emergencyContacts === 'unlimited' ? '∞' : '5'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Emergency Contacts {subscription.emergencyContacts !== 'unlimited' && '/ 5'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}