import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Crown, 
  Shield, 
  Brain, 
  Activity,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  DollarSign,
  BarChart3,
  Settings,
  Download,
  Calendar,
  User
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UsageData {
  aiInteractions: number;
  emergencyAlerts: number;
  locationRequests: number;
  biometricScans: number;
  totalCost: number;
  billingPeriod: string;
}

interface SubscriptionData {
  plan: 'free' | 'guardian' | 'professional';
  status: 'active' | 'cancelled' | 'trial';
  nextBilling: string;
  trialEndsAt?: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [usage, setUsage] = useState<UsageData>({
    aiInteractions: 847,
    emergencyAlerts: 12,
    locationRequests: 2340,
    biometricScans: 15670,
    totalCost: 8.42,
    billingPeriod: "November 2024"
  });
  
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'guardian',
    status: 'active',
    nextBilling: '2024-12-15',
    trialEndsAt: undefined
  });

  const [billingHistory, setBillingHistory] = useState([
    { date: '2024-11-01', amount: 9.99, plan: 'Guardian', status: 'paid' },
    { date: '2024-10-01', amount: 9.99, plan: 'Guardian', status: 'paid' },
    { date: '2024-09-01', amount: 9.99, plan: 'Guardian', status: 'paid' },
  ]);

  const planDetails = {
    free: {
      name: 'Essential',
      price: 0,
      limits: {
        aiInteractions: 10,
        emergencyAlerts: 5,
        locationRequests: 100,
        biometricScans: 500
      },
      features: ['Basic panic button', '5 emergency contacts', 'Community support']
    },
    guardian: {
      name: 'Guardian',
      price: 9.99,
      limits: {
        aiInteractions: 1000,
        emergencyAlerts: 100,
        locationRequests: 10000,
        biometricScans: 50000
      },
      features: ['AI threat detection', 'Unlimited contacts', '24/7 AI counselor', 'High-accuracy GPS']
    },
    professional: {
      name: 'Professional',
      price: 24.99,
      limits: {
        aiInteractions: -1, // unlimited
        emergencyAlerts: -1,
        locationRequests: -1,
        biometricScans: -1
      },
      features: ['Everything in Guardian', 'Family monitoring', 'Enterprise encryption', 'Dedicated support']
    }
  };

  const currentPlan = planDetails[subscription.plan];
  
  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const handleUpgrade = async (newPlan: string) => {
    try {
      const response = await apiRequest('POST', '/api/billing/upgrade', { plan: newPlan });
      if (response.ok) {
        toast({
          title: "Plan Updated",
          description: `Successfully upgraded to ${newPlan} plan.`,
        });
        // Refresh subscription data
        setSubscription(prev => ({ ...prev, plan: newPlan as any }));
      }
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Unable to process upgrade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDowngrade = async () => {
    try {
      const response = await apiRequest('POST', '/api/billing/downgrade');
      if (response.ok) {
        toast({
          title: "Plan Downgraded",
          description: "Your plan will be downgraded at the end of the current billing period.",
        });
      }
    } catch (error) {
      toast({
        title: "Downgrade Failed", 
        description: "Unable to process downgrade. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Usage</h1>
          <p className="text-muted-foreground">
            Manage your subscription and monitor AI usage costs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            className={`${
              subscription.status === 'active' ? 'bg-green-100 text-green-800' :
              subscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}
          >
            {subscription.status === 'active' ? 'Active' : 
             subscription.status === 'trial' ? 'Free Trial' : 'Cancelled'}
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            <Crown className="h-3 w-3 mr-1" />
            {currentPlan.name}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Details</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Current Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Plan</span>
                    <span className="text-xl font-bold">{currentPlan.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Monthly Cost</span>
                    <span className="text-xl font-bold text-green-600">
                      ${currentPlan.price}/month
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Next Billing</span>
                    <span>{new Date(subscription.nextBilling).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Included Features</h4>
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">This Month's Usage Cost</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    ${usage.totalCost.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on AI interactions and advanced features used
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Plan
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Brain className="h-8 w-8 text-purple-600 mb-2" />
                    <div className="text-2xl font-bold">{usage.aiInteractions}</div>
                    <div className="text-sm text-muted-foreground">AI Interactions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      ${(usage.aiInteractions * 0.005).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">$0.005 each</div>
                  </div>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.aiInteractions, currentPlan.limits.aiInteractions)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                    <div className="text-2xl font-bold">{usage.emergencyAlerts}</div>
                    <div className="text-sm text-muted-foreground">Emergency Alerts</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      ${(usage.emergencyAlerts * 0.10).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">$0.10 each</div>
                  </div>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.emergencyAlerts, currentPlan.limits.emergencyAlerts)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <MapPin className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold">{usage.locationRequests}</div>
                    <div className="text-sm text-muted-foreground">Location Requests</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      ${(usage.locationRequests * 0.001).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">$0.001 each</div>
                  </div>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.locationRequests, currentPlan.limits.locationRequests)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Activity className="h-8 w-8 text-green-600 mb-2" />
                    <div className="text-2xl font-bold">{usage.biometricScans}</div>
                    <div className="text-sm text-muted-foreground">Biometric Scans</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${(usage.biometricScans * 0.0002).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">$0.0002 each</div>
                  </div>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.biometricScans, currentPlan.limits.biometricScans)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Details Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Usage Analytics</CardTitle>
              <p className="text-muted-foreground">
                Track your AI usage patterns and costs for {usage.billingPeriod}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Usage breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Usage by Feature</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Brain className="h-5 w-5 text-purple-600" />
                          <span>AI Crisis Counseling</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{usage.aiInteractions}</div>
                          <div className="text-sm text-muted-foreground">interactions</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span>Emergency Detection</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{usage.emergencyAlerts}</div>
                          <div className="text-sm text-muted-foreground">alerts sent</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          <span>Location Tracking</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{usage.locationRequests}</div>
                          <div className="text-sm text-muted-foreground">GPS requests</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Cost Breakdown</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Base subscription</span>
                        <span className="font-bold">${currentPlan.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>AI interactions</span>
                        <span>${(usage.aiInteractions * 0.005).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Emergency alerts</span>
                        <span>${(usage.emergencyAlerts * 0.10).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Location requests</span>
                        <span>${(usage.locationRequests * 0.001).toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total this month</span>
                          <span>${(currentPlan.price + usage.totalCost).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(planDetails).map(([key, plan]) => (
              <Card 
                key={key} 
                className={`${
                  subscription.plan === key 
                    ? 'ring-2 ring-blue-500 shadow-xl' 
                    : 'hover:shadow-lg'
                } transition-all`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {subscription.plan === key && (
                      <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                    )}
                  </CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-lg text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {subscription.plan !== key && (
                    <Button 
                      className="w-full"
                      onClick={() => handleUpgrade(key)}
                      variant={plan.price > currentPlan.price ? "default" : "outline"}
                    >
                      {plan.price > currentPlan.price ? "Upgrade" : "Downgrade"} to {plan.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium">{bill.plan} Plan</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(bill.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold">${bill.amount}</span>
                      <Badge className="bg-green-100 text-green-800">
                        {bill.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}