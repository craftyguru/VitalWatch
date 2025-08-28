import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function EnhancedInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installMethod, setInstallMethod] = useState<'native' | 'manual'>('manual');

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone;
    
    if (isStandalone) {
      return; // Don't show if already installed
    }

    // Check if user has dismissed recently
    const dismissedTime = localStorage.getItem('vitalwatch-install-dismissed');
    if (dismissedTime) {
      const timeSinceDismissed = Date.now() - parseInt(dismissedTime);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (timeSinceDismissed < sevenDays) {
        return;
      }
    }

    // Listen for native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setInstallMethod('native');
      
      // Show prompt after short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 8000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback: Show manual instructions for browsers without native support
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt) {
        setInstallMethod('manual');
        setShowPrompt(true);
      }
    }, 12000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt]);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed successfully');
        localStorage.setItem('vitalwatch-installed', 'true');
      }
      
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install failed:', error);
      // Switch to manual mode on error
      setInstallMethod('manual');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('vitalwatch-install-dismissed', Date.now().toString());
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold">Install VitalWatch</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Get the full VitalWatch experience with offline access and faster loading.
        </p>

        {installMethod === 'native' && deferredPrompt ? (
          // Native install available
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  One-Click Install Available
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your browser supports automatic installation
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                Not Now
              </Button>
              <Button 
                onClick={handleNativeInstall}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
            </div>
          </div>
        ) : (
          // Manual install instructions
          <div className="space-y-4">
            {isIOS ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Share className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    iPhone/iPad Instructions
                  </span>
                </div>
                <ol className="text-xs space-y-1 list-decimal list-inside text-blue-700 dark:text-blue-300">
                  <li>Tap the <strong>Share</strong> button in Safari</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> to install</li>
                </ol>
              </div>
            ) : isAndroid ? (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Android Instructions
                  </span>
                </div>
                <ol className="text-xs space-y-1 list-decimal list-inside text-green-700 dark:text-green-300">
                  <li>Tap the <strong>menu</strong> (three dots) in Chrome</li>
                  <li>Select <strong>"Add to Home screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> to install</li>
                </ol>
              </div>
            ) : (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800 dark:text-purple-200">
                    Desktop Instructions
                  </span>
                </div>
                <ol className="text-xs space-y-1 list-decimal list-inside text-purple-700 dark:text-purple-300">
                  <li>Look for an <strong>"Install"</strong> icon in the address bar</li>
                  <li>Or use browser menu → <strong>"Install VitalWatch"</strong></li>
                  <li>The app will appear in your applications</li>
                </ol>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button 
                onClick={handleDismiss}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
              >
                Got It!
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-3">
          Install once, use anywhere • Works offline • Fast loading
        </p>
      </div>
    </div>
  );
}