import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Shield, Zap, 
  Clock, Target, AlertTriangle, Heart, Brain, Phone, Mail,
  Download, Filter, Calendar, Eye, MousePointer
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [userSegment, setUserSegment] = useState('all');

  // User Engagement Data
  const engagementData = [
    { date: '2024-08-21', activeUsers: 1240, sessions: 3480, avgSessionTime: 12.4 },
    { date: '2024-08-22', activeUsers: 1380, sessions: 3920, avgSessionTime: 14.2 },
    { date: '2024-08-23', activeUsers: 1520, sessions: 4360, avgSessionTime: 13.8 },
    { date: '2024-08-24', activeUsers: 1450, sessions: 4120, avgSessionTime: 15.1 },
    { date: '2024-08-25', activeUsers: 1680, sessions: 4780, avgSessionTime: 16.3 },
    { date: '2024-08-26', activeUsers: 1590, sessions: 4520, avgSessionTime: 14.9 },
    { date: '2024-08-27', activeUsers: 1720, sessions: 4890, avgSessionTime: 17.2 }
  ];

  // Revenue Analytics
  const revenueData = [
    { month: 'Aug', guardian: 12450, professional: 4380, total: 16830 },
    { month: 'Sep', guardian: 13200, professional: 4920, total: 18120 },
    { month: 'Oct', guardian: 14100, professional: 5460, total: 19560 },
    { month: 'Nov', guardian: 15300, professional: 6120, total: 21420 },
    { month: 'Dec', guardian: 16800, professional: 6890, total: 23690 },
    { month: 'Jan', guardian: 18200, professional: 7560, total: 25760 },
    { month: 'Feb', guardian: 19400, professional: 8240, total: 27640 }
  ];

  // Feature Usage
  const featureUsageData = [
    { name: 'Panic Button', usage: 8920, color: '#EF4444' },
    { name: 'Mood Tracking', usage: 15680, color: '#3B82F6' },
    { name: 'AI Insights', usage: 12340, color: '#8B5CF6' },
    { name: 'Emergency Contacts', usage: 18950, color: '#10B981' },
    { name: 'Location Sharing', usage: 11220, color: '#F59E0B' },
    { name: 'Crisis Chat', usage: 4560, color: '#06B6D4' }
  ];

  // Emergency Response Metrics
  const emergencyData = [
    { type: 'Panic Button', count: 342, avgResponse: 2.1, resolved: 98.5 },
    { type: 'Fall Detection', count: 128, avgResponse: 1.8, resolved: 96.2 },
    { type: 'Audio Alert', count: 89, avgResponse: 3.2, resolved: 94.4 },
    { type: 'Manual Alert', count: 267, avgResponse: 2.7, resolved: 99.1 },
    { type: 'Biometric Alert', count: 45, avgResponse: 1.9, resolved: 97.8 }
  ];

  // User Acquisition Funnel
  const funnelData = [
    { stage: 'Visitors', count: 18420, percentage: 100 },
    { stage: 'Signups', count: 3680, percentage: 20 },
    { stage: 'Email Verified', count: 2940, percentage: 16 },
    { stage: 'Trial Started', count: 2350, percentage: 13 },
    { stage: 'First Emergency Setup', count: 1880, percentage: 10 },
    { stage: 'Converted to Paid', count: 940, percentage: 5 }
  ];

  // Key Metrics Cards
  const metrics: MetricCard[] = [
    {
      title: 'Monthly Active Users',
      value: '24,680',
      change: 12.5,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-blue-500',
      subtitle: '+2,840 this month'
    },
    {
      title: 'Monthly Recurring Revenue',
      value: '$27,640',
      change: 8.7,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-green-500',
      subtitle: '+$2,080 vs last month'
    },
    {
      title: 'Emergency Response Rate',
      value: '97.8%',
      change: 2.1,
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-red-500',
      subtitle: 'Avg 2.3s response time'
    },
    {
      title: 'Trial Conversion Rate',
      value: '42.3%',
      change: -1.2,
      icon: <Target className="h-5 w-5" />,
      color: 'bg-purple-500',
      subtitle: '940 conversions this month'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      change: 0.3,
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-pink-500',
      subtitle: 'Based on 1,240 reviews'
    },
    {
      title: 'AI Accuracy Score',
      value: '94.2%',
      change: 1.8,
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-indigo-500',
      subtitle: 'Threat detection accuracy'
    }
  ];

  // Retention Cohort Data
  const cohortData = [
    { cohort: 'Aug 2024', week1: 100, week2: 75, week3: 58, week4: 45, week8: 32, week12: 28 },
    { cohort: 'Sep 2024', week1: 100, week2: 78, week3: 62, week4: 48, week8: 35, week12: 31 },
    { cohort: 'Oct 2024', week1: 100, week2: 81, week3: 65, week4: 52, week8: 38, week12: 34 },
    { cohort: 'Nov 2024', week1: 100, week2: 83, week3: 68, week4: 55, week8: 41, week12: 37 },
    { cohort: 'Dec 2024', week1: 100, week2: 85, week3: 71, week4: 58, week8: 44, week12: 40 },
    { cohort: 'Jan 2025', week1: 100, week2: 87, week3: 74, week4: 61, week8: 47, week12: null },
    { cohort: 'Feb 2025', week1: 100, week2: 89, week3: 76, week4: 64, week8: null, week12: null }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userSegment} onValueChange={setUserSegment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="free">Free Users</SelectItem>
              <SelectItem value="trial">Trial Users</SelectItem>
              <SelectItem value="guardian">Guardian Users</SelectItem>
              <SelectItem value="professional">Professional Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`${metric.color} p-2 rounded-lg text-white`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    {metric.subtitle && (
                      <p className="text-xs text-gray-500">{metric.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change >= 0 ? 
                      <TrendingUp className="h-4 w-4 mr-1" /> : 
                      <TrendingDown className="h-4 w-4 mr-1" />
                    }
                    <span className="text-sm font-medium">
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>User engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="activeUsers" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Metrics</CardTitle>
                <CardDescription>Session count and average duration</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="sessions" fill="#10B981" />
                    <Line yAxisId="right" type="monotone" dataKey="avgSessionTime" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Monthly recurring revenue by plan type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Bar dataKey="guardian" stackId="a" fill="#3B82F6" name="Guardian Plan" />
                  <Bar dataKey="professional" stackId="a" fill="#10B981" name="Professional Plan" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Response Metrics</CardTitle>
                <CardDescription>Response times and resolution rates by alert type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{item.type}</p>
                          <p className="text-sm text-gray-600">{item.count} incidents</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{item.avgResponse}s</span> avg response
                        </p>
                        <Badge variant="outline" className="text-green-700 bg-green-50">
                          {item.resolved}% resolved
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Volume by Time</CardTitle>
                <CardDescription>Emergency alerts throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { hour: '00', alerts: 12 }, { hour: '02', alerts: 8 }, { hour: '04', alerts: 5 },
                    { hour: '06', alerts: 15 }, { hour: '08', alerts: 28 }, { hour: '10', alerts: 35 },
                    { hour: '12', alerts: 42 }, { hour: '14', alerts: 38 }, { hour: '16', alerts: 45 },
                    { hour: '18', alerts: 52 }, { hour: '20', alerts: 48 }, { hour: '22', alerts: 32 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="alerts" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Distribution</CardTitle>
              <CardDescription>Most popular VitalWatch features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={featureUsageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {featureUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {featureUsageData.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: feature.color }}
                        />
                        <span className="font-medium">{feature.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{feature.usage.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">uses this month</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Acquisition Funnel</CardTitle>
              <CardDescription>Conversion rates through the user journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{stage.stage}</p>
                          <p className="text-sm text-gray-600">{stage.count.toLocaleString()} users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{stage.percentage}%</p>
                        {index > 0 && (
                          <p className="text-sm text-gray-600">
                            {((stage.count / funnelData[index - 1].count) * 100).toFixed(1)}% conversion
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Retention Cohorts</CardTitle>
              <CardDescription>Percentage of users returning over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cohort</th>
                      <th className="text-center p-2">Week 1</th>
                      <th className="text-center p-2">Week 2</th>
                      <th className="text-center p-2">Week 3</th>
                      <th className="text-center p-2">Week 4</th>
                      <th className="text-center p-2">Week 8</th>
                      <th className="text-center p-2">Week 12</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{cohort.cohort}</td>
                        <td className="text-center p-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {cohort.week1}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant="outline" 
                            className={cohort.week2 >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {cohort.week2}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant="outline" 
                            className={cohort.week3 >= 60 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {cohort.week3}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant="outline" 
                            className={cohort.week4 >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {cohort.week4}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          {cohort.week8 ? (
                            <Badge variant="outline" 
                              className={cohort.week8 >= 40 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {cohort.week8}%
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-center p-2">
                          {cohort.week12 ? (
                            <Badge variant="outline" 
                              className={cohort.week12 >= 30 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {cohort.week12}%
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}