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
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [autoPromptShown, setAutoPromptShown] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    console.log('PWA Install Check:', {
      isStandalone,
      displayMode: window.matchMedia('(display-mode: standalone)').matches,
      standalone: (window.navigator as any).standalone,
      referrer: document.referrer
    });
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Mobile device detection
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    // Force a slight delay to ensure the browser has time to detect PWA criteria
    const timer = setTimeout(() => {
      console.log('Checking for install prompt after delay...');
      
      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        console.log('Before install prompt event fired!', e);
        e.preventDefault();
        setDeferredPrompt(e);
        setIsVisible(true);
        console.log('Install prompt available and stored');
        
        // Auto-trigger install prompt for mobile users after delay
        if (showAutoPrompt && isMobile && !autoPromptShown) {
          setTimeout(() => {
            if (!isInstalled && !autoPromptShown) {
              triggerAutoInstallPrompt(e);
            }
          }, 3000); // 3 second delay before auto-prompt
        }
      };

      // Listen for successful installation
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setIsVisible(false);
        console.log('App installed successfully');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Force visibility for testing or if no native prompt available
      if (isMobile) {
        setIsVisible(true);
      }
      
      // Manual trigger check for testing
      if (window.location.search.includes('debug=install')) {
        console.log('Debug mode: Forcing install button to show');
        setIsVisible(true);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const triggerAutoInstallPrompt = async (prompt: BeforeInstallPromptEvent) => {
    if (autoPromptShown) return;
    
    setAutoPromptShown(true);
    console.log('Auto-triggering install prompt for mobile user');
    
    try {
      await prompt.prompt();
      const choiceResult = await prompt.userChoice;
      
      console.log('Auto-prompt user choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Auto install prompt error:', error);
    }
  };

  const handleInstallClick = async () => {
    console.log('Install button clicked');
    console.log('Deferred prompt available:', !!deferredPrompt);
    console.log('User agent:', navigator.userAgent);
    console.log('Current URL:', window.location.href);
    
    if (deferredPrompt) {
      try {
        console.log('Triggering native install prompt');
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        console.log('User choice:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setIsVisible(false);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install error:', error);
      }
    } else {
      // Enhanced fallback for when native prompt isn't available
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isChrome = /Chrome/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;
      const isReplit = window.location.hostname.includes('replit.dev') || window.location.hostname.includes('replit.app');
      
      console.log('Browser detection:', { isIOS, isAndroid, isChrome, isSafari, isReplit });
      
      if (isReplit) {
        // For development/testing, show "Add to Home Screen" instructions
        showAddToHomeScreenInstructions(isIOS, isAndroid, isSafari);
      } else if (isIOS && isSafari) {
        showAddToHomeScreenInstructions(true, false, true);
      } else if (isAndroid && isChrome) {
        // Fallback for Android Chrome if native prompt failed
        showAddToHomeScreenInstructions(false, true, false);
      } else {
        // Try to trigger native install via manual method
        triggerFallbackInstall();
      }
    }
  };

  const showAddToHomeScreenInstructions = (isIOS: boolean, isAndroid: boolean, isSafari: boolean) => {
    let message = '';
    
    if (isIOS && isSafari) {
      message = `To install VitalWatch:\n\n1. Tap the Share button (↗️) at the bottom\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install VitalWatch`;
    } else if (isAndroid) {
      message = `To install VitalWatch:\n\n1. Tap the menu (⋮) in the top right\n2. Tap "Add to Home screen"\n3. Tap "Add" to install VitalWatch`;
    } else {
      message = `To install VitalWatch:\n\n1. Use the browser menu to "Add to Home Screen"\n2. This will install VitalWatch as a native app`;
    }
    
    alert(message);
  };

  const triggerFallbackInstall = () => {
    // Try to show browser menu or fallback instructions
    console.log('Attempting fallback install method');
    alert('To install VitalWatch, use your browser\'s menu to "Add to Home Screen" or "Install App"');
  };

  // Don't show if installed or not visible
  if (isInstalled || !isVisible) {
    return null;
  }

  // Check PWA installation criteria
  const checkPWACriteria = () => {
    const criteria = {
      https: location.protocol === 'https:' || location.hostname === 'localhost',
      manifest: !!document.querySelector('link[rel="manifest"]'),
      serviceWorker: 'serviceWorker' in navigator,
      icons: true, // We have icons in manifest
      displayMode: true // We have display: standalone
    };
    
    console.log('PWA Installation Criteria:', criteria);
    return criteria;
  };

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isDevelopment = window.location.hostname.includes('replit.dev') || window.location.hostname.includes('replit.app');

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button 
        onClick={handleInstallClick}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
        size="lg"
      >
        <Download className="w-5 h-5 mr-2" />
        {deferredPrompt ? 'Install VitalWatch' : (isMobile ? 'Install App' : 'Add to Home Screen')}
      </Button>
      
      {/* Development mode notice */}
      {isDevelopment && (
        <div className="text-center max-w-sm">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs">
            <div className="flex items-center justify-center text-amber-700 dark:text-amber-300 mb-1">
              <Smartphone className="w-4 h-4 mr-1" />
              <span className="font-medium">Development Mode</span>
            </div>
            <p className="text-amber-600 dark:text-amber-400">
              Mobile app installation requires deployment. For now, use "Add to Home Screen" for quick access.
            </p>
          </div>
        </div>
      )}
      
      {/* Debug info for mobile */}
      {window.location.search.includes('debug') && (
        <Button 
          onClick={checkPWACriteria}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Check PWA Criteria
        </Button>
      )}
    </div>
  );
}