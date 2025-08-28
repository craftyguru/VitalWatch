import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  MessageSquare, Send, Users, Clock, CheckCircle, AlertTriangle, 
  Search, Filter, Archive, Star, Reply, Forward, MoreHorizontal,
  User, Phone, Mail, Calendar, Tag, Paperclip
} from 'lucide-react';

interface SupportMessage {
  id: string;
  ticketId: string;
  content: string;
  sender: 'user' | 'admin';
  senderName: string;
  senderEmail: string;
  timestamp: Date;
  attachments?: string[];
  isRead: boolean;
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
  userName: string;
  userEmail: string;
  userPlan: string;
  messageCount: number;
  hasUnread: boolean;
}

interface LiveChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPlan: string;
  status: 'active' | 'waiting' | 'ended';
  startedAt: Date;
  lastActivity: Date;
  messageCount: number;
  hasUnread: boolean;
}

export function AdminMessaging() {
  const { toast } = useToast();
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [liveChatSessions, setLiveChatSessions] = useState<LiveChatSession[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedChat, setSelectedChat] = useState<LiveChatSession | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = () => {
    // Mock support tickets
    setSupportTickets([
      {
        id: 'TK-2024-001',
        subject: 'Panic button not working on iPhone',
        category: 'emergency',
        priority: 'urgent',
        status: 'open',
        createdAt: new Date('2024-08-27T10:30:00'),
        lastReply: new Date('2024-08-27T11:15:00'),
        adminAssigned: 'Sarah Johnson',
        userName: 'John Smith',
        userEmail: 'john.smith@email.com',
        userPlan: 'Guardian',
        messageCount: 3,
        hasUnread: true
      },
      {
        id: 'TK-2024-002',
        subject: 'Trial not converting to paid plan',
        category: 'billing',
        priority: 'high',
        status: 'in-progress',
        createdAt: new Date('2024-08-27T09:20:00'),
        lastReply: new Date('2024-08-27T10:45:00'),
        adminAssigned: 'Mike Chen',
        userName: 'Emily Davis',
        userEmail: 'emily.davis@email.com',
        userPlan: 'Trial',
        messageCount: 5,
        hasUnread: false
      },
      {
        id: 'TK-2024-003',
        subject: 'AI threat detection false positives',
        category: 'ai',
        priority: 'medium',
        status: 'resolved',
        createdAt: new Date('2024-08-26T16:45:00'),
        lastReply: new Date('2024-08-27T08:30:00'),
        adminAssigned: 'Alex Rivera',
        userName: 'Michael Johnson',
        userEmail: 'michael.j@email.com',
        userPlan: 'Professional',
        messageCount: 7,
        hasUnread: false
      }
    ]);

    // Mock live chat sessions
    setLiveChatSessions([
      {
        id: 'CHAT-001',
        userId: 'user-123',
        userName: 'Lisa Williams',
        userEmail: 'lisa.w@email.com',
        userPlan: 'Guardian',
        status: 'active',
        startedAt: new Date('2024-08-27T11:20:00'),
        lastActivity: new Date('2024-08-27T11:28:00'),
        messageCount: 4,
        hasUnread: true
      },
      {
        id: 'CHAT-002',
        userId: 'user-456',
        userName: 'Robert Brown',
        userEmail: 'robert.b@email.com',
        userPlan: 'Free',
        status: 'waiting',
        startedAt: new Date('2024-08-27T11:25:00'),
        lastActivity: new Date('2024-08-27T11:26:00'),
        messageCount: 1,
        hasUnread: true
      }
    ]);
  };

  const loadTicketMessages = async (ticketId: string) => {
    setIsLoading(true);
    // Mock messages for the ticket
    const mockMessages: SupportMessage[] = [
      {
        id: 'msg-1',
        ticketId,
        content: "Hi, I'm having trouble with my panic button on my iPhone. When I press it, nothing happens. This is really concerning since I rely on this for my safety.",
        sender: 'user',
        senderName: 'John Smith',
        senderEmail: 'john.smith@email.com',
        timestamp: new Date('2024-08-27T10:30:00'),
        isRead: true
      },
      {
        id: 'msg-2',
        ticketId,
        content: "Hi John, I'm sorry to hear about this issue. Let me help you troubleshoot this right away. Can you tell me:\n\n1. What iOS version are you running?\n2. When did you last update the VitalWatch app?\n3. Have you tried force-closing and reopening the app?\n\nI'm marking this as urgent and we'll get this resolved quickly.",
        sender: 'admin',
        senderName: 'Sarah Johnson',
        senderEmail: 'sarah@vitalwatch.app',
        timestamp: new Date('2024-08-27T10:35:00'),
        isRead: true
      },
      {
        id: 'msg-3',
        ticketId,
        content: "Thanks for the quick response! I'm on iOS 17.5.1 and I updated the app yesterday. I tried force-closing but it still doesn't work. The button shows the animation but no alert is sent.",
        sender: 'user',
        senderName: 'John Smith',
        senderEmail: 'john.smith@email.com',
        timestamp: new Date('2024-08-27T11:15:00'),
        isRead: false
      }
    ];
    
    setMessages(mockMessages);
    setIsLoading(false);
  };

  const sendReply = async () => {
    if (!newMessage.trim() || (!selectedTicket && !selectedChat)) return;

    const message: SupportMessage = {
      id: Date.now().toString(),
      ticketId: selectedTicket?.id || selectedChat?.id || '',
      content: newMessage.trim(),
      sender: 'admin',
      senderName: 'Support Team',
      senderEmail: 'support@vitalwatch.app',
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      await apiRequest('POST', '/api/admin/send-reply', {
        ticketId: selectedTicket?.id,
        chatId: selectedChat?.id,
        content: message.content
      });

      toast({
        title: "Reply Sent",
        description: "Your message has been sent to the user.",
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await apiRequest('PUT', `/api/admin/tickets/${ticketId}/status`, { status });
      setSupportTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: status as any } : ticket
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update ticket status.",
        variant: "destructive",
      });
    }
  };

  const assignTicket = async (ticketId: string, adminName: string) => {
    try {
      await apiRequest('PUT', `/api/admin/tickets/${ticketId}/assign`, { adminName });
      setSupportTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, adminAssigned: adminName } : ticket
        )
      );
      
      toast({
        title: "Ticket Assigned",
        description: `Ticket assigned to ${adminName}`,
      });
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign ticket.",
        variant: "destructive",
      });
    }
  };

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'professional': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'guardian': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trial': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'free': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <Tabs defaultValue="tickets" className="h-full">
          <TabsList className="grid w-full grid-cols-2 sticky top-0 z-10">
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="chat">Live Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="h-full overflow-hidden">
            {/* Filters */}
            <div className="p-4 space-y-3 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ticket List */}
            <div className="overflow-y-auto h-full">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setSelectedChat(null);
                    loadTicketMessages(ticket.id);
                  }}
                  className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-white border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-500">{ticket.id}</span>
                        {ticket.hasUnread && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm truncate">{ticket.subject}</h3>
                      <p className="text-xs text-gray-600 truncate">{ticket.userName} • {ticket.userEmail}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span>{ticket.messageCount} messages</span>
                      <Badge variant="outline" className={getPlanColor(ticket.userPlan)}>
                        {ticket.userPlan}
                      </Badge>
                    </div>
                    <span>{ticket.lastReply?.toLocaleTimeString()}</span>
                  </div>
                  
                  {ticket.adminAssigned && (
                    <div className="flex items-center mt-2 text-xs text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      {ticket.adminAssigned}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="h-full overflow-hidden">
            {/* Live Chat Sessions */}
            <div className="overflow-y-auto h-full">
              {liveChatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedChat(session);
                    setSelectedTicket(null);
                    // Load chat messages
                  }}
                  className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                    selectedChat?.id === session.id ? 'bg-white border-l-4 border-l-green-600' : ''
                  } ${session.hasUnread ? 'bg-green-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          session.status === 'active' ? 'bg-green-500' :
                          session.status === 'waiting' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-gray-500">{session.id}</span>
                        {session.hasUnread && (
                          <div className="w-2 h-2 bg-green-600 rounded-full" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{session.userName}</h3>
                      <p className="text-xs text-gray-600">{session.userEmail}</p>
                    </div>
                    <Badge variant="outline" className={getPlanColor(session.userPlan)}>
                      {session.userPlan}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{session.messageCount} messages</span>
                    <span>{session.lastActivity.toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Started {session.startedAt.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {(selectedTicket || selectedChat) ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedTicket ? selectedTicket.subject : `Chat with ${selectedChat?.userName}`}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {selectedTicket ? selectedTicket.userName : selectedChat?.userName}
                    </span>
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {selectedTicket ? selectedTicket.userEmail : selectedChat?.userEmail}
                    </span>
                    <Badge variant="outline" className={getPlanColor(selectedTicket ? selectedTicket.userPlan : selectedChat?.userPlan || '')}>
                      {selectedTicket ? selectedTicket.userPlan : selectedChat?.userPlan}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedTicket && (
                    <>
                      <Select value={selectedTicket.status} onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={selectedTicket.adminAssigned || 'unassigned'} onValueChange={(value) => assignTicket(selectedTicket.id, value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                          <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                          <SelectItem value="Alex Rivera">Alex Rivera</SelectItem>
                          <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-lg ${
                        message.sender === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{message.senderName}</span>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex items-center mt-2 space-x-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-xs">{message.attachments.length} attachment(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t bg-white">
              <div className="space-y-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="min-h-24"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-1" />
                      Attach
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-1" />
                      Template
                    </Button>
                  </div>
                  <Button onClick={sendReply} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
              <p className="text-sm">Choose a support ticket or live chat session to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}