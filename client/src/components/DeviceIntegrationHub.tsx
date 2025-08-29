import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRealDeviceScanner } from '@/hooks/useRealDeviceScanner';
import {
  Bluetooth,
  Smartphone,
  Activity,
  MapPin,
  Battery,
  Wifi,
  CheckCircle,
  AlertCircle,
  Settings,
  Mic,
  Shield,
  Zap,
  Loader2
} from 'lucide-react';

interface DeviceIntegrationHubProps {
  sensorData?: any;
  permissions?: any;
  requestPermissions?: () => void;
}

export function DeviceIntegrationHub({ sensorData, permissions, requestPermissions }: DeviceIntegrationHubProps) {
  const { toast } = useToast();
  const { 
    capabilities, 
    bluetoothDevices, 
    isScanning, 
    realTimeData, 
    scanBluetoothDevices, 
    initializeCapabilities 
  } = useRealDeviceScanner();

  const handleScanDevices = async () => {
    try {
      toast({
        title: "Scanning devices...",
        description: "Searching for real Bluetooth devices and updating sensor data",
      });
      
      await initializeCapabilities();
      
      toast({
        title: "Device scan complete",
        description: `Found ${capabilities.filter(cap => cap.status === 'available').length} available capabilities`,
      });
    } catch (error: any) {
      toast({
        title: "Scan error",
        description: error.message || "Failed to scan devices",
        variant: "destructive",
      });
    }
  };

  const handleBluetoothScan = async () => {
    try {
      await scanBluetoothDevices();
      toast({
        title: "Bluetooth device connected",
        description: "Successfully connected to Bluetooth device for real-time monitoring",
      });
    } catch (error: any) {
      toast({
        title: "Bluetooth connection failed",
        description: error.message || "Could not connect to Bluetooth device",
        variant: "destructive",
      });
    }
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
        {/* Real-time Status Overview */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800 dark:text-green-200">All Systems Normal</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {capabilities.map((cap) => (
                <div key={cap.id} className="flex items-center gap-2 text-sm">
                  <div className={`h-2 w-2 rounded-full ${
                    cap.status === 'available' ? 'bg-green-500' : 
                    cap.status === 'connected' ? 'bg-blue-500' :
                    cap.status === 'scanning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="capitalize">{cap.name}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleScanDevices} className="w-full" disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Enable All Sensors
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Real Device Capabilities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Device Capabilities</h3>
          <div className="grid grid-cols-1 gap-4">
            {capabilities.map((capability) => {
              const IconComponent = 
                capability.icon === 'activity' ? Activity :
                capability.icon === 'map-pin' ? MapPin :
                capability.icon === 'battery' ? Battery :
                capability.icon === 'bluetooth' ? Bluetooth :
                capability.icon === 'wifi' ? Wifi :
                capability.icon === 'smartphone' ? Smartphone : Settings;

              return (
                <div key={capability.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-5 w-5 ${
                      capability.status === 'available' ? 'text-blue-500' :
                      capability.status === 'connected' ? 'text-green-500' :
                      capability.status === 'scanning' ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">{capability.name}</p>
                      <p className="text-sm text-muted-foreground">{capability.description}</p>
                      {realTimeData[capability.id] && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {capability.id === 'location' && realTimeData.location && (
                            `${realTimeData.location.latitude.toFixed(4)}, ${realTimeData.location.longitude.toFixed(4)} (±${realTimeData.location.accuracy}m)`
                          )}
                          {capability.id === 'battery' && realTimeData.battery && (
                            `${realTimeData.battery.level}% ${realTimeData.battery.charging ? '(charging)' : ''}`
                          )}
                          {capability.id === 'motion' && realTimeData.motion && (
                            `X: ${realTimeData.motion.acceleration.x.toFixed(2)}, Y: ${realTimeData.motion.acceleration.y.toFixed(2)}, Z: ${realTimeData.motion.acceleration.z.toFixed(2)}`
                          )}
                          {capability.id === 'network' && realTimeData.network && (
                            `${realTimeData.network.connectionType || 'unknown'} ${realTimeData.network.online ? 'online' : 'offline'}`
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={
                    capability.status === 'available' ? "default" : 
                    capability.status === 'connected' ? "default" :
                    capability.status === 'scanning' ? "secondary" : "destructive"
                  }>
                    {capability.status === 'available' ? "Available" :
                     capability.status === 'connected' ? "Connected" :
                     capability.status === 'scanning' ? "Scanning" : "Unavailable"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bluetooth Devices */}
        {bluetoothDevices.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connected Bluetooth Devices</h3>
            <div className="grid grid-cols-1 gap-4">
              {bluetoothDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bluetooth className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {device.services.length} services • {device.connected ? 'Connected' : 'Disconnected'}
                      </p>
                      {device.rssi && (
                        <p className="text-xs text-blue-600">Signal: {device.rssi} dBm</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={device.connected ? "default" : "secondary"}>
                    {device.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleScanDevices} 
            disabled={isScanning}
            className="flex-1"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              "Scan Devices"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleBluetoothScan}
            disabled={isScanning}
            className="flex-1"
          >
            <Bluetooth className="h-4 w-4 mr-2" />
            Connect Bluetooth
          </Button>
        </div>

        {/* Real-time Data Summary */}
        {Object.keys(realTimeData).length > 0 && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Live Sensor Data</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {realTimeData.location && (
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">
                      {realTimeData.location.latitude.toFixed(4)}, {realTimeData.location.longitude.toFixed(4)}
                    </p>
                  </div>
                )}
                {realTimeData.battery && (
                  <div>
                    <p className="font-medium">Battery</p>
                    <p className="text-muted-foreground">
                      {realTimeData.battery.level}% {realTimeData.battery.charging ? '(charging)' : ''}
                    </p>
                  </div>
                )}
                {realTimeData.motion && (
                  <div>
                    <p className="font-medium">Motion</p>
                    <p className="text-muted-foreground">
                      Active ({Math.abs(realTimeData.motion.acceleration.x + realTimeData.motion.acceleration.y + realTimeData.motion.acceleration.z).toFixed(1)} m/s²)
                    </p>
                  </div>
                )}
                {realTimeData.network && (
                  <div>
                    <p className="font-medium">Network</p>
                    <p className="text-muted-foreground">
                      {realTimeData.network.connectionType || 'Connected'} • {realTimeData.network.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Summary */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          {capabilities.filter(cap => cap.status === 'available' || cap.status === 'connected').length > 2 ? (
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