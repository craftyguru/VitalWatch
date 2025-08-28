import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Mail, Send, Users, Target, Calendar, Zap, AlertTriangle, Crown, Heart } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'announcement' | 'promotion' | 'emergency' | 'feature' | 'trial';
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome New Users',
    subject: 'Welcome to VitalWatch - Your Safety Journey Begins',
    content: `Hi {{firstName}},

Welcome to VitalWatch! We're excited to have you join our community of safety-conscious individuals.

Your 14-day Pro trial has started, giving you access to:
🚨 Unlimited emergency alerts
🤖 Advanced AI threat detection  
📱 Real-time crisis intervention
🎯 Priority emergency response

Get started by:
1. Adding your emergency contacts
2. Testing the panic button
3. Exploring mood tracking features

Stay safe,
The VitalWatch Team`,
    type: 'announcement'
  },
  {
    id: 'trial-ending',
    name: 'Trial Ending Soon',
    subject: 'Your VitalWatch Pro Trial Expires Tomorrow - Don\'t Lose Protection!',
    content: `Hi {{firstName}},

⚠️ URGENT: Your VitalWatch Pro trial expires in 24 hours!

Don't lose access to these critical safety features:
✅ Unlimited SMS emergency alerts
✅ AI-powered threat detection
✅ Real-time biometric monitoring
✅ 24/7 crisis intervention

SPECIAL OFFER: Upgrade now and get 50% off your first month!

[Upgrade to Guardian - Just $4.99 First Month]

Your safety can't wait.

The VitalWatch Team`,
    type: 'trial'
  },
  {
    id: 'new-feature',
    name: 'New Feature Announcement',
    subject: 'New VitalWatch Feature: {{featureName}}',
    content: `Hi {{firstName}},

We've just released an exciting new feature: {{featureName}}!

{{featureDescription}}

Available now for all {{planType}} users.

Log in to try it: [Open VitalWatch]

Best regards,
The VitalWatch Team`,
    type: 'feature'
  },
  {
    id: 'emergency-update',
    name: 'Emergency System Update',
    subject: 'IMPORTANT: VitalWatch Emergency System Update',
    content: `Hi {{firstName}},

We're performing critical updates to our emergency response system.

What this means for you:
🔧 Improved response times
🔧 Enhanced threat detection
🔧 Better mobile reliability

Update will complete by {{updateTime}}.

Your protection continues uninterrupted.

VitalWatch Team`,
    type: 'emergency'
  },
  {
    id: 'promotion',
    name: 'Special Promotion',
    subject: '🎉 Limited Time: {{promotionTitle}}',
    content: `Hi {{firstName}},

Special offer just for you: {{promotionTitle}}

{{promotionDetails}}

Use code: {{promoCode}}
Valid until: {{expiryDate}}

[Claim Your Offer]

Don't miss out!

The VitalWatch Team`,
    type: 'promotion'
  }
];

interface EmailStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export function EmailBlaster() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [scheduleSend, setScheduleSend] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  const [emailStats] = useState<EmailStats>({
    totalSent: 15420,
    delivered: 15180,
    opened: 9640,
    clicked: 2890,
    bounced: 240,
    deliveryRate: 98.4,
    openRate: 63.5,
    clickRate: 18.9
  });

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCustomSubject(template.subject);
    setCustomContent(template.content);
  };

  const handleSendEmail = async () => {
    if (!customSubject || !customContent) {
      toast({
        title: "Missing Content",
        description: "Please provide both subject and email content.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const emailData = {
        subject: customSubject,
        content: customContent,
        targetAudience,
        scheduleSend,
        scheduleDate: scheduleSend ? scheduleDate : undefined,
        templateType: selectedTemplate?.type || 'announcement'
      };

      const response = await apiRequest('POST', '/api/admin/send-bulk-email', emailData);
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Email Campaign Started",
          description: `Email queued for ${result.recipientCount} users${scheduleSend ? ` (scheduled for ${scheduleDate})` : ''}`,
        });
        
        // Reset form
        setCustomSubject('');
        setCustomContent('');
        setSelectedTemplate(null);
        setScheduleSend(false);
        setScheduleDate('');
      }
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send email campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !customSubject || !customContent) {
      toast({
        title: "Missing Information",
        description: "Please provide test email, subject, and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/admin/send-test-email', {
        email: testEmail,
        subject: customSubject,
        content: customContent
      });

      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${testEmail}`,
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to send test email.",
        variant: "destructive",
      });
    }
  };

  const getAudienceSize = (audience: string) => {
    switch (audience) {
      case 'all': return 2847;
      case 'free': return 1920;
      case 'trial': return 156;
      case 'guardian': return 623;
      case 'professional': return 148;
      case 'inactive': return 445;
      default: return 0;
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Mail className="h-4 w-4" />;
      case 'promotion': return <Target className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'feature': return <Zap className="h-4 w-4" />;
      case 'trial': return <Crown className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  const getTemplateColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'promotion': return 'bg-green-100 text-green-800 border-green-200';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'feature': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'trial': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{emailStats.totalSent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold">{emailStats.deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">{emailStats.openRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold">{emailStats.clickRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Blaster Interface */}
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose Campaign</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="history">Campaign History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Compose Email Campaign</span>
              </CardTitle>
              <CardDescription>
                Send targeted email campaigns to your VitalWatch users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users ({getAudienceSize('all').toLocaleString()})</SelectItem>
                    <SelectItem value="free">Free Plan Users ({getAudienceSize('free').toLocaleString()})</SelectItem>
                    <SelectItem value="trial">Trial Users ({getAudienceSize('trial').toLocaleString()})</SelectItem>
                    <SelectItem value="guardian">Guardian Users ({getAudienceSize('guardian').toLocaleString()})</SelectItem>
                    <SelectItem value="professional">Professional Users ({getAudienceSize('professional').toLocaleString()})</SelectItem>
                    <SelectItem value="inactive">Inactive Users ({getAudienceSize('inactive').toLocaleString()})</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  This campaign will reach {getAudienceSize(targetAudience).toLocaleString()} users
                </p>
              </div>

              {/* Email Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>

              {/* Email Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Enter email content... Use {{firstName}} for personalization"
                  rows={12}
                />
                <p className="text-sm text-gray-600">
                  Available variables: {{firstName}}, {{lastName}}, {{email}}, {{planType}}
                </p>
              </div>

              {/* Schedule Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="schedule"
                    checked={scheduleSend}
                    onCheckedChange={setScheduleSend}
                  />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>

                {scheduleSend && (
                  <div className="space-y-2">
                    <Label htmlFor="schedule-date">Schedule Date & Time</Label>
                    <Input
                      id="schedule-date"
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Test Email */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">Test Email</h4>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter test email address..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleSendTest}>
                    Send Test
                  </Button>
                </div>
              </div>

              {/* Send Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setCustomSubject('');
                  setCustomContent('');
                  setSelectedTemplate(null);
                }}>
                  Clear
                </Button>
                <Button 
                  onClick={handleSendEmail} 
                  disabled={isSending || !customSubject || !customContent}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSending ? 'Sending...' : scheduleSend ? 'Schedule Campaign' : 'Send Campaign'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMAIL_TEMPLATES.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTemplateIcon(template.type)}
                      <h3 className="font-medium">{template.name}</h3>
                    </div>
                    <Badge variant="outline" className={getTemplateColor(template.type)}>
                      {template.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-2">{template.subject}</p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {template.content.split('\n')[0]}...
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Campaigns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, subject: 'New AI Features Launch', sent: '2 hours ago', recipients: 2847, opened: 1820, clicked: 456, status: 'delivered' },
                  { id: 2, subject: 'Trial Ending Reminder', sent: '1 day ago', recipients: 156, opened: 124, clicked: 89, status: 'delivered' },
                  { id: 3, subject: 'Monthly Safety Tips', sent: '3 days ago', recipients: 2510, opened: 1605, clicked: 234, status: 'delivered' },
                  { id: 4, subject: 'Emergency System Update', sent: '1 week ago', recipients: 2847, opened: 2341, clicked: 567, status: 'delivered' },
                  { id: 5, subject: 'Welcome New Users', sent: '2 weeks ago', recipients: 89, opened: 76, clicked: 34, status: 'delivered' }
                ].map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{campaign.subject}</h4>
                      <p className="text-sm text-gray-600">Sent {campaign.sent} to {campaign.recipients.toLocaleString()} users</p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{campaign.opened.toLocaleString()}</p>
                        <p className="text-gray-600">Opened</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{campaign.clicked.toLocaleString()}</p>
                        <p className="text-gray-600">Clicked</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}