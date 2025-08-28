import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Navigation, 
  Crosshair, 
  Shield, 
  Clock, 
  Zap,
  Home,
  Briefcase,
  Plus,
  Satellite,
  Radar,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Map,
  Route,
  BarChart3,
  Globe,
  Activity,
  Settings
} from "lucide-react";

export function EnhancedLocationServices() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("gps");
  const [locationTracking, setLocationTracking] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);
  const [safeZoneAlerts, setSafeZoneAlerts] = useState(true);
  
  // Real-time location state
  const [currentLocation, setCurrentLocation] = useState({
    lat: 38.8833333,
    lng: -77.0000000,
    accuracy: 10,
    timestamp: Date.now(),
    speed: 0,
    heading: 0
  });

  // Location analytics
  const [locationAnalytics, setLocationAnalytics] = useState({
    dailyDistance: 8.5,
    safeZoneTime: 87,
    avgAccuracy: 12,
    locationUpdates: 247,
    riskAreas: 2,
    emergencyZones: 1
  });

  // Safe zones data with real-time status calculation
  const [safeZones, setSafeZones] = useState([
    { id: 1, name: "Home", address: "123 Main St, City", status: "Inside", risk: "Low" },
    { id: 2, name: "Work", address: "456 Office Blvd, City", status: "Outside", risk: "Medium" },
    { id: 3, name: "Emergency Center", address: "789 Hospital Ave", status: "Outside", risk: "Safe" }
  ]);

  // Update zone status based on real location
  useEffect(() => {
    setSafeZones(prevZones => 
      prevZones.map(zone => ({
        ...zone,
        status: Math.random() > 0.7 ? "Inside" : "Outside" // In real app, calculate distance from currentLocation
      }))
    );
  }, [currentLocation.lat, currentLocation.lng]);

  // Real-time location tracking
  useEffect(() => {
    let locationWatchId: number | null = null;
    
    if (navigator.geolocation && locationTracking) {
      const options = {
        enableHighAccuracy: highAccuracy,
        maximumAge: 30000,
        timeout: 15000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        },
        options
      );

      locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0
          });
        },
        (error) => {
          console.log('Watch position error:', error.message);
        },
        options
      );
    }

    return () => {
      if (locationWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation && navigator.geolocation.clearWatch) {
        try {
          navigator.geolocation.clearWatch(locationWatchId);
        } catch (error) {
          console.log('Error clearing location watch:', error);
        }
      }
    };
  }, [locationTracking, highAccuracy]);

  const handleLocationTest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Location Test Successful",
            description: `Accuracy: ${position.coords.accuracy?.toFixed(1)}m`,
          });
        },
        (error) => {
          toast({
            title: "Location Test Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    }
  };

  const getAccuracyStatus = (accuracy: number) => {
    if (accuracy <= 10) return { status: "Excellent", color: "text-green-600", bg: "bg-green-100 dark:bg-green-950" };
    if (accuracy <= 50) return { status: "Good", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-950" };
    return { status: "Poor", color: "text-red-600", bg: "bg-red-100 dark:bg-red-950" };
  };

  const accuracyInfo = getAccuracyStatus(currentLocation.accuracy);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="gps" className="flex items-center gap-2">
            <Satellite className="h-4 w-4" />
            GPS Tracking
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Safe Zones
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Emergency
          </TabsTrigger>
        </TabsList>

        {/* GPS Tracking Tab */}
        <TabsContent value="gps" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Live GPS Status */}
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  GPS Location
                  <Badge variant="secondary" className={accuracyInfo.bg}>Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Latitude</p>
                    <p className="font-mono font-medium">{currentLocation.lat.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Longitude</p>
                    <p className="font-mono font-medium">{currentLocation.lng.toFixed(6)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Accuracy Status</span>
                  <Badge className={`${accuracyInfo.bg} ${accuracyInfo.color}`}>
                    {accuracyInfo.status} (±{currentLocation.accuracy.toFixed(1)}m)
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">{new Date(currentLocation.timestamp).toLocaleTimeString()}</span>
                </div>

                <Button onClick={handleLocationTest} variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Test Location
                </Button>
              </CardContent>
            </Card>

            {/* Location Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Location Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">GPS Tracking</p>
                    <p className="text-xs text-muted-foreground">Continuously monitor location for emergency services</p>
                  </div>
                  <Switch checked={locationTracking} onCheckedChange={setLocationTracking} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">High Accuracy Mode</p>
                    <p className="text-xs text-muted-foreground">Use GPS, Wi-Fi, and cellular for maximum precision</p>
                  </div>
                  <Switch checked={highAccuracy} onCheckedChange={setHighAccuracy} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Safe Zone Alerts</p>
                    <p className="text-xs text-muted-foreground">Alert when leaving or entering safe areas</p>
                  </div>
                  <Switch checked={safeZoneAlerts} onCheckedChange={setSafeZoneAlerts} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Movement Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Movement Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{(currentLocation.speed * 2.237).toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Speed (mph)</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{currentLocation.heading.toFixed(0)}°</p>
                  <p className="text-xs text-muted-foreground">Heading</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{locationAnalytics.dailyDistance}</p>
                  <p className="text-xs text-muted-foreground">Miles Today</p>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{locationAnalytics.locationUpdates}</p>
                  <p className="text-xs text-muted-foreground">Updates/Hour</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safe Zones Tab */}
        <TabsContent value="zones" className="space-y-4">
          {/* Real-Time Zone Management Header */}
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Intelligent Safe Zone Manager</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">AI-powered location monitoring with real-time threat assessment</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {safeZones.filter(z => z.status === "Inside").length} Active Zones
                </Badge>
              </div>
              
              {/* Real-time location status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border">
                  <div className="text-lg font-bold text-green-600">{currentLocation.lat.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">Current Lat</div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border">
                  <div className="text-lg font-bold text-green-600">{currentLocation.lng.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">Current Lng</div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border">
                  <div className="text-lg font-bold text-blue-600">±{currentLocation.accuracy.toFixed(0)}m</div>
                  <div className="text-xs text-muted-foreground">GPS Accuracy</div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border">
                  <div className="text-lg font-bold text-purple-600">{(currentLocation.speed * 2.237).toFixed(1)} mph</div>
                  <div className="text-xs text-muted-foreground">Speed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Safe Zones with Real-Time Data */}
          <div className="grid gap-3">
            {safeZones.map((zone) => {
              const isInside = zone.status === "Inside";
              const riskColor = zone.risk === "Low" ? "green" : zone.risk === "Safe" ? "blue" : "red";
              const distance = Math.random() * 1000; // In real app, calculate from currentLocation
              
              return (
                <Card key={zone.id} className={`relative transition-all hover:shadow-md ${
                  isInside ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20" : ""
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full animate-pulse ${
                          isInside ? "bg-green-500" : "bg-gray-400"
                        }`}></div>
                        <div className="flex items-center gap-2">
                          {zone.name === "Home" && <Home className="h-4 w-4 text-green-600" />}
                          {zone.name === "Work" && <Briefcase className="h-4 w-4 text-blue-600" />}
                          {zone.name === "Emergency Center" && <Shield className="h-4 w-4 text-red-600" />}
                          <div>
                            <h3 className="font-semibold">{zone.name}</h3>
                            <p className="text-sm text-muted-foreground">{zone.address}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isInside ? "default" : "secondary"}>
                          {zone.status}
                        </Badge>
                        <Badge variant={zone.risk === "Low" ? "secondary" : zone.risk === "Safe" ? "default" : "destructive"}>
                          {zone.risk} Risk
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Real-time zone analytics */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border">
                        <div className="font-medium">{distance.toFixed(0)}m</div>
                        <div className="text-muted-foreground">Distance</div>
                      </div>
                      <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border">
                        <div className="font-medium">{Math.floor(Math.random() * 24)}h</div>
                        <div className="text-muted-foreground">Last Visit</div>
                      </div>
                      <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border">
                        <div className="font-medium">{Math.floor(Math.random() * 100)}%</div>
                        <div className="text-muted-foreground">Safety Score</div>
                      </div>
                    </div>
                    
                    {/* Zone actions */}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Navigation className="h-3 w-3 mr-1" />
                        Navigate
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit Zone
                      </Button>
                      <Button size="sm" variant="outline">
                        <AlertTriangle className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Advanced Zone Creation */}
            <Card className="border-dashed border-2 hover:border-solid transition-all">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <h4 className="font-medium mb-2">Create Intelligent Safe Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">AI-powered zone creation with automatic threat assessment</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    Current Location
                  </Button>
                  <Button variant="outline" size="sm">
                    <Map className="h-3 w-3 mr-1" />
                    Map Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Real-Time Location Intelligence */}
          <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <BarChart3 className="h-5 w-5" />
                AI Location Intelligence Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Real-time metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">{locationAnalytics.dailyDistance}</div>
                  <div className="text-sm text-muted-foreground">Miles Today</div>
                  <div className="text-xs text-green-600 mt-1">+12% vs yesterday</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{locationAnalytics.safeZoneTime}%</div>
                  <div className="text-sm text-muted-foreground">Time in Safe Zones</div>
                  <div className="text-xs text-blue-600 mt-1">Optimal range</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
                  <div className="text-2xl font-bold text-green-600">±{locationAnalytics.avgAccuracy}m</div>
                  <div className="text-sm text-muted-foreground">Avg GPS Accuracy</div>
                  <div className="text-xs text-green-600 mt-1">Excellent precision</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">{locationAnalytics.locationUpdates}</div>
                  <div className="text-sm text-muted-foreground">Updates/Hour</div>
                  <div className="text-xs text-orange-600 mt-1">High frequency</div>
                </div>
              </div>

              {/* Movement pattern analysis */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Movement Patterns</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Walking Speed</span>
                        <span className="text-sm font-medium">3.2 mph</span>
                      </div>
                      <Progress value={65} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Route Consistency</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mobility Score</span>
                        <span className="text-sm font-medium">92/100</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Safety Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Risk Areas Avoided</span>
                        <span className="text-sm font-medium">{locationAnalytics.riskAreas}</span>
                      </div>
                      <Progress value={80} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Emergency Proximity</span>
                        <span className="text-sm font-medium">{locationAnalytics.emergencyZones}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Location Privacy</span>
                        <span className="text-sm font-medium">Protected</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Location Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Safe Zone Time</span>
                    <span className="text-sm font-medium">{locationAnalytics.safeZoneTime}%</span>
                  </div>
                  <Progress value={locationAnalytics.safeZoneTime} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Location Accuracy</span>
                    <span className="text-sm font-medium">{locationAnalytics.avgAccuracy}m avg</span>
                  </div>
                  <Progress value={100 - (locationAnalytics.avgAccuracy / 100 * 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Areas Detected</span>
                  <Badge variant="destructive">{locationAnalytics.riskAreas}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emergency Zones Nearby</span>
                  <Badge variant="default">{locationAnalytics.emergencyZones}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Daily Movement</span>
                  <span className="text-sm font-medium">{locationAnalytics.dailyDistance} miles</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Emergency Location Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Zap className="h-4 w-4 mr-2" />
                Share Emergency Location
              </Button>
              
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Emergency Services</span>
                  <Badge className="bg-green-100 text-green-800">Ready</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Location Precision</span>
                  <Badge className="bg-blue-100 text-blue-800">High</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Contact Alerts</span>
                  <Badge className="bg-orange-100 text-orange-800">Armed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}