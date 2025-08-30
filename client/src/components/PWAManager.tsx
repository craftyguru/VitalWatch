import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, FileDown, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// APK Download Manager Class
class APKDownloadManager {
  private isDismissed = false;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Check session dismissal
    if (sessionStorage.getItem('apk-download-dismissed') === 'true') {
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

  // Check if should show download prompt
  shouldShowDownload(): boolean {
    return !this.isDismissed && this.isProductionOrDev();
  }

  // APK Download method
  async downloadAPK(): Promise<boolean> {
    try {
      // In production, this would point to your hosted APK file
      // For now, we'll provide instructions
      const apkUrl = '/downloads/vitalwatch-latest.apk';
      
      // Try to download the APK
      const link = document.createElement('a');
      link.href = apkUrl;
      link.download = 'VitalWatch.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('APK download failed:', error);
      return false;
    }
  }

  // Dismiss for session
  dismiss(): void {
    this.isDismissed = true;
    sessionStorage.setItem('apk-download-dismissed', 'true');
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
const apkDownloadManager = new APKDownloadManager();

// React Hook for APK Download
export function useAPKDownload() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = apkDownloadManager.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  return {
    shouldShow: apkDownloadManager.shouldShowDownload(),
    isMobile: apkDownloadManager.isMobileDevice(),
    isProductionOrDev: apkDownloadManager.isProductionOrDev(),
    downloadAPK: () => apkDownloadManager.downloadAPK(),
    dismiss: () => apkDownloadManager.dismiss()
  };
}

// Desktop APK Download Button Component
export function APKDownloadButton() {
  const { shouldShow, isMobile, downloadAPK } = useAPKDownload();
  const { toast } = useToast();

  // Only show on desktop when appropriate
  if (isMobile || !shouldShow) return null;

  const handleDownload = async () => {
    const success = await downloadAPK();
    if (success) {
      toast({
        title: "Download Started!",
        description: "VitalWatch APK is downloading. Install it to access Health Connect integration.",
      });
    } else {
      toast({
        title: "Download Instructions",
        description: "Use EAS Build to generate the APK: npx expo build:android",
        variant: "default",
      });
    }
  };

  return (
    <Button 
      onClick={handleDownload}
      className="hidden md:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
      data-testid="button-download-apk-desktop"
    >
      <FileDown className="w-4 h-4" />
      Download Android App
    </Button>
  );
}

// Mobile APK Download Prompt Component
export function APKMobilePrompt() {
  const { shouldShow, isMobile, isProductionOrDev, downloadAPK, dismiss } = useAPKDownload();
  const { toast } = useToast();

  // Only show on mobile when appropriate and correct domain
  if (!isMobile || !shouldShow || !isProductionOrDev) return null;

  const handleDownload = async () => {
    const success = await downloadAPK();
    if (success) {
      toast({
        title: "APK Download Started!",
        description: "Install the VitalWatch APK to access Health Connect and device sensors.",
      });
    } else {
      toast({
        title: "Native App Required",
        description: "For Health Connect integration, install the native Android app.",
      });
      // Open instructions or alternative download
      window.open('https://docs.expo.dev/build/setup/', '_blank');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mobile-safe-area">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Get Native VitalWatch</h3>
              <p className="text-white/90 text-xs">Access Health Connect & full device sensors</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-white text-green-600 hover:bg-gray-100 text-xs font-semibold min-h-[44px] min-w-[70px]"
              data-testid="button-download-apk-mobile"
            >
              Download
            </Button>
            <Button
              onClick={dismiss}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 min-h-[44px] min-w-[44px]"
              data-testid="button-dismiss-apk-mobile"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}