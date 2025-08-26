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
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [currentBattery] = useState(85);
  const [networkQuality] = useState("Strong");
  const [sensorStatus] = useState("Active");

  const userName = `${demoUser.firstName} ${demoUser.lastName}`;
  const wellnessScore = 78;

  useEffect(() => {
    // Demo banner warning - exactly like in the screenshots
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
    <div className="min-h-screen bg-black text-white">
      {/* Header - exactly matching the real app */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">VitalWatch</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-400">Protected & Connected</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white">Welcome back, Sarah</p>
              <p className="text-xs text-gray-400">Demo User Experience</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-xs">SJ</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        
        {/* Stats Cards - exactly like the real app */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 border border-green-600 rounded-lg p-4 text-center">
            <Activity className="h-5 w-5 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-500">78%</div>
            <div className="text-xs text-gray-400">Wellness Score</div>
            <div className="text-xs text-gray-500">↑ 12% this week</div>
          </div>

          <div className="bg-gray-900 border border-blue-600 rounded-lg p-4 text-center">
            <Shield className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-500">24/7</div>
            <div className="text-xs text-gray-400">AI Protection</div>
            <div className="text-xs text-gray-500">Active monitoring</div>
          </div>

          <div className="bg-gray-900 border border-purple-600 rounded-lg p-4 text-center">
            <Brain className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-500">4.2</div>
            <div className="text-xs text-gray-400">Avg Mood</div>
            <div className="text-xs text-gray-500">Great trend!</div>
          </div>

          <div className="bg-gray-900 border border-orange-600 rounded-lg p-4 text-center">
            <Users className="h-5 w-5 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-500">3</div>
            <div className="text-xs text-gray-400">Contacts</div>
            <div className="text-xs text-gray-500">Ready to help</div>
          </div>
        </div>

        {/* Tab Navigation - exactly like the real app */}
        <div className="bg-gray-800 rounded-lg p-1 mb-6">
          <div className="grid grid-cols-4 gap-1">
            {['dashboard', 'monitoring', 'contacts', 'insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === tab 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        {currentTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wellness Analytics */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-blue-400 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Wellness Analytics
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Overall Wellness</span>
                    <span className="font-semibold text-white">78%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-green-500">18</div>
                    <div className="text-xs text-gray-400">Day Streak</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-purple-500">92%</div>
                    <div className="text-xs text-gray-400">Stress Relief</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Mood Entries */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-red-400 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Recent Mood Entries
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {demoMoodEntries.map((mood) => (
                  <div key={mood.id} className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < mood.moodScore ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                      <div>
                        <div className="text-sm text-white">{mood.notes}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(mood.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Content */}
        {currentTab === 'monitoring' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Device Status */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-green-400 flex items-center">
                  <Battery className="h-5 w-5 mr-2" />
                  Device Status
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Battery Level</span>
                  <span className="font-semibold text-green-500">{currentBattery}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${currentBattery}%`}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Network Quality</span>
                  <span className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded">{networkQuality}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Sensor Status</span>
                  <span className="text-xs bg-blue-800 text-blue-300 px-2 py-1 rounded">{sensorStatus}</span>
                </div>
              </div>
            </div>

            {/* Live Monitoring */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-purple-400 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Live Monitoring
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Motion Detection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Audio Analysis</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-500">Listening</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Location Services</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-orange-500">Tracking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Status */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-red-400 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Emergency Status
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">Safe</div>
                  <div className="text-sm text-gray-400">All systems normal</div>
                </div>
                
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Alert
                </Button>
                
                <div className="text-xs text-center text-gray-500">
                  Last check: Just now
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Content */}
        {currentTab === 'contacts' && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-orange-400 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Emergency Contacts
              </h3>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {demoContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{contact.name}</div>
                      <div className="text-sm text-gray-400">{contact.phone}</div>
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {contact.relationship}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights Content */}
        {currentTab === 'insights' && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-purple-400 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI-Powered Insights
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {demoInsights.map((insight) => (
                <div key={insight.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      insight.type === 'positive' ? 'bg-green-800 text-green-400' : 'bg-blue-800 text-blue-400'
                    }`}>
                      {insight.type === 'positive' ? <CheckCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{insight.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">AI Generated • Just now</span>
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="flex justify-center space-x-4 py-6 mt-8">
          <Link href="/landing">
            <Button variant="outline" size="lg" className="border-gray-600 text-gray-300">
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