import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Navigation,
  Target,
  Crosshair,
  Satellite,
  Radar,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

export function LocationServices() {
  const { toast } = useToast();
  const [locationTracking, setLocationTracking] = useState(true);
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);
  
  // Real-time location simulation
  const [currentLocation, setCurrentLocation] = useState({
    lat: 40.7128,
    lng: -74.0060,
    accuracy: 5,
    timestamp: Date.now()
  });
  
  // Location tracking effect
  useEffect(() => {
    let locationWatchId: number | null = null;
    
    const startLocationTracking = () => {
      if (navigator.geolocation && locationTracking) {
        // Get initial position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            });
          },
          (error) => {
            console.log('Initial geolocation error:', error.message);
          },
          {
            enableHighAccuracy: highAccuracy,
            maximumAge: 60000,
            timeout: 15000
          }
        );
        
        // Set up continuous tracking
        try {
          locationWatchId = navigator.geolocation.watchPosition(
            (position) => {
              setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now()
              });
            },
            (error) => {
              console.log('Watch position error:', error.message);
            },
            {
              enableHighAccuracy: highAccuracy,
              maximumAge: 30000,
              timeout: 20000
            }
          );
        } catch (error) {
          console.log('Watch position not supported');
        }
      }
    };

    if (locationTracking) {
      startLocationTracking();
    }

    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [locationTracking, highAccuracy]);

  const handleLocationTest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Location Test Successful",
            description: `Accuracy: ${position.coords.accuracy}m`,
            variant: "default",
          });
        },
        (error) => {
          toast({
            title: "Location Test Failed",
            description: error.message,
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return "text-green-600 bg-green-100 dark:bg-green-950";
    if (accuracy <= 50) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-950";
    return "text-red-600 bg-red-100 dark:bg-red-950";
  };

  const getAccuracyText = (accuracy: number) => {
    if (accuracy <= 10) return "Excellent";
    if (accuracy <= 50) return "Good";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      {/* Location Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span>GPS Location</span>
            {locationTracking && (
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Coordinates</Label>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg font-mono text-sm">
                <div>Lat: {currentLocation.lat.toFixed(6)}</div>
                <div>Lng: {currentLocation.lng.toFixed(6)}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Accuracy Status</Label>
              <div className={`p-3 rounded-lg ${getAccuracyColor(currentLocation.accuracy)}`}>
                <div className="font-semibold">{getAccuracyText(currentLocation.accuracy)}</div>
                <div className="text-sm">±{currentLocation.accuracy}m radius</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Last updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
            </span>
            <Button variant="outline" size="sm" onClick={handleLocationTest}>
              <Target className="h-4 w-4 mr-2" />
              Test Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-green-500" />
            <span>Location Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="location-tracking" className="flex items-center space-x-2">
                <Satellite className="h-4 w-4" />
                <span>GPS Tracking</span>
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Continuously monitor location for emergency services
              </p>
            </div>
            <Switch
              id="location-tracking"
              checked={locationTracking}
              onCheckedChange={setLocationTracking}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="high-accuracy" className="flex items-center space-x-2">
                <Crosshair className="h-4 w-4" />
                <span>High Accuracy Mode</span>
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Use GPS, Wi-Fi, and cellular for maximum precision
              </p>
            </div>
            <Switch
              id="high-accuracy"
              checked={highAccuracy}
              onCheckedChange={setHighAccuracy}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="geofence" className="flex items-center space-x-2">
                <Radar className="h-4 w-4" />
                <span>Safe Zone Alerts</span>
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Alert when leaving predefined safe areas
              </p>
            </div>
            <Switch
              id="geofence"
              checked={geofenceEnabled}
              onCheckedChange={setGeofenceEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Geofence Management */}
      {geofenceEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radar className="h-5 w-5 text-purple-500" />
              <span>Safe Zones</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300">Home</p>
                    <p className="text-sm text-green-600 dark:text-green-400">123 Main St, City</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Inside
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">Work</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">456 Office Blvd, City</p>
                  </div>
                </div>
                <Badge variant="outline">
                  Outside
                </Badge>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Add New Safe Zone
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Location Privacy */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Location data is encrypted and only shared with emergency contacts during active alerts. 
          You can disable tracking at any time in privacy settings.
        </AlertDescription>
      </Alert>
    </div>
  );
}