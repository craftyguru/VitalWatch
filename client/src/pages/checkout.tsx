import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Crown,
  Star,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ plan }: { plan: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/billing?success=true`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to VitalWatch Pro! Your subscription is now active.",
      });
      setLocation('/home');
    }

    setIsLoading(false);
  };

  const planDetails = {
    guardian: {
      name: 'Guardian',
      price: '$9.99/month',
      icon: Crown,
      features: [
        'Real-time AI threat detection',
        'Unlimited emergency contacts',
        'High-accuracy GPS tracking',
        'Advanced biometric monitoring',
        '24/7 AI crisis counselor',
        'Audio/video evidence recording',
        'Geofencing and safe zones',
        'Priority emergency response'
      ]
    },
    professional: {
      name: 'Professional',
      price: '$24.99/month',
      icon: Star,
      features: [
        'Everything in Guardian',
        'Multi-device family monitoring',
        'Advanced analytics dashboard',
        'Custom AI training',
        'Professional mental health integration',
        'Enterprise-grade encryption',
        'Dedicated support specialist',
        'Custom integrations'
      ]
    }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails];
  const Icon = currentPlan?.icon || Shield;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{currentPlan?.name} Plan</CardTitle>
          <p className="text-3xl font-bold text-blue-600">{currentPlan?.price}</p>
          <Badge className="bg-green-100 text-green-800 mt-2">
            <CheckCircle className="h-3 w-3 mr-1" />
            Most Popular Choice
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            {currentPlan?.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <Button 
              type="submit" 
              disabled={!stripe || isLoading} 
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Subscribe to ${currentPlan?.name} - ${currentPlan?.price}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [plan, setPlan] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    const clientSecretParam = params.get('client_secret');
    
    if (planParam) setPlan(planParam);
    if (clientSecretParam) setClientSecret(clientSecretParam);
  }, []);

  if (!clientSecret || !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading payment form...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/billing">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 dark:hover:bg-blue-900">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Complete Your Subscription
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm plan={plan} />
        </Elements>
      </div>
    </div>
  );
}