import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  Camera,
  PlayCircle,
  PauseCircle,
  Square,
  Timer,
  Volume2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export function RecordingTools() {
  const { toast } = useToast();
  const [audioRecording, setAudioRecording] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [storageUsed, setStorageUsed] = useState(45); // Percentage
  
  // Recording timer effect
  useEffect(() => {
    let recordingInterval: NodeJS.Timeout;
    
    if (audioRecording || videoRecording) {
      recordingInterval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [audioRecording, videoRecording]);

  const handleAudioRecording = () => {
    if (audioRecording) {
      setAudioRecording(false);
      toast({
        title: "Audio Recording Stopped",
        description: `Recorded ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}`,
        variant: "default",
      });
    } else {
      setVideoRecording(false); // Stop video if starting audio
      setAudioRecording(true);
      toast({
        title: "Audio Recording Started",
        description: "Emergency audio evidence is being recorded",
        variant: "default",
      });
    }
  };

  const handleVideoRecording = () => {
    if (videoRecording) {
      setVideoRecording(false);
      toast({
        title: "Video Recording Stopped",
        description: `Recorded ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}`,
        variant: "default",
      });
    } else {
      setAudioRecording(false); // Stop audio if starting video
      setVideoRecording(true);
      toast({
        title: "Video Recording Started",
        description: "Emergency video evidence is being recorded",
        variant: "default",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Active Recording Status */}
      {(audioRecording || videoRecording) && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-red-700 dark:text-red-300">
                    {audioRecording ? "Audio Recording" : "Video Recording"}
                  </span>
                </div>
                <Badge variant="destructive">
                  RECORDING
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <Timer className="h-4 w-4 text-red-600" />
                <span className="font-mono text-lg font-bold text-red-700 dark:text-red-300">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5 text-blue-500" />
            <span>Emergency Recording</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio Recording */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mic className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Audio Recording</span>
                </div>
                {audioRecording && (
                  <Badge variant="destructive">
                    Recording
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleAudioRecording}
                className={`w-full h-12 ${
                  audioRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {audioRecording ? (
                  <>
                    <Square className="h-5 w-5 mr-2" />
                    Stop Audio
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Audio
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                High-quality audio for evidence collection
              </p>
            </div>

            {/* Video Recording */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Video Recording</span>
                </div>
                {videoRecording && (
                  <Badge variant="destructive">
                    Recording
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleVideoRecording}
                className={`w-full h-12 ${
                  videoRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {videoRecording ? (
                  <>
                    <Square className="h-5 w-5 mr-2" />
                    Stop Video
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5 mr-2" />
                    Start Video
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Full HD video with audio for comprehensive evidence
              </p>
            </div>
          </div>

          {/* Recording Quality Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-sm font-medium">Audio Quality</label>
              <select className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900">
                <option value="high">High (48kHz)</option>
                <option value="medium">Medium (44kHz)</option>
                <option value="low">Low (22kHz)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Quality</label>
              <select className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900">
                <option value="1080p">1080p HD</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <span>Recording Storage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Storage Used</span>
              <span>{storageUsed}% of 1GB</span>
            </div>
            <Progress value={storageUsed} className="w-full" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>450 MB used</span>
              <span>550 MB available</span>
            </div>
          </div>
          
          <Alert className={storageUsed > 80 ? "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950" : ""}>
            <AlertTriangle className={`h-4 w-4 ${storageUsed > 80 ? 'text-orange-600' : 'text-blue-600'}`} />
            <AlertDescription className={storageUsed > 80 ? 'text-orange-700 dark:text-orange-300' : ''}>
              {storageUsed > 80 
                ? "Storage almost full. Consider deleting old recordings or upgrading storage."
                : "Emergency recordings are automatically encrypted and backed up to secure cloud storage."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recent Recordings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-slate-500" />
            <span>Recent Recordings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mic className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">Emergency Audio #1</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">2:34 • Today 3:45 PM</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <PlayCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <Camera className="h-4 w-4 text-green-500" />
                <div>
                  <p className="font-medium">Emergency Video #1</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">1:12 • Today 2:22 PM</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <PlayCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              View All Recordings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}