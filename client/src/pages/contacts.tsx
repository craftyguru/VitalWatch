import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmergencyContactSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Users,
  Plus,
  Phone,
  Mail,
  Edit,
  Trash2,
  Star,
  AlertTriangle,
  Shield,
  ArrowLeft,
  Activity,
  TrendingUp,
  Wind,
  Settings,
  UserPlus,
  Heart,
  MapPin
} from "lucide-react";

const relationships = [
  "Family Member",
  "Spouse/Partner",
  "Friend",
  "Therapist",
  "Doctor",
  "Counselor",
  "Colleague",
  "Neighbor",
  "Other"
];

export default function Contacts() {
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    },
  });

  // Edit contact form
  const editForm = useForm({
    resolver: zodResolver(insertEmergencyContactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      relationship: "",
      priority: 1,
    },
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/emergency-contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency contact added",
        description: "Your contact has been successfully added to your network",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
      setIsAddContactOpen(false);
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

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/emergency-contacts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact updated",
        description: "Your emergency contact has been updated",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
      setEditingContact(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update contact",
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
        title: "Contact removed",
        description: "The emergency contact has been removed from your network",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddContact = (data: any) => {
    createContactMutation.mutate(data);
  };

  const handleEditContact = (data: any) => {
    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data });
    }
  };

  const handleDeleteContact = (id: number, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your emergency contacts?`)) {
      deleteContactMutation.mutate(id);
    }
  };

  const startEditing = (contact: any) => {
    setEditingContact(contact);
    editForm.reset({
      name: contact.name,
      phone: contact.phone || "",
      email: contact.email || "",
      relationship: contact.relationship,
      priority: contact.priority,
    });
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Primary";
      case 2: return "Secondary";
      case 3: return "Tertiary";
      default: return "Other";
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-red-100 text-red-700";
      case 2: return "bg-yellow-100 text-yellow-700";
      case 3: return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-700">Emergency Contacts</h1>
              <p className="text-xs text-neutral-500">Your safety network</p>
            </div>
          </div>
          <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
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
                          <Input placeholder="Enter full name" {...field} />
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
                          <Input placeholder="(555) 123-4567" {...field} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
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
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {relationships.map((rel) => (
                              <SelectItem key={rel} value={rel}>
                                {rel}
                              </SelectItem>
                            ))}
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
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 - Primary (First to be contacted)</SelectItem>
                            <SelectItem value="2">2 - Secondary (Second priority)</SelectItem>
                            <SelectItem value="3">3 - Tertiary (Third priority)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={createContactMutation.isPending} className="flex-1">
                      {createContactMutation.isPending ? "Adding..." : "Add Contact"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddContactOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Info Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-1">Your Safety Network</h3>
                <p className="text-sm text-blue-700">
                  These contacts will be notified during emergency alerts with your location and message.
                  Priority 1 contacts are contacted first, followed by Priority 2, then Priority 3.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-neutral-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : emergencyContacts && emergencyContacts.length > 0 ? (
          <div className="space-y-4">
            {emergencyContacts
              .sort((a: any, b: any) => a.priority - b.priority)
              .map((contact: any) => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={contact.name} />
                        <AvatarFallback className="bg-primary text-white text-lg">
                          {contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-neutral-800">{contact.name}</h3>
                            <p className="text-sm text-neutral-600">{contact.relationship}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getPriorityColor(contact.priority)}`}>
                              {getPriorityLabel(contact.priority)}
                            </Badge>
                            {contact.priority === 1 && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-1 mb-3">
                          {contact.phone && (
                            <div className="flex items-center space-x-2 text-sm text-neutral-600">
                              <Phone className="h-3 w-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center space-x-2 text-sm text-neutral-600">
                              <Mail className="h-3 w-3" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {contact.phone && (
                              <Button
                                size="sm"
                                onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                                className="bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                Call
                              </Button>
                            )}
                            {contact.email && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`mailto:${contact.email}`, '_self')}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(contact)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteContact(contact.id, contact.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="border-dashed border-neutral-300">
            <CardContent className="p-8 text-center">
              <UserPlus className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Emergency Contacts</h3>
              <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                Add trusted contacts who will be notified during emergencies. 
                Include family, friends, or healthcare providers who can help in a crisis.
              </p>
              <Button onClick={() => setIsAddContactOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Heart className="h-5 w-5" />
              <span>Safety Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                <span>Add at least 2-3 emergency contacts for reliable coverage</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                <span>Include both local and distant contacts in case of regional emergencies</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                <span>Let your contacts know they're listed as emergency contacts</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                <span>Keep contact information updated regularly</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Edit Contact Dialog */}
      {editingContact && (
        <Dialog open={true} onOpenChange={() => setEditingContact(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Emergency Contact</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditContact)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {relationships.map((rel) => (
                            <SelectItem key={rel} value={rel}>
                              {rel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 - Primary (First to be contacted)</SelectItem>
                          <SelectItem value="2">2 - Secondary (Second priority)</SelectItem>
                          <SelectItem value="3">3 - Tertiary (Third priority)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-2">
                  <Button type="submit" disabled={updateContactMutation.isPending} className="flex-1">
                    {updateContactMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingContact(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-neutral-100 px-4 py-3 fixed bottom-0 left-0 right-0 z-30">
        <div className="grid grid-cols-5 gap-1">
          <Link href="/" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Activity className="h-5 w-5 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
          
          <Link href="/mood" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs">Mood</span>
          </Link>
          
          <Link href="/tools" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Wind className="h-5 w-5 mb-1" />
            <span className="text-xs">Tools</span>
          </Link>
          
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-blue-50 text-primary">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Network</span>
          </div>
          
          <Link href="/profile" className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-neutral-100 transition-all text-neutral-400">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
