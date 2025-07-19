import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, RotateCcw, Wind } from "lucide-react";

type BreathingPhase = "inhale" | "hold" | "exhale" | "pause";

const breathingPatterns = {
  "4-7-8": {
    name: "4-7-8 Relaxation",
    description: "Inhale for 4, hold for 7, exhale for 8",
    phases: [
      { phase: "inhale" as BreathingPhase, duration: 4, instruction: "Breathe in slowly" },
      { phase: "hold" as BreathingPhase, duration: 7, instruction: "Hold your breath" },
      { phase: "exhale" as BreathingPhase, duration: 8, instruction: "Exhale completely" },
      { phase: "pause" as BreathingPhase, duration: 1, instruction: "Rest" },
    ],
    cycles: 4,
  },
  "4-4-4": {
    name: "Box Breathing",
    description: "Equal 4-count breathing for balance",
    phases: [
      { phase: "inhale" as BreathingPhase, duration: 4, instruction: "Breathe in" },
      { phase: "hold" as BreathingPhase, duration: 4, instruction: "Hold" },
      { phase: "exhale" as BreathingPhase, duration: 4, instruction: "Breathe out" },
      { phase: "pause" as BreathingPhase, duration: 4, instruction: "Rest" },
    ],
    cycles: 5,
  },
  "6-2-6": {
    name: "Calm Breathing",
    description: "Gentle rhythm for anxiety relief",
    phases: [
      { phase: "inhale" as BreathingPhase, duration: 6, instruction: "Inhale deeply" },
      { phase: "hold" as BreathingPhase, duration: 2, instruction: "Brief hold" },
      { phase: "exhale" as BreathingPhase, duration: 6, instruction: "Exhale slowly" },
      { phase: "pause" as BreathingPhase, duration: 2, instruction: "Rest" },
    ],
    cycles: 6,
  },
};

interface BreathingExerciseProps {
  pattern?: keyof typeof breathingPatterns;
  onComplete?: () => void;
}

export function BreathingExercise({ 
  pattern = "4-7-8", 
  onComplete 
}: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const currentPattern = breathingPatterns[pattern];
  const currentPhase = currentPattern.phases[currentPhaseIndex];
  const totalCycles = currentPattern.cycles;

  const recordUsageMutation = useMutation({
    mutationFn: async (data: { duration: number; completed: boolean; effectiveness?: number }) => {
      const response = await apiRequest("POST", "/api/coping-tools-usage", {
        toolType: "breathing",
        ...data,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coping-tools-usage"] });
    },
  });

  // Calculate total exercise duration
  useEffect(() => {
    const phaseTotal = currentPattern.phases.reduce((sum, phase) => sum + phase.duration, 0);
    setTotalDuration(phaseTotal * currentPattern.cycles);
  }, [pattern]);

  const startExercise = () => {
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentPhaseIndex(0);
    setSecondsLeft(currentPattern.phases[0].duration);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    
    toast({
      title: "Breathing exercise started",
      description: `Follow the ${currentPattern.name} pattern`,
      variant: "default",
    });
  };

  const pauseExercise = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhaseIndex(0);
    setSecondsLeft(0);
    setElapsedTime(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Record incomplete session
    if (startTimeRef.current) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 5) { // Only record if exercised for more than 5 seconds
        recordUsageMutation.mutate({
          duration,
          completed: false,
        });
      }
    }
    
    startTimeRef.current = null;
  };

  const completeExercise = () => {
    setIsActive(false);
    
    if (startTimeRef.current) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      recordUsageMutation.mutate({
        duration,
        completed: true,
      });
    }
    
    toast({
      title: "Breathing exercise completed!",
      description: "Great job! How do you feel?",
      variant: "default",
    });
    
    onComplete?.();
  };

  // Main exercise timer
  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setCurrentPhaseIndex((phaseIndex) => {
            const nextPhaseIndex = (phaseIndex + 1) % currentPattern.phases.length;
            
            // If we've completed all phases, move to next cycle
            if (nextPhaseIndex === 0) {
              setCurrentCycle((cycle) => {
                const nextCycle = cycle + 1;
                
                // If we've completed all cycles, finish exercise
                if (nextCycle >= totalCycles) {
                  completeExercise();
                  return cycle;
                }
                
                return nextCycle;
              });
            }
            
            return nextPhaseIndex;
          });
          
          return currentPattern.phases[currentPhaseIndex === currentPattern.phases.length - 1 ? 0 : currentPhaseIndex + 1].duration;
        }
        
        return prev - 1;
      });
      
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentPhaseIndex, currentCycle, totalCycles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const progress = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0;
  const cycleProgress = totalCycles > 0 ? ((currentCycle + (currentPhaseIndex / currentPattern.phases.length)) / totalCycles) * 100 : 0;

  const getPhaseColor = (phase: BreathingPhase) => {
    switch (phase) {
      case "inhale": return "text-blue-600";
      case "hold": return "text-purple-600";
      case "exhale": return "text-green-600";
      case "pause": return "text-gray-500";
      default: return "text-gray-600";
    }
  };

  const getCircleAnimation = (phase: BreathingPhase) => {
    switch (phase) {
      case "inhale": return "scale-125";
      case "hold": return "scale-125";
      case "exhale": return "scale-75";
      case "pause": return "scale-100";
      default: return "scale-100";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Wind className="h-5 w-5 text-blue-500" />
          <span>{currentPattern.name}</span>
        </CardTitle>
        <p className="text-sm text-neutral-600">{currentPattern.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Visual breathing guide */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div 
              className={`
                w-24 h-24 rounded-full border-4 border-blue-400 bg-blue-50
                transition-transform duration-1000 ease-in-out
                ${isActive ? getCircleAnimation(currentPhase.phase) : "scale-100"}
              `}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {secondsLeft}
              </span>
            </div>
          </div>
          
          {isActive && (
            <div className="text-center">
              <p className={`text-lg font-semibold ${getPhaseColor(currentPhase.phase)}`}>
                {currentPhase.instruction}
              </p>
              <p className="text-sm text-neutral-500">
                Cycle {currentCycle + 1} of {totalCycles}
              </p>
            </div>
          )}
        </div>

        {/* Progress indicators */}
        {isActive && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-600">
              <span>Cycle Progress</span>
              <span>{Math.round(cycleProgress)}%</span>
            </div>
            <Progress value={cycleProgress} className="h-2" />
            
            <div className="flex justify-between text-xs text-neutral-600">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          {!isActive ? (
            <Button
              onClick={startExercise}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Exercise
            </Button>
          ) : (
            <>
              <Button
                onClick={pauseExercise}
                variant="outline"
                size="sm"
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button
                onClick={resetExercise}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Pattern selection */}
        {!isActive && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">Other patterns:</p>
            <div className="grid grid-cols-1 gap-1">
              {Object.entries(breathingPatterns).map(([key, patternInfo]) => (
                <button
                  key={key}
                  onClick={() => window.location.reload()} // Simple pattern switching
                  className={`
                    text-left p-2 rounded text-xs border
                    ${pattern === key 
                      ? "bg-blue-50 border-blue-200 text-blue-700" 
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  <div className="font-medium">{patternInfo.name}</div>
                  <div className="text-xs opacity-75">{patternInfo.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
