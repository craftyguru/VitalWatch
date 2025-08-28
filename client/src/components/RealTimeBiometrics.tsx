import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Brain, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface BiometricsProps {
  sensorData: any;
  permissions: any;
  requestPermissions: () => void;
}

export function RealTimeBiometrics({ sensorData, permissions, requestPermissions }: BiometricsProps) {
  const heartRate = sensorData?.heartRate?.bpm || null;
  const stressLevel = heartRate ? Math.min(Math.max((heartRate - 60) / 40 * 100, 0), 100) : 15;
  const activityLevel = Math.sqrt(
    (sensorData?.accelerometer?.x || 0) ** 2 + 
    (sensorData?.accelerometer?.y || 0) ** 2 + 
    (sensorData?.accelerometer?.z || 0) ** 2
  ) * 10;

  const riskLevel = stressLevel > 70 ? 'High' : stressLevel > 40 ? 'Medium' : 'Low';
  const riskColor = riskLevel === 'High' ? 'text-red-600' : riskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Heart Rate Monitor */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span className="text-red-900 dark:text-red-100">Heart Rate Monitor</span>
            </div>
            {sensorData?.heartRate?.active ? (
              <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-gray-600 border-gray-600">Simulated</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-red-600 mb-2">
              {heartRate || '--'}
            </div>
            <div className="text-sm text-muted-foreground">BPM - Normal Range</div>
          </div>
          <Progress value={heartRate ? Math.min((heartRate / 100) * 100, 100) : 0} className="h-2" />
        </CardContent>
      </Card>

      {/* Stress Analysis */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-900 dark:text-yellow-100">Stress Analysis</span>
            </div>
            <Badge variant="outline" className={`${riskColor} border-current`}>
              {riskLevel} Risk
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {Math.round(stressLevel)}%
            </div>
            <div className="text-sm text-muted-foreground">Low Stress Detected</div>
          </div>
          <Progress value={stressLevel} className="h-2" />
        </CardContent>
      </Card>

      {/* AI Emergency Risk Assessment */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>AI Emergency Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Risk Level</span>
                <span className={`text-sm font-bold ${riskColor}`}>{riskLevel}</span>
              </div>
              <Progress value={riskLevel === 'Low' ? 25 : riskLevel === 'Medium' ? 60 : 85} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Activity Level</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(Math.min(activityLevel, 100))}%</span>
              </div>
              <Progress value={Math.min(activityLevel, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Emergency Threshold</span>
                <span className="text-sm font-bold text-green-600">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>

          <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI continuously monitors biometric patterns for early emergency detection
              </span>
            </div>
            {!permissions?.accelerometer && (
              <div className="mt-3">
                <Button 
                  onClick={requestPermissions}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Enable Real Sensor Monitoring
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}