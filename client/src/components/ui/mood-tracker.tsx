import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Frown, 
  Meh, 
  Smile, 
  Laugh,
  MessageSquareHeart
} from "lucide-react";

const moodOptions = [
  { 
    mood: "terrible", 
    score: 1, 
    icon: MessageSquareHeart, 
    color: "text-red-500", 
    bgColor: "bg-red-50 hover:bg-red-100 border-red-200",
    label: "Terrible" 
  },
  { 
    mood: "bad", 
    score: 2, 
    icon: Frown, 
    color: "text-orange-500", 
    bgColor: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    label: "Bad" 
  },
  { 
    mood: "okay", 
    score: 3, 
    icon: Meh, 
    color: "text-neutral-500", 
    bgColor: "bg-neutral-50 hover:bg-neutral-100 border-neutral-200",
    label: "Okay" 
  },
  { 
    mood: "good", 
    score: 4, 
    icon: Smile, 
    color: "text-blue-500", 
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    label: "Good" 
  },
  { 
    mood: "great", 
    score: 5, 
    icon: Laugh, 
    color: "text-green-500", 
    bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
    label: "Great" 
  },
];

interface MoodTrackerProps {
  onMoodSubmitted?: () => void;
}

export function MoodTracker({ onMoodSubmitted }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();
  const { getCurrentPosition } = useGeolocation();
  const queryClient = useQueryClient();

  const moodMutation = useMutation({
    mutationFn: async (data: { mood: string; moodScore: number; note?: string; location?: any }) => {
      const response = await apiRequest("POST", "/api/mood-entries", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Mood recorded",
        description: "Thank you for sharing how you're feeling.",
        variant: "default",
      });
      
      // Reset form
      setSelectedMood(null);
      setNote("");
      
      // Invalidate mood entries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      
      // Check if AI detected any concerning patterns
      if (data.aiAnalysis?.riskLevel === "high" || data.aiAnalysis?.riskLevel === "critical") {
        toast({
          title: "Support Available",
          description: "We noticed you might be going through a tough time. Consider reaching out for support.",
          variant: "default",
        });
      }
      
      onMoodSubmitted?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to record mood",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMoodSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling right now.",
        variant: "destructive",
      });
      return;
    }

    const selectedOption = moodOptions.find(option => option.mood === selectedMood);
    if (!selectedOption) return;

    try {
      // Get current location (optional for mood tracking)
      const location = await getCurrentPosition(false);
      
      moodMutation.mutate({
        mood: selectedOption.mood,
        moodScore: selectedOption.score,
        note: note.trim() || undefined,
        location,
      });
    } catch (error) {
      // Submit without location if geolocation fails
      moodMutation.mutate({
        mood: selectedOption.mood,
        moodScore: selectedOption.score,
        note: note.trim() || undefined,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-700">
          How are you feeling?
        </CardTitle>
        <p className="text-sm text-neutral-500">
          Share your current mood to help us understand patterns
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selection */}
        <div className="grid grid-cols-5 gap-2">
          {moodOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedMood === option.mood;
            
            return (
              <button
                key={option.mood}
                onClick={() => setSelectedMood(option.mood)}
                className={`
                  aspect-square border rounded-xl flex flex-col items-center justify-center
                  transition-all duration-200 p-2
                  ${isSelected 
                    ? `${option.bgColor} ring-2 ring-offset-2 ring-current ${option.color}` 
                    : `${option.bgColor} border-opacity-50`
                  }
                `}
              >
                <Icon className={`h-6 w-6 mb-1 ${option.color}`} />
                <span className={`text-xs font-medium ${option.color}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Note Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            What's on your mind? (Optional)
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Share any thoughts or feelings that might help us understand patterns..."
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-neutral-500">
            Your notes help our AI provide better insights and detect concerning patterns
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleMoodSubmit}
          disabled={!selectedMood || moodMutation.isPending}
          className="w-full bg-primary hover:bg-blue-600 text-white"
        >
          {moodMutation.isPending ? "Recording..." : "Record Mood"}
        </Button>
      </CardContent>
    </Card>
  );
}
