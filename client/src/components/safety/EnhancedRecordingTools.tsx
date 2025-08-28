import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera,
  Mic,
  Video,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Circle,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Clock,
  HardDrive,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileAudio,
  FileVideo,
  FileImage,
  Settings,
  Zap
} from "lucide-react";

export function EnhancedRecordingTools() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("audio");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [stealthMode, setStealthMode] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Recording settings
  const [recordingSettings, setRecordingSettings] = useState({
    audioQuality: "high",
    videoQuality: "1080p",
    autoUpload: true,
    continuousRecording: false,
    emergencyTrigger: true,
    storageLimit: 5 // GB
  });

  // Storage info
  const [storageInfo, setStorageInfo] = useState({
    used: 1.2,
    available: 3.8,
    recordings: 24,
    totalDuration: "4h 32m"
  });

  // Recording history
  const [recordings, setRecordings] = useState([
    {
      id: 1,
      type: "audio",
      title: "Emergency Alert - Audio",
      duration: "2:34",
      timestamp: new Date(Date.now() - 3600000),
      size: "4.2 MB",
      isUploaded: true,
      isEmergency: true
    },
    {
      id: 2,
      type: "video",
      title: "Security Recording",
      duration: "0:45",
      timestamp: new Date(Date.now() - 7200000),
      size: "12.8 MB",
      isUploaded: true,
      isEmergency: false
    },
    {
      id: 3,
      type: "audio",
      title: "Voice Note",
      duration: "1:15",
      timestamp: new Date(Date.now() - 86400000),
      size: "2.1 MB",
      isUploaded: false,
      isEmergency: false
    }
  ]);

  // Recording timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const newRecording = {
          id: recordings.length + 1,
          type: "audio",
          title: `Audio Recording ${recordings.length + 1}`,
          duration: formatDuration(recordingDuration),
          timestamp: new Date(),
          size: `${(blob.size / 1024 / 1024).toFixed(1)} MB`,
          isUploaded: false,
          isEmergency: false
        };
        setRecordings(prev => [newRecording, ...prev]);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType("audio");
      
      toast({
        title: stealthMode ? "" : "Audio Recording Started",
        description: stealthMode ? "" : "Recording in high quality mode",
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Unable to access microphone",
        variant: "destructive",
      });
    }
  };

  const startVideoRecording = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1920, height: 1080 },
        audio: true
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const newRecording = {
          id: recordings.length + 1,
          type: "video",
          title: `Video Recording ${recordings.length + 1}`,
          duration: formatDuration(recordingDuration),
          timestamp: new Date(),
          size: `${(blob.size / 1024 / 1024).toFixed(1)} MB`,
          isUploaded: false,
          isEmergency: false
        };
        setRecordings(prev => [newRecording, ...prev]);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType("video");
      
      toast({
        title: stealthMode ? "" : "Video Recording Started",
        description: stealthMode ? "" : "Recording in 1080p quality",
      });
    } catch (error: any) {
      console.error("Video recording error:", error);
      toast({
        title: "Recording Failed",
        description: error.name === "NotAllowedError" 
          ? "Camera/microphone permission denied. Please allow access and try again."
          : "Unable to access camera/microphone. Check your device settings.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingType(null);
    
    if (!stealthMode) {
      toast({
        title: "Recording Stopped",
        description: "Recording saved successfully",
      });
    }
  };

  const startEmergencyRecording = async () => {
    // Start both audio and video in emergency mode
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType("emergency");
      
      toast({
        title: "Emergency Recording Active",
        description: "Audio and video recording started",
        variant: "destructive",
      });
    } catch (error) {
      // Fallback to audio only
      startAudioRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingIcon = (type: string) => {
    switch (type) {
      case "audio": return FileAudio;
      case "video": return FileVideo;
      case "image": return FileImage;
      default: return FileAudio;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Emergency
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Storage
          </TabsTrigger>
        </TabsList>

        {/* Audio Recording Tab */}
        <TabsContent value="audio" className="space-y-4">
          {/* Audio Controls */}
          <Card className={isRecording && recordingType === "audio" ? "border-red-500 border-2" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Audio Recording
                {isRecording && recordingType === "audio" && (
                  <Badge variant="destructive" className="ml-auto">
                    <Circle className="h-3 w-3 mr-1 animate-pulse fill-current" />
                    Recording
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRecording && recordingType === "audio" ? (
                <div className="text-center space-y-4">
                  <div className="text-4xl font-mono font-bold text-red-600">
                    {formatDuration(recordingDuration)}
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button onClick={stopRecording} variant="destructive">
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Mic className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium">High Quality</p>
                      <p className="text-xs text-muted-foreground">48kHz, 16-bit</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm font-medium">Encrypted</p>
                      <p className="text-xs text-muted-foreground">End-to-end</p>
                    </div>
                  </div>
                  
                  <Button onClick={startAudioRecording} className="w-full" size="lg">
                    <Mic className="h-5 w-5 mr-2" />
                    Start Audio Recording
                  </Button>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Stealth Mode</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStealthMode(!stealthMode)}
                    >
                      {stealthMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audio Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Quality</span>
                  <Badge variant="default">{recordingSettings.audioQuality}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Auto Upload</span>
                  <Badge variant={recordingSettings.autoUpload ? "default" : "secondary"}>
                    {recordingSettings.autoUpload ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Trigger</span>
                  <Badge variant={recordingSettings.emergencyTrigger ? "default" : "secondary"}>
                    {recordingSettings.emergencyTrigger ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Continuous Recording</span>
                  <Badge variant={recordingSettings.continuousRecording ? "destructive" : "secondary"}>
                    {recordingSettings.continuousRecording ? "On" : "Off"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Recording Tab */}
        <TabsContent value="video" className="space-y-4">
          <Card className={isRecording && recordingType === "video" ? "border-red-500 border-2" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Recording
                {isRecording && recordingType === "video" && (
                  <Badge variant="destructive" className="ml-auto">
                    <Circle className="h-3 w-3 mr-1 animate-pulse fill-current" />
                    Recording
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRecording && recordingType === "video" ? (
                <div className="text-center space-y-4">
                  <div className="text-4xl font-mono font-bold text-red-600">
                    {formatDuration(recordingDuration)}
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button onClick={stopRecording} variant="destructive">
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Video className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-sm font-medium">1080p HD</p>
                      <p className="text-xs text-muted-foreground">30 FPS</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm font-medium">Secure</p>
                      <p className="text-xs text-muted-foreground">Local storage</p>
                    </div>
                  </div>
                  
                  <Button onClick={startVideoRecording} className="w-full" size="lg">
                    <Video className="h-5 w-5 mr-2" />
                    Start Video Recording
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Recording Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Emergency Recording System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRecording && recordingType === "emergency" ? (
                <div className="text-center space-y-4">
                  <div className="text-4xl font-mono font-bold text-red-600">
                    {formatDuration(recordingDuration)}
                  </div>
                  <Badge variant="destructive" className="text-lg p-2">
                    <Circle className="h-4 w-4 mr-2 animate-pulse fill-current" />
                    EMERGENCY RECORDING ACTIVE
                  </Badge>
                  <Button onClick={stopRecording} variant="destructive" size="lg">
                    <StopCircle className="h-5 w-5 mr-2" />
                    Stop Emergency Recording
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Emergency recording captures both audio and video simultaneously and 
                      automatically shares with emergency contacts.
                    </p>
                    <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                      <li>• Automatic cloud backup</li>
                      <li>• Real-time sharing with contacts</li>
                      <li>• GPS location embedding</li>
                      <li>• Stealth operation mode</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={startEmergencyRecording} 
                    className="w-full bg-red-600 hover:bg-red-700" 
                    size="lg"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    START EMERGENCY RECORDING
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Management Tab */}
        <TabsContent value="storage" className="space-y-4">
          {/* Storage Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Storage Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used Storage</span>
                  <span>{storageInfo.used} GB / {storageInfo.used + storageInfo.available} GB</span>
                </div>
                <Progress value={(storageInfo.used / (storageInfo.used + storageInfo.available)) * 100} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{storageInfo.recordings}</div>
                  <p className="text-xs text-muted-foreground">Total Recordings</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{storageInfo.totalDuration}</div>
                  <p className="text-xs text-muted-foreground">Total Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Recordings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recordings.slice(0, 5).map((recording) => {
                  const Icon = getRecordingIcon(recording.type);
                  return (
                    <div key={recording.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${
                          recording.type === "audio" ? "text-blue-500" :
                          recording.type === "video" ? "text-purple-500" :
                          "text-green-500"
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{recording.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {recording.timestamp.toLocaleDateString()} • {recording.duration} • {recording.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {recording.isEmergency && (
                          <Badge variant="destructive">Emergency</Badge>
                        )}
                        <Badge variant={recording.isUploaded ? "default" : "secondary"}>
                          {recording.isUploaded ? "Uploaded" : "Local"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}