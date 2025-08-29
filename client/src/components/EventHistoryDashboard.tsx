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
  audioRecording?: {
    filename: string;
    duration?: number;
    url?: string;
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

  // Fetch real user events from database
  const { data: userEvents = [], isLoading } = useQuery({
    queryKey: ['/api/events', { dateRange, type: selectedFilter }],
    enabled: !!user,
  });

  // Transform database events to EventRecord format
  const events: EventRecord[] = userEvents.map((event: any) => ({
    ...event,
    timestamp: new Date(event.createdAt || event.timestamp),
  }));

  // Filtering logic for real user data
  const filteredEvents = useMemo(() => {
    if (!events.length) return [];
    
    // Search filtering (other filters handled by API query)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return events.filter(event => 
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.status?.toLowerCase().includes(query) ||
        event.severity?.toLowerCase().includes(query)
      );
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events, searchQuery]);

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

  const downloadAudioRecording = async (audioRecording: { filename: string; duration?: number; url?: string }) => {
    try {
      if (audioRecording.url) {
        // Direct download from URL
        const a = document.createElement('a');
        a.href = audioRecording.url;
        a.download = audioRecording.filename;
        a.click();
      } else {
        // Fetch from API
        const response = await fetch(`/api/events/audio/${audioRecording.filename}`);
        if (!response.ok) throw new Error('Failed to fetch audio');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = audioRecording.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Download Started",
        description: `Audio recording: ${audioRecording.filename}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download audio recording",
        variant: "destructive"
      });
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
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading Events</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Fetching your safety event history...
                </p>
              </CardContent>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {searchQuery ? 'No Events Match Your Search' : 'No Events Yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters.' 
                    : 'Your safety events and Guardian AI activities will appear here once you start using VitalWatch.'}
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
                            {event.audioRecording && (
                              <span className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadAudioRecording(event.audioRecording!);
                                  }}
                                  className="h-5 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  data-testid={`button-download-audio-${event.id}`}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Audio ({event.audioRecording.duration}s)
                                </Button>
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
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Analyzing your safety data...</p>
              </CardContent>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Analytics Data</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Analytics will appear here once you have safety events to analyze.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
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
            </>
          )}
        </TabsContent>

        {/* AI Insights View */}
        <TabsContent value="insights" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading AI Insights</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Analyzing your data patterns...</p>
              </CardContent>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Brain className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No AI Insights Available</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  AI insights will be generated once you have sufficient safety event data for analysis.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  AI Analysis & Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Real AI Insights based on user data */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Data Insights</h4>
                      <div className="space-y-3">
                        {filteredEvents.some(e => e.type === 'panic_button') && (
                          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-amber-800 dark:text-amber-200">Manual Activations</div>
                              <div className="text-sm text-amber-700 dark:text-amber-300">
                                {filteredEvents.filter(e => e.type === 'panic_button').length} panic button activations recorded
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {filteredEvents.some(e => e.type === 'guardian_ai') && (
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800 dark:text-blue-200">AI Detection Events</div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                {filteredEvents.filter(e => e.type === 'guardian_ai').length} situations detected by Guardian AI
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Safety Recommendations</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-green-800 dark:text-green-200">Response Performance</div>
                            <div className="text-sm text-green-700 dark:text-green-300">
                              {analytics.resolutionRate.toFixed(0)}% resolution rate - {analytics.resolutionRate >= 80 ? 'Excellent' : analytics.resolutionRate >= 60 ? 'Good' : 'Needs improvement'}
                            </div>
                          </div>
                        </div>
                        
                        {analytics.avgResponseTime > 0 && (
                          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <Settings className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-purple-800 dark:text-purple-200">Response Time Analysis</div>
                              <div className="text-sm text-purple-700 dark:text-purple-300">
                                Average response: {analytics.avgResponseTime.toFixed(0)}s
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment based on real data */}
                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className={`${analytics.criticalEvents === 0 ? 'border-green-200 dark:border-green-800' : 'border-amber-200 dark:border-amber-800'}`}>
                        <CardContent className="p-4 text-center">
                          <div className={`text-3xl font-bold ${analytics.criticalEvents === 0 ? 'text-green-600' : 'text-amber-600'} mb-1`}>
                            {analytics.criticalEvents === 0 ? 'LOW' : 'MEDIUM'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Current Risk Level</div>
                          <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                            Based on recent event patterns
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">{analytics.totalEvents}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Events</div>
                          <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                            All recorded incidents
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-purple-200 dark:border-purple-800">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-1">
                            {analytics.resolutionRate > 0 ? analytics.resolutionRate.toFixed(0) + '%' : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</div>
                          <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                            Successfully resolved incidents
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Event History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose format to export your event history data.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  exportData('csv');
                  setShowExportDialog(false);
                }}
                variant="outline"
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
              <Button
                onClick={() => {
                  exportData('json');
                  setShowExportDialog(false);
                }}
                variant="outline"
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={selectedEvent !== null} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && getEventTypeIcon(selectedEvent.type)}
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(selectedEvent.severity)}>
                  {selectedEvent.severity.toUpperCase()}
                </Badge>
                <Badge 
                  variant={selectedEvent.status === 'resolved' ? 'default' : selectedEvent.status === 'active' ? 'destructive' : 'secondary'}
                >
                  {selectedEvent.status.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <p>{format(selectedEvent.timestamp, 'PPpp')}</p>
                </div>
                {selectedEvent.location && (
                  <div>
                    <span className="font-medium">Location:</span>
                    <p>{selectedEvent.location.address || `${selectedEvent.location.lat}, ${selectedEvent.location.lng}`}</p>
                  </div>
                )}
                {selectedEvent.response && (
                  <div>
                    <span className="font-medium">Response:</span>
                    <p>{selectedEvent.response.contactsNotified} contacts notified</p>
                    {selectedEvent.response.responseTime && <p>Response time: {selectedEvent.response.responseTime}s</p>}
                  </div>
                )}
                {selectedEvent.biometrics && (
                  <div>
                    <span className="font-medium">Biometrics:</span>
                    {selectedEvent.biometrics.heartRate && <p>Heart Rate: {selectedEvent.biometrics.heartRate} BPM</p>}
                    {selectedEvent.biometrics.stressLevel && <p>Stress Level: {selectedEvent.biometrics.stressLevel}%</p>}
                  </div>
                )}
              </div>

              {selectedEvent.audioRecording && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Audio Recording:</span>
                    <Button
                      onClick={() => downloadAudioRecording(selectedEvent.audioRecording!)}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download Audio ({selectedEvent.audioRecording.duration}s)
                    </Button>
                  </div>
                </div>
              )}

              {selectedEvent.aiAnalysis && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">AI Analysis</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Confidence:</span>
                      <span className="text-sm ml-2">{(selectedEvent.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Triggers:</span>
                      <ul className="text-sm ml-4 list-disc">
                        {selectedEvent.aiAnalysis.triggers.map((trigger, index) => (
                          <li key={index}>{trigger}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Recommendations:</span>
                      <ul className="text-sm ml-4 list-disc">
                        {selectedEvent.aiAnalysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.response?.notes && (
                <div className="border-t pt-4">
                  <span className="font-medium">Notes:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedEvent.response.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}