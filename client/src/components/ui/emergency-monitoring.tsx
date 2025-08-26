import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Square, 
  AlertTriangle, 
  Shield, 
  Eye,
  Headphones,
  Volume2,
  Users,
  MapPin,
  Clock,
  Zap,
  Activity,
  Phone,
  MessageSquare
} from "lucide-react";

interface EmergencyMonitoringProps {
  onThreatDetected?: (threat: ThreatAnalysis) => void;
  emergencyContacts?: any[];
}

interface ThreatAnalysis {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  keywords: string[];
  transcription: string;
  location?: GeolocationPosition;
  timestamp: Date;
  suggestedActions: string[];
}

export function EmergencyMonitoring({ onThreatDetected, emergencyContacts }: EmergencyMonitoringProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [currentThreat, setCurrentThreat] = useState<ThreatAnalysis | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [monitoringDuration, setMonitoringDuration] = useState(0);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (durationRef.current) clearInterval(durationRef.current);
      stopMonitoring();
    };
  }, []);

  const startMonitoring = async () => {
    try {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => setLocation(position),
          (error) => console.log("Location access denied:", error)
        );
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up media recorder for transcription
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks: BlobPart[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await processAudioForTranscription(audioBlob);
      };

      // Start monitoring
      setIsMonitoring(true);
      setMonitoringDuration(0);
      
      // Monitor audio levels
      const monitorAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(Math.round((average / 255) * 100));
        }
      };

      intervalRef.current = setInterval(monitorAudioLevel, 100);
      
      // Track duration
      durationRef.current = setInterval(() => {
        setMonitoringDuration(prev => prev + 1);
      }, 1000);

      // Start recording in chunks for real-time processing
      startRecordingChunk();

      toast({
        title: "Emergency Monitoring Active",
        description: "AI is listening and analyzing for potential threats",
        variant: "default"
      });

    } catch (error) {
      console.error("Failed to start monitoring:", error);
      toast({
        title: "Monitoring Failed",
        description: "Could not access microphone. Please allow microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const startRecordingChunk = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      setIsRecording(true);
      mediaRecorderRef.current.start();
      
      // Record in 10-second chunks for real-time analysis
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          
          // Start next chunk if still monitoring
          setTimeout(() => {
            if (isMonitoring) {
              startRecordingChunk();
            }
          }, 1000);
        }
      }, 10000);
    }
  };

  const processAudioForTranscription = async (audioBlob: Blob) => {
    try {
      // Convert audio to base64 for API
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to our backend for OpenAI Whisper transcription and analysis
        const response = await fetch('/api/emergency-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: base64Audio,
            location: location ? {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              accuracy: location.coords.accuracy
            } : null,
            timestamp: new Date().toISOString()
          })
        });

        if (response.ok) {
          const analysis = await response.json();
          setTranscription(prev => prev + " " + analysis.transcription);
          
          if (analysis.threatAnalysis) {
            const threat: ThreatAnalysis = {
              ...analysis.threatAnalysis,
              location,
              timestamp: new Date()
            };
            
            setCurrentThreat(threat);
            
            // Auto-trigger emergency if critical threat detected
            if (threat.threatLevel === 'critical') {
              onThreatDetected?.(threat);
              await triggerEmergencyAlert(threat);
            }
          }
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Audio processing failed:", error);
    }
  };

  const triggerEmergencyAlert = async (threat: ThreatAnalysis) => {
    try {
      await fetch('/api/emergency-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ai_detected',
          severity: threat.threatLevel,
          location: threat.location ? {
            lat: threat.location.coords.latitude,
            lng: threat.location.coords.longitude
          } : null,
          message: `AI Emergency Detection: ${threat.transcription}. Threat Level: ${threat.threatLevel.toUpperCase()}. Keywords: ${threat.keywords.join(', ')}`,
          metadata: {
            confidence: threat.confidence,
            keywords: threat.keywords,
            transcription: threat.transcription,
            suggestedActions: threat.suggestedActions
          }
        })
      });

      toast({
        title: "Emergency Alert Sent",
        description: `Critical threat detected. Emergency contacts notified.`,
        variant: "destructive"
      });
    } catch (error) {
      console.error("Failed to send emergency alert:", error);
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setIsRecording(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (durationRef.current) clearInterval(durationRef.current);
    
    setAudioLevel(0);
    setCurrentThreat(null);

    toast({
      title: "Monitoring Stopped",
      description: "Emergency monitoring has been deactivated",
      variant: "default"
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isMonitoring ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Emergency Monitoring</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isMonitoring ? 'Actively listening and analyzing for threats' : 'Ready to protect you'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">
              {formatDuration(monitoringDuration)}
            </div>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!isMonitoring ? (
            <Button 
              onClick={startMonitoring}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full"
              data-testid="button-start-monitoring"
            >
              <Eye className="h-5 w-5 mr-2" />
              Start Emergency Monitoring
            </Button>
          ) : (
            <Button 
              onClick={stopMonitoring}
              size="lg"
              variant="destructive"
              className="px-8 py-3 rounded-full"
              data-testid="button-stop-monitoring"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop Monitoring
            </Button>
          )}
        </div>

        {/* Status Indicators */}
        {isMonitoring && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Mic className={`h-5 w-5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
                <Volume2 className="h-4 w-4 ml-1 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Audio Level</div>
              <Progress value={audioLevel} className="mt-2 h-2" />
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{audioLevel}%</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm font-medium text-green-900 dark:text-green-100">AI Status</div>
              <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30">
                {isRecording ? 'Analyzing' : 'Listening'}
              </Badge>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Contacts Ready</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {emergencyContacts?.length || 0}
              </div>
            </div>
          </div>
        )}

        {/* Current Threat Analysis */}
        {currentThreat && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-900 dark:text-orange-100">Threat Detected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getThreatColor(currentThreat.threatLevel)}`}></div>
                <Badge variant="outline" className={`${getThreatColor(currentThreat.threatLevel)} text-white border-0`}>
                  {currentThreat.threatLevel.toUpperCase()}
                </Badge>
                <Badge variant="secondary">
                  {Math.round(currentThreat.confidence * 100)}% Confidence
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentThreat.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-orange-100 text-orange-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {currentThreat.suggestedActions.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Suggested Actions:</span>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 mt-1 space-y-1">
                    {currentThreat.suggestedActions.map((action, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Transcription */}
        {isMonitoring && transcription && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Live Transcription</h4>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
              {transcription || "Listening for audio..."}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {isMonitoring && (
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('tel:911', '_self')}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call 911
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('sms:911?body=Emergency at my location', '_self')}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Text 911
            </Button>
          </div>
        )}

        {/* Safety Notice */}
        <div className="text-xs text-muted-foreground text-center bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
          <Shield className="h-4 w-4 mx-auto mb-1 text-blue-600" />
          This AI monitoring system analyzes audio patterns to detect potential emergencies. 
          It does not replace professional emergency services. Always call 911 for immediate emergencies.
        </div>
      </CardContent>
    </Card>
  );
}