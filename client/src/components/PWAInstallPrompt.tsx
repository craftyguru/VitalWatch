import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed prompt recently
    const dismissedTime = localStorage.getItem('vitalwatch-install-dismissed');
    if (dismissedTime) {
      const timeSinceDissmissal = Date.now() - parseInt(dismissedTime);
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (timeSinceDissmissal < threeDays) {
        return;
      }
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a longer delay for better UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS or mobile devices, show manual install instructions
    if ((iOS || isMobile) && !isStandalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 12000); // Show after 12 seconds - less intrusive timing
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('vitalwatch-install-dismissed', Date.now().toString());
  };

  const handleLater = () => {
    setShowPrompt(false);
    // Don't set dismissed flag, allow prompt to show again in same session
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-800 border-0 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="VitalWatch Logo" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  Install VitalWatch
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get instant access to emergency protection
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Works offline for emergencies</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Instant notifications and alerts</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Fast access from home screen</span>
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
                  To install VitalWatch on your iPhone:
                </p>
                <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>1. Tap the share button <span className="inline-block w-4 h-4 bg-blue-500 rounded text-white text-center text-xs leading-4">↗</span> in Safari</li>
                  <li>2. Scroll down and tap "Add to Home Screen"</li>
                  <li>3. Tap "Add" to install VitalWatch</li>
                </ol>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleLater} variant="outline" className="flex-1">
                  Maybe Later
                </Button>
                <Button onClick={handleDismiss} variant="outline" className="flex-1">
                  Got It
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleLater} variant="outline" className="flex-1">
                Maybe Later
              </Button>
              <Button 
                onClick={handleInstall} 
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Free • Secure • No account required to start
          </p>
        </CardContent>
      </Card>
    </div>
  );
}