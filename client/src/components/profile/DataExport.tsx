import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  Database, 
  Archive,
  Calendar,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

export function DataExport() {
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (type: string) => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Quick Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-blue-500" />
            <span>Quick Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => handleExport('mood')}
              disabled={isExporting}
            >
              <BarChart3 className="h-6 w-6 text-purple-500" />
              <span>Mood Data</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => handleExport('emergency')}
              disabled={isExporting}
            >
              <Shield className="h-6 w-6 text-red-500" />
              <span>Emergency Logs</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => handleExport('contacts')}
              disabled={isExporting}
            >
              <Database className="h-6 w-6 text-green-500" />
              <span>Contact List</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => handleExport('complete')}
              disabled={isExporting}
            >
              <Archive className="h-6 w-6 text-orange-500" />
              <span>Complete Backup</span>
            </Button>
          </div>
          
          {isExporting && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Exporting data...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-500" />
            <span>Custom Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Data Types</Label>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="mood-data">Mood Tracking Data</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Include all mood entries and AI insights
                    </p>
                  </div>
                  <Switch id="mood-data" defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="emergency-data">Emergency Incidents</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Emergency alerts and response logs
                    </p>
                  </div>
                  <Switch id="emergency-data" defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="coping-data">Coping Tools Usage</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Breathing exercises and meditation sessions
                    </p>
                  </div>
                  <Switch id="coping-data" defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="location-data">Location History</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      GPS coordinates during emergency events
                    </p>
                  </div>
                  <Switch id="location-data" />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-base font-medium">Date Range</Label>
              <div className="mt-3 flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 30 Days
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 6 Months
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  All Time
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-base font-medium">Export Format</Label>
              <div className="mt-3 flex items-center space-x-4">
                <Button variant="outline" size="sm">JSON</Button>
                <Button variant="outline" size="sm">CSV</Button>
                <Button variant="outline" size="sm">PDF Report</Button>
              </div>
            </div>
          </div>
          
          <Button className="w-full" disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Generate Custom Export
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-slate-500" />
            <span>Recent Exports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Complete Backup</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">August 20, 2025 • 2.3 MB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Mood Analytics Report</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">August 15, 2025 • 845 KB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Emergency Log Export</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">August 10, 2025 • Failed</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          All exported data is encrypted and only accessible to you. We recommend storing backups securely and never sharing sensitive information.
        </AlertDescription>
      </Alert>
    </div>
  );
}