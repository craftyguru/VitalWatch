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

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show floating button after 3 seconds for testing (even without prompt)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

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

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={handleInstall}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg animate-pulse"
        size="lg"
      >
        <Download className="w-5 h-5 mr-2" />
        {deferredPrompt ? 'Install Now' : 'Install App'}
      </Button>
    </div>
  );
}