import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Activity
} from "lucide-react";

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleReplotAuth = () => {
    window.location.href = "/api/login";
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
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">VitalWatch</h1>
          <p className="text-gray-300">AI-Powered Vital Signs Monitoring</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-lg shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Access VitalWatch</CardTitle>
            <p className="text-gray-400">Your AI-powered emergency companion</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Main Auth Button */}
            <Button
              onClick={handleReplotAuth}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
              data-testid="button-auth-login"
            >
              <Shield className="h-5 w-5 mr-2" />
              Sign In to VitalWatch
            </Button>

            <div className="text-center text-gray-400 text-sm">
              Secure authentication powered by Replit
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">Test Account Available</span>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Test Account Info</h4>
              <p className="text-gray-300 text-sm mb-1">
                <strong>Email:</strong> VitalWatch@vitalwatch.com
              </p>
              <p className="text-gray-300 text-sm mb-3">
                <strong>Status:</strong> Ready for testing
              </p>
              <p className="text-gray-400 text-xs">
                Click "Sign In to VitalWatch" above to authenticate through Replit and access the test account.
              </p>
            </div>
          </CardContent>
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
      </div>
    </div>
  );
}