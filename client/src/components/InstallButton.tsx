import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface InstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function InstallButton({ variant = 'default', size = 'default', className = '' }: InstallButtonProps) {
  const { canInstall, isInstalled, isIOS, installApp } = usePWA();

  if (isInstalled) {
    return null;
  }

  const handleInstall = () => {
    if (isIOS) {
      // Show iOS install instructions
      alert('To install VitalWatch:\n1. Tap the share button in Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install');
    } else {
      installApp();
    }
  };

  if (!canInstall) {
    return null;
  }

  return (
    <Button 
      onClick={handleInstall}
      variant={variant}
      size={size}
      className={`${className} bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700`}
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