import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MoodTracker } from "@/components/ui/mood-tracker";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Calendar,
  Brain,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  Wind,
  Settings,
  BarChart3,
  LineChart,
  PieChart,
  ArrowLeft,
  MessageSquareHeart,
  Frown,
  Meh,
  Smile,
  Laugh,
  Clock,
  MapPin
} from "lucide-react";

const moodIcons = {
  terrible: MessageSquareHeart,
  bad: Frown,
  okay: Meh,
  good: Smile,
  great: Laugh,
};

const moodColors = {
  terrible: "text-red-500",
  bad: "text-orange-500",
  okay: "text-neutral-500",
  good: "text-blue-500",
  great: "text-green-500",
};

const moodBgColors = {
  terrible: "bg-red-50",
  bad: "bg-orange-50",
  okay: "bg-neutral-50",
  good: "bg-blue-50",
  great: "bg-green-50",
};

export default function Mood() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("tracker");

  // Fetch mood entries
  const { data: moodEntries, isLoading } = useQuery({
    queryKey: ["/api/mood-entries"],
  });

  // Fetch AI insights
  const { data: aiInsights } = useQuery({
    queryKey: ["/api/ai-insights"],
  });

  // Generate insight mutation
  const generateInsightMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-insight");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "New insight generated",
        description: "Check out your personalized wellness insight",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-insights"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate insight",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark insight as read mutation
  const markInsightReadMutation = useMutation({
    mutationFn: async (insightId: number) => {
      const response = await apiRequest("POST", `/api/ai-insights/${insightId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-insights"] });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateMoodTrend = (entries: any[]) => {
    if (!entries || entries.length < 2) return null;
    
    const recent = entries.slice(0, 7); // Last 7 entries
    const older = entries.slice(7, 14); // Previous 7 entries
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.moodScore, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, entry) => sum + entry.moodScore, 0) / older.length : recentAvg;
    
    return recentAvg - olderAvg;
  };

  const getMoodStats = (entries: any[]) => {
    if (!entries || entries.length === 0) return null;

    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const totalEntries = entries.length;
    const avgScore = entries.reduce((sum, entry) => sum + entry.moodScore, 0) / totalEntries;
    const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => moodCounts[a[0]] > moodCounts[b[0]] ? a : b)[0];

    return {
      totalEntries,
      avgScore,
      mostCommonMood,
      moodCounts,
    };
  };

  const moodTrend = calculateMoodTrend(moodEntries || []);
  const moodStats = getMoodStats(moodEntries || []);
  const unreadInsights = aiInsights?.filter(insight => !insight.isRead) || [];
  const criticalInsights = aiInsights?.filter(insight => insight.type === "crisis_warning") || [];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm">
              <img 
                src="/logo.png" 
                alt="VitalWatch Logo" 
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-700">Mood Tracking</h1>
              <p className="text-xs text-neutral-500">Monitor your mental wellness</p>
            </div>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Critical Insights Alert */}
        {criticalInsights.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">Crisis Pattern Detected</h3>
                  <p className="text-sm text-red-700 mb-3">
                    We've noticed concerning patterns in your recent mood entries. Consider reaching out for support.
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => window.open('tel:988', '_self')}>
                      Call 988
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-600 text-red-600">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="tracker">Track</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          {/* Mood Tracker Tab */}
          <TabsContent value="tracker" className="space-y-6">
            <MoodTracker />
            
            {moodStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Quick Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{moodStats.totalEntries}</div>
                      <div className="text-xs text-neutral-600">Total Entries</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{moodStats.avgScore.toFixed(1)}/5</div>
                      <div className="text-xs text-neutral-600">Average Score</div>
                    </div>
                  </div>
                  
                  {moodTrend !== null && (
                    <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className={`h-4 w-4 ${moodTrend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        <span className="text-sm font-medium">
                          {moodTrend >= 0 ? 'Trending up' : 'Trending down'}
                        </span>
                        <span className={`text-xs ${moodTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(moodTrend).toFixed(1)} points
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-neutral-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                          <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : moodEntries && moodEntries.length > 0 ? (
              <div className="space-y-3">
                {moodEntries.map((entry: any) => {
                  const MoodIcon = moodIcons[entry.mood as keyof typeof moodIcons];
                  return (
                    <Card key={entry.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${moodBgColors[entry.mood as keyof typeof moodBgColors]}`}>
                            <MoodIcon className={`h-5 w-5 ${moodColors[entry.mood as keyof typeof moodColors]}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium capitalize text-neutral-700">
                                {entry.mood} ({entry.moodScore}/5)
                              </span>
                              <div className="flex items-center space-x-1 text-xs text-neutral-500">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(entry.createdAt)}</span>
                              </div>
                            </div>
                            
                            {entry.note && (
                              <p className="text-sm text-neutral-600 mb-2">{entry.note}</p>
                            )}
                            
                            {entry.location?.address && (
                              <div className="flex items-center space-x-1 text-xs text-neutral-500">
                                <MapPin className="h-3 w-3" />
                                <span>{entry.location.address}</span>
                              </div>
                            )}
                            
                            {entry.riskLevel && entry.riskLevel !== "low" && (
                              <div className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full mt-2 ${
                                entry.riskLevel === "critical" ? "bg-red-100 text-red-700" :
                                entry.riskLevel === "high" ? "bg-orange-100 text-orange-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>
                                <AlertTriangle className="h-3 w-3" />
                                <span>Risk: {entry.riskLevel}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="font-medium text-neutral-700 mb-2">No mood entries yet</h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    Start tracking your mood to see patterns and get AI insights
                  </p>
                  <Button onClick={() => setActiveTab("tracker")}>
                    Record Your First Mood
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-700">AI Insights</h3>
              <Button 
                onClick={() => generateInsightMutation.mutate()}
                disabled={generateInsightMutation.isPending}
                size="sm"
              >
                {generateInsightMutation.isPending ? "Generating..." : "Generate New"}
              </Button>
            </div>

            {aiInsights && aiInsights.length > 0 ? (
              <div className="space-y-4">
                {aiInsights.map((insight: any) => (
                  <Card 
                    key={insight.id} 
                    className={`${insight.isRead ? 'opacity-75' : ''} ${
                      insight.type === 'crisis_warning' ? 'border-red-200 bg-red-50' : 
                      insight.type === 'pattern_detected' ? 'border-blue-200 bg-blue-50' :
                      'border-green-200 bg-green-50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          insight.type === 'crisis_warning' ? 'bg-red-100' :
                          insight.type === 'pattern_detected' ? 'bg-blue-100' :
                          'bg-green-100'
                        }`}>
                          {insight.type === 'crisis_warning' ? (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Brain className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                              {insight.type.replace('_', ' ')}
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-neutral-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(insight.createdAt)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-700 mb-3">{insight.insight}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-neutral-500">
                              Confidence: {Math.round(insight.confidence * 100)}%
                            </div>
                            {!insight.isRead && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => markInsightReadMutation.mutate(insight.id)}
                                className="text-xs"
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="font-medium text-neutral-700 mb-2">No insights available</h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    Track your mood for a few days to generate personalized insights
                  </p>
                  <Button 
                    onClick={() => generateInsightMutation.mutate()}
                    disabled={generateInsightMutation.isPending || !moodEntries || moodEntries.length < 3}
                  >
                    Generate First Insight
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {moodStats ? (
              <>
                {/* Overall Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      <span>Overall Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{moodStats.totalEntries}</div>
                        <div className="text-sm text-neutral-600">Total Entries</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{moodStats.avgScore.toFixed(1)}</div>
                        <div className="text-sm text-neutral-600">Average Score</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${moodBgColors[moodStats.mostCommonMood as keyof typeof moodBgColors]}`}>
                          {React.createElement(moodIcons[moodStats.mostCommonMood as keyof typeof moodIcons], {
                            className: `h-4 w-4 ${moodColors[moodStats.mostCommonMood as keyof typeof moodColors]}`
                          })}
                        </div>
                        <span className="font-medium text-purple-700">Most Common Mood</span>
                      </div>
                      <div className="text-lg font-bold text-purple-800 capitalize">{moodStats.mostCommonMood}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mood Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <span>Mood Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(moodStats.moodCounts).map(([mood, count]) => {
                        const percentage = (count as number / moodStats.totalEntries) * 100;
                        const MoodIcon = moodIcons[mood as keyof typeof moodIcons];
                        return (
                          <div key={mood} className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${moodBgColors[mood as keyof typeof moodBgColors]}`}>
                              <MoodIcon className={`h-4 w-4 ${moodColors[mood as keyof typeof moodColors]}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium capitalize">{mood}</span>
                                <span className="text-sm text-neutral-500">{count} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Trend Analysis */}
                {moodTrend !== null && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <LineChart className="h-5 w-5 text-primary" />
                        <span>Trend Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`p-4 rounded-lg ${moodTrend >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className={`h-5 w-5 ${moodTrend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                          <span className="font-medium">
                            Your mood is {moodTrend >= 0 ? 'improving' : 'declining'}
                          </span>
                        </div>
                        <div className={`text-sm ${moodTrend >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {Math.abs(moodTrend).toFixed(1)} point {moodTrend >= 0 ? 'increase' : 'decrease'} compared to previous week
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="font-medium text-neutral-700 mb-2">No data available</h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    Start tracking your mood to see detailed statistics
                  </p>
                  <Button onClick={() => setActiveTab("tracker")}>
                    Track Your Mood
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-neutral-100 px-4 py-3 fixed bottom-0 left-0 right-0 z-30">
        <div className="grid grid-cols-5 gap-1">
          <Link href="/" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Activity className="h-5 w-5 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
          
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-blue-50 text-primary">
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Mood</span>
          </div>
          
          <Link href="/tools" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Wind className="h-5 w-5 mb-1" />
            <span className="text-xs">Tools</span>
          </Link>
          
          <Link href="/contacts" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Network</span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
