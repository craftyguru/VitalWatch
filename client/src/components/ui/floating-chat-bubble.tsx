import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Minimize2, LifeBuoy, AlertTriangle, Heart } from "lucide-react";
import CrisisChatSupport from "./crisis-chat-support";

interface FloatingChatBubbleProps {
  className?: string;
}

export default function FloatingChatBubble({ className }: FloatingChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [activeTab, setActiveTab] = useState("help");
  const [currentCrisisLevel, setCurrentCrisisLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [helpMessages, setHelpMessages] = useState<Array<{id: string, sender: 'user' | 'bot', content: string, timestamp: Date}>>([
    {
      id: '1',
      sender: 'bot',
      content: 'Hi! I\'m here to help you navigate VitalWatch. What would you like assistance with?',
      timestamp: new Date()
    }
  ]);
  const [helpInput, setHelpInput] = useState("");

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

  const handleEmergencyTrigger = () => {
    setCurrentCrisisLevel('critical');
    setHasNotification(true);
    setActiveTab('crisis');
  };

  const handleHelpSubmit = () => {
    if (!helpInput.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      content: helpInput.trim(),
      timestamp: new Date()
    };
    
    setHelpMessages(prev => [...prev, userMessage]);
    setHelpInput("");
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'bot' as const,
        content: getHelpResponse(helpInput),
        timestamp: new Date()
      };
      setHelpMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getHelpResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('mood') || input.includes('feeling')) {
      return 'You can track your mood by going to the Mood page from the navigation menu. There you can log daily moods and see AI insights about your mental health patterns.';
    } else if (input.includes('emergency') || input.includes('contact')) {
      return 'To set up emergency contacts, go to the Contacts page. You can add trusted people who will be notified during emergencies. We recommend adding at least 2-3 contacts.';
    } else if (input.includes('tool') || input.includes('breathing') || input.includes('grounding')) {
      return 'Visit the Tools page to access breathing exercises, grounding techniques, and other coping tools. You can also access crisis chat support for immediate help.';
    } else if (input.includes('subscription') || input.includes('billing') || input.includes('upgrade')) {
      return 'Check your subscription details and upgrade options in the Billing page. VitalWatch offers Pro features for enhanced monitoring and support.';
    } else if (input.includes('profile') || input.includes('settings')) {
      return 'Customize your experience in the Profile page where you can update personal information, notification preferences, and privacy settings.';
    } else {
      return 'I can help you with mood tracking, emergency contacts, coping tools, billing, and profile settings. What specific feature would you like to learn about?';
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="help" className="flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4" />
                  Help & Support
                </TabsTrigger>
                <TabsTrigger value="crisis" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Crisis Support
                  {hasNotification && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </DialogHeader>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsContent value="help" className="flex-1 flex flex-col m-0 p-4">
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="flex-1 border rounded-lg p-3 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                      <div className="space-y-3">
                        {helpMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-2 rounded-lg text-sm ${
                                message.sender === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={helpInput}
                        onChange={(e) => setHelpInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleHelpSubmit()}
                        placeholder="Ask about VitalWatch features..."
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="help-input"
                      />
                      <Button
                        onClick={handleHelpSubmit}
                        disabled={!helpInput.trim()}
                        size="sm"
                        data-testid="help-send"
                      >
                        Send
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