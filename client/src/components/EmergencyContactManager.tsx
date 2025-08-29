import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { insertEmergencyContactSchema } from '@shared/schema';
import type { z } from 'zod';

type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;

export function EmergencyContactManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  // Fetch emergency contacts with real data
  const { data: emergencyContacts, isLoading, error } = useQuery({
    queryKey: ["/api/emergency-contacts"],
  });

  // Add contact form
  const addForm = useForm<InsertEmergencyContact>({
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
  const editForm = useForm<InsertEmergencyContact>({
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
    mutationFn: async (data: InsertEmergencyContact) => {
      const response = await apiRequest("POST", "/api/emergency-contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency contact added",
        description: "Your contact has been successfully added to your network",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add contact",
        description: error.message || "An error occurred while adding the contact",
        variant: "destructive",
      });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertEmergencyContact> }) => {
      const response = await apiRequest("PUT", `/api/emergency-contacts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact updated",
        description: "Emergency contact has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
      setEditingContact(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update contact",
        description: error.message || "An error occurred while updating the contact",
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
        description: "Emergency contact has been removed from your network",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove contact",
        description: error.message || "An error occurred while removing the contact",
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: InsertEmergencyContact) => {
    createContactMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertEmergencyContact) => {
    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data });
    }
  };

  const startEdit = (contact: any) => {
    setEditingContact(contact);
    editForm.reset({
      name: contact.name,
      phone: contact.phone || "",
      email: contact.email || "",
      relationship: contact.relationship,
      priority: contact.priority,
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Loading emergency contacts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Failed to load emergency contacts</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const contacts = Array.isArray(emergencyContacts) ? emergencyContacts : [];
  const hasContacts = contacts.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold">Emergency Contact Network</h2>
          {hasContacts && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''} configured
            </Badge>
          )}
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Contact</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...addForm.register("name")}
                  placeholder="Enter contact's full name"
                />
                {addForm.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{addForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...addForm.register("phone")}
                  placeholder="+1 (555) 123-4567"
                />
                {addForm.formState.errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{addForm.formState.errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...addForm.register("email")}
                  placeholder="contact@example.com"
                />
                {addForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{addForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Select value={addForm.watch("relationship")} onValueChange={(value) => addForm.setValue("relationship", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="friend">Close Friend</SelectItem>
                    <SelectItem value="doctor">Healthcare Provider</SelectItem>
                    <SelectItem value="therapist">Mental Health Professional</SelectItem>
                    <SelectItem value="neighbor">Neighbor</SelectItem>
                    <SelectItem value="coworker">Coworker</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {addForm.formState.errors.relationship && (
                  <p className="text-sm text-red-600 mt-1">{addForm.formState.errors.relationship.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={addForm.watch("priority")?.toString()} onValueChange={(value) => addForm.setValue("priority", parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Primary (1st contact)</SelectItem>
                    <SelectItem value="2">Secondary (2nd contact)</SelectItem>
                    <SelectItem value="3">Tertiary (3rd contact)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={createContactMutation.isPending}
                  className="flex-1"
                >
                  {createContactMutation.isPending ? "Adding..." : "Add Contact"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contact List */}
      {hasContacts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact: any) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={
                      contact.priority === 1 ? "border-red-500 text-red-600" :
                      contact.priority === 2 ? "border-yellow-500 text-yellow-600" :
                      "border-blue-500 text-blue-600"
                    }>
                      Priority {contact.priority}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(contact)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteContactMutation.mutate(contact.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{contact.name}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{contact.relationship}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contact.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-3 w-3 text-green-600" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-3 w-3 text-blue-600" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Emergency Contacts</h3>
            <p className="text-muted-foreground mb-4">
              Add trusted contacts who will be notified during emergencies.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Emergency Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                {...editForm.register("name")}
                placeholder="Enter contact's full name"
              />
              {editForm.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">{editForm.formState.errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                {...editForm.register("phone")}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                {...editForm.register("email")}
                placeholder="contact@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-relationship">Relationship *</Label>
              <Select value={editForm.watch("relationship")} onValueChange={(value) => editForm.setValue("relationship", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family Member</SelectItem>
                  <SelectItem value="friend">Close Friend</SelectItem>
                  <SelectItem value="doctor">Healthcare Provider</SelectItem>
                  <SelectItem value="therapist">Mental Health Professional</SelectItem>
                  <SelectItem value="neighbor">Neighbor</SelectItem>
                  <SelectItem value="coworker">Coworker</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-priority">Priority Level</Label>
              <Select value={editForm.watch("priority")?.toString()} onValueChange={(value) => editForm.setValue("priority", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Primary (1st contact)</SelectItem>
                  <SelectItem value="2">Secondary (2nd contact)</SelectItem>
                  <SelectItem value="3">Tertiary (3rd contact)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={updateContactMutation.isPending}
                className="flex-1"
              >
                {updateContactMutation.isPending ? "Updating..." : "Update Contact"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingContact(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Indicator */}
      {hasContacts && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Emergency network active with {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}