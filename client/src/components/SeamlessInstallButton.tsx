import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface SeamlessInstallButtonProps {
  showAutoPrompt?: boolean;
}

export function SeamlessInstallButton({ showAutoPrompt = false }: SeamlessInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [nudged, setNudged] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone;
    setIsStandalone(standalone);

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/i.test(userAgent));
    setIsAndroid(/android/i.test(userAgent));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('VitalWatch: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      console.log('VitalWatch: App installed successfully');
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    // Check for display mode changes (when app gets installed)
    const handleDisplayModeChange = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsStandalone(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('visibilitychange', handleDisplayModeChange);

    // Gentle nudge after first interaction (not auto on load)
    if (showAutoPrompt && !nudged) {
      const handleFirstClick = () => {
        if (deferredPrompt && isAndroid && !isStandalone) {
          setTimeout(() => {
            console.log('VitalWatch: Showing gentle install suggestion');
            // You could show a toast/banner here instead of auto-prompting
          }, 1000);
          setNudged(true);
        }
      };

      window.addEventListener('click', handleFirstClick, { once: true });
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.removeEventListener('appinstalled', handleAppInstalled);
        document.removeEventListener('visibilitychange', handleDisplayModeChange);
        window.removeEventListener('click', handleFirstClick);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);  
      document.removeEventListener('visibilitychange', handleDisplayModeChange);
    };
  }, [showAutoPrompt, nudged, deferredPrompt, isAndroid, isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions if event not available yet
      if (isAndroid) {
        alert('If you don\'t see a prompt, open Chrome menu → "Install app".');
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('VitalWatch: Install outcome:', outcome);
      
      if (outcome === 'accepted') {
        setIsStandalone(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('VitalWatch: Install error:', error);
    }
  };

  // Hide button if already installed
  if (isStandalone) {
    return null;
  }

  const isDevelopment = window.location.hostname.includes('replit.dev') || 
                       window.location.hostname.includes('replit.app');

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Android: Show install button when prompt is available */}
      {isAndroid && deferredPrompt && (
        <Button 
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Install VitalWatch
        </Button>
      )}

      {/* Android: Show fallback button even when prompt isn't available yet */}
      {isAndroid && !deferredPrompt && !isStandalone && (
        <Button 
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Install App
        </Button>
      )}

      {/* iOS: Show Add to Home Screen instructions */}
      {isIOS && !isStandalone && (
        <div className="text-center max-w-sm">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-center text-blue-700 dark:text-blue-300 mb-1">
              <Smartphone className="w-4 h-4 mr-1" />
              <span className="font-medium">Add to Home Screen</span>
            </div>
            <p className="text-blue-600 dark:text-blue-400">
              Tap the Share button (↗️) → "Add to Home Screen"
            </p>
          </div>
        </div>
      )}

      {/* Development mode notice */}
      {isDevelopment && (isAndroid || isIOS) && (
        <div className="text-center max-w-sm">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs">
            <div className="flex items-center justify-center text-amber-700 dark:text-amber-300 mb-1">
              <Smartphone className="w-4 h-4 mr-1" />
              <span className="font-medium">Development Mode</span>
            </div>
            <p className="text-amber-600 dark:text-amber-400">
              Full PWA install available after deployment. Use "Add to Home Screen" for now.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}