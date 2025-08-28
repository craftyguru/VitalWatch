import { useEffect } from 'react';
import { useAppVersion } from '@/hooks/useAppVersion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function UpdateAvailableToast() {
  const { hasUpdate, updateApp } = useAppVersion();
  const { toast } = useToast();

  useEffect(() => {
    if (hasUpdate) {
      toast({
        title: "Update Available",
        description: "A new version of VitalWatch is available with improved features and bug fixes.",
        duration: 10000,
        action: (
          <Button 
            size="sm" 
            onClick={updateApp}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Update Now
          </Button>
        ),
      });
    }
  }, [hasUpdate, toast, updateApp]);

  return null;
}