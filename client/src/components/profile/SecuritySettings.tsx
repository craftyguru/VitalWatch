import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Shield, 
  Lock, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Globe,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";

interface SecuritySettingsProps {
  form: any;
  isLoading: boolean;
}

export function SecuritySettings({ form, isLoading }: SecuritySettingsProps) {
  return (
    <div className="space-y-6">
      {/* Biometric Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fingerprint className="h-5 w-5 text-blue-500" />
            <span>Biometric Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="fingerprint-lock">Fingerprint Lock</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Require fingerprint to access emergency features
              </p>
            </div>
            <Switch id="fingerprint-lock" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="face-recognition">Face Recognition</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Use face recognition for quick app access
              </p>
            </div>
            <Switch id="face-recognition" />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="voice-verification">Voice Verification</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Verify identity using voice patterns
              </p>
            </div>
            <Switch id="voice-verification" />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-green-500" />
            <span>Privacy Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <FormField
              control={form.control}
              name="privacyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal - Basic protection</SelectItem>
                      <SelectItem value="standard">Standard - Balanced privacy</SelectItem>
                      <SelectItem value="enhanced">Enhanced - Maximum privacy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Controls how much data is shared and stored
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <FormField
              control={form.control}
              name="locationSharingEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Location Sharing</span>
                    </FormLabel>
                    <FormDescription>
                      Share location with emergency contacts during alerts
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="data-encryption">Data Encryption</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Encrypt all personal data and communications
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-purple-500" />
            <span>Device Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your device security score: <strong>Excellent (95/100)</strong>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Remote Wipe</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Allow emergency contacts to remotely wipe sensitive data
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-Lock Timer</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Automatically lock app after inactivity
                </p>
              </div>
              <Select defaultValue="5min">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1min">1 minute</SelectItem>
                  <SelectItem value="5min">5 minutes</SelectItem>
                  <SelectItem value="15min">15 minutes</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Stealth Mode</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Hide app from recent apps and disable notifications
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}