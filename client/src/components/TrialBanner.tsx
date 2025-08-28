import { useFeatureAccess } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Clock, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export function TrialBanner() {
  const { isInTrial, trialDaysLeft, needsUpgrade } = useFeatureAccess();

  if (!isInTrial && !needsUpgrade) return null;

  if (isInTrial) {
    return (
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-white p-2 rounded-full">
              <Crown className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">VitalWatch Pro Trial Active</h3>
              <div className="flex items-center space-x-2 text-sm text-amber-700">
                <Clock className="h-3 w-3" />
                <span>{trialDaysLeft} days remaining</span>
              </div>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="border-amber-400 text-amber-700 hover:bg-amber-50">
            <Link href="/billing">
              Upgrade Now <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 text-white p-2 rounded-full">
            <Crown className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">Unlock VitalWatch Pro Features</h3>
            <p className="text-sm text-blue-700">
              Get unlimited emergency alerts, AI monitoring, and premium protection
            </p>
          </div>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/billing">
            Start Free Trial <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}