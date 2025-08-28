import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Bluetooth,
  Smartphone,
  Activity,
  MapPin,
  Battery,
  Wifi,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface DeviceIntegrationHubProps {
  sensorData?: any;
  permissions?: any;
  requestPermissions?: () => void;
}

export function DeviceIntegrationHub({ sensorData, permissions, requestPermissions }: DeviceIntegrationHubProps) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  
  const deviceCapabilities = {
    motion: 'DeviceMotionEvent' in window,
    location: 'geolocation' in navigator,
    battery: 'getBattery' in navigator,
    bluetooth: 'bluetooth' in navigator,
    network: navigator.onLine
  };

  const handleScanDevices = () => {
    setScanning(true);
    toast({
      title: "Scanning devices...",
      description: "Checking available device capabilities",
    });
    
    setTimeout(() => {
      setScanning(false);
      toast({
        title: "Scan complete",
        description: `Found ${Object.values(deviceCapabilities).filter(Boolean).length} available capabilities`,
      });
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Device Integration Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Capabilities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Device Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Motion Sensors */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Motion Sensors</p>
                  <p className="text-sm text-muted-foreground">Accelerometer & Gyroscope</p>
                </div>
              </div>
              <Badge variant={deviceCapabilities.motion ? "default" : "secondary"}>
                {deviceCapabilities.motion ? "Available" : "Unavailable"}
              </Badge>
            </div>

            {/* Location Services */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Location Services</p>
                  <p className="text-sm text-muted-foreground">GPS Positioning</p>
                </div>
              </div>
              <Badge variant={deviceCapabilities.location ? "default" : "secondary"}>
                {deviceCapabilities.location ? "Available" : "Unavailable"}
              </Badge>
            </div>

            {/* Battery API */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Battery className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Battery Status</p>
                  <p className="text-sm text-muted-foreground">Power Level Monitoring</p>
                </div>
              </div>
              <Badge variant={deviceCapabilities.battery ? "default" : "secondary"}>
                {deviceCapabilities.battery ? "Available" : "Unavailable"}
              </Badge>
            </div>

            {/* Bluetooth */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Bluetooth className="h-5 w-5 text-cyan-500" />
                <div>
                  <p className="font-medium">Bluetooth</p>
                  <p className="text-sm text-muted-foreground">Device Connectivity</p>
                </div>
              </div>
              <Badge variant={deviceCapabilities.bluetooth ? "default" : "secondary"}>
                {deviceCapabilities.bluetooth ? "Available" : "Unavailable"}
              </Badge>
            </div>

            {/* Network Status */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Network Status</p>
                  <p className="text-sm text-muted-foreground">Connectivity Monitoring</p>
                </div>
              </div>
              <Badge variant={deviceCapabilities.network ? "default" : "secondary"}>
                {deviceCapabilities.network ? "Online" : "Offline"}
              </Badge>
            </div>

            {/* Device Type */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="font-medium">Device Type</p>
                  <p className="text-sm text-muted-foreground">Platform Detection</p>
                </div>
              </div>
              <Badge variant="default">
                {/Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? "Mobile" : "Desktop"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleScanDevices} 
            disabled={scanning}
            className="flex-1"
          >
            {scanning ? "Scanning..." : "Scan Devices"}
          </Button>
          {requestPermissions && (
            <Button 
              variant="outline" 
              onClick={requestPermissions}
              className="flex-1"
            >
              Request Permissions
            </Button>
          )}
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          {Object.values(deviceCapabilities).filter(Boolean).length > 2 ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Device ready for VitalWatch monitoring</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Limited device capabilities detected</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}