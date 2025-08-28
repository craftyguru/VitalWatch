import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function SeamlessInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

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

    // Force a slight delay to ensure the browser has time to detect PWA criteria
    const timer = setTimeout(() => {
      console.log('Checking for install prompt after delay...');
      
      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        console.log('Before install prompt event fired!', e);
        e.preventDefault();
        setDeferredPrompt(e);
        console.log('Install prompt available and stored');
      };

      // Listen for successful installation
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
        console.log('App installed successfully');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Manual trigger check for testing
      if (window.location.search.includes('debug=install')) {
        console.log('Debug mode: Forcing install button to show');
        // For debugging purposes
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('Install button clicked');
    console.log('Deferred prompt available:', !!deferredPrompt);
    console.log('User agent:', navigator.userAgent);
    console.log('Current URL:', window.location.href);
    
    if (deferredPrompt) {
      try {
        console.log('Triggering native install prompt');
        // Directly trigger the native browser install prompt
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        console.log('User choice:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install error:', error);
      }
    } else {
      // Enhanced instructions for different mobile browsers
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isChrome = /Chrome/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;
      
      console.log('Browser detection:', { isIOS, isAndroid, isChrome, isSafari });
      
      let instructions = 'To install VitalWatch:\n\n';
      
      if (isIOS && isSafari) {
        instructions += '• Tap the Share button (square with arrow)\n• Select "Add to Home Screen"\n• Tap "Add" to install';
      } else if (isAndroid && isChrome) {
        instructions += '• Look for "Install app" in the browser menu\n• Or check the address bar for an install icon\n• Tap "Install" when prompted';
      } else if (isChrome) {
        instructions += '• Look for the install icon in the address bar\n• Click "Install VitalWatch"\n• Or check the browser menu for "Install app"';
      } else {
        instructions += '• Chrome: Look for "Install" icon in the address bar\n• Safari: Use "Add to Home Screen" from the share menu\n• Edge: Use "Install this site as an app" from the menu';
      }
      
      alert(instructions);
    }
  };

  // Always show button for testing on mobile
  if (isInstalled) {
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

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button 
        onClick={handleInstallClick}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
        size="lg"
      >
        <Download className="w-5 h-5 mr-2" />
        {deferredPrompt ? 'Install VitalWatch' : 'Install App'}
      </Button>
      
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