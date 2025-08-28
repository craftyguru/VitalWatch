import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export function FloatingInstallButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone;
    
    if (isStandalone) {
      return; // Don't show if already installed
    }

    // Check if user has already seen/dismissed the install prompt
    const hasSeenInstall = localStorage.getItem('vitalwatch-install-seen');
    const dismissedTime = localStorage.getItem('vitalwatch-install-dismissed');
    
    if (hasSeenInstall || dismissedTime) {
      const timeSinceDismissed = dismissedTime ? Date.now() - parseInt(dismissedTime) : 0;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      
      // Only show again after 7 days if dismissed
      if (!dismissedTime || timeSinceDismissed < sevenDays) {
        return;
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't auto-show, wait for user interaction or timer
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show install prompt once after user has been on site for 8 seconds
    const timer = setTimeout(() => {
      if (!hasSeenInstall) {
        setShowInstructions(true);
        localStorage.setItem('vitalwatch-install-seen', 'true');
      }
    }, 8000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Native PWA install prompt available
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsVisible(false);
        setDeferredPrompt(null);
      }
    } else {
      // Show manual instructions
      setShowInstructions(true);
    }
  };

  if (!isVisible) return null;

  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Install VitalWatch App</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowInstructions(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {isIOS ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add VitalWatch to your iPhone home screen:
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <ol className="text-sm space-y-2 list-decimal list-inside text-blue-800 dark:text-blue-200">
                  <li>Tap the <strong>Share</strong> button in Safari</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> to install VitalWatch</li>
                </ol>
              </div>
              <p className="text-xs text-gray-500">
                Once installed, VitalWatch will work like a native app with offline capabilities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Install VitalWatch for the best experience:
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <ul className="text-sm space-y-2 list-disc list-inside text-green-800 dark:text-green-200">
                  <li>Look for the <strong>"Install"</strong> button in your browser</li>
                  <li>Or tap the <strong>menu</strong> and select "Add to Home Screen"</li>
                  <li>The app will appear on your home screen</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500">
                Enjoy faster loading, offline access, and push notifications.
              </p>
            </div>
          )}
          
          <div className="flex gap-2 mt-6">
            <Button 
              onClick={() => setShowInstructions(false)}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={() => {
                setShowInstructions(false);
                setIsVisible(false);
                localStorage.setItem('vitalwatch-install-dismissed', Date.now().toString());
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
            >
              Got It!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the floating button - only show the modal when triggered
  return null;
}