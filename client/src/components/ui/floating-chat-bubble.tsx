import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, X, Minimize2, LifeBuoy, AlertTriangle, Heart, BookOpen, Shield, Activity, Settings, Zap, Eye, EyeOff, HelpCircle, Home, Users, BarChart3, Bluetooth, Smartphone, Star, ArrowRight } from "lucide-react";
import { useIncognito } from "@/contexts/IncognitoContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CrisisChatSupport from "./crisis-chat-support";

interface FloatingChatBubbleProps {
  className?: string;
}

export default function FloatingChatBubble({ className }: FloatingChatBubbleProps) {
  const { incognitoMode } = useIncognito();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [activeTab, setActiveTab] = useState("guided-tour");
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [currentCrisisLevel, setCurrentCrisisLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [helpMessages, setHelpMessages] = useState<Array<{id: string, sender: 'user' | 'bot', content: string, timestamp: Date}>>([]);
  const [helpInput, setHelpInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const { toast } = useToast();
  
  const tourSteps = [
    {
      title: "Welcome to VitalWatch",
      icon: <Heart className="h-6 w-6" />,
      content: "VitalWatch is your comprehensive mental health and safety companion. It provides 24/7 monitoring, crisis support, and wellness tools to keep you safe and healthy.",
      features: ["AI-powered threat detection", "Emergency response system", "Mental health support", "Wellness tracking"]
    },
    {
      title: "Dashboard Overview",
      icon: <Home className="h-6 w-6" />,
      content: "Your main dashboard shows real-time health status, mood trends, emergency contacts, and quick access to all safety features.",
      features: ["Current mood status", "Emergency contact list", "Recent activities", "Quick action buttons"]
    },
    {
      title: "Safety Tools",
      icon: <Shield className="h-6 w-6" />,
      content: "Comprehensive safety features including panic button, emergency alerts, location sharing, and crisis support tools.",
      features: ["Instant panic button", "Emergency contacts alert", "Location sharing", "Crisis chat support", "Safe zone monitoring"]
    },
    {
      title: "Wellness Analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      content: "Track your mental health with mood analytics, breathing exercises, coping tools, and AI-powered insights.",
      features: ["Mood tracking charts", "Breathing exercises", "Grounding techniques", "AI mood analysis", "Progress reports"]
    },
    {
      title: "Device Hub",
      icon: <Bluetooth className="h-6 w-6" />,
      content: "Connect and monitor various devices including wearables, sensors, and smart home devices for comprehensive health tracking.",
      features: ["Wearable integration", "Heart rate monitoring", "Activity tracking", "Environmental sensors", "Device synchronization"]
    },
    {
      title: "AI Guardian",
      icon: <Zap className="h-6 w-6" />,
      content: "Professional-grade AI monitoring system that analyzes 15+ vital parameters, environmental conditions, and behavioral patterns for intelligent threat assessment.",
      features: ["Real-time vitals monitoring", "Environmental hazard detection", "Behavioral pattern analysis", "Predictive analytics", "Automated emergency response"]
    },
    {
      title: "Panic Button System",
      icon: <AlertTriangle className="h-6 w-6" />,
      content: "Multiple ways to trigger emergency alerts: floating panic button, voice commands, gesture detection, or automatic AI detection.",
      features: ["3-second hold activation", "Countdown timer (customizable)", "Multiple contact alerts", "Location sharing", "Auto-dial emergency services"]
    },
    {
      title: "Incognito Mode",
      icon: <EyeOff className="h-6 w-6" />,
      content: "Privacy mode that hides all VitalWatch interface elements while maintaining background monitoring and emergency features.",
      features: ["Hidden interface", "Silent background monitoring", "Emergency access maintained", "Quick toggle on/off", "Privacy protection"]
    },
    {
      title: "AI Chat Bubble",
      icon: <MessageCircle className="h-6 w-6" />,
      content: "This floating chat provides 24/7 support with guided tours, crisis counseling, feature help, and emergency escalation.",
      features: ["Guided feature tours", "Crisis support chat", "AI counselor", "Emergency escalation", "Real-time help"]
    }
  ];
  
  const [initialMessages] = useState<Array<{id: string, sender: 'user' | 'bot', content: string, timestamp: Date}>>([
    {
      id: '1',
      sender: 'bot',
      content: 'Hi! I\'m your VitalWatch AI assistant. I can help you with feature tutorials, crisis support, or answer questions about the app. Would you like to start with the guided tour?',
      timestamp: new Date()
    }
  ]);

  // Simulate notification for urgent situations (in real app, this would come from crisis detection)
  useEffect(() => {
    const checkForCrisisNotifications = () => {
      // This would normally check user's current crisis indicators
      const shouldShowNotification = Math.random() < 0.1; // 10% chance for demo
      setHasNotification(shouldShowNotification);
    };

    const interval = setInterval(checkForCrisisNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Load initial messages when help tab is accessed
  useEffect(() => {
    if (isOpen && activeTab === 'help' && helpMessages.length === 0) {
      setHelpMessages(initialMessages);
    }
  }, [isOpen, activeTab, initialMessages, helpMessages.length]);

  const handleEmergencyTrigger = () => {
    setCurrentCrisisLevel('critical');
    setHasNotification(true);
    setActiveTab('crisis');
  };

  const handleHelpSubmit = async () => {
    if (!helpInput.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      content: helpInput.trim(),
      timestamp: new Date()
    };
    
    setHelpMessages(prev => [...prev, userMessage]);
    const currentInput = helpInput.trim();
    setHelpInput("");
    setIsAiThinking(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai-help-chat', {
        message: currentInput,
        context: 'vitalwatch_help'
      });
      
      if (response.ok) {
        const data = await response.json();
        const botResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'bot' as const,
          content: data.response,
          timestamp: new Date()
        };
        setHelpMessages(prev => [...prev, botResponse]);
      } else {
        throw new Error('AI response failed');
      }
    } catch (error) {
      const fallbackResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'bot' as const,
        content: getFallbackHelpResponse(currentInput),
        timestamp: new Date()
      };
      setHelpMessages(prev => [...prev, fallbackResponse]);
      
      toast({
        title: "AI Temporarily Unavailable",
        description: "Using basic help responses. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  const getFallbackHelpResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('panic') || input.includes('emergency button')) {
      return 'The panic button can be activated by: 1) Holding the red panic button for 3 seconds, 2) Voice command "VitalWatch Emergency", 3) Gesture detection (shake phone rapidly), or 4) Automatic AI detection. It alerts all emergency contacts and can auto-dial 911.';
    } else if (input.includes('incognito') || input.includes('privacy') || input.includes('hidden')) {
      return 'Incognito mode hides all VitalWatch interface elements for privacy while maintaining background monitoring. Toggle it from the main menu or quick settings. Emergency features remain active even in incognito mode.';
    } else if (input.includes('ai guardian') || input.includes('monitoring')) {
      return 'AI Guardian is our professional monitoring system that tracks 15+ vital parameters including heart rate, stress levels, environmental conditions, and behavioral patterns. It provides predictive analytics and automated emergency response.';
    } else if (input.includes('mood') || input.includes('feeling')) {
      return 'Track your mood in Wellness Analytics. The AI analyzes patterns, provides insights, and correlates mood with biometric data. You can log moods, see trends, and get personalized recommendations.';
    } else if (input.includes('emergency') || input.includes('contact')) {
      return 'Set up emergency contacts in Safety Tools. Add trusted people who will be notified during emergencies. Pro plans support unlimited contacts with family monitoring features.';
    } else if (input.includes('tool') || input.includes('breathing') || input.includes('grounding')) {
      return 'Access coping tools in Wellness Analytics: breathing exercises (Box Breathing, 4-7-8), grounding techniques (5-4-3-2-1 method), guided meditation, and crisis chat support.';
    } else if (input.includes('device') || input.includes('wearable') || input.includes('sensor')) {
      return 'Connect devices in Device Hub: smartwatches, fitness trackers, environmental sensors, and smart home devices. Supports heart rate monitoring, activity tracking, and environmental data.';
    } else if (input.includes('chat') || input.includes('support')) {
      return 'This chat bubble provides: guided tours, crisis counseling, feature help, and emergency escalation. It adapts to your current situation and can connect you with professional support when needed.';
    } else if (input.includes('subscription') || input.includes('billing') || input.includes('upgrade')) {
      return 'VitalWatch offers Free, Guardian, and Professional plans. Guardian adds unlimited contacts and advanced AI. Professional includes family monitoring and enterprise features. Check Billing for details.';
    } else {
      return 'I can help with: panic button usage, incognito mode, AI Guardian monitoring, mood tracking, emergency contacts, coping tools, device connections, and subscription features. What would you like to learn about?';
    }
  };

  const getBubbleColor = () => {
    switch (currentCrisisLevel) {
      case 'critical': return 'bg-red-500 hover:bg-red-600 animate-pulse';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-green-500 hover:bg-green-600';
    }
  };

  const getNotificationText = () => {
    switch (currentCrisisLevel) {
      case 'critical': return 'Crisis Support Needed';
      case 'high': return 'Support Available';
      case 'medium': return 'AI Counselor Ready';
      default: return 'Chat Support';
    }
  };

  // Hide chat bubble when in incognito mode
  if (incognitoMode) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Bubble */}
      <div 
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        data-testid="floating-chat-bubble"
      >
        <div className="relative">
          {/* Notification Badge */}
          {hasNotification && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 z-10 animate-bounce text-xs px-1 py-0"
              data-testid="chat-notification-badge"
            >
              !
            </Badge>
          )}
          
          {/* Chat Button */}
          <Button
            onClick={() => {
              setIsOpen(true);
              setHasNotification(false);
              // Auto-switch to crisis tab if there's a crisis notification
              if (hasNotification && currentCrisisLevel === 'critical') {
                setActiveTab('crisis');
              }
            }}
            className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${getBubbleColor()}`}
            data-testid="chat-bubble-button"
          >
            <MessageCircle className="h-8 w-8 text-white" />
          </Button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {getNotificationText()}
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="w-full max-w-md h-[80vh] p-0 gap-0 flex flex-col"
          data-testid="chat-dialog"
        >
          {/* Header */}
          <DialogHeader className="p-4 pb-2 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <DialogTitle className="text-lg font-semibold">VitalWatch Support</DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === 'crisis' && (
                  <Badge className={`text-xs ${
                    currentCrisisLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    currentCrisisLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    currentCrisisLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {currentCrisisLevel.toUpperCase()}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  data-testid="minimize-chat"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  data-testid="close-chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="guided-tour" className="flex items-center gap-1 text-xs">
                  <BookOpen className="h-3 w-3" />
                  Tour
                </TabsTrigger>
                <TabsTrigger value="help" className="flex items-center gap-1 text-xs">
                  <LifeBuoy className="h-3 w-3" />
                  Help
                </TabsTrigger>
                <TabsTrigger value="crisis" className="flex items-center gap-1 text-xs">
                  <Heart className="h-3 w-3" />
                  Crisis
                  {hasNotification && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </DialogHeader>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsContent value="guided-tour" className="flex-1 flex flex-col m-0 p-4">
                  <ScrollArea className="flex-1">
                    <div className="space-y-4">
                      {/* Tour Progress */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">VitalWatch Guided Tour</h3>
                        <Badge variant="outline">
                          {currentTourStep + 1} of {tourSteps.length}
                        </Badge>
                      </div>
                      
                      {/* Current Step */}
                      <Card className="border-2 border-blue-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                              {tourSteps[currentTourStep].icon}
                            </div>
                            <CardTitle className="text-lg">{tourSteps[currentTourStep].title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {tourSteps[currentTourStep].content}
                          </p>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">Key Features:</h4>
                            <ul className="space-y-1">
                              {tourSteps[currentTourStep].features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Navigation */}
                      <div className="flex justify-between items-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentTourStep(Math.max(0, currentTourStep - 1))}
                          disabled={currentTourStep === 0}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex gap-1">
                          {tourSteps.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentTourStep ? 'bg-blue-600' : 
                                index < currentTourStep ? 'bg-green-400' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <Button
                          onClick={() => {
                            if (currentTourStep < tourSteps.length - 1) {
                              setCurrentTourStep(currentTourStep + 1);
                            } else {
                              setActiveTab('help');
                              setCurrentTourStep(0);
                            }
                          }}
                        >
                          {currentTourStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next'}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                      
                      {/* Quick Access Features */}
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Quick Feature Access:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-xs">Test Panic Button</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
                            <EyeOff className="h-4 w-4 text-purple-500" />
                            <span className="text-xs">Toggle Incognito</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
                            <Zap className="h-4 w-4 text-blue-500" />
                            <span className="text-xs">AI Guardian</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="text-xs">Add Contacts</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="help" className="flex-1 flex flex-col m-0 p-4">
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">VitalWatch AI Assistant</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setActiveTab('guided-tour');
                          setCurrentTourStep(0);
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Start Tour
                      </Button>
                    </div>
                    
                    <ScrollArea className="flex-1 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                      <div className="space-y-3">
                        {helpMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                message.sender === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))}
                        
                        {isAiThinking && (
                          <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-gray-500">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={helpInput}
                        onChange={(e) => setHelpInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isAiThinking && handleHelpSubmit()}
                        placeholder="Ask about VitalWatch features..."
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="help-input"
                        disabled={isAiThinking}
                      />
                      <Button
                        onClick={handleHelpSubmit}
                        disabled={!helpInput.trim() || isAiThinking}
                        size="sm"
                        data-testid="help-send"
                      >
                        {isAiThinking ? 'Thinking...' : 'Send'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="crisis" className="flex-1 m-0">
                  <CrisisChatSupport 
                    crisisLevel={currentCrisisLevel}
                    onEmergencyTrigger={handleEmergencyTrigger}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Crisis support is minimized but still active
              </p>
              <Button
                onClick={() => setIsMinimized(false)}
                variant="outline"
                size="sm"
                data-testid="restore-chat"
              >
                Restore Chat
              </Button>
            </div>
          )}

          {/* Emergency Quick Actions Footer */}
          {currentCrisisLevel === 'critical' && !isMinimized && activeTab === 'crisis' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <div className="flex gap-2 text-xs">
                <Button 
                  size="sm" 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => window.open('tel:988')}
                  data-testid="call-988"
                >
                  Call 988
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-red-300 text-red-700"
                  onClick={() => window.open('tel:911')}
                  data-testid="call-911"
                >
                  Call 911
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}