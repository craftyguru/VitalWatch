import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailBlaster } from "@/components/admin/EmailBlaster";
import { AdvancedAnalytics } from "@/components/admin/AdvancedAnalytics";
import { AdminMessaging } from "@/components/admin/AdminMessaging";
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  CreditCard, 
  TrendingUp, 
  Shield,
  MessageSquare,
  Heart,
  Brain,
  DollarSign,
  UserCheck,
  Clock,
  BarChart3,
  Phone,
  Send,
  Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [smsTestPhone, setSmsTestPhone] = useState('');
  const [smsTestMessage, setSmsTestMessage] = useState('Test emergency alert from VitalWatch');

  // Fetch admin analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: emergencyIncidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ["/api/admin/emergency-incidents"],
  });

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["/api/admin/subscriptions"],
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/admin/system-health"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: string; updates: any }) =>
      apiRequest("PATCH", `/api/admin/users/${data.userId}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resolveIncidentMutation = useMutation({
    mutationFn: (incidentId: number) =>
      apiRequest("PATCH", `/api/admin/incidents/${incidentId}`, { status: "resolved" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emergency-incidents"] });
      toast({ title: "Incident resolved successfully" });
    },
  });

  const testSmsMutation = useMutation({
    mutationFn: (data: { phoneNumber: string; message: string }) =>
      apiRequest("POST", "/api/test-sms", data),
    onSuccess: (response) => {
      toast({
        title: "SMS Test Successful",
        description: response.details + " - " + response.cost,
      });
    },
    onError: (error: any) => {
      toast({
        title: "SMS Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUserStatusChange = (userId: string, status: string) => {
    updateUserMutation.mutate({ userId, updates: { status } });
  };

  const handleResolveIncident = (incidentId: number) => {
    resolveIncidentMutation.mutate(incidentId);
  };

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden bg-white shadow-lg">
              <img 
                src="/logo.png" 
                alt="VitalWatch Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">VitalWatch Admin Dashboard</h1>
              <p className="text-purple-200 mt-2">Comprehensive platform monitoring and management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
              <Shield className="w-4 h-4 mr-1" />
              System Healthy
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500">
              <Clock className="w-4 h-4 mr-1" />
              Live Data
            </Badge>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics?.totalUsers || 0}</div>
              <p className="text-xs text-slate-400">
                +{analytics?.newUsersToday || 0} today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Active Emergencies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics?.activeEmergencies || 0}</div>
              <p className="text-xs text-slate-400">
                {analytics?.emergenciesToday || 0} incidents today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Pro Subscribers</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics?.proSubscribers || 0}</div>
              <p className="text-xs text-slate-400">
                ${analytics?.monthlyRevenue || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">AI Insights</CardTitle>
              <Brain className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics?.aiInsightsToday || 0}</div>
              <p className="text-xs text-slate-400">
                {analytics?.criticalInsights || 0} critical alerts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700 grid grid-cols-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="messaging" className="data-[state=active]:bg-purple-500">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-purple-500">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-500">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="emergencies" className="data-[state=active]:bg-purple-500">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergencies
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-purple-500">
              <DollarSign className="w-4 h-4 mr-2" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-purple-500">
              <Activity className="w-4 h-4 mr-2" />
              Health
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Activity Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">User Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    <TrendingUp className="w-8 h-8 mr-2" />
                    Activity visualization would appear here
                  </div>
                </CardContent>
              </Card>

              {/* Recent Emergency Alerts */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Emergency Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {emergencyIncidents?.slice(0, 3).map((incident: any) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          incident.severity === 'critical' ? 'text-red-400' : 
                          incident.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{incident.type.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-slate-400 text-sm">{format(new Date(incident.createdAt), 'MMM dd, HH:mm')}</p>
                        </div>
                      </div>
                      <Badge variant={incident.status === 'active' ? 'destructive' : 'secondary'}>
                        {incident.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <AdvancedAnalytics />
            </div>
          </TabsContent>

          {/* Admin Messaging Tab */}
          <TabsContent value="messaging">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg h-[800px]">
              <AdminMessaging />
            </div>
          </TabsContent>

          {/* Email Blaster Tab */}
          <TabsContent value="email">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <EmailBlaster />
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-200 p-3">User</th>
                        <th className="text-left text-slate-200 p-3">Plan</th>
                        <th className="text-left text-slate-200 p-3">Status</th>
                        <th className="text-left text-slate-200 p-3">Joined</th>
                        <th className="text-left text-slate-200 p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((user: any) => (
                        <tr key={user.id} className="border-b border-slate-700/50">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.firstName?.[0] || user.username?.[0] || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-slate-400 text-sm">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={user.subscriptionPlan === 'pro' ? 'default' : 'secondary'}>
                              {user.subscriptionPlan}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                              {user.emailVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </td>
                          <td className="p-3 text-slate-300">
                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-slate-600">
                                View
                              </Button>
                              {user.isAdmin && (
                                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergencies Tab */}
          <TabsContent value="emergencies">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Emergency Incident Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyIncidents?.map((incident: any) => (
                    <div key={incident.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className={`w-6 h-6 ${
                            incident.severity === 'critical' ? 'text-red-400' : 
                            incident.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                          }`} />
                          <div>
                            <h3 className="text-white font-medium">{incident.type.replace('_', ' ').toUpperCase()}</h3>
                            <p className="text-slate-400 text-sm">{format(new Date(incident.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={incident.severity === 'critical' ? 'destructive' : 'default'}>
                            {incident.severity}
                          </Badge>
                          <Badge variant={incident.status === 'active' ? 'destructive' : 'secondary'}>
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                      {incident.description && (
                        <p className="text-slate-300 mb-3">{incident.description}</p>
                      )}
                      {incident.status === 'active' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveIncident(incident.id)}
                          disabled={resolveIncidentMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Subscription Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-400">${analytics?.monthlyRevenue || 0}</div>
                      <p className="text-slate-400">This month</p>
                      <div className="mt-4">
                        <div className="text-sm text-slate-300">Annual: ${analytics?.annualRevenue || 0}</div>
                        <div className="text-sm text-slate-300">Growth: +{analytics?.revenueGrowth || 0}%</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Active Trials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-400">{analytics?.activeTrials || 0}</div>
                      <p className="text-slate-400">14-day Pro trials</p>
                      <div className="mt-4">
                        <div className="text-sm text-slate-300">Conversion rate: {analytics?.trialConversion || 0}%</div>
                        <div className="text-sm text-slate-300">Expiring soon: {analytics?.trialsExpiringSoon || 0}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Churn Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-400">{analytics?.churnRate || 0}%</div>
                      <p className="text-slate-400">Monthly churn rate</p>
                      <div className="mt-4">
                        <div className="text-sm text-slate-300">Cancelled: {analytics?.cancelledThisMonth || 0}</div>
                        <div className="text-sm text-slate-300">At risk: {analytics?.usersAtRisk || 0}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">API Response Time</span>
                    <span className="text-green-400">{systemHealth?.apiResponseTime || 0}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Database Performance</span>
                    <span className="text-green-400">{systemHealth?.dbResponseTime || 0}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Active Connections</span>
                    <span className="text-blue-400">{systemHealth?.activeConnections || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Uptime</span>
                    <span className="text-green-400">{systemHealth?.uptime || '99.9%'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Service Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-slate-300">API Server</span>
                    </div>
                    <span className="text-green-400">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-slate-300">Database</span>
                    </div>
                    <span className="text-green-400">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-slate-300">Emergency Services</span>
                    </div>
                    <span className="text-green-400">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-slate-300">SMS Service</span>
                    </div>
                    <span className="text-yellow-400">Limited</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SMS Testing Tab */}
          <TabsContent value="sms-test" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Twilio SMS Testing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        Phone Number (include +1)
                      </label>
                      <Input
                        placeholder="+1234567890"
                        value={smsTestPhone}
                        onChange={(e) => setSmsTestPhone(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        Test Message
                      </label>
                      <Textarea
                        placeholder="Test emergency alert message"
                        value={smsTestMessage}
                        onChange={(e) => setSmsTestMessage(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                      />
                    </div>
                    
                    <Button
                      onClick={() => testSmsMutation.mutate({ 
                        phoneNumber: smsTestPhone, 
                        message: smsTestMessage 
                      })}
                      disabled={testSmsMutation.isPending || !smsTestPhone || !smsTestMessage}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {testSmsMutation.isPending ? 'Sending...' : 'Send Test SMS'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">SMS Cost Breakdown</h4>
                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex justify-between">
                          <span>Single SMS segment (≤160 chars):</span>
                          <span>$0.008</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Long SMS (2+ segments):</span>
                          <span>$0.016+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guardian plan includes:</span>
                          <span>500/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overage pricing:</span>
                          <span>$0.015</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                      <h4 className="text-blue-400 font-medium mb-2">Test Results</h4>
                      <p className="text-slate-300 text-sm">
                        SMS test results will appear here after sending.
                        Check your phone for the actual message delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}