import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Heart,
  Brain,
  Activity,
  FileText,
  ShieldCheck
} from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";
import ReCAPTCHA from "react-google-recaptcha";
import LegalAgreementModal from "@/components/legal/LegalAgreementModal";

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  // Legal agreement states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        window.location.href = "/dashboard";
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "You must agree to the Terms of Service",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToPrivacy) {
      toast({
        title: "Privacy Policy Required",
        description: "You must agree to the Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    if (!captchaToken) {
      toast({
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          email: signupData.email,
          password: signupData.password,
          captchaToken
        }),
      });

      if (response.ok) {
        toast({
          title: "Account Created!",
          description: "Welcome to VitalWatch. You're now protected.",
        });
        window.location.href = "/dashboard";
      } else {
        const error = await response.json();
        toast({
          title: "Signup Failed",
          description: error.message || "Unable to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  const handleFacebookAuth = () => {
    window.location.href = "/api/auth/facebook";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-40"></div>
      
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/landing">
            <Button variant="ghost" className="mb-4 text-gray-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <img 
                src="/logo.png" 
                alt="VitalWatch Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">VitalWatch</h1>
          <p className="text-gray-300">AI-Powered Vital Signs Monitoring</p>
        </div>

        {/* Auth Tabs */}
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-lg shadow-2xl">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="login" className="data-[state=active]:bg-blue-600">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-purple-600">
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Social Auth Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleGoogleAuth}
                  variant="outline"
                  className="w-full border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
                  size="lg"
                  data-testid="button-auth-google"
                >
                  <SiGoogle className="h-5 w-5 mr-2 text-red-500" />
                  Google
                </Button>

                <Button
                  onClick={handleFacebookAuth}
                  variant="outline"
                  className="w-full border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
                  size="lg"
                  data-testid="button-auth-facebook"
                >
                  <SiFacebook className="h-5 w-5 mr-2 text-blue-500" />
                  Facebook
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">Or use email/username</span>
                </div>
              </div>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-200">Email or Username</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="text"
                        placeholder="Enter your email or username"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        required
                        data-testid="input-login-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-200">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        required
                        data-testid="input-login-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                    data-testid="button-login-submit"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <div className="text-center">
                  <Button variant="link" className="text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Button>
                </div>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname" className="text-gray-200">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-firstname"
                          type="text"
                          placeholder="First name"
                          value={signupData.firstName}
                          onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                          required
                          data-testid="input-signup-firstname"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname" className="text-gray-200">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-lastname"
                          type="text"
                          placeholder="Last name"
                          value={signupData.lastName}
                          onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                          required
                          data-testid="input-signup-lastname"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-200">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        required
                        data-testid="input-signup-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-200">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        required
                        data-testid="input-signup-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-gray-200">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        required
                        data-testid="input-signup-confirm-password"
                      />
                    </div>
                  </div>

                  {/* CAPTCHA */}
                  <div className="space-y-3">
                    <Label className="text-gray-200">Security Verification</Label>
                    <div className="flex justify-center">
                      {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                          onChange={(token) => setCaptchaToken(token)}
                          onExpired={() => setCaptchaToken(null)}
                          theme="dark"
                          data-testid="recaptcha"
                        />
                      ) : (
                        <div className="text-xs text-red-400">
                          CAPTCHA not configured
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Legal Agreement Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms-checkbox"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        className="mt-1"
                        data-testid="checkbox-terms"
                      />
                      <div className="flex-1">
                        <Label htmlFor="terms-checkbox" className="text-sm text-gray-300 cursor-pointer">
                          I have read and agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-purple-400 hover:text-purple-300 underline"
                            data-testid="link-terms"
                          >
                            Terms of Service
                          </button>
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy-checkbox"
                        checked={agreedToPrivacy}
                        onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                        className="mt-1"
                        data-testid="checkbox-privacy"
                      />
                      <div className="flex-1">
                        <Label htmlFor="privacy-checkbox" className="text-sm text-gray-300 cursor-pointer">
                          I have read and agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowPrivacyModal(true)}
                            className="text-purple-400 hover:text-purple-300 underline"
                            data-testid="link-privacy"
                          >
                            Privacy Policy
                          </button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading || !agreedToTerms || !agreedToPrivacy || !captchaToken}
                    data-testid="button-signup-submit"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              {/* Email Verification Notice */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-300 font-semibold mb-1">Email Verification Required</h4>
                    <p className="text-blue-200 text-sm">
                      After signing up, check your email for a welcome message with account verification and helpful tips to get started with VitalWatch.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Tabs>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-gray-300">
            <Activity className="h-6 w-6 mx-auto mb-2 text-green-400" />
            <p className="text-xs">24/7 Monitoring</p>
          </div>
          <div className="text-gray-300">
            <Brain className="h-6 w-6 mx-auto mb-2 text-purple-400" />
            <p className="text-xs">AI Protection</p>
          </div>
          <div className="text-gray-300">
            <Heart className="h-6 w-6 mx-auto mb-2 text-red-400" />
            <p className="text-xs">Mental Health</p>
          </div>
        </div>

        {/* Legal Agreement Modals */}
        <LegalAgreementModal
          type="terms"
          open={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          onAgree={() => setAgreedToTerms(true)}
        />
        
        <LegalAgreementModal
          type="privacy"
          open={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          onAgree={() => setAgreedToPrivacy(true)}
        />
      </div>
    </div>
  );
}