import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "wouter";
import { 
  Settings, 
  Wind, 
  Leaf, 
  Waves, 
  Puzzle,
  Phone,
  MessageCircle,
  Video,
  Brain,
  Clock,
  MapPin,
  Users,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowRight,
  Shield,
  Heart,
  Zap,
  Calendar,
  BarChart3,
  Bell,
  Star,
  ChevronRight,
  Sparkles,
  Target,
  Award,
  Eye,
  Mic,
  Battery,
  Signal,
  Home,
  CreditCard,
  AlertTriangle,
  X
} from "lucide-react";

// Mock demo data
const demoUser = {
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@demo.com",
  profileImageUrl: undefined
};

const demoMoodEntries = [
  { id: 1, moodScore: 4, notes: "Feeling great after morning workout", createdAt: new Date().toISOString() },
  { id: 2, moodScore: 3, notes: "Bit stressed about work presentation", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, moodScore: 5, notes: "Amazing day with friends!", createdAt: new Date(Date.now() - 172800000).toISOString() }
];

const demoContacts = [
  { id: 1, name: "Mom", phone: "+1-555-0123", email: "mom@demo.com", relationship: "family" },
  { id: 2, name: "Dr. Smith", phone: "+1-555-0456", email: "dr.smith@demo.com", relationship: "medical" },
  { id: 3, name: "Best Friend Alex", phone: "+1-555-0789", email: "alex@demo.com", relationship: "friend" }
];

const demoInsights = [
  { id: 1, type: "positive", content: "Your mood has been consistently improving over the past week!", isRead: false },
  { id: 2, type: "recommendation", content: "Consider trying breathing exercises during your afternoon stress peak", isRead: false }
];

export default function DemoPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [emergencyOverlayOpen, setEmergencyOverlayOpen] = useState(false);
  const [currentBattery, setCurrentBattery] = useState(85);
  const [networkQuality, setNetworkQuality] = useState("Strong");
  const [sensorStatus, setSensorStatus] = useState("Active");

  const userName = `${demoUser.firstName} ${demoUser.lastName}`;
  const wellnessScore = 78;

  useEffect(() => {
    // Demo banner warning
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
      color: white;
      padding: 12px;
      text-align: center;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    banner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="m12 17 .01 0"/>
        </svg>
        DEMO MODE - This is a test environment with sample data
        <button onclick="this.parentElement.parentElement.remove()" style="margin-left: 16px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
      </div>
    `;
    document.body.appendChild(banner);
    document.body.style.paddingTop = '60px';

    return () => {
      if (document.body.contains(banner)) {
        document.body.removeChild(banner);
        document.body.style.paddingTop = '0';
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/95">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground p-3 rounded-2xl shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                  VitalWatch
                </h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-sm text-muted-foreground font-medium">
                    {isConnected ? 'Protected & Connected' : 'Reconnecting...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-foreground">
                    Welcome back, {userName}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Demo User Experience</span>
                  </p>
                </div>
                <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-md">
                  <AvatarImage src={demoUser.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground font-bold text-lg">
                    SJ
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{wellnessScore}%</div>
              <div className="text-sm text-muted-foreground">Wellness Score</div>
              <div className="text-xs text-green-600">↑ 12% this week</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-muted-foreground">AI Protection</div>
              <div className="text-xs text-blue-600">Active monitoring</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200">
            <CardContent className="p-4 text-center">
              <Brain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">4.2</div>
              <div className="text-sm text-muted-foreground">Avg Mood</div>
              <div className="text-xs text-green-600">Great trend!</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{demoContacts.length}</div>
              <div className="text-sm text-muted-foreground">Contacts</div>
              <div className="text-xs text-orange-600">Ready to help</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wellness Overview */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Wellness Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Wellness</span>
                      <span className="font-semibold">{wellnessScore}%</span>
                    </div>
                    <Progress value={wellnessScore} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600">18</div>
                      <div className="text-xs text-muted-foreground">Day Streak</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">92%</div>
                      <div className="text-xs text-muted-foreground">Stress Relief</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Mood Entries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Recent Mood Entries</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demoMoodEntries.map((mood, index) => (
                    <div key={mood.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < mood.moodScore ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{mood.notes}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(mood.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Battery className="h-5 w-5 text-green-600" />
                    <span>Device Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Battery Level</span>
                    <span className="font-semibold text-green-600">{currentBattery}%</span>
                  </div>
                  <Progress value={currentBattery} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Network Quality</span>
                    <Badge className="bg-green-100 text-green-800">{networkQuality}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sensor Status</span>
                    <Badge className="bg-blue-100 text-blue-800">{sensorStatus}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span>Live Monitoring</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Motion Detection</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audio Analysis</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-blue-600">Listening</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Location Services</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-orange-600">Tracking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <span>Emergency Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">Safe</div>
                    <div className="text-sm text-muted-foreground">All systems normal</div>
                  </div>
                  
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setEmergencyOverlayOpen(true)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Alert
                  </Button>
                  
                  <div className="text-xs text-center text-muted-foreground">
                    Last check: Just now
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Emergency Contacts</span>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.phone}</div>
                        <Badge variant="secondary" className="text-xs">
                          {contact.relationship}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI-Powered Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoInsights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        insight.type === 'positive' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {insight.type === 'positive' ? <CheckCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{insight.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">AI Generated • Just now</span>
                          <Button size="sm" variant="ghost">
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    AI Learning Your Patterns
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Our AI is analyzing your wellness data to provide personalized insights and early warning systems.
                  </p>
                  <Button variant="outline">
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Action Bar */}
        <div className="flex justify-center space-x-4 py-6">
          <Link href="/landing">
            <Button variant="outline" size="lg">
              <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
              Back to Landing
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Shield className="h-5 w-5 mr-2" />
              Start Your Protection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}