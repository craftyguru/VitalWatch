import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// PWA Manager Singleton Class
class PWAManager {
  private deferredPrompt: any = null;
  private isInstalled = false;
  private isDismissed = false;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.notifyListeners();
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.notifyListeners();
    });

    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check session dismissal
    if (sessionStorage.getItem('pwa-dismissed') === 'true') {
      this.isDismissed = true;
    }
  }

  // Domain whitelist check
  isProductionOrDev(): boolean {
    const hostname = window.location.hostname;
    return hostname.includes('vitalwatch') || 
           hostname === 'localhost' || 
           hostname.includes('replit.dev') ||
           hostname.includes('replit.app');
  }

  // Mobile detection
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Check if installable
  isInstallable(): boolean {
    return !this.isInstalled && 
           !this.isDismissed && 
           this.deferredPrompt !== null &&
           this.isProductionOrDev();
  }

  // Installation method
  async install(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    
    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.isInstalled = true;
        this.deferredPrompt = null;
      }
      
      this.notifyListeners();
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }

  // Dismiss for session
  dismiss(): void {
    this.isDismissed = true;
    sessionStorage.setItem('pwa-dismissed', 'true');
    this.notifyListeners();
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Singleton instance
const pwaManager = new PWAManager();

// React Hook
export function usePWAInstall() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = pwaManager.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  return {
    isInstallable: pwaManager.isInstallable(),
    isMobile: pwaManager.isMobileDevice(),
    isProductionOrDev: pwaManager.isProductionOrDev(),
    install: () => pwaManager.install(),
    dismiss: () => pwaManager.dismiss()
  };
}

// Desktop Install Button Component
export function PWAInstallButton() {
  const { isInstallable, isMobile, install } = usePWAInstall();
  const { toast } = useToast();

  // Only show on desktop when installable
  if (isMobile || !isInstallable) return null;

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast({
        title: "App Installed!",
        description: "VitalWatch has been installed and can be accessed from your desktop.",
      });
    }
  };

  return (
    <Button 
      onClick={handleInstall}
      className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      data-testid="button-install-desktop"
    >
      <Download className="w-4 h-4" />
      Install App
    </Button>
  );
}

// Mobile Bottom Prompt Component
export function PWAMobilePrompt() {
  const { isInstallable, isMobile, isProductionOrDev, install, dismiss } = usePWAInstall();
  const { toast } = useToast();

  // Only show on mobile when installable and correct domain
  if (!isMobile || !isInstallable || !isProductionOrDev) return null;

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast({
        title: "VitalWatch Installed!",
        description: "The app has been added to your home screen.",
      });
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mobile-safe-area">
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-4 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Install VitalWatch</h3>
              <p className="text-white/90 text-xs">Add to home screen for quick access</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100 text-xs font-semibold min-h-[44px] min-w-[60px]"
              data-testid="button-install-mobile"
            >
              Install
            </Button>
            <Button
              onClick={dismiss}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 min-h-[44px] min-w-[44px]"
              data-testid="button-dismiss-mobile"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}