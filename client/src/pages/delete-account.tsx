import { useState } from 'react';
import { ArrowLeft, AlertTriangle, Shield } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useLocation as useRouterLocation } from 'wouter';

export default function DeleteAccount() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [confirmations, setConfirmations] = useState({
    emergency: false,
    data: false,
    irreversible: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!(user as any)?.email || confirmationEmail !== (user as any).email) {
      toast({
        title: "Email Mismatch",
        description: "Please enter your exact email address to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    if (!confirmations.emergency || !confirmations.data || !confirmations.irreversible) {
      toast({
        title: "Confirmations Required",
        description: "Please check all confirmation boxes to proceed.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      await apiRequest('DELETE', '/api/user/delete-account');
      
      toast({
        title: "Account Deletion Initiated",
        description: "Your account deletion has been processed. You will receive a confirmation email.",
      });

      // Redirect to landing page after deletion
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "There was an error processing your account deletion. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Delete Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Permanently delete your VitalWatch account and associated data
          </p>
        </div>

        {/* Emergency Warning */}
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/30">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Emergency App Warning:</strong> VitalWatch is designed to protect you in emergency situations. 
            Deleting your account will remove your emergency contacts, safety zones, and monitoring capabilities. 
            Consider temporarily disabling features instead of permanent deletion.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Account Deletion Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What Gets Deleted */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Data That Will Be Deleted:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Personal profile information and preferences</li>
                <li>• Emergency contacts and safety zone locations</li>
                <li>• Mood tracking data and mental health entries</li>
                <li>• AI chat history and personalized insights</li>
                <li>• Device connections and biometric data</li>
                <li>• Subscription information and billing history</li>
              </ul>
            </div>

            {/* What Gets Retained */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Data Retained for Legal Compliance:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Emergency incident reports (required for 7 years)</li>
                <li>• Audio recordings from emergency activations</li>
                <li>• Communications with emergency services</li>
                <li>• Legal compliance and safety audit data</li>
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Emergency data retention is required by law and cannot be deleted immediately.
              </p>
            </div>

            {/* Email Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm your email address:
              </label>
              <Input
                type="email"
                value={confirmationEmail}
                onChange={(e) => setConfirmationEmail(e.target.value)}
                placeholder={(user as any)?.email || "Enter your email"}
                className="w-full"
                data-testid="input-confirm-email"
              />
            </div>

            {/* Confirmation Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="emergency-confirm"
                  checked={confirmations.emergency}
                  onCheckedChange={(checked) => 
                    setConfirmations(prev => ({ ...prev, emergency: checked as boolean }))
                  }
                  data-testid="checkbox-emergency-confirm"
                />
                <label 
                  htmlFor="emergency-confirm" 
                  className="text-sm text-gray-700 dark:text-gray-300 leading-tight"
                >
                  I understand that deleting my account will remove all emergency monitoring, 
                  panic button functionality, and safety features that protect me.
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="data-confirm"
                  checked={confirmations.data}
                  onCheckedChange={(checked) => 
                    setConfirmations(prev => ({ ...prev, data: checked as boolean }))
                  }
                  data-testid="checkbox-data-confirm"
                />
                <label 
                  htmlFor="data-confirm" 
                  className="text-sm text-gray-700 dark:text-gray-300 leading-tight"
                >
                  I understand that my personal data, mood tracking, and AI insights will be 
                  permanently deleted and cannot be recovered.
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="irreversible-confirm"
                  checked={confirmations.irreversible}
                  onCheckedChange={(checked) => 
                    setConfirmations(prev => ({ ...prev, irreversible: checked as boolean }))
                  }
                  data-testid="checkbox-irreversible-confirm"
                />
                <label 
                  htmlFor="irreversible-confirm" 
                  className="text-sm text-gray-700 dark:text-gray-300 leading-tight"
                >
                  I understand this action is <strong>irreversible</strong> and I will lose 
                  access to all VitalWatch services permanently.
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Link href="/profile" asChild>
                <Button variant="outline" className="flex-1" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
                data-testid="button-delete-account"
              >
                {isDeleting ? 'Processing...' : 'Delete My Account'}
              </Button>
            </div>

            {/* Support Contact */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Need help? Contact our support team at{' '}
                <a 
                  href="mailto:support@vitalwatch.app" 
                  className="text-blue-600 hover:text-blue-700"
                >
                  support@vitalwatch.app
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}