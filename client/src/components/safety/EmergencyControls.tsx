import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  Phone,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Lock,
  Unlock,
  Zap
} from "lucide-react";

export function EmergencyControls() {
  const { toast } = useToast();
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [autoAlert, setAutoAlert] = useState(true);
  const [biometricLock, setBiometricLock] = useState(true);

  const handleEmergencyToggle = (enabled: boolean) => {
    setEmergencyMode(enabled);
    toast({
      title: enabled ? "Emergency Mode Activated" : "Emergency Mode Deactivated",
      description: enabled ? 
        "All safety systems are now active and monitoring" : 
        "Emergency monitoring has been disabled",
      variant: enabled ? "destructive" : "default",
    });
  };

  const handlePanicButton = () => {
    toast({
      title: "Emergency Alert Sent",
      description: "All emergency contacts have been notified with your location",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Emergency Mode Toggle */}
      <Card className={`border-2 transition-all ${emergencyMode ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-slate-200 dark:border-slate-800'}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className={`h-5 w-5 ${emergencyMode ? 'text-red-500' : 'text-slate-500'}`} />
            <span>Emergency Mode</span>
            {emergencyMode && (
              <Badge variant="destructive" className="ml-auto">
                ACTIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="emergency-mode">Master Emergency Control</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Activates all safety monitoring and alert systems
              </p>
            </div>
            <Switch
              id="emergency-mode"
              checked={emergencyMode}
              onCheckedChange={handleEmergencyToggle}
            />
          </div>
          
          {emergencyMode && (
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                Emergency mode is active. All sensors are monitoring and ready to send alerts.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Panic Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Emergency Alert</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handlePanicButton}
            className="w-full h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-bold"
            size="lg"
          >
            <Zap className="h-6 w-6 mr-3" />
            SEND EMERGENCY ALERT
          </Button>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 text-center">
            Instantly notifies all emergency contacts with your location and status
          </p>
        </CardContent>
      </Card>

      {/* Safety Modes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <span>Safety Modes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="silent-mode" className="flex items-center space-x-2">
                {silentMode ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                <span>Silent Mode</span>
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Send alerts without sound or vibration
              </p>
            </div>
            <Switch
              id="silent-mode"
              checked={silentMode}
              onCheckedChange={setSilentMode}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="stealth-mode" className="flex items-center space-x-2">
                {stealthMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>Stealth Mode</span>
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Hide all emergency activity from device notifications
              </p>
            </div>
            <Switch
              id="stealth-mode"
              checked={stealthMode}
              onCheckedChange={setStealthMode}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-alert" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Auto Alert</span>
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automatically send alerts when threats are detected
              </p>
            </div>
            <Switch
              id="auto-alert"
              checked={autoAlert}
              onCheckedChange={setAutoAlert}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="biometric-lock" className="flex items-center space-x-2">
                {biometricLock ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                <span>Biometric Lock</span>
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Require biometric verification to disable emergency features
              </p>
            </div>
            <Switch
              id="biometric-lock"
              checked={biometricLock}
              onCheckedChange={setBiometricLock}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}