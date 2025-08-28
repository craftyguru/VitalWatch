import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle,
  Shield,
  Brain,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Ear,
  Zap,
  Target,
  BarChart3,
  Gauge,
  Radar,
  Lightbulb
} from "lucide-react";

export function EnhancedThreatAssessment() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // AI Threat Analysis State
  const [threatData, setThreatData] = useState({
    overallRisk: 15,
    riskTrend: "decreasing",
    lastAssessment: Date.now(),
    threatsDetected: 0,
    anomalies: 2,
    confidence: 93
  });

  // Multi-sensor threat analysis
  const [sensorThreats, setSensorThreats] = useState({
    environmental: { level: 20, status: "low", factors: ["Noise Level: Normal", "Lighting: Adequate", "Air Quality: Good"] },
    behavioral: { level: 10, status: "low", factors: ["Movement: Stable", "Voice Stress: Low", "Routine: Normal"] },
    biometric: { level: 25, status: "low", factors: ["Heart Rate: Normal", "Stress: Low", "Sleep: Good"] },
    location: { level: 5, status: "low", factors: ["Safe Zone: Inside", "Crime Rate: Low", "Emergency Access: Good"] },
    device: { level: 8, status: "low", factors: ["Battery: Good", "Connectivity: Strong", "Security: Active"] }
  });

  // Real-time monitoring feeds
  const [activeMonitoring, setActiveMonitoring] = useState({
    audioAnalysis: { active: true, status: "monitoring", lastAlert: null, threats: 0 },
    motionDetection: { active: true, status: "active", lastAlert: null, threats: 0 },
    heartRateVariability: { active: true, status: "monitoring", lastAlert: null, threats: 0 },
    patternRecognition: { active: true, status: "learning", lastAlert: null, threats: 0 },
    environmentalScan: { active: false, status: "limited", lastAlert: null, threats: 0 }
  });

  // Historical threat patterns
  const [threatHistory, setThreatHistory] = useState([
    { time: "2h ago", type: "Environmental", level: "Low", resolved: true },
    { time: "6h ago", type: "Biometric", level: "Medium", resolved: true },
    { time: "1d ago", type: "Behavioral", level: "Low", resolved: true },
    { time: "2d ago", type: "Location", level: "Medium", resolved: true }
  ]);

  // AI Insights and Recommendations
  const [aiInsights, setAiInsights] = useState([
    {
      type: "insight",
      title: "Stress Pattern Recognition",
      description: "AI detected elevated stress levels during evening hours. Consider evening meditation.",
      confidence: 87,
      actionable: true
    },
    {
      type: "warning",
      title: "Location Risk Assessment",
      description: "Current area has 15% higher incident rate. Enhanced monitoring recommended.",
      confidence: 92,
      actionable: true
    },
    {
      type: "recommendation",
      title: "Device Optimization",
      description: "Enable environmental sensors for improved threat detection accuracy.",
      confidence: 78,
      actionable: true
    }
  ]);

  // Calculate overall risk score
  const calculateOverallRisk = () => {
    const sensors = Object.values(sensorThreats);
    const total = sensors.reduce((sum, sensor) => sum + sensor.level, 0);
    return Math.round(total / sensors.length);
  };

  // Real-time threat assessment updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time threat assessment updates
      setThreatData(prev => ({
        ...prev,
        overallRisk: calculateOverallRisk(),
        lastAssessment: Date.now(),
        confidence: Math.min(95, prev.confidence + Math.random() * 2 - 1)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [sensorThreats]);

  const getRiskColor = (level: number) => {
    if (level <= 20) return "text-green-600";
    if (level <= 50) return "text-yellow-600";
    if (level <= 75) return "text-orange-600";
    return "text-red-600";
  };

  const getRiskBadgeVariant = (status: string) => {
    switch (status) {
      case "low": return "default";
      case "medium": return "secondary";
      case "high": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Radar className="h-4 w-4" />
            Live Monitor
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Main Threat Assessment */}
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logo.png" 
                    alt="VitalWatch Logo" 
                    className="h-5 w-5 object-contain"
                  />
                  Threat Assessment
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">LOW RISK</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getRiskColor(threatData.overallRisk)} mb-2`}>
                    {threatData.overallRisk}
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{threatData.confidence}%</div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{threatData.threatsDetected}</div>
                    <p className="text-xs text-muted-foreground">Active Threats</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{threatData.anomalies}</div>
                    <p className="text-xs text-muted-foreground">Anomalies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Sensor Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Multi-Sensor Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(sensorThreats).map(([key, sensor]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">{key}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{sensor.level}%</span>
                      <Badge variant={getRiskBadgeVariant(sensor.status)}>
                        {sensor.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={sensor.level} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {sensor.factors.join(" • ")}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {/* AI Insights */}
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <Card key={index} className={`${
                insight.type === "warning" ? "border-yellow-200 dark:border-yellow-800" :
                insight.type === "insight" ? "border-blue-200 dark:border-blue-800" :
                "border-green-200 dark:border-green-800"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === "warning" ? "bg-yellow-100 dark:bg-yellow-950" :
                      insight.type === "insight" ? "bg-blue-100 dark:bg-blue-950" :
                      "bg-green-100 dark:bg-green-950"
                    }`}>
                      {insight.type === "warning" ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                       insight.type === "insight" ? <Lightbulb className="h-4 w-4 text-blue-600" /> :
                       <Target className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span>Confidence: {insight.confidence}%</span>
                          <Progress value={insight.confidence} className="h-1 w-16" />
                        </div>
                        {insight.actionable && (
                          <Button size="sm" variant="outline">Take Action</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pattern Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Pattern Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Behavioral Patterns</span>
                  <Badge variant="default">Learning</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Environmental Factors</span>
                  <Badge variant="default">Analyzing</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Biometric Trends</span>
                  <Badge variant="default">Monitoring</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Location Patterns</span>
                  <Badge variant="default">Mapped</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(activeMonitoring).map(([key, monitor]) => (
              <Card key={key} className={monitor.active ? "border-green-200 dark:border-green-800" : "border-gray-200 dark:border-gray-800"}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${monitor.active ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
                      <div>
                        <h3 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{monitor.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={monitor.active ? "default" : "secondary"}>
                        {monitor.active ? "Active" : "Inactive"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {monitor.threats} threats detected
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Real-time Threat Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Threat Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">All systems normal - No threats detected</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">AI monitoring active - No immediate threats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {threatHistory.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${threat.resolved ? "bg-green-500" : "bg-red-500"}`}></div>
                      <div>
                        <p className="font-medium">{threat.type} Threat</p>
                        <p className="text-sm text-muted-foreground">{threat.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={threat.level === "Low" ? "default" : threat.level === "Medium" ? "secondary" : "destructive"}>
                        {threat.level}
                      </Badge>
                      <Badge variant={threat.resolved ? "default" : "destructive"}>
                        {threat.resolved ? "Resolved" : "Active"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <p className="text-xs text-muted-foreground">Monitoring Uptime</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98.7%</div>
                  <p className="text-xs text-muted-foreground">Accuracy Rate</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">156</div>
                  <p className="text-xs text-muted-foreground">Assessments Today</p>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">0.3s</div>
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}