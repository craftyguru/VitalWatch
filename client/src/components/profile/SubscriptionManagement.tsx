import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  ArrowRight,
  Gift,
  Star,
  Zap,
  Loader2
} from "lucide-react";

export function SubscriptionManagement() {
  const features = useSubscription();
  
  // Calculate actual trial progress
  const calculateTrialProgress = () => {
    if (!features.isInTrial) return { daysUsed: 0, totalDays: 14, percentage: 0 };
    
    const trialStartDate = new Date();
    trialStartDate.setDate(trialStartDate.getDate() - (14 - features.trialDaysLeft));
    const daysUsed = 14 - features.trialDaysLeft;
    const percentage = (daysUsed / 14) * 100;
    
    return { daysUsed, totalDays: 14, percentage };
  };
  
  // Calculate next billing date (trial end date for trial users)
  const getNextBillingDate = () => {
    if (features.isInTrial) {
      const nextBilling = new Date();
      nextBilling.setDate(nextBilling.getDate() + features.trialDaysLeft);
      return nextBilling.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    // For paid subscriptions, we'd get this from Stripe
    return 'Not available';
  };
  
  const trialProgress = calculateTrialProgress();
  const nextBillingDate = getNextBillingDate();
  
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span>Guardian Pro</span>
            <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
              Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {features.isProTrial ? 'Trial Ends' : 'Next Billing'}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{nextBillingDate}</p>
            </div>
            
            <div className="text-center p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
              <CreditCard className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Cost</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {features.isProTrial ? 'Free Trial' : '$9.99'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
              <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Plan</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{features.planName}</p>
            </div>
          </div>
          
          {features.isProTrial && (
            <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
              <Gift className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                You're currently in your <strong>14-day free trial</strong>. 
                {features.trialDaysLeft > 0 
                  ? `${features.trialDaysLeft} days remaining.` 
                  : 'Trial has ended.'}
              </AlertDescription>
            </Alert>
          )}
          
          {features.isProTrial && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Trial Progress</span>
                <span>{trialProgress.daysUsed} of {trialProgress.totalDays} days used</span>
              </div>
              <Progress value={trialProgress.percentage} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Guardian Pro Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Emergency Features</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">AI-powered threat detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Real-time GPS tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited emergency contacts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">24/7 monitoring service</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Wellness Features</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Advanced mood analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Personalized coping tools</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Crisis intervention support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited data export</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Management */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {features.isInTrial ? 'No payment required during trial' : 'No payment method on file'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <Link href="/billing">
                View Billing History
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            <Button variant="outline">
              Download Invoice
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex flex-col space-y-2">
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950">
              Cancel Subscription
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              You can cancel anytime. Your subscription will remain active until the end of the current billing period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}