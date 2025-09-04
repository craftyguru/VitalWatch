import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Heart, 
  Bell, 
  Mail, 
  Phone, 
  CheckCircle, 
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Link } from "wouter";

export default function OptInPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [preferences, setPreferences] = useState({
    emergencyAlerts: true,
    healthUpdates: true,
    productNews: false,
    safetyTips: true,
    smsNotifications: false,
    emailNotifications: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      toast({
        title: "Successfully Opted In!",
        description: "You'll receive important VitalWatch updates and safety alerts.",
      });
    } catch (error) {
      toast({
        title: "Opt-in Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  You're All Set!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Thank you for opting in to VitalWatch notifications. You'll receive important safety alerts and health updates.
                </p>
                <div className="space-y-3">
                  <Link href="/" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-go-home">
                      <Shield className="w-4 h-4 mr-2" />
                      Go to VitalWatch
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <Button variant="outline" className="w-full" data-testid="button-create-account">
                      Create Full Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to VitalWatch
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Main Card */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Stay Protected with VitalWatch
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-4">
                Opt in to receive critical safety alerts, health updates, and emergency notifications that could save your life.
              </p>
            </CardHeader>

            <CardContent>
              {/* Benefits Section */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Emergency Alerts</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Immediate notifications during crisis situations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Health Updates</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Important wellness tips and health insights</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Real-time Monitoring</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24/7 vital signs tracking and alerts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Safety Tips</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Personalized safety recommendations</p>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Opt-in Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                  <p className="text-xs text-gray-500">For emergency SMS alerts</p>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Notification Preferences</Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emergency-alerts"
                        checked={preferences.emergencyAlerts}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, emergencyAlerts: checked as boolean }))
                        }
                        data-testid="checkbox-emergency-alerts"
                      />
                      <Label htmlFor="emergency-alerts" className="text-sm">
                        <AlertTriangle className="w-4 h-4 inline mr-2 text-red-500" />
                        Emergency Alerts (Recommended)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="health-updates"
                        checked={preferences.healthUpdates}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, healthUpdates: checked as boolean }))
                        }
                        data-testid="checkbox-health-updates"
                      />
                      <Label htmlFor="health-updates" className="text-sm">
                        <Heart className="w-4 h-4 inline mr-2 text-green-500" />
                        Health & Wellness Updates
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="safety-tips"
                        checked={preferences.safetyTips}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, safetyTips: checked as boolean }))
                        }
                        data-testid="checkbox-safety-tips"
                      />
                      <Label htmlFor="safety-tips" className="text-sm">
                        <Shield className="w-4 h-4 inline mr-2 text-blue-500" />
                        Safety Tips & Best Practices
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="product-news"
                        checked={preferences.productNews}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, productNews: checked as boolean }))
                        }
                        data-testid="checkbox-product-news"
                      />
                      <Label htmlFor="product-news" className="text-sm">
                        <Sparkles className="w-4 h-4 inline mr-2 text-purple-500" />
                        Product Updates & Features
                      </Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Delivery Methods</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email-notifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, emailNotifications: checked as boolean }))
                        }
                        data-testid="checkbox-email-notifications"
                      />
                      <Label htmlFor="email-notifications" className="text-sm">
                        <Mail className="w-4 h-4 inline mr-2 text-blue-500" />
                        Email Notifications
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="sms-notifications"
                        checked={preferences.smsNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, smsNotifications: checked as boolean }))
                        }
                        disabled={!phone}
                        data-testid="checkbox-sms-notifications"
                        className="mt-1"
                      />
                      <Label htmlFor="sms-notifications" className="text-sm leading-relaxed">
                        <Phone className="w-4 h-4 inline mr-2 text-green-500" />
                        I agree to receive SMS notifications and daily check-ins from VitalWatch. Msg & Data rates may apply. Reply STOP to unsubscribe.
                        {!phone && <span className="block text-xs text-gray-500 mt-1">(Enter phone number)</span>}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    disabled={isSubmitting}
                    data-testid="button-opt-in"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Setting up your preferences...
                      </>
                    ) : (
                      <>
                        <Bell className="w-5 h-5 mr-2" />
                        Opt In to VitalWatch Notifications
                      </>
                    )}
                  </Button>
                </div>

                {/* Privacy Notice */}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4">
                  <p>
                    Messages are account-related only: account notifications and daily check-in reminders. 
                    Links direct only to vitalwatch.app domain. No marketing. No third-party lists or promotional content.
                    <br />
                    <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 underline">
                      View Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}