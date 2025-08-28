import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VerificationResult {
  success: boolean;
  message: string;
  user?: {
    firstName: string;
    email: string;
    proTrialActive?: boolean;
    proTrialEndDate?: string;
  };
}

export default function VerifyEmail() {
  const [location, navigate] = useLocation();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const firstName = urlParams.get('firstName');
    const trialActive = urlParams.get('trialActive');
    const trialEndDate = urlParams.get('trialEndDate');

    // Handle URL parameters from redirect
    if (success === 'true') {
      setVerificationResult({
        success: true,
        message: "Email verified successfully! Your VitalWatch Pro trial has started.",
        user: {
          firstName: firstName || 'User',
          email: '',
          proTrialActive: trialActive === 'true',
          proTrialEndDate: trialEndDate || ''
        }
      });
      setIsLoading(false);
      return;
    }

    if (error) {
      const errorMessages: { [key: string]: string } = {
        'invalid-token': "Invalid verification link. Please check your email and try again.",
        'verification-failed': "Verification failed. Please try again or contact support.",
        'server-error': "Server error occurred. Please try again later."
      };
      setVerificationResult({
        success: false,
        message: errorMessages[error] || "Verification failed. Please try again or contact support."
      });
      setIsLoading(false);
      return;
    }

    if (!token) {
      setVerificationResult({
        success: false,
        message: "Invalid verification link. Please check your email and try again."
      });
      setIsLoading(false);
      return;
    }

    // Use JSON API for direct token verification
    fetch(`/api/verify-email-json?token=${token}`)
      .then(res => res.json())
      .then((data: VerificationResult) => {
        setVerificationResult(data);
        setIsLoading(false);
      })
      .catch(() => {
        setVerificationResult({
          success: false,
          message: "Verification failed. Please try again or contact support."
        });
        setIsLoading(false);
      });
  }, []);

  const handleContinue = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-slate-800/50 border-purple-500/20 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-6"
            >
              <Loader2 className="h-16 w-16 text-purple-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h2>
            <p className="text-slate-300">Please wait while we activate your VitalWatch account...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-0">
              {verificationResult?.success ? (
                <>
                  {/* Success Header */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="h-20 w-20 text-white mx-auto mb-4" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome to VitalWatch!</h1>
                    <p className="text-green-100 text-lg">Your account is now active and ready to protect you</p>
                  </div>

                  {/* Success Content */}
                  <div className="p-8">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center mb-8"
                    >
                      <h2 className="text-2xl font-bold text-white mb-4">
                        Hi {verificationResult.user?.firstName}! 🎉
                      </h2>
                      <p className="text-slate-300 text-lg leading-relaxed">
                        Your VitalWatch AI companion is now active and monitoring your safety 24/7. 
                        You're protected by the world's most advanced emergency detection system.
                      </p>
                    </motion.div>

                    {/* Pro Trial Banner */}
                    {verificationResult.user?.proTrialActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl p-6 mb-8"
                      >
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                            FREE TRIAL ACTIVE
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white text-center mb-2">
                          🔥 VitalWatch Pro - 14 Days FREE
                        </h3>
                        <p className="text-amber-100 text-center">
                          Experience advanced AI threat detection, unlimited emergency contacts, 
                          and premium crisis intervention tools until {new Date(verificationResult.user.proTrialEndDate || '').toLocaleDateString()}.
                        </p>
                      </motion.div>
                    )}

                    {/* Features Grid */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="grid md:grid-cols-3 gap-6 mb-8"
                    >
                      <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <img 
                          src="/logo.png" 
                          alt="VitalWatch Logo" 
                          className="h-12 w-12 mx-auto mb-3 object-contain"
                        />
                        <h3 className="font-semibold text-white mb-2">AI Protection</h3>
                        <p className="text-slate-300 text-sm">24/7 monitoring with instant threat detection</p>
                      </div>
                      <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                        <h3 className="font-semibold text-white mb-2">Instant Alerts</h3>
                        <p className="text-slate-300 text-sm">Emergency contacts notified in under 3 seconds</p>
                      </div>
                      <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <Mail className="h-12 w-12 text-green-400 mx-auto mb-3" />
                        <h3 className="font-semibold text-white mb-2">Crisis Support</h3>
                        <p className="text-slate-300 text-sm">Professional intervention tools and resources</p>
                      </div>
                    </motion.div>

                    {/* Call to Action */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0 }}
                      className="text-center"
                    >
                      <Button 
                        onClick={handleContinue}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-continue-dashboard"
                      >
                        Start Protecting Your Life
                      </Button>
                      <p className="text-slate-400 text-sm mt-4">
                        Your safety journey begins now
                      </p>
                    </motion.div>
                  </div>
                </>
              ) : (
                <>
                  {/* Error Header */}
                  <div className="bg-gradient-to-r from-red-600 to-rose-600 p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <XCircle className="h-20 w-20 text-white mx-auto mb-4" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2">Verification Failed</h1>
                    <p className="text-red-100 text-lg">We couldn't verify your email address</p>
                  </div>

                  {/* Error Content */}
                  <div className="p-8 text-center">
                    <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                      {verificationResult?.message}
                    </p>
                    
                    <div className="space-y-4">
                      <Button 
                        onClick={() => navigate("/auth")}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl"
                        data-testid="button-back-auth"
                      >
                        Back to Login
                      </Button>
                      <p className="text-slate-400 text-sm">
                        Need help? Contact support@vitalwatch.app
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}