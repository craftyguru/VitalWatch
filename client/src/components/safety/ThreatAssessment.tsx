import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Shield,
  Activity,
  Brain,
  Eye,
  Waves,
  Gauge,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

export function ThreatAssessment() {
  const [threatLevel, setThreatLevel] = useState("LOW");
  const [stressLevel, setStressLevel] = useState(15);
  const [heartRate, setHeartRate] = useState(72);
  const [riskFactors, setRiskFactors] = useState([
    { name: "Environmental", level: 20, status: "normal" },
    { name: "Behavioral", level: 10, status: "normal" },
    { name: "Biometric", level: 25, status: "elevated" },
    { name: "Location", level: 5, status: "safe" }
  ]);

  // Simulate real-time threat analysis updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newStress = Math.max(0, Math.min(100, stressLevel + (Math.random() - 0.5) * 10));
      const newHeart = Math.max(60, Math.min(120, heartRate + (Math.random() - 0.5) * 8));
      
      setStressLevel(newStress);
      setHeartRate(newHeart);
      
      // Update threat level based on stress
      if (newStress > 70) setThreatLevel("HIGH");
      else if (newStress > 40) setThreatLevel("MEDIUM");
      else setThreatLevel("LOW");
      
      // Update risk factors
      setRiskFactors(prev => prev.map(factor => ({
        ...factor,
        level: Math.max(0, Math.min(100, factor.level + (Math.random() - 0.5) * 5))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [stressLevel, heartRate]);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "HIGH": return {
        bg: "bg-red-100 dark:bg-red-950 border-red-500",
        text: "text-red-600 dark:text-red-400",
        badge: "bg-red-500 text-white"
      };
      case "MEDIUM": return {
        bg: "bg-orange-100 dark:bg-orange-950 border-orange-500",
        text: "text-orange-600 dark:text-orange-400",
        badge: "bg-orange-500 text-white"
      };
      case "LOW": return {
        bg: "bg-green-100 dark:bg-green-950 border-green-500",
        text: "text-green-600 dark:text-green-400",
        badge: "bg-green-500 text-white"
      };
      default: return {
        bg: "bg-slate-100 dark:bg-slate-900 border-slate-500",
        text: "text-slate-600 dark:text-slate-400",
        badge: "bg-slate-500 text-white"
      };
    }
  };

  const getRiskIcon = (status: string) => {
    switch (status) {
      case "safe": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "normal": return <Activity className="h-4 w-4 text-blue-500" />;
      case "elevated": return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "critical": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  const colors = getThreatColor(threatLevel);

  return (
    <div className="space-y-6">
      {/* Main Threat Level Display */}
      <Card className={`border-2 ${colors.bg}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span>Threat Assessment</span>
            </div>
            <Badge className={colors.badge}>
              {threatLevel} RISK
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="relative">
              <div className={`text-6xl font-bold ${colors.text}`}>
                {stressLevel}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Overall Risk Score
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {Math.round(heartRate)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Heart Rate</div>
              </div>
              
              <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {Math.round(85 + Math.random() * 10)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Activity</div>
              </div>
              
              <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {Math.round(92 + Math.random() * 8)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Confidence</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factor Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>AI Risk Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {riskFactors.map((factor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRiskIcon(factor.status)}
                  <span className="font-medium">{factor.name}</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {Math.round(factor.level)}%
                </span>
              </div>
              <Progress value={factor.level} className="w-full h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <span>Active Monitoring</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Audio Analysis</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Motion Detection</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Waves className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Heart Rate Variability</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  Monitoring
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Pattern Recognition</span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  Learning
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat Level Alerts */}
      {threatLevel === "HIGH" && (
        <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            <strong>High threat level detected.</strong> Emergency protocols are activated. 
            All safety systems are monitoring and ready to alert emergency contacts.
          </AlertDescription>
        </Alert>
      )}
      
      {threatLevel === "MEDIUM" && (
        <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            <strong>Elevated threat level.</strong> Increased monitoring is active. 
            Consider activating safety measures or moving to a safer location.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}