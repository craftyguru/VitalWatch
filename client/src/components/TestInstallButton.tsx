import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

export function TestInstallButton() {
  const [showInstructions, setShowInstructions] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleInstall = () => {
    if (isIOS) {
      setShowInstructions(true);
    } else if (isMobile) {
      // Try to trigger install prompt
      const event = new Event('beforeinstallprompt');
      window.dispatchEvent(event);
      setShowInstructions(true);
    } else {
      setShowInstructions(true);
    }
  };

  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-bold mb-4">Install VitalWatch</h3>
          
          {isIOS ? (
            <div className="space-y-4">
              <p className="text-sm">To install VitalWatch on your iPhone:</p>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Tap the Share button in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install VitalWatch</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">To install VitalWatch:</p>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>Look for "Install" or "Add to Home Screen" in your browser menu</li>
                <li>Or use the browser's install option from the address bar</li>
                <li>The app will appear on your home screen</li>
              </ul>
            </div>
          )}
          
          <div className="flex gap-2 mt-6">
            <Button 
              onClick={() => setShowInstructions(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowInstructions(false);
                localStorage.setItem('vitalwatch-install-shown', 'true');
              }}
              className="flex-1"
            >
              Got It
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleInstall}
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
    >
      {isIOS ? (
        <>
          <Smartphone className="w-4 h-4 mr-2" />
          Add to Home Screen
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Install App
        </>
      )}
    </Button>
  );
}