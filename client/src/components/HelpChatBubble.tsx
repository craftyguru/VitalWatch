import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { 
  MessageCircle, X, Send, User, Bot, Clock, CheckCircle, 
  AlertCircle, HelpCircle, Settings, Zap, Heart, Shield,
  ChevronDown, ChevronUp, Minimize2, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'admin' | 'bot';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  adminName?: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
  lastReply?: Date;
  adminAssigned?: string;
}

const FAQ_ITEMS = [
  {
    question: "How do I test the panic button?",
    answer: "Go to Settings > Emergency Settings > Test Panic Button. This will send a test alert without triggering real emergency contacts.",
    category: "emergency"
  },
  {
    question: "How many emergency contacts can I add?",
    answer: "Free: 3 contacts, Guardian: Unlimited, Professional: Unlimited with family monitoring.",
    category: "contacts"
  },
  {
    question: "How accurate is the AI threat detection?",
    answer: "Our AI has 94.2% accuracy in threat detection, continuously improving with machine learning algorithms.",
    category: "ai"
  },
  {
    question: "Can I use VitalWatch without GPS?",
    answer: "Yes, but location sharing improves emergency response. You can enable/disable in Privacy Settings.",
    category: "privacy"
  },
  {
    question: "How do I upgrade to Guardian or Professional?",
    answer: "Go to Settings > Billing or start your 14-day free trial during account setup.",
    category: "billing"
  },
  {
    question: "What happens if my trial expires?",
    answer: "You'll be downgraded to the Free plan. Upgrade anytime to restore Pro features.",
    category: "trial"
  }
];

const QUICK_ACTIONS = [
  { label: "Test Emergency System", icon: <Shield className="h-4 w-4" />, action: "test-emergency" },
  { label: "Billing & Subscription", icon: <Settings className="h-4 w-4" />, action: "billing-help" },
  { label: "AI Features Guide", icon: <Zap className="h-4 w-4" />, action: "ai-guide" },
  { label: "Report a Bug", icon: <AlertCircle className="h-4 w-4" />, action: "report-bug" },
  { label: "Feature Request", icon: <Heart className="h-4 w-4" />, action: "feature-request" },
  { label: "Privacy & Security", icon: <User className="h-4 w-4" />, action: "privacy-help" }
];

export function HelpChatBubble() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'chat' | 'faq' | 'ticket'>('main');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium' as const,
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial data
  useEffect(() => {
    if (isOpen && user) {
      loadSupportTickets();
      loadChatHistory();
    }
  }, [isOpen, user]);

  const loadSupportTickets = async () => {
    try {
      const response = await apiRequest('GET', '/api/support/tickets');
      if (response.ok) {
        const tickets = await response.json();
        setSupportTickets(tickets);
      }
    } catch (error) {
      console.error('Failed to load support tickets:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await apiRequest('GET', '/api/support/chat-history');
      if (response.ok) {
        const history = await response.json();
        setMessages(history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await apiRequest('POST', '/api/support/send-message', {
        content: message.content,
        type: 'support_request'
      });

      if (response.ok) {
        // Simulate typing delay
        setTimeout(() => {
          setIsTyping(false);
          // Add auto-response or wait for admin reply
          const autoReply: Message = {
            id: (Date.now() + 1).toString(),
            content: "Thanks for reaching out! A VitalWatch team member will respond shortly. For urgent emergencies, use the panic button or call 911.",
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, autoReply]);
        }, 2000);

        toast({
          title: "Message Sent",
          description: "Your message has been sent to our support team.",
        });
      }
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createSupportTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/support/create-ticket', ticketForm);
      if (response.ok) {
        const newTicket = await response.json();
        setSupportTickets(prev => [newTicket, ...prev]);
        setTicketForm({ subject: '', category: '', priority: 'medium', description: '' });
        setCurrentView('main');
        
        toast({
          title: "Ticket Created",
          description: `Support ticket #${newTicket.id} has been created.`,
        });
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'test-emergency':
        setCurrentView('chat');
        const testMessage: Message = {
          id: Date.now().toString(),
          content: "I need help testing my emergency system",
          sender: 'user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, testMessage]);
        break;
      case 'billing-help':
        window.location.href = '/billing';
        break;
      case 'report-bug':
        setCurrentView('ticket');
        setTicketForm(prev => ({ ...prev, category: 'bug', subject: 'Bug Report: ' }));
        break;
      case 'feature-request':
        setCurrentView('ticket');
        setTicketForm(prev => ({ ...prev, category: 'feature', subject: 'Feature Request: ' }));
        break;
      default:
        setCurrentView('chat');
    }
  };

  const filteredFAQ = FAQ_ITEMS.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      {/* Chat Bubble Trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg relative"
              size="lg"
            >
              <MessageCircle className="h-6 w-6" />
              {hasNewMessage && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: 100, y: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={{ scale: 0, opacity: 0, x: 100, y: 100 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className={`w-96 shadow-2xl ${isMinimized ? 'h-16' : 'h-[600px]'} transition-all duration-300`}>
              {/* Header */}
              <CardHeader className="p-4 bg-blue-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 p-1 rounded-full">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">VitalWatch Support</CardTitle>
                      <CardDescription className="text-blue-100 text-xs">
                        We're here to help 24/7
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Content */}
              {!isMinimized && (
                <CardContent className="p-0 h-full overflow-hidden flex flex-col">
                  {currentView === 'main' && (
                    <div className="p-4 space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-800">How can we help you?</h3>
                        <p className="text-sm text-gray-600">Choose an option below or start a chat</p>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-2">
                        {QUICK_ACTIONS.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start text-left"
                            onClick={() => handleQuickAction(action.action)}
                          >
                            {action.icon}
                            <span className="ml-2">{action.label}</span>
                          </Button>
                        ))}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" onClick={() => setCurrentView('chat')}>
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                        <Button variant="outline" onClick={() => setCurrentView('faq')}>
                          <HelpCircle className="h-4 w-4 mr-1" />
                          FAQ
                        </Button>
                        <Button variant="outline" onClick={() => setCurrentView('ticket')}>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Ticket
                        </Button>
                      </div>

                      {/* Recent Tickets */}
                      {supportTickets.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Recent Tickets</h4>
                          {supportTickets.slice(0, 2).map((ticket) => (
                            <div key={ticket.id} className="p-2 border rounded-lg text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{ticket.subject}</span>
                                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                  {ticket.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                #{ticket.id} • {ticket.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentView === 'chat' && (
                    <div className="flex flex-col h-full">
                      {/* Back Button */}
                      <div className="p-2 border-b">
                        <Button variant="ghost" size="sm" onClick={() => setCurrentView('main')}>
                          ← Back to Help
                        </Button>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.sender === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : message.sender === 'admin'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {message.sender === 'admin' && (
                                <p className="text-xs font-medium mb-1">
                                  {message.adminName || 'Support Team'}
                                </p>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs opacity-70">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                                {message.sender === 'user' && message.status && (
                                  <span className="text-xs opacity-70">
                                    {message.status === 'sent' && <Clock className="h-3 w-3" />}
                                    {message.status === 'delivered' && <CheckCircle className="h-3 w-3" />}
                                    {message.status === 'read' && <CheckCircle className="h-3 w-3 text-blue-300" />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t">
                        <div className="flex space-x-2">
                          <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 min-h-0 resize-none"
                            rows={1}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                          />
                          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentView === 'faq' && (
                    <div className="flex flex-col h-full">
                      {/* Back Button */}
                      <div className="p-2 border-b">
                        <Button variant="ghost" size="sm" onClick={() => setCurrentView('main')}>
                          ← Back to Help
                        </Button>
                      </div>

                      {/* Search */}
                      <div className="p-4 border-b">
                        <Input
                          placeholder="Search FAQ..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      {/* FAQ Items */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {filteredFAQ.map((item, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <h4 className="font-medium text-sm mb-2">{item.question}</h4>
                            <p className="text-sm text-gray-600">{item.answer}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentView === 'ticket' && (
                    <div className="flex flex-col h-full">
                      {/* Back Button */}
                      <div className="p-2 border-b">
                        <Button variant="ghost" size="sm" onClick={() => setCurrentView('main')}>
                          ← Back to Help
                        </Button>
                      </div>

                      {/* Ticket Form */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={ticketForm.subject}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Brief description of your issue"
                          />
                        </div>

                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bug">Bug Report</SelectItem>
                              <SelectItem value="feature">Feature Request</SelectItem>
                              <SelectItem value="billing">Billing Issue</SelectItem>
                              <SelectItem value="emergency">Emergency System</SelectItem>
                              <SelectItem value="account">Account & Login</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select value={ticketForm.priority} onValueChange={(value: any) => setTicketForm(prev => ({ ...prev, priority: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={ticketForm.description}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Provide detailed information about your issue..."
                            rows={4}
                          />
                        </div>

                        <Button onClick={createSupportTicket} className="w-full">
                          Create Support Ticket
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}