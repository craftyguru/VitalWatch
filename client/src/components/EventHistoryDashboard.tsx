import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Shield,
  Brain,
  MapPin,
  Phone,
  FileText,
  Download,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  Eye,
  Settings,
  ExternalLink,
  Trash2,
  Archive,
  Star,
  ChevronRight,
  Activity,
  Heart,
  CheckCircle
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

interface EventRecord {
  id: string;
  type: 'panic_button' | 'auto_detected' | 'guardian_ai' | 'crisis_chat' | 'mood_alert';
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'cancelled';
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  deviceData?: any;
  biometrics?: {
    heartRate?: number;
    stressLevel?: number;
    activityLevel?: number;
  };
  response?: {
    contactsNotified: number;
    responseTime?: number;
    resolved: boolean;
    notes?: string;
  };
  aiAnalysis?: {
    confidence: number;
    triggers: string[];
    recommendations: string[];
  };
}

export function EventHistoryDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [activeView, setActiveView] = useState<'timeline' | 'analytics' | 'insights'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Sample event data - in production this would come from the database
  const sampleEvents: EventRecord[] = [
    {
      id: 'incident-001',
      type: 'panic_button',
      title: 'Panic Button Activated',
      description: 'Manual panic button press during evening walk',
      severity: 'high',
      status: 'resolved',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      location: {
        lat: 37.7749,
        lng: -122.4194,
        address: '123 Main St, San Francisco, CA'
      },
      biometrics: {
        heartRate: 145,
        stressLevel: 89,
        activityLevel: 92
      },
      response: {
        contactsNotified: 3,
        responseTime: 45,
        resolved: true,
        notes: 'False alarm - user accidentally triggered button'
      }
    },
    {
      id: 'guardian-002',
      type: 'guardian_ai',
      title: 'Anomalous Behavior Pattern Detected',
      description: 'AI detected unusual movement patterns and elevated stress indicators',
      severity: 'medium',
      status: 'resolved',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      biometrics: {
        heartRate: 98,
        stressLevel: 72,
        activityLevel: 15
      },
      aiAnalysis: {
        confidence: 0.78,
        triggers: ['Irregular movement', 'Elevated heart rate', 'Location isolation'],
        recommendations: ['Check-in protocol', 'Breathing exercise suggestion', 'Contact availability check']
      },
      response: {
        contactsNotified: 1,
        resolved: true,
        notes: 'User confirmed safety via app response'
      }
    },
    {
      id: 'auto-003',
      type: 'auto_detected',
      title: 'Fall Detection Alert',
      description: 'Automatic fall detected by device sensors',
      severity: 'critical',
      status: 'resolved',
      timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      location: {
        lat: 37.7849,
        lng: -122.4094,
        address: 'Golden Gate Park, San Francisco, CA'
      },
      biometrics: {
        heartRate: 156,
        stressLevel: 95,
        activityLevel: 5
      },
      deviceData: {
        accelerometer: { x: -2.3, y: 8.9, z: -0.5 },
        impact: 'severe'
      },
      response: {
        contactsNotified: 5,
        responseTime: 12,
        resolved: true,
        notes: 'User responded quickly, minor injury reported to contacts'
      }
    },
    {
      id: 'mood-004',
      type: 'mood_alert',
      title: 'Mental Health Risk Assessment',
      description: 'Concerning mood pattern identified through AI analysis',
      severity: 'medium',
      status: 'active',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      aiAnalysis: {
        confidence: 0.82,
        triggers: ['Declining mood trend', 'Reduced activity', 'Sleep pattern disruption'],
        recommendations: ['Professional consultation', 'Mood tracking increase', 'Support network activation']
      },
      response: {
        contactsNotified: 0,
        resolved: false,
        notes: 'Monitoring in progress'
      }
    },
    {
      id: 'crisis-005',
      type: 'crisis_chat',
      title: 'Crisis Chat Session Escalation',
      description: 'High-risk conversation escalated to human counselor',
      severity: 'high',
      status: 'resolved',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      aiAnalysis: {
        confidence: 0.91,
        triggers: ['Self-harm indicators', 'Crisis language', 'Emotional distress'],
        recommendations: ['Immediate human intervention', 'Safety plan activation', 'Emergency contact alert']
      },
      response: {
        contactsNotified: 2,
        responseTime: 8,
        resolved: true,
        notes: 'Successfully connected to crisis counselor, situation stabilized'
      }
    }
  ];

  // Filtering logic
  const filteredEvents = useMemo(() => {
    let events = sampleEvents;

    // Date range filtering
    if (dateRange !== 'all') {
      const days = parseInt(dateRange.replace('d', ''));
      const cutoff = subDays(new Date(), days);
      events = events.filter(event => event.timestamp > cutoff);
    }

    // Type filtering
    if (selectedFilter !== 'all') {
      events = events.filter(event => event.type === selectedFilter);
    }

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.status.toLowerCase().includes(query) ||
        event.severity.toLowerCase().includes(query)
      );
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [sampleEvents, dateRange, selectedFilter, searchQuery]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const criticalEvents = filteredEvents.filter(e => e.severity === 'critical').length;
    const resolvedEvents = filteredEvents.filter(e => e.status === 'resolved').length;
    const avgResponseTime = filteredEvents
      .filter(e => e.response?.responseTime)
      .reduce((acc, e) => acc + (e.response?.responseTime || 0), 0) / 
      filteredEvents.filter(e => e.response?.responseTime).length || 0;

    const typeBreakdown = {
      panic_button: filteredEvents.filter(e => e.type === 'panic_button').length,
      auto_detected: filteredEvents.filter(e => e.type === 'auto_detected').length,
      guardian_ai: filteredEvents.filter(e => e.type === 'guardian_ai').length,
      crisis_chat: filteredEvents.filter(e => e.type === 'crisis_chat').length,
      mood_alert: filteredEvents.filter(e => e.type === 'mood_alert').length,
    };

    return {
      totalEvents,
      criticalEvents,
      resolvedEvents,
      avgResponseTime,
      resolutionRate: totalEvents > 0 ? (resolvedEvents / totalEvents) * 100 : 0,
      typeBreakdown
    };
  }, [filteredEvents]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/50 border-red-200 dark:border-red-800';
      case 'high': return 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800';
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950/50 border-green-200 dark:border-green-800';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'panic_button': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'auto_detected': return <Shield className="w-4 h-4 text-orange-600" />;
      case 'guardian_ai': return <Brain className="w-4 h-4 text-blue-600" />;
      case 'crisis_chat': return <Heart className="w-4 h-4 text-purple-600" />;
      case 'mood_alert': return <Activity className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const exportData = (exportFormat: 'csv' | 'json' | 'pdf') => {
    let data: any = filteredEvents;
    let filename = `vitalwatch-events-${format(new Date(), 'yyyy-MM-dd')}`;
    
    if (exportFormat === 'csv') {
      const headers = ['Date', 'Type', 'Title', 'Severity', 'Status', 'Location', 'Response Time'];
      const csvData = [
        headers.join(','),
        ...data.map((event: EventRecord) => [
          format(event.timestamp, 'yyyy-MM-dd HH:mm:ss'),
          event.type,
          `"${event.title}"`,
          event.severity,
          event.status,
          `"${event.location?.address || 'Unknown'}"`,
          event.response?.responseTime || 'N/A'
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
    } else if (exportFormat === 'json') {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
    }
    
    toast({
      title: "Export Successful",
      description: `Event history exported as ${exportFormat.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Analytics Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100">Event History</CardTitle>
                <p className="text-sm text-blue-700 dark:text-blue-300">Complete log of all safety events and AI Guardian activities</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                className="border-blue-200"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalEvents}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Events</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{analytics.criticalEvents}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{analytics.resolvedEvents}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Resolved</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{analytics.resolutionRate.toFixed(0)}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Resolution Rate</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{analytics.avgResponseTime.toFixed(0)}s</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Response</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-events"
                />
              </div>
            </div>
            
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="panic_button">Panic Button</SelectItem>
                <SelectItem value="auto_detected">Auto-Detected</SelectItem>
                <SelectItem value="guardian_ai">Guardian AI</SelectItem>
                <SelectItem value="crisis_chat">Crisis Chat</SelectItem>
                <SelectItem value="mood_alert">Mood Alert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={(value: '7d' | '30d' | '90d' | 'all') => setDateRange(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'timeline' | 'analytics' | 'insights')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Events Found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  {searchQuery ? 'No events match your search criteria.' : 'No events found for the selected time range.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                  data-testid={`card-event-${event.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h3>
                            <Badge className={`text-xs ${getSeverityColor(event.severity)}`}>
                              {event.severity.toUpperCase()}
                            </Badge>
                            <Badge 
                              variant={event.status === 'resolved' ? 'default' : event.status === 'active' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {event.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(event.timestamp, 'MMM dd, yyyy HH:mm')}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Location recorded
                              </span>
                            )}
                            {event.response?.contactsNotified && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {event.response.contactsNotified} contacted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Event Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Event Type Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.typeBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(type)}
                      <span className="capitalize font-medium">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={analytics.totalEvents > 0 ? (count / analytics.totalEvents) * 100 : 0} 
                        className="w-24" 
                      />
                      <span className="text-sm font-semibold min-w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Response Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Response Time</span>
                    <span className="font-bold text-lg">{analytics.avgResponseTime.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</span>
                    <span className="font-bold text-lg text-green-600">{analytics.resolutionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Critical Events</span>
                    <span className="font-bold text-lg text-red-600">{analytics.criticalEvents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                    <span className="font-bold">
                      {filteredEvents.filter(e => 
                        e.timestamp > subDays(new Date(), 7)
                      ).length} events
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Monitoring</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                      Running
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Guardian AI Status</span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights View */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                AI Analysis & Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Pattern Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Identified Patterns</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-yellow-800 dark:text-yellow-200">Evening Activity Pattern</div>
                          <div className="text-sm text-yellow-700 dark:text-yellow-300">60% of incidents occur between 6-9 PM</div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Recommendation: Enhanced monitoring during evening hours</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-800 dark:text-blue-200">Stress Correlation</div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">Events correlate with elevated stress (&gt;70)</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Suggestion: Proactive stress management tools</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">AI Recommendations</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-green-800 dark:text-green-200">Safety Improvement</div>
                          <div className="text-sm text-green-700 dark:text-green-300">Consider adding more emergency contacts</div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">Current: 3 contacts | Recommended: 5+</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <Settings className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-purple-800 dark:text-purple-200">System Optimization</div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">Reduce false positive rate by 15%</div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Adjust sensitivity thresholds</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Risk Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-green-200 dark:border-green-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">LOW</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Current Risk Level</div>
                        <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                          Based on recent patterns and activity
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">94%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">System Confidence</div>
                        <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                          AI Guardian monitoring accuracy
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-orange-200 dark:border-orange-800">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-1">23</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Days Safe</div>
                        <div className="mt-2 text-xs text-orange-700 dark:text-orange-300">
                          Since last critical event
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedEvent && getEventTypeIcon(selectedEvent.type)}
              {selectedEvent?.title}
              <Badge className={`ml-auto ${selectedEvent && getSeverityColor(selectedEvent.severity)}`}>
                {selectedEvent?.severity.toUpperCase()}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                      <span className="font-medium">{format(selectedEvent.timestamp, 'PPp')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-medium capitalize">{selectedEvent.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <Badge variant={selectedEvent.status === 'resolved' ? 'default' : 'destructive'}>
                        {selectedEvent.status}
                      </Badge>
                    </div>
                    {selectedEvent.response?.responseTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                        <span className="font-medium">{selectedEvent.response.responseTime}s</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location & Biometrics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Context Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedEvent.location && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Location:</span>
                        <div className="mt-1 text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                          {selectedEvent.location.address}
                        </div>
                      </div>
                    )}
                    {selectedEvent.biometrics && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Biometrics:</span>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                          {selectedEvent.biometrics.heartRate && (
                            <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                              <div className="font-semibold text-red-600">{selectedEvent.biometrics.heartRate}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">BPM</div>
                            </div>
                          )}
                          {selectedEvent.biometrics.stressLevel && (
                            <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                              <div className="font-semibold text-orange-600">{selectedEvent.biometrics.stressLevel}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Stress</div>
                            </div>
                          )}
                          {selectedEvent.biometrics.activityLevel && (
                            <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                              <div className="font-semibold text-blue-600">{selectedEvent.biometrics.activityLevel}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Activity</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* AI Analysis (if available) */}
              {selectedEvent.aiAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-500" />
                      AI Guardian Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600 dark:text-gray-400">Confidence Level:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={selectedEvent.aiAnalysis.confidence * 100} className="w-20" />
                          <span className="font-semibold">{(selectedEvent.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Triggers Detected:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedEvent.aiAnalysis.triggers.map((trigger, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Recommendations:</span>
                        <div className="mt-2 space-y-2">
                          {selectedEvent.aiAnalysis.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                              <Star className="w-4 h-4 text-blue-500 mt-0.5" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Response Summary */}
              {selectedEvent.response && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      Response Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Contacts Notified:</span>
                        <span className="font-medium">{selectedEvent.response.contactsNotified}</span>
                      </div>
                      {selectedEvent.response.responseTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                          <span className="font-medium">{selectedEvent.response.responseTime} seconds</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Resolution Status:</span>
                        <Badge variant={selectedEvent.response.resolved ? 'default' : 'destructive'}>
                          {selectedEvent.response.resolved ? 'Resolved' : 'Ongoing'}
                        </Badge>
                      </div>
                      {selectedEvent.response.notes && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Notes:</span>
                          <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                            {selectedEvent.response.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Archive className="w-4 h-4 mr-1" />
                  Archive Event
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Generate Report
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Event History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Export your event history data for backup or analysis purposes.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  exportData('csv');
                  setShowExportDialog(false);
                }}
                className="justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV (Excel Compatible)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  exportData('json');
                  setShowExportDialog(false);
                }}
                className="justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as JSON (Technical Data)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  toast({
                    title: "PDF Export",
                    description: "PDF export feature coming soon!",
                  });
                  setShowExportDialog(false);
                }}
                className="justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF Report (Coming Soon)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}