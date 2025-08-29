import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Share, 
  Phone, 
  Volume2, 
  VolumeX, 
  Settings, 
  Download, 
  Upload, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Save, 
  Shield, 
  MapPin, 
  Clock, 
  Users, 
  FileText, 
  Camera, 
  Smartphone, 
  Wifi, 
  Database, 
  Cloud, 
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  Headphones,
  Radio,
  Zap,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Minus,
  RefreshCw,
  Monitor,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack
} from "lucide-react";

interface EmergencyToolsModalProps {
  tool: 'audio' | 'video' | 'share' | 'call' | 'silent' | 'setup' | null;
  isOpen: boolean;
  onClose: () => void;
  emergencyLocation?: { lat: number; lng: number } | null;
}

interface MediaRecording {
  id: string;
  type: 'audio' | 'video';
  blob: Blob;
  timestamp: Date;
  duration: number;
  size: number;
  uploaded: boolean;
}

interface EvidencePackage {
  id: string;
  timestamp: Date;
  location: { lat: number; lng: number } | null;
  recordings: MediaRecording[];
  screenshots: string[];
  deviceInfo: any;
  sensorData: any;
  contacts: string[];
  notes: string;
  uploaded: boolean;
}

export function EmergencyToolsModal({ tool, isOpen, onClose, emergencyLocation }: EmergencyToolsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordings, setRecordings] = useState<MediaRecording[]>([]);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  
  // Evidence storage
  const [evidencePackage, setEvidencePackage] = useState<EvidencePackage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // UI states
  const [activeTab, setActiveTab] = useState("main");
  const [silentMode, setSilentMode] = useState(false);
  const [autoUpload, setAutoUpload] = useState(true);
  const [compressionQuality, setCompressionQuality] = useState([80]);
  const [notes, setNotes] = useState("");
  
  // Device capabilities
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    audio: false,
    video: false,
    screen: false,
    location: false,
    accelerometer: false,
    battery: false
  });

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize device capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      const caps = {
        audio: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        video: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        screen: 'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices,
        location: 'geolocation' in navigator,
        accelerometer: 'DeviceMotionEvent' in window,
        battery: 'getBattery' in navigator
      };
      setDeviceCapabilities(caps);
    };
    checkCapabilities();
  }, []);

  // Create new evidence package
  const createEvidencePackage = () => {
    const packageId = `evidence-${Date.now()}-${user?.id}`;
    const pkg: EvidencePackage = {
      id: packageId,
      timestamp: new Date(),
      location: emergencyLocation,
      recordings: [],
      screenshots: [],
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth
        }
      },
      sensorData: {},
      contacts: [],
      notes: "",
      uploaded: false
    };
    setEvidencePackage(pkg);
    return pkg;
  };

  // Upload evidence to Supabase
  const uploadEvidence = async (pkg: EvidencePackage) => {
    if (!user) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload media files first
      const uploadedRecordings = [];
      
      for (let i = 0; i < pkg.recordings.length; i++) {
        const recording = pkg.recordings[i];
        setUploadProgress((i / pkg.recordings.length) * 50);
        
        // Convert blob to base64 for API upload
        const base64 = await blobToBase64(recording.blob);
        
        const uploadResult = await apiRequest("POST", "/api/upload-evidence", {
          type: recording.type,
          data: base64,
          filename: `${recording.type}-${recording.id}.${recording.type === 'audio' ? 'webm' : 'mp4'}`,
          evidenceId: pkg.id
        });
        
        uploadedRecordings.push({
          ...recording,
          url: uploadResult.url,
          uploaded: true
        });
      }
      
      setUploadProgress(75);
      
      // Save evidence package metadata
      await apiRequest("POST", "/api/evidence-packages", {
        ...pkg,
        recordings: uploadedRecordings,
        notes,
        uploaded: true
      });
      
      setUploadProgress(100);
      setEvidencePackage({ ...pkg, recordings: uploadedRecordings, uploaded: true });
      
      toast({
        title: "Evidence Uploaded",
        description: `${uploadedRecordings.length} recordings and data securely stored`,
      });
      
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload evidence",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Audio recording functions
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      setCurrentStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const recording: MediaRecording = {
          id: `audio-${Date.now()}`,
          type: 'audio',
          blob,
          timestamp: new Date(),
          duration: recordingDuration,
          size: blob.size,
          uploaded: false
        };
        
        setRecordings(prev => [...prev, recording]);
        
        if (evidencePackage) {
          setEvidencePackage(prev => prev ? {
            ...prev,
            recordings: [...prev.recordings, recording]
          } : null);
        }
        
        if (autoUpload && evidencePackage) {
          uploadEvidence({ ...evidencePackage, recordings: [...evidencePackage.recordings, recording] });
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      if (!evidencePackage) {
        createEvidencePackage();
      }
      
      if (!silentMode) {
        toast({
          title: "Recording Started",
          description: "Audio evidence is being captured",
        });
      }
      
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Unable to access microphone",
        variant: "destructive"
      });
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      
      setCurrentStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const recording: MediaRecording = {
          id: `video-${Date.now()}`,
          type: 'video',
          blob,
          timestamp: new Date(),
          duration: recordingDuration,
          size: blob.size,
          uploaded: false
        };
        
        setRecordings(prev => [...prev, recording]);
        
        if (evidencePackage) {
          setEvidencePackage(prev => prev ? {
            ...prev,
            recordings: [...prev.recordings, recording]
          } : null);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      if (!evidencePackage) {
        createEvidencePackage();
      }
      
      if (!silentMode) {
        toast({
          title: "Video Recording Started",
          description: "Video evidence is being captured",
        });
      }
      
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Unable to access camera",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        setCurrentStream(null);
      }
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      setRecordingDuration(0);
      
      if (!silentMode) {
        toast({
          title: "Recording Stopped",
          description: "Evidence has been saved",
        });
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { mediaSource: 'screen' }
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        const screenshot = canvas.toDataURL('image/png');
        
        if (evidencePackage) {
          setEvidencePackage(prev => prev ? {
            ...prev,
            screenshots: [...prev.screenshots, screenshot]
          } : null);
        }
        
        stream.getTracks().forEach(track => track.stop());
        
        if (!silentMode) {
          toast({
            title: "Screenshot Captured",
            description: "Screen evidence has been saved",
          });
        }
      });
      
    } catch (error) {
      toast({
        title: "Screenshot Failed",
        description: "Unable to capture screen",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderToolContent = () => {
    switch (tool) {
      case 'audio':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="main">Record</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="h-5 w-5" />
                    <span>Audio Evidence Recording</span>
                    {isRecording && (
                      <Badge variant="destructive" className="animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                        RECORDING
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="text-center">
                      <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 ${
                        isRecording ? 'bg-red-100 border-4 border-red-500 animate-pulse' : 'bg-gray-100 border-4 border-gray-300'
                      }`}>
                        {isRecording ? (
                          <Mic className="h-12 w-12 text-red-600" />
                        ) : (
                          <MicOff className="h-12 w-12 text-gray-600" />
                        )}
                      </div>
                      <div className="text-3xl font-mono font-bold mb-2">
                        {formatDuration(recordingDuration)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready to Record'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-3">
                    {!isRecording ? (
                      <Button onClick={startAudioRecording} size="lg" className="bg-red-600 hover:bg-red-700">
                        <Mic className="h-5 w-5 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <>
                        {!isPaused ? (
                          <Button onClick={pauseRecording} variant="outline" size="lg">
                            <Pause className="h-5 w-5" />
                          </Button>
                        ) : (
                          <Button onClick={resumeRecording} variant="outline" size="lg">
                            <Play className="h-5 w-5" />
                          </Button>
                        )}
                        <Button onClick={stopRecording} variant="destructive" size="lg">
                          <Square className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {deviceCapabilities.audio && (
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Microphone Available</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        High-quality audio with noise suppression enabled
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recording Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Silent Mode</Label>
                    <Switch checked={silentMode} onCheckedChange={setSilentMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto Upload to Evidence</Label>
                    <Switch checked={autoUpload} onCheckedChange={setAutoUpload} />
                  </div>
                  <div>
                    <Label>Audio Quality: {compressionQuality[0]}%</Label>
                    <Slider
                      value={compressionQuality}
                      onValueChange={setCompressionQuality}
                      max={100}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recorded Audio ({recordings.filter(r => r.type === 'audio').length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {recordings.filter(r => r.type === 'audio').length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No audio recordings yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recordings.filter(r => r.type === 'audio').map((recording) => (
                        <div key={recording.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mic className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{formatDuration(recording.duration)}</div>
                              <div className="text-sm text-muted-foreground">
                                {recording.timestamp.toLocaleTimeString()} • {formatFileSize(recording.size)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {recording.uploaded && (
                              <Badge variant="secondary" className="text-green-600">
                                <Cloud className="h-3 w-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Evidence Package</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evidencePackage ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{evidencePackage.recordings.length}</div>
                          <div className="text-sm text-blue-700">Recordings</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{evidencePackage.screenshots.length}</div>
                          <div className="text-sm text-green-700">Screenshots</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Evidence Notes</Label>
                        <Textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any relevant details about this evidence..."
                          rows={3}
                        />
                      </div>
                      
                      {isUploading ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading Evidence...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} />
                        </div>
                      ) : (
                        <Button 
                          onClick={() => uploadEvidence(evidencePackage)} 
                          className="w-full"
                          disabled={evidencePackage.uploaded}
                        >
                          {evidencePackage.uploaded ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Evidence Uploaded
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Evidence Package
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <div>No evidence package created yet</div>
                      <div className="text-sm">Start recording to create evidence</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        );

      case 'video':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="main">Record</TabsTrigger>
              <TabsTrigger value="screen">Screen</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5" />
                    <span>Video Evidence Recording</span>
                    {isRecording && (
                      <Badge variant="destructive" className="animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                        RECORDING
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    {isRecording && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                        REC {formatDuration(recordingDuration)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center space-x-3">
                    {!isRecording ? (
                      <Button onClick={startVideoRecording} size="lg" className="bg-red-600 hover:bg-red-700">
                        <Video className="h-5 w-5 mr-2" />
                        Start Video Recording
                      </Button>
                    ) : (
                      <>
                        {!isPaused ? (
                          <Button onClick={pauseRecording} variant="outline" size="lg">
                            <Pause className="h-5 w-5" />
                          </Button>
                        ) : (
                          <Button onClick={resumeRecording} variant="outline" size="lg">
                            <Play className="h-5 w-5" />
                          </Button>
                        )}
                        <Button onClick={stopRecording} variant="destructive" size="lg">
                          <Square className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="screen" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5" />
                    <span>Screen Capture</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={takeScreenshot} className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Take Screenshot
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Video Library ({recordings.filter(r => r.type === 'video').length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {recordings.filter(r => r.type === 'video').length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No video recordings yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recordings.filter(r => r.type === 'video').map((recording) => (
                        <div key={recording.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Video className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{formatDuration(recording.duration)}</div>
                              <div className="text-sm text-muted-foreground">
                                {recording.timestamp.toLocaleTimeString()} • {formatFileSize(recording.size)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {recording.uploaded && (
                              <Badge variant="secondary" className="text-green-600">
                                <Cloud className="h-3 w-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Evidence Package</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evidencePackage && evidencePackage.screenshots.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Screenshots ({evidencePackage.screenshots.length})</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {evidencePackage.screenshots.map((screenshot, index) => (
                          <img
                            key={index}
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(screenshot, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        );

      case 'share':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share className="h-5 w-5" />
                  <span>Emergency Location Share</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergencyLocation && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Current Location</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Lat: {emergencyLocation.lat.toFixed(6)}<br/>
                      Lng: {emergencyLocation.lng.toFixed(6)}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => {
                      if (navigator.share && emergencyLocation) {
                        navigator.share({
                          title: 'Emergency Location',
                          text: `Emergency assistance needed at: ${emergencyLocation.lat.toFixed(6)}, ${emergencyLocation.lng.toFixed(6)}`,
                          url: `https://maps.google.com/maps?q=${emergencyLocation.lat},${emergencyLocation.lng}`
                        });
                      }
                    }}
                    className="h-16"
                  >
                    <div className="text-center">
                      <Share className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs">Share Location</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      if (emergencyLocation) {
                        window.open(`https://maps.google.com/maps?q=${emergencyLocation.lat},${emergencyLocation.lng}`, '_blank');
                      }
                    }}
                    variant="outline"
                    className="h-16"
                  >
                    <div className="text-center">
                      <MapPin className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs">Open Maps</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      if (emergencyLocation) {
                        const message = `EMERGENCY: I need immediate assistance. My location is: https://maps.google.com/maps?q=${emergencyLocation.lat},${emergencyLocation.lng}`;
                        window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
                      }
                    }}
                    variant="outline"
                    className="h-16"
                  >
                    <div className="text-center">
                      <MessageSquare className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs">Send SMS</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      if (emergencyLocation) {
                        const coords = `${emergencyLocation.lat},${emergencyLocation.lng}`;
                        navigator.clipboard.writeText(coords);
                        toast({
                          title: "Coordinates Copied",
                          description: "Location coordinates copied to clipboard"
                        });
                      }
                    }}
                    variant="outline"
                    className="h-16"
                  >
                    <div className="text-center">
                      <Database className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs">Copy Coords</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'call':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Emergency Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button 
                    onClick={() => window.open('tel:911', '_self')}
                    className="h-16 bg-red-600 hover:bg-red-700 text-lg font-semibold"
                  >
                    <div className="text-center">
                      <Phone className="h-6 w-6 mx-auto mb-1" />
                      <div>Emergency Services</div>
                      <div className="text-sm font-normal">911</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('tel:988', '_self')}
                    className="h-16 bg-purple-600 hover:bg-purple-700"
                  >
                    <div className="text-center">
                      <Heart className="h-6 w-6 mx-auto mb-1" />
                      <div>Crisis Hotline</div>
                      <div className="text-sm font-normal">988</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('tel:211', '_self')}
                    variant="outline"
                    className="h-16"
                  >
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto mb-1" />
                      <div>Community Help</div>
                      <div className="text-sm">211</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'silent':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <VolumeX className="h-5 w-5" />
                  <span>Silent Emergency Mode</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Silent Mode Active</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    All emergency actions will be performed without sound notifications
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Disable All Sounds</Label>
                    <Switch checked={silentMode} onCheckedChange={setSilentMode} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Vibration Only</Label>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Screen Flash Alerts</Label>
                    <Switch />
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Test Silent Mode
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'setup':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {Object.entries(deviceCapabilities).map(([key, granted]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {key === 'audio' && <Mic className="h-5 w-5" />}
                          {key === 'video' && <Video className="h-5 w-5" />}
                          {key === 'screen' && <Monitor className="h-5 w-5" />}
                          {key === 'location' && <MapPin className="h-5 w-5" />}
                          {key === 'accelerometer' && <Activity className="h-5 w-5" />}
                          {key === 'battery' && <Zap className="h-5 w-5" />}
                          <div>
                            <div className="font-medium capitalize">{key}</div>
                            <div className="text-sm text-muted-foreground">
                              {granted ? 'Access granted' : 'Permission needed'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {granted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => {
                      // Request all permissions
                      if (navigator.mediaDevices) {
                        navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                      }
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(() => {});
                      }
                    }}
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Grant All Permissions
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Devices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Primary Device</div>
                        <div className="text-sm text-muted-foreground">This device</div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wifi className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Network Connection</div>
                        <div className="text-sm text-muted-foreground">Connected</div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Auto-Upload Evidence</Label>
                      <Switch checked={autoUpload} onCheckedChange={setAutoUpload} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Location Tracking</Label>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Emergency Contacts Alert</Label>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Biometric Monitoring</Label>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        );

      default:
        return null;
    }
  };

  if (!tool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {tool === 'audio' && <Mic className="h-6 w-6" />}
            {tool === 'video' && <Video className="h-6 w-6" />}
            {tool === 'share' && <Share className="h-6 w-6" />}
            {tool === 'call' && <Phone className="h-6 w-6" />}
            {tool === 'silent' && <VolumeX className="h-6 w-6" />}
            {tool === 'setup' && <Settings className="h-6 w-6" />}
            <span className="capitalize">Emergency {tool}</span>
            {evidencePackage && !evidencePackage.uploaded && (
              <Badge variant="secondary" className="text-yellow-600">
                <Database className="h-3 w-3 mr-1" />
                Evidence Ready
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {renderToolContent()}
      </DialogContent>
    </Dialog>
  );
}