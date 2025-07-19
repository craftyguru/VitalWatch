import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, MapPin } from "lucide-react";

interface EmergencyButtonProps {
  onEmergencyTriggered?: (incidentId: number) => void;
  className?: string;
}

export function EmergencyButton({ onEmergencyTriggered, className }: EmergencyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { toast } = useToast();
  const { getCurrentPosition } = useGeolocation();

  const emergencyMutation = useMutation({
    mutationFn: async ({ location, message }: { location?: any; message?: string }) => {
      const response = await apiRequest("POST", "/api/emergency-alert", {
        type: "panic_button",
        severity: "critical",
        location,
        message,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Emergency Alert Sent",
          description: "Your emergency contacts have been notified.",
          variant: "default",
        });
        if (onEmergencyTriggered && data.incidentId) {
          onEmergencyTriggered(data.incidentId);
        }
      } else {
        toast({
          title: "Emergency Alert Issues",
          description: data.errors?.join(", ") || "Some notifications may have failed.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Emergency Alert Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsPressed(false);
    },
  });

  const handleEmergencyPress = async () => {
    if (isPressed || emergencyMutation.isPending) return;

    setIsPressed(true);

    try {
      // Get current location for emergency alert
      const location = await getCurrentPosition(true); // High accuracy for emergencies
      
      // Trigger emergency alert
      emergencyMutation.mutate({
        location,
        message: "Emergency alert activated through panic button",
      });

    } catch (error) {
      console.error("Emergency button error:", error);
      // Still send alert without location
      emergencyMutation.mutate({
        message: "Emergency alert activated through panic button",
      });
    }
  };

  return (
    <Button
      onClick={handleEmergencyPress}
      disabled={isPressed || emergencyMutation.isPending}
      className={`
        relative overflow-hidden
        ${isPressed ? 'animate-pulse scale-105' : 'hover:scale-105'}
        bg-gradient-to-r from-red-500 to-red-600 
        hover:from-red-600 hover:to-red-700
        text-white font-semibold
        border-0 shadow-lg
        transition-all duration-200
        ${className}
      `}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <AlertTriangle className="h-8 w-8" />
        <div className="text-lg font-bold">Emergency Alert</div>
        <div className="text-sm opacity-90 flex items-center space-x-1">
          <MapPin className="h-3 w-3" />
          <span>Send location & alert contacts</span>
        </div>
      </div>
      
      {isPressed && (
        <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse" />
      )}
    </Button>
  );
}
