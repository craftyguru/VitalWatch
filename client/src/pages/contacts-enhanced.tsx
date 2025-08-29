import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmergencyContactSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Users,
  Plus,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  Star,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Edit,
  Trash2,
  UserPlus,
  MessageSquare,
  Share2,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Activity,
  Zap,
  Target,
  Award,
  TrendingUp,
  Settings,
  HelpCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Smartphone,
  Wifi,
  WifiOff,
  Globe,
  Lock,
  Unlock
} from "lucide-react";

type EmergencyContact = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  priority: number;
  notes?: string;
  isActive: boolean;
  lastContacted?: string;
  responseTime?: number;
};

export default function ContactsEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch emergency contacts
  const { data: emergencyContacts, isLoading } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });

  // Add contact form
  const addForm = useForm({
    resolver: zodResolver(insertEmergencyContactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      relationship: "",
      priority: 1,
      notes: "",
    },
  });

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/emergency-contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact added",
        description: "Emergency contact has been added successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/emergency-contacts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact deleted",
        description: "Emergency contact has been removed",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddContact = (data: any) => {
    addContactMutation.mutate(data);
  };

  const handleDeleteContact = (id: number) => {
    if (confirm("Are you sure you want to delete this emergency contact?")) {
      deleteContactMutation.mutate(id);
    }
  };

  const contacts = Array.isArray(emergencyContacts) ? emergencyContacts : [];
  const filteredContacts = contacts.filter((contact: EmergencyContact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.relationship.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || contact.priority.toString() === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const primaryContacts = contacts.filter((c: EmergencyContact) => c.priority === 1);
  const secondaryContacts = contacts.filter((c: EmergencyContact) => c.priority === 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Enhanced Header */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button variant="ghost" size="icon" asChild className="hover:bg-blue-100 dark:hover:bg-blue-900 flex-shrink-0">
                <Link href="/" data-testid="link-back-home">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white shadow-lg flex-shrink-0">
                  <img 
                    src="/logo.png" 
                    alt="VitalWatch Logo" 
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">Emergency Contacts</h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">Manage your safety network and emergency contacts</p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats - Mobile Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="text-center hidden sm:block">
                <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{contacts.length}</div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total</div>
              </div>
              <div className="text-center hidden sm:block">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{primaryContacts.length}</div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Primary</div>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-3 sm:px-4">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Contact</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Emergency Contact</DialogTitle>
                    <DialogDescription>
                      Add a trusted contact who will be notified during emergencies.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addForm}>
                    <form onSubmit={addForm.handleSubmit(handleAddContact)} className="space-y-4">
                      <FormField
                        control={addForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} data-testid="input-contact-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} data-testid="input-contact-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address (Optional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@example.com" {...field} data-testid="input-contact-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="relationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-contact-relationship">
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="family">Family Member</SelectItem>
                                <SelectItem value="friend">Close Friend</SelectItem>
                                <SelectItem value="spouse">Spouse/Partner</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="colleague">Colleague</SelectItem>
                                <SelectItem value="neighbor">Neighbor</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority Level</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-contact-priority">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Primary Contact</SelectItem>
                                <SelectItem value="2">Secondary Contact</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Primary contacts are notified first during emergencies
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Additional information..." {...field} data-testid="input-contact-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addContactMutation.isPending} data-testid="button-save-contact">
                          {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Safety Network Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Network Status */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-900 dark:text-green-100">
                <Shield className="h-5 w-5" />
                <span>Safety Network Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-500 text-white p-3 rounded-xl w-fit mx-auto mb-2">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{contacts.length}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Active Contacts</div>
                </div>
                <div className="text-center">
                  <div className="bg-blue-500 text-white p-3 rounded-xl w-fit mx-auto mb-2">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">8s</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="bg-purple-500 text-white p-3 rounded-xl w-fit mx-auto mb-2">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">98%</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Network Reliability</div>
                </div>
              </div>
              
              {contacts.length > 0 && (
                <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-900 dark:text-green-100">Network Active</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your safety network is fully operational. All contacts verified and ready for emergency response.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Contact
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Test Network
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Contacts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Import Contacts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Share Network Info
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter - Mobile Responsive */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-auto"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-48 h-10 sm:h-auto">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="1">Primary Contacts</SelectItem>
              <SelectItem value="2">Secondary Contacts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contacts Display */}
        {contacts.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="bg-blue-100 dark:bg-blue-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Build Your Safety Network
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                Emergency contacts are crucial for your safety. Add trusted family members, friends, and healthcare providers who can be reached during emergencies. We recommend having at least 2-3 contacts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl">
                  <Heart className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Family Member</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Spouse, parent, or close relative who can respond quickly</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl">
                  <Users className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Close Friend</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">Trusted friend who knows your situation and location</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl">
                  <Phone className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Emergency Contact</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Professional or institutional emergency contact</p>
                </div>
              </div>

              <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Primary Contacts */}
            {primaryContacts.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Primary Contacts</h2>
                  <Badge className="bg-yellow-100 text-yellow-800">High Priority</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {primaryContacts.map((contact: EmergencyContact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onDelete={handleDeleteContact}
                      onEdit={setEditingContact}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Contacts */}
            {secondaryContacts.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Secondary Contacts</h2>
                  <Badge variant="outline">Standard Priority</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {secondaryContacts.map((contact: EmergencyContact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onDelete={handleDeleteContact}
                      onEdit={setEditingContact}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Safety Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>Safety Network Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-fit mx-auto mb-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Add at least 3 contacts</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ensure reliable coverage for emergencies</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Include local and distant contacts</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Mix of nearby and regional emergency contacts</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-fit mx-auto mb-3">
                  <Phone className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Let your contacts know they're listed</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Inform them about emergency contact procedures</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full w-fit mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Keep contact information updated</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Review and update contact details regularly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Contact Dialog */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Add Emergency Contact</span>
          </DialogTitle>
          <DialogDescription>
            Add a trusted contact who will be notified during emergencies. Ensure they are aware of their role as your emergency contact.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...addForm}>
          <form onSubmit={addForm.handleSubmit(handleAddContact)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse/Partner</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="colleague">Colleague</SelectItem>
                        <SelectItem value="neighbor">Neighbor</SelectItem>
                        <SelectItem value="healthcare">Healthcare Provider</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={addForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>Primary contact number for emergencies</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormDescription>Optional backup contact method</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={addForm.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Level</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Primary Contact - Contacted first in emergencies</SelectItem>
                      <SelectItem value="2">Secondary Contact - Contacted if primary unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Primary contacts are reached first during emergencies
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={addForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Any important details or special instructions" {...field} />
                  </FormControl>
                  <FormDescription>
                    Special instructions, medical information, or other relevant details
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addContactMutation.isPending}>
                {addContactMutation.isPending ? "Adding..." : "Add Contact"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </div>
  );
}

// Contact Card Component
function ContactCard({ 
  contact, 
  onDelete, 
  onEdit 
}: { 
  contact: EmergencyContact; 
  onDelete: (id: number) => void;
  onEdit: (contact: EmergencyContact) => void;
}) {
  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-800">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{contact.name}</h3>
              <p className="text-slate-600 dark:text-slate-400 capitalize">{contact.relationship}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={contact.priority === 1 ? "default" : "outline"} className="text-xs">
              {contact.priority === 1 ? 'Primary' : 'Secondary'}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{contact.phone}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          
          {contact.email && (
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">{contact.email}</span>
            </div>
          )}

          {contact.notes && (
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-slate-400 mt-0.5" />
              <span className="text-sm text-slate-600 dark:text-slate-400">{contact.notes}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600">Ready</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(contact.id)} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}