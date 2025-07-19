import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmergencyButton } from "@/components/ui/emergency-button";
import { MoodTracker } from "@/components/ui/mood-tracker";
import { EmergencyOverlay } from "@/components/ui/emergency-overlay";
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
  CheckCircle
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected, lastMessage } = useWebSocket();
  const [emergencyOverlayOpen, setEmergencyOverlayOpen] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState<number | null>(null);

  // Fetch user settings for emergency countdown
  const { data: userSettings } = useQuery({
    queryKey: ["/api/user-settings"],
  });

  // Fetch emergency contacts
  const { data: emergencyContacts } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });

  // Fetch recent mood entries
  const { data: recentMoods } = useQuery({
    queryKey: ["/api/mood-entries"],
  });

  // Fetch AI insights
  const { data: aiInsights } = useQuery({
    queryKey: ["/api/ai-insights"],
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'emergency_alert_sent':
        toast({
          title: "Emergency Alert Sent",
          description: `Notified ${lastMessage.contactsNotified} emergency contacts`,
          variant: "default",
        });
        break;
      
      case 'crisis_risk_detected':
        toast({
          title: "Support Available",
          description: lastMessage.message,
          variant: "default",
        });
        break;
      
      case 'immediate_support_needed':
        toast({
          title: "Immediate Support",
          description: lastMessage.message,
          variant: "destructive",
        });
        break;
    }
  }, [lastMessage, toast]);

  const handleEmergencyTriggered = (incidentId: number) => {
    setCurrentIncidentId(incidentId);
    setEmergencyOverlayOpen(true);
  };

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || "Friend" : "Friend";
  const unreadInsights = aiInsights?.filter(insight => !insight.isRead) || [];
  const latestMood = recentMoods?.[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-700">Emergency Friend</h1>
              <p className="text-xs text-neutral-500 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-700">Hello, {userName}</p>
              <p className="text-xs text-neutral-500">{new Date().toLocaleDateString()}</p>
            </div>
            <Avatar>
              <AvatarImage src={user?.profileImageUrl} alt="Profile" />
              <AvatarFallback className="bg-primary text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="pb-20">
        {/* Emergency Quick Access */}
        <section className="gradient-emergency text-white px-4 py-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold mb-2">Need Immediate Help?</h2>
            <p className="text-sm opacity-90">You're not alone. Help is available right now.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <EmergencyButton 
              onEmergencyTriggered={handleEmergencyTriggered}
              className="w-full h-24 emergency-button rounded-2xl"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => window.open('tel:988', '_self')}
                className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl p-4 text-center hover:bg-opacity-30 transition-all h-16"
              >
                <div className="flex flex-col items-center">
                  <Phone className="h-5 w-5 mb-1" />
                  <div className="text-sm font-medium">Call 988</div>
                  <div className="text-xs opacity-80">Crisis Lifeline</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => window.open('https://suicidepreventionlifeline.org/chat/', '_blank')}
                className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl p-4 text-center hover:bg-opacity-30 transition-all h-16"
              >
                <div className="flex flex-col items-center">
                  <MessageCircle className="h-5 w-5 mb-1" />
                  <div className="text-sm font-medium">Crisis Chat</div>
                  <div className="text-xs opacity-80">24/7 Support</div>
                </div>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Tools */}
        <section className="px-4 py-6 bg-white">
          <h3 className="text-lg font-semibold mb-4 text-neutral-700">Quick Relief Tools</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/tools">
              <Button 
                variant="outline"
                className="w-full h-20 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl"
              >
                <div className="flex flex-col items-center">
                  <Wind className="h-6 w-6 mb-1" />
                  <div className="text-sm font-medium">Breathing</div>
                  <div className="text-xs opacity-75">4-7-8 Technique</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/tools">
              <Button 
                variant="outline"
                className="w-full h-20 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 rounded-xl"
              >
                <div className="flex flex-col items-center">
                  <Leaf className="h-6 w-6 mb-1" />
                  <div className="text-sm font-medium">Grounding</div>
                  <div className="text-xs opacity-75">5-4-3-2-1 Method</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/tools">
              <Button 
                variant="outline"
                className="w-full h-20 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 rounded-xl"
              >
                <div className="flex flex-col items-center">
                  <Waves className="h-6 w-6 mb-1" />
                  <div className="text-sm font-medium">Meditation</div>
                  <div className="text-xs opacity-75">Guided Session</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/tools">
              <Button 
                variant="outline"
                className="w-full h-20 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 rounded-xl"
              >
                <div className="flex flex-col items-center">
                  <Puzzle className="h-6 w-6 mb-1" />
                  <div className="text-sm font-medium">Distraction</div>
                  <div className="text-xs opacity-75">Games & Activities</div>
                </div>
              </Button>
            </Link>
          </div>
        </section>

        {/* Mood Tracking */}
        <section className="px-4 py-6 bg-neutral-50">
          <MoodTracker />
        </section>

        {/* Safety Network */}
        <section className="px-4 py-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-700">Your Safety Network</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/contacts">
                <span className="text-primary text-sm font-medium">Manage</span>
              </Link>
            </Button>
          </div>
          
          {emergencyContacts && emergencyContacts.length > 0 ? (
            <div className="space-y-3">
              {emergencyContacts.slice(0, 3).map((contact: any) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-neutral-700 text-sm">{contact.name}</div>
                      <div className="text-xs text-neutral-500">
                        {contact.priority === 1 ? 'Primary' : 'Secondary'} • {contact.relationship}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {contact.phone && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                        className="p-2 bg-primary bg-opacity-10 text-primary rounded-lg hover:bg-opacity-20"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    )}
                    {contact.email && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(`mailto:${contact.email}`, '_self')}
                        className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {emergencyContacts.length > 3 && (
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href="/contacts">
                    View all {emergencyContacts.length} contacts
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Card className="border-dashed border-neutral-300">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 mb-3">No emergency contacts yet</p>
                <Button size="sm" asChild>
                  <Link href="/contacts">Add Emergency Contact</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* AI Insights */}
        {unreadInsights.length > 0 && (
          <section className="px-4 py-6 bg-neutral-50">
            <h3 className="text-lg font-semibold mb-4 text-neutral-700">Your Wellness Insights</h3>
            
            <div className="space-y-3">
              {unreadInsights.slice(0, 2).map((insight: any) => (
                <Card key={insight.id} className="gradient-calm text-white">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-2">AI Insight</h4>
                        <p className="text-sm opacity-90 mb-3">{insight.insight}</p>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-xs px-3 py-1 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30"
                          >
                            Learn More
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-xs px-3 py-1 bg-white bg-opacity-10 text-white rounded-full hover:bg-opacity-20"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Crisis Resources */}
        <section className="px-4 py-6 bg-white">
          <h3 className="text-lg font-semibold mb-4 text-neutral-700">Crisis Resources</h3>
          
          <div className="space-y-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.open('tel:988', '_self')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-700">988 Suicide & Crisis Lifeline</div>
                      <div className="text-sm text-neutral-500">24/7 Crisis Support</div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.open('sms:741741?body=HOME', '_self')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-700">Crisis Text Line</div>
                      <div className="text-sm text-neutral-500">Text HOME to 741741</div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Text
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.open('https://suicidepreventionlifeline.org/chat/', '_blank')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Video className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-700">Virtual Crisis Support</div>
                      <div className="text-sm text-neutral-500">Connect with trained counselors</div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-neutral-100 px-4 py-3 fixed bottom-0 left-0 right-0 z-30">
        <div className="grid grid-cols-5 gap-1">
          <Link href="/" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-blue-50 text-primary">
            <Activity className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          <Link href="/mood" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs">Mood</span>
          </Link>
          
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

      {/* Emergency Overlay */}
      <EmergencyOverlay 
        isOpen={emergencyOverlayOpen}
        onClose={() => setEmergencyOverlayOpen(false)}
        incidentId={currentIncidentId}
        countdownDuration={userSettings?.emergencyCountdown || 180}
      />
    </div>
  );
}
