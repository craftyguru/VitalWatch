import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function ProfessionalInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Automatically show install prompt after a delay on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && !localStorage.getItem('vitalwatch-install-dismissed')) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // Show after 3 seconds
      }
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt && !isIOS) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Error during installation:', error);
      }
    } else if (isIOS) {
      // For iOS, show simple instructions
      setShowInstallPrompt(true);
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('vitalwatch-install-dismissed', 'true');
  };

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Install Button */}
      {(deferredPrompt || isIOS) && (
        <Button 
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          size="lg"
        >
          {isIOS ? (
            <>
              <Smartphone className="w-5 h-5 mr-2" />
              Add to Home Screen
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Install VitalWatch
            </>
          )}
        </Button>
      )}

      {/* Professional Install Dialog */}
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden bg-white shadow-lg">
                  <img 
                    src="/logo.png" 
                    alt="VitalWatch Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 via-orange-500 to-pink-600 bg-clip-text text-transparent">
                    Install VitalWatch
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    Get the full app experience
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={dismissPrompt}
                className="h-6 w-6 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Benefits of installing:</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Instant access from your home screen</li>
                <li>• Works offline for emergencies</li>
                <li>• Faster launch times</li>
                <li>• Push notifications for alerts</li>
              </ul>
            </div>

            {isIOS ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">To install on iOS:</p>
                <ol className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Tap the <strong>Share</strong> button in Safari</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Tap <strong>"Add"</strong> to install</span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={dismissPrompt}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}