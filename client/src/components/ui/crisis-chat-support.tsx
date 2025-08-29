import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Phone, 
  AlertTriangle, 
  Heart, 
  Shield, 
  Headphones,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Activity,
  Clock,
  TrendingUp,
  Users,
  CheckCircle
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  messageType?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

interface CrisisChatSupportProps {
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
  onEmergencyTrigger?: () => void;
}

interface SupportResource {
  title: string;
  description: string;
  action: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  icon: any;
}

export default function CrisisChatSupport({ 
  crisisLevel = 'medium', 
  onEmergencyTrigger 
}: CrisisChatSupportProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat messages for current session
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['/api/crisis-chat/messages', currentSession],
    enabled: !!currentSession,
  });

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/crisis-chat/session');
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentSession(data.session.sessionId);
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-chat/messages'] });
      toast({
        title: "Crisis Support Connected",
        description: "AI counselor is ready to help",
      });
    },
    onError: () => {
      toast({
        title: "Connection Failed", 
        description: "Unable to start chat session. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { 
      sessionId: string; 
      sender: string; 
      content: string; 
      urgency?: string;
      messageType?: string;
    }) => {
      const response = await apiRequest('POST', '/api/crisis-chat/message', messageData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-chat/messages', currentSession] });
      
      if (data.needsEscalation) {
        setEmergencyMode(true);
        toast({
          title: "Crisis Alert",
          description: "Escalation recommended. Professional help available.",
          variant: "destructive",
        });
        
        if (onEmergencyTrigger) {
          onEmergencyTrigger();
        }
      }
      
      setInputMessage("");
      setIsTyping(false);
    },
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  });

  const supportResources: SupportResource[] = [
    {
      title: "National Suicide Prevention Lifeline",
      description: "24/7 crisis support and suicide prevention",
      action: "Call 988",
      urgency: 'critical',
      icon: Phone
    },
    {
      title: "Crisis Text Line",
      description: "Text-based crisis support available 24/7",
      action: "Text HOME to 741741",
      urgency: 'high',
      icon: MessageCircle
    },
    {
      title: "Emergency Services",
      description: "Immediate medical or psychiatric emergency",
      action: "Call 911",
      urgency: 'critical',
      icon: AlertTriangle
    },
    {
      title: "SAMHSA National Helpline",
      description: "Mental health and substance abuse support",
      action: "Call 1-800-662-4357",
      urgency: 'medium',
      icon: Headphones
    }
  ];

  const initializeChat = () => {
    createSessionMutation.mutate();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession) return;

    setIsTyping(true);
    
    try {
      await sendMessageMutation.mutateAsync({
        sessionId: currentSession,
        sender: 'user',
        content: inputMessage.trim(),
        urgency: crisisLevel,
        messageType: 'text'
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoiceMode = () => {
    setVoiceMode(!voiceMode);
    toast({
      title: voiceMode ? "Voice Mode Disabled" : "Voice Mode Enabled",
      description: voiceMode ? "Switched to text input" : "Voice input activated",
    });
  };

  const formatMessageTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" data-testid="crisis-chat-support">
      <Card className="border-2 border-red-200 dark:border-red-800">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-300">
              Crisis Support Chat
            </CardTitle>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Badge className={getUrgencyColor(crisisLevel)}>
              Crisis Level: {crisisLevel.toUpperCase()}
            </Badge>
            {emergencyMode && (
              <Badge variant="destructive" className="animate-pulse">
                Emergency Mode Active
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" data-testid="tab-chat">Chat Support</TabsTrigger>
              <TabsTrigger value="resources" data-testid="tab-resources">Crisis Resources</TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              {!currentSession ? (
                <div className="text-center space-y-4">
                  <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                    <Heart className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">You're Not Alone</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Our AI crisis counselor is here to provide immediate support and guidance.
                      This is a safe space where you can share your feelings.
                    </p>
                    <Button 
                      onClick={initializeChat}
                      disabled={createSessionMutation.isPending}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid="button-start-chat"
                    >
                      {createSessionMutation.isPending ? "Connecting..." : "Start Crisis Chat"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ScrollArea className="h-96 w-full border rounded-lg p-4">
                    <div className="space-y-4">
                      {loadingMessages && (
                        <div className="text-center py-4">
                          <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                          <p className="text-sm text-gray-500 mt-2">Loading messages...</p>
                        </div>
                      )}
                      
                      {Array.isArray(messages) && messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${message.sender}-${message.id}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs opacity-70">
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {message.urgency && message.urgency !== 'low' && (
                                <Badge size="sm" className={getUrgencyColor(message.urgency)}>
                                  {message.urgency}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share what's on your mind..."
                      disabled={sendMessageMutation.isPending || isTyping}
                      className="flex-1"
                      data-testid="input-message"
                    />
                    <Button
                      onClick={toggleVoiceMode}
                      variant="outline"
                      size="icon"
                      data-testid="button-voice-toggle"
                    >
                      {voiceMode ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || sendMessageMutation.isPending || isTyping}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="grid gap-4">
                {supportResources.map((resource, index) => (
                  <Card 
                    key={index} 
                    className={`border-l-4 ${
                      resource.urgency === 'critical' ? 'border-l-red-500' :
                      resource.urgency === 'high' ? 'border-l-orange-500' :
                      resource.urgency === 'medium' ? 'border-l-yellow-500' :
                      'border-l-green-500'
                    }`}
                    data-testid={`resource-${index}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <resource.icon className="h-5 w-5 mt-1 text-gray-600" />
                          <div>
                            <h3 className="font-semibold">{resource.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                        <Badge className={getUrgencyColor(resource.urgency)}>
                          {resource.urgency}
                        </Badge>
                      </div>
                      <Button 
                        className="mt-3 w-full" 
                        variant="outline"
                        data-testid={`button-resource-${index}`}
                      >
                        {resource.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="audio-enabled">Audio Responses</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Enable audio responses from the AI counselor
                      </p>
                    </div>
                    <Switch
                      id="audio-enabled"
                      checked={audioEnabled}
                      onCheckedChange={setAudioEnabled}
                      data-testid="switch-audio"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="voice-input">Voice Input</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Use voice to send messages
                      </p>
                    </div>
                    <Switch
                      id="voice-input"
                      checked={voiceMode}
                      onCheckedChange={setVoiceMode}
                      data-testid="switch-voice"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}