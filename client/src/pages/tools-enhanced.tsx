import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, Heart, Brain, Shield, Target, Zap, 
  TrendingUp, Calendar, Clock, Award, Star,
  Play, CheckCircle2, AlertTriangle, Users,
  MapPin, Eye, Timer, Wind
} from 'lucide-react';
import { AdvancedSafetyTools } from '@/components/ui/advanced-safety-tools';

export default function ToolsEnhanced() {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Emergency Friend</h1>
          <p className="text-muted-foreground">AI-powered mental health companion with comprehensive crisis management</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="safety">Safety Tools</TabsTrigger>
            <TabsTrigger value="wellness">Wellness Analytics</TabsTrigger>
            <TabsTrigger value="gamification">Achievements</TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Comprehensive Wellness Overview</h2>
              <p className="text-muted-foreground">Your personal dashboard with AI-powered insights and real-time monitoring</p>
            </div>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">65%</div>
                  <div className="text-sm text-muted-foreground">Wellness Score</div>
                  <div className="text-xs text-green-600 mt-1">↑ 8% this week</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">24</div>
                  <div className="text-sm text-muted-foreground">Sessions This Week</div>
                  <div className="text-xs text-green-600 mt-1">+3 from last week</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.2</div>
                  <div className="text-sm text-muted-foreground">Avg Mood Score</div>
                  <div className="text-xs text-green-600 mt-1">↑ 0.3 improvement</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">12</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                  <div className="text-xs text-green-600 mt-1">Personal best!</div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Dashboard */}
            <section>
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                        <Brain className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100">Advanced AI Insights</CardTitle>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">Real-time analysis with predictive recommendations</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      AI Active
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/70 dark:bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">Optimal Timing</h3>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        Your sessions are 23% more effective at 7:30 AM
                      </p>
                      <Button size="sm" variant="outline" className="w-full text-blue-700 border-blue-300">
                        Schedule Session
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-white/70 dark:bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <h3 className="font-semibold text-amber-800 dark:text-amber-200">Stress Prediction</h3>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                        73% likelihood of stress Tuesday 2-4 PM
                      </p>
                      <Button size="sm" variant="outline" className="w-full text-amber-700 border-amber-300">
                        Set Reminder
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-white/70 dark:bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Wind className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-purple-800 dark:text-purple-200">Recommended</h3>
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                        Try the 4-7-8 breathing technique for better sleep quality
                      </p>
                      <Button size="sm" variant="outline" className="w-full text-purple-700 border-purple-300">
                        Start Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Safety Tools Tab */}
          <TabsContent value="safety">
            <AdvancedSafetyTools 
              emergencyContacts={emergencyContacts}
              userLocation={userLocation}
            />
          </TabsContent>

          {/* Wellness Analytics Tab */}
          <TabsContent value="wellness" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Wellness Analytics</h2>
              <p className="text-muted-foreground">Comprehensive insights into your mental health journey with predictive analytics</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Advanced wellness analytics dashboard is in development.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="gamification" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Achievement System</h2>
              <p className="text-muted-foreground">Gamified progression with competitive leaderboards and 17 achievement categories</p>
            </div>

            {/* Achievement Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                        <Timer className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">12-Day Safety Streak</div>
                        <div className="text-sm text-muted-foreground">Daily wellness check-ins completed</div>
                        <div className="text-xs text-yellow-600 mt-1">+150 points</div>
                      </div>
                      <Badge className="bg-yellow-200 text-yellow-800">New!</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Emergency Response Pro</div>
                        <div className="text-sm text-muted-foreground">Sub-10s average response time</div>
                        <div className="text-xs text-blue-600 mt-1">+200 points</div>
                      </div>
                      <Badge variant="secondary">Elite</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-purple-500" />
                    <span>Progress Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">1,247</div>
                      <div className="text-sm text-muted-foreground">Total Points</div>
                    </div>
                    <Progress value={68} className="h-2" />
                    <div className="text-xs text-center text-muted-foreground">
                      Level 4 → Level 5 (68% complete)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}