import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedEmergencyControls } from "@/components/safety/EnhancedEmergencyControls";
import { EnhancedSensorMonitoring } from "@/components/safety/EnhancedSensorMonitoring";
import { EnhancedLocationServices } from "@/components/safety/EnhancedLocationServices";
import { EnhancedRecordingTools } from "@/components/safety/EnhancedRecordingTools";
import { EnhancedThreatAssessment } from "@/components/safety/EnhancedThreatAssessment";
import { 
  Shield, 
  Activity, 
  MapPin, 
  Camera,
  Gauge,
  AlertTriangle
} from "lucide-react";

export default function AdvancedSafetyTools() {
  const [activeTab, setActiveTab] = useState("emergency");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Advanced Safety Monitoring
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Comprehensive emergency protection with AI-powered threat detection
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="emergency" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Emergency</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
            <Activity className="h-5 w-5" />
            <span className="text-sm font-medium">Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">Location</span>
          </TabsTrigger>
          <TabsTrigger value="recording" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
            <Camera className="h-5 w-5" />
            <span className="text-sm font-medium">Recording</span>
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex flex-col items-center space-y-2 py-4 px-6 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all">
            <Gauge className="h-5 w-5" />
            <span className="text-sm font-medium">Threats</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="emergency" className="space-y-6">
            <EnhancedEmergencyControls />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <EnhancedSensorMonitoring />
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <EnhancedLocationServices />
          </TabsContent>

          <TabsContent value="recording" className="space-y-6">
            <EnhancedRecordingTools />
          </TabsContent>

          <TabsContent value="threats" className="space-y-6">
            <EnhancedThreatAssessment />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}