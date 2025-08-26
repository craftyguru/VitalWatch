import { useState, useEffect, useRef } from "react";
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
  Send, 
  Bot, 
  User, 
  Heart, 
  AlertTriangle,
  Clock,
  Shield,
  Zap,
  Brain,
  Headphones,
  Phone,
  Video,
  Settings,
  TrendingUp,
  Award,
  Star,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";

interface CrisisChatSupportProps {
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
  onEmergencyTrigger?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'suggestion' | 'resource' | 'escalation';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 23,
    averageSessionLength: 12,
    crisisDetections: 3,
    successfulDeescalations: 18
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const crisisResponses = {
    greetings: [
      "I'm here to support you through this difficult time. How are you feeling right now?",
      "Thank you for reaching out. It takes courage to ask for help. What's on your mind?",
      "I'm glad you're here. You're not alone in this. Can you tell me what's happening?",
      "I'm here to listen and help. What would you like to talk about today?"
    ],
    high_risk: [
      "I hear that you're in significant pain right now. Your feelings are valid, and I want to help you through this.",
      "It sounds like you're going through something really difficult. Can you help me understand what's making things feel so overwhelming?",
      "I'm concerned about what you're sharing. Have you been having thoughts of hurting yourself or others?",
      "Right now, your safety is the most important thing. Are you somewhere safe? Is there someone who can be with you?"
    ],
    supportive: [
      "You're being incredibly brave by sharing this with me. That shows real strength.",
      "It's completely understandable to feel this way given what you're going through.",
      "You've taken an important step by reaching out. That's something to be proud of.",
      "These feelings are difficult, but they are temporary. We can work through this together."
    ],
    coping_suggestions: [
      "Let's try a quick grounding technique together. Can you name 5 things you can see around you?",
      "Would you like to try some breathing exercises with me? They can help calm your nervous system.",
      "Sometimes it helps to focus on the present moment. What can you hear right now?",
      "Have you tried any coping strategies that have helped you in the past?"
    ]
  };

  const initializeChat = () => {
    const sessionId = Date.now().toString();
    setCurrentSession(sessionId);
    
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      content: getResponseBasedOnCrisisLevel('greeting'),
      timestamp: new Date(),
      type: 'text',
      urgency: 'low'
    };
    
    setMessages([welcomeMessage]);
  };

  const getResponseBasedOnCrisisLevel = (context: string): string => {
    switch (context) {
      case 'greeting':
        return crisisResponses.greetings[Math.floor(Math.random() * crisisResponses.greetings.length)];
      case 'high_risk':
        return crisisResponses.high_risk[Math.floor(Math.random() * crisisResponses.high_risk.length)];
      case 'supportive':
        return crisisResponses.supportive[Math.floor(Math.random() * crisisResponses.supportive.length)];
      case 'coping':
        return crisisResponses.coping_suggestions[Math.floor(Math.random() * crisisResponses.coping_suggestions.length)];
      default:
        return "I'm here to listen and support you. Please tell me more about how you're feeling.";
    }
  };

  const analyzeMessageForRisk = (message: string): 'low' | 'medium' | 'high' | 'critical' => {
    const highRiskWords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'want to die'];
    const mediumRiskWords = ['hopeless', 'worthless', 'can\'t go on', 'desperate', 'trapped'];
    const lowRiskWords = ['sad', 'anxious', 'stressed', 'worried', 'upset'];
    
    const lowerMessage = message.toLowerCase();
    
    if (highRiskWords.some(word => lowerMessage.includes(word))) return 'critical';
    if (mediumRiskWords.some(word => lowerMessage.includes(word))) return 'high';
    if (lowRiskWords.some(word => lowerMessage.includes(word))) return 'medium';
    
    return 'low';
  };

  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    const riskLevel = analyzeMessageForRisk(userMessage);
    
    let responseContent = "";
    let responseType: ChatMessage['type'] = 'text';
    
    if (riskLevel === 'critical') {
      responseContent = getResponseBasedOnCrisisLevel('high_risk');
      responseType = 'escalation';
      setEmergencyMode(true);
      
      // Trigger emergency protocols
      setTimeout(() => {
        const emergencyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          content: "🚨 High-risk situation detected. Emergency resources are being displayed. Please consider contacting emergency services immediately.",
          timestamp: new Date(),
          type: 'escalation',
          urgency: 'critical'
        };
        setMessages(prev => [...prev, emergencyMessage]);
      }, 1000);
      
    } else if (riskLevel === 'high') {
      responseContent = getResponseBasedOnCrisisLevel('high_risk');
      responseType = 'suggestion';
    } else if (riskLevel === 'medium') {
      responseContent = getResponseBasedOnCrisisLevel('supportive');
    } else {
      responseContent = getResponseBasedOnCrisisLevel('coping');
    }
    
    return {
      id: Date.now().toString(),
      sender: 'ai',
      content: responseContent,
      timestamp: new Date(),
      type: responseType,
      urgency: riskLevel
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleEmergencyCall = (resource: SupportResource) => {
    toast({
      title: "Emergency Resource Activated",
      description: `Connecting to ${resource.title}`,
      variant: "default"
    });
    
    if (onEmergencyTrigger) {
      onEmergencyTrigger();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = (message: ChatMessage) => {
    switch (message.urgency) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      default:
        return message.sender === 'ai' ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                <MessageCircle className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-teal-900 dark:text-teal-100">
                  Crisis Chat Support
                </CardTitle>
                <p className="text-teal-700 dark:text-teal-300">
                  AI-powered emotional support and guided crisis intervention available 24/7
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Star className="h-3 w-3 mr-1" />
                4.9 Rating
              </Badge>
              {emergencyMode && (
                <Badge className="bg-red-100 text-red-800 border-red-300 animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Emergency Mode
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="resources">Crisis Resources</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                      <span className="font-medium truncate">AI Crisis Counselor</span>
                      <Badge variant="secondary" className="flex-shrink-0">Online</Badge>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVoiceMode(!voiceMode)}
                        className="h-8 w-8 p-0"
                      >
                        {voiceMode ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className="h-8 w-8 p-0"
                      >
                        {audioEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                            <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                {message.sender === 'user' ? (
                                  <User className="h-4 w-4" />
                                ) : message.sender === 'ai' ? (
                                  <Bot className="h-4 w-4" />
                                ) : (
                                  <Shield className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`p-3 rounded-lg border ${getMessageStyle(message)}`}>
                                  <p className="text-sm break-words">{message.content}</p>
                                  {message.type === 'escalation' && (
                                    <div className="mt-2 pt-2 border-t border-current/20">
                                      <p className="text-xs font-medium break-words">This message has been flagged for immediate attention.</p>
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="flex items-start space-x-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div className="bg-blue-100 border border-blue-300 p-3 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Input Area */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Share what's on your mind... I'm here to listen."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!inputMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 break-words">
                      This AI provides support but is not a replacement for professional help. In emergencies, contact 911.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel - Quick Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-3 px-3"
                    onClick={() => setInputMessage("I'm feeling overwhelmed and need help")}
                  >
                    <Heart className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm break-words">I need immediate support</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-3 px-3"
                    onClick={() => setInputMessage("Can you guide me through a breathing exercise?")}
                  >
                    <Brain className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm break-words">Breathing exercises</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-3 px-3"
                    onClick={() => setInputMessage("I'm having a panic attack")}
                  >
                    <Zap className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm break-words">Panic attack help</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-3 px-3"
                    onClick={() => setInputMessage("I'm having thoughts of self-harm")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm break-words">Crisis intervention</span>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Duration</span>
                    <span>{currentSession ? Math.floor((Date.now() - parseInt(currentSession)) / 60000) : 0} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Messages</span>
                    <span>{messages.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Crisis Level</span>
                    <Badge variant="secondary">{crisisLevel}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Crisis Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportResources.map((resource, index) => (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  resource.urgency === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 
                  resource.urgency === 'high' ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' : 
                  'border-blue-300 bg-blue-50 dark:bg-blue-950/20'
                }`}
                onClick={() => handleEmergencyCall(resource)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      resource.urgency === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : 
                      resource.urgency === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' : 
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <resource.icon className={`h-6 w-6 ${
                        resource.urgency === 'critical' ? 'text-red-600' : 
                        resource.urgency === 'high' ? 'text-orange-600' : 
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={resource.urgency === 'critical' ? 'destructive' : 'secondary'}>
                          {resource.urgency}
                        </Badge>
                        <span className="text-sm font-medium">{resource.action}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Chat Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Voice Mode</Label>
                      <p className="text-xs text-muted-foreground">Enable voice input and output</p>
                    </div>
                    <Switch checked={voiceMode} onCheckedChange={setVoiceMode} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Audio Responses</Label>
                      <p className="text-xs text-muted-foreground">AI speaks responses aloud</p>
                    </div>
                    <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Emergency Mode</Label>
                      <p className="text-xs text-muted-foreground">Enhanced crisis detection and response</p>
                    </div>
                    <Switch checked={emergencyMode} onCheckedChange={setEmergencyMode} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Crisis Detection Sensitivity</Label>
                    <p className="text-xs text-muted-foreground mb-2">How quickly the AI escalates conversations</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Low</Button>
                      <Button variant="default" size="sm">Medium</Button>
                      <Button variant="outline" size="sm">High</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Response Style</Label>
                    <p className="text-xs text-muted-foreground mb-2">AI conversation approach</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Gentle</Button>
                      <Button variant="default" size="sm">Balanced</Button>
                      <Button variant="outline" size="sm">Direct</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold text-blue-600">{sessionStats.totalSessions}</div>
                <div className="text-xs text-muted-foreground">Total Sessions</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-lg font-bold text-green-600">{sessionStats.averageSessionLength}m</div>
                <div className="text-xs text-muted-foreground">Avg Session Length</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-lg font-bold text-orange-600">{sessionStats.crisisDetections}</div>
                <div className="text-xs text-muted-foreground">Crisis Detections</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-lg font-bold text-purple-600">{sessionStats.successfulDeescalations}</div>
                <div className="text-xs text-muted-foreground">Successful De-escalations</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}