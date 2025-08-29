import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import CrisisChatSupport from "./crisis-chat-support";

interface FloatingChatBubbleProps {
  className?: string;
}

export default function FloatingChatBubble({ className }: FloatingChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [currentCrisisLevel, setCurrentCrisisLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Simulate notification for urgent situations (in real app, this would come from crisis detection)
  useEffect(() => {
    const checkForCrisisNotifications = () => {
      // This would normally check user's current crisis indicators
      const shouldShowNotification = Math.random() < 0.1; // 10% chance for demo
      setHasNotification(shouldShowNotification);
    };

    const interval = setInterval(checkForCrisisNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyTrigger = () => {
    setCurrentCrisisLevel('critical');
    setHasNotification(true);
  };

  const getBubbleColor = () => {
    switch (currentCrisisLevel) {
      case 'critical': return 'bg-red-500 hover:bg-red-600 animate-pulse';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-green-500 hover:bg-green-600';
    }
  };

  const getNotificationText = () => {
    switch (currentCrisisLevel) {
      case 'critical': return 'Crisis Support Needed';
      case 'high': return 'Support Available';
      case 'medium': return 'AI Counselor Ready';
      default: return 'Chat Support';
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <div 
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        data-testid="floating-chat-bubble"
      >
        <div className="relative">
          {/* Notification Badge */}
          {hasNotification && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 z-10 animate-bounce text-xs px-1 py-0"
              data-testid="chat-notification-badge"
            >
              !
            </Badge>
          )}
          
          {/* Chat Button */}
          <Button
            onClick={() => {
              setIsOpen(true);
              setHasNotification(false);
            }}
            className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${getBubbleColor()}`}
            data-testid="chat-bubble-button"
          >
            <MessageCircle className="h-8 w-8 text-white" />
          </Button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {getNotificationText()}
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="w-full max-w-md h-[80vh] p-0 gap-0 flex flex-col"
          data-testid="chat-dialog"
        >
          {/* Header */}
          <DialogHeader className="p-4 pb-2 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <DialogTitle className="text-lg font-semibold">Crisis Support</DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${
                  currentCrisisLevel === 'critical' ? 'bg-red-100 text-red-800' :
                  currentCrisisLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                  currentCrisisLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {currentCrisisLevel.toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  data-testid="minimize-chat"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  data-testid="close-chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              <CrisisChatSupport 
                crisisLevel={currentCrisisLevel}
                onEmergencyTrigger={handleEmergencyTrigger}
              />
            </div>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Crisis support is minimized but still active
              </p>
              <Button
                onClick={() => setIsMinimized(false)}
                variant="outline"
                size="sm"
                data-testid="restore-chat"
              >
                Restore Chat
              </Button>
            </div>
          )}

          {/* Emergency Quick Actions Footer */}
          {currentCrisisLevel === 'critical' && !isMinimized && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <div className="flex gap-2 text-xs">
                <Button 
                  size="sm" 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => window.open('tel:988')}
                  data-testid="call-988"
                >
                  Call 988
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-red-300 text-red-700"
                  onClick={() => window.open('tel:911')}
                  data-testid="call-911"
                >
                  Call 911
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}