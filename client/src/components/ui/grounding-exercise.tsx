import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Ear, Hand, Stethoscope, Cherry, CheckCircle, RotateCcw } from "lucide-react";

interface GroundingStep {
  sense: string;
  icon: React.ComponentType<any>;
  color: string;
  count: number;
  instruction: string;
  placeholder: string;
}

const groundingSteps: GroundingStep[] = [
  {
    sense: "See",
    icon: Eye,
    color: "text-blue-500",
    count: 5,
    instruction: "Look around and name 5 things you can see",
    placeholder: "What do you see? (e.g., a blue wall, a coffee cup...)",
  },
  {
    sense: "Touch",
    icon: Hand,
    color: "text-green-500",
    count: 4,
    instruction: "Notice 4 things you can touch or feel",
    placeholder: "What can you feel? (e.g., soft fabric, cool air...)",
  },
  {
    sense: "Hear",
    icon: Ear,
    color: "text-purple-500",
    count: 3,
    instruction: "Listen for 3 sounds around you",
    placeholder: "What do you hear? (e.g., birds chirping, traffic...)",
  },
  {
    sense: "Smell",
    icon: Stethoscope,
    color: "text-orange-500",
    count: 2,
    instruction: "Identify 2 scents or smells",
    placeholder: "What can you smell? (e.g., coffee, fresh air...)",
  },
  {
    sense: "Taste",
    icon: Cherry,
    color: "text-red-500",
    count: 1,
    instruction: "Notice 1 taste in your mouth",
    placeholder: "What can you taste? (e.g., minty toothpaste, water...)",
  },
];

interface GroundingExerciseProps {
  onComplete?: () => void;
}

export function GroundingExercise({ onComplete }: GroundingExerciseProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const recordUsageMutation = useMutation({
    mutationFn: async (data: { duration: number; completed: boolean; effectiveness?: number }) => {
      const response = await apiRequest("POST", "/api/coping-tools-usage", {
        toolType: "grounding",
        ...data,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coping-tools-usage"] });
    },
  });

  const currentStep = groundingSteps[currentStepIndex];
  const progress = ((currentStepIndex + responses.length / currentStep.count) / groundingSteps.length) * 100;
  const totalStepsCompleted = groundingSteps.slice(0, currentStepIndex).reduce((sum, step) => sum + step.count, 0) + responses.length;
  const totalSteps = groundingSteps.reduce((sum, step) => sum + step.count, 0);

  const startExercise = () => {
    setIsStarted(true);
    setStartTime(Date.now());
    setCurrentStepIndex(0);
    setResponses([]);
    setCurrentInput("");
    setIsCompleted(false);

    toast({
      title: "Grounding exercise started",
      description: "Take your time and focus on your senses",
      variant: "default",
    });
  };

  const addResponse = () => {
    if (!currentInput.trim()) return;

    const newResponses = [...responses, currentInput.trim()];
    setResponses(newResponses);
    setCurrentInput("");

    // Check if current step is complete
    if (newResponses.length >= currentStep.count) {
      if (currentStepIndex < groundingSteps.length - 1) {
        // Move to next step
        setTimeout(() => {
          setCurrentStepIndex(currentStepIndex + 1);
          setResponses([]);
        }, 500);
      } else {
        // Exercise complete
        completeExercise();
      }
    }
  };

  const completeExercise = () => {
    setIsCompleted(true);
    
    if (startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      recordUsageMutation.mutate({
        duration,
        completed: true,
      });
    }

    toast({
      title: "Grounding exercise completed!",
      description: "You've successfully used the 5-4-3-2-1 technique",
      variant: "default",
    });

    onComplete?.();
  };

  const resetExercise = () => {
    setIsStarted(false);
    setIsCompleted(false);
    setCurrentStepIndex(0);
    setResponses([]);
    setCurrentInput("");

    if (startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > 10) {
        recordUsageMutation.mutate({
          duration,
          completed: false,
        });
      }
    }
    
    setStartTime(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addResponse();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Eye className="h-5 w-5 text-blue-500" />
          <span>5-4-3-2-1 Grounding</span>
        </CardTitle>
        <p className="text-sm text-neutral-600">
          Use your senses to ground yourself in the present moment
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isStarted ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-4">
                This technique helps you reconnect with your surroundings by engaging all five senses.
              </p>
              <Button
                onClick={startExercise}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Start Grounding Exercise
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-700">What you'll do:</p>
              {groundingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.sense} className="flex items-center space-x-2 text-xs">
                    <Icon className={`h-4 w-4 ${step.color}`} />
                    <span>{step.count} things you can {step.sense.toLowerCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : isCompleted ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">Exercise Complete!</h3>
              <p className="text-sm text-neutral-600">
                You've successfully grounded yourself using all five senses.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-neutral-500">How do you feel now?</p>
              <Button
                onClick={resetExercise}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-neutral-600">
                <span>Progress</span>
                <span>{totalStepsCompleted} / {totalSteps}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current step */}
            <div className="text-center space-y-2">
              {React.createElement(currentStep.icon, {
                className: `h-12 w-12 ${currentStep.color} mx-auto`
              })}
              <h3 className="font-semibold text-lg">
                {currentStep.instruction}
              </h3>
              <p className="text-sm text-neutral-600">
                {responses.length} of {currentStep.count} completed
              </p>
            </div>

            {/* Previous responses for current step */}
            {responses.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-neutral-700">You noticed:</p>
                {responses.map((response, index) => (
                  <div
                    key={index}
                    className="text-xs bg-green-50 border border-green-200 rounded px-2 py-1 text-green-700"
                  >
                    {index + 1}. {response}
                  </div>
                ))}
              </div>
            )}

            {/* Input for current response */}
            {responses.length < currentStep.count && (
              <div className="space-y-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentStep.placeholder}
                  className="w-full"
                  autoFocus
                />
                <Button
                  onClick={addResponse}
                  disabled={!currentInput.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  size="sm"
                >
                  Add ({responses.length + 1} of {currentStep.count})
                </Button>
              </div>
            )}

            {/* Reset option */}
            <div className="text-center">
              <Button
                onClick={resetExercise}
                variant="ghost"
                size="sm"
                className="text-neutral-500"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
