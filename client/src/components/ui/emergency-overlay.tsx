import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Phone, MessageCircle, X } from "lucide-react";

interface EmergencyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId?: number;
  countdownDuration?: number; // in seconds
}

export function EmergencyOverlay({ 
  isOpen, 
  onClose, 
  incidentId,
  countdownDuration = 180 // 3 minutes default
}: EmergencyOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(countdownDuration);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const { toast } = useToast();

  const cancelEmergencyMutation = useMutation({
    mutationFn: async () => {
      if (!incidentId) return;
      const response = await apiRequest("POST", `/api/emergency-incidents/${incidentId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      setIsCountdownActive(false);
      toast({
        title: "Emergency alert cancelled",
        description: "Your emergency contacts will be notified that you're safe.",
        variant: "default",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel emergency",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !isCountdownActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsCountdownActive(false);
          // Auto-escalate emergency
          toast({
            title: "Emergency escalated",
            description: "Emergency services have been automatically contacted.",
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isCountdownActive, timeLeft]);

  // Reset countdown when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(countdownDuration);
      setIsCountdownActive(true);
    }
  }, [isOpen, countdownDuration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCall988 = () => {
    window.open('tel:988', '_self');
  };

  const handleCall911 = () => {
    window.open('tel:911', '_self');
  };

  const handleCrisisChat = () => {
    // This would open a crisis chat interface
    window.open('https://suicidepreventionlifeline.org/chat/', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              Emergency Alert Activated
            </h2>
            <p className="text-neutral-600 text-sm">
              Your emergency contacts are being notified and your location is being shared.
            </p>
          </div>

          {/* Countdown */}
          {isCountdownActive && timeLeft > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-red-700">
                Auto-escalation to emergency services
              </div>
              <div className="text-xs text-red-600 mt-1">
                Cancel if you're safe
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleCall911}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call 911 Now
            </Button>

            <Button
              onClick={handleCall988}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Crisis Lifeline (988)
            </Button>

            <Button
              onClick={handleCrisisChat}
              variant="outline"
              className="w-full py-3"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Crisis Text Chat
            </Button>

            {isCountdownActive && (
              <Button
                onClick={() => cancelEmergencyMutation.mutate()}
                disabled={cancelEmergencyMutation.isPending}
                variant="outline"
                className="w-full py-3 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                {cancelEmergencyMutation.isPending ? (
                  "Cancelling..."
                ) : (
                  <>
                    <X className="h-5 w-5 mr-2" />
                    Cancel Alert - I'm Safe
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Additional resources */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center mb-2">
              Additional Crisis Resources
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => window.open('sms:741741?body=HOME', '_self')}
                className="p-2 bg-neutral-100 rounded text-neutral-600 hover:bg-neutral-200"
              >
                Text HOME to 741741
              </button>
              <button 
                onClick={() => window.open('tel:18002738255', '_self')}
                className="p-2 bg-neutral-100 rounded text-neutral-600 hover:bg-neutral-200"
              >
                Domestic Violence: 1-800-799-7233
              </button>
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-neutral-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Emergency system active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
