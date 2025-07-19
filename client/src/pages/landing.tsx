import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Brain, Users, Phone, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-800">Emergency Friend</h1>
              <p className="text-xs text-neutral-500">24/7 Crisis Support & Mental Health</p>
            </div>
          </div>
          <Button onClick={handleLogin} className="bg-primary hover:bg-blue-600 text-white">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
            Your Mental Health{" "}
            <span className="text-primary">Support Network</span>
          </h2>
          <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
            Advanced emergency friend support with AI-powered crisis detection, 
            one-touch emergency alerts, and comprehensive mental health resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg"
              className="bg-primary hover:bg-blue-600 text-white px-8 py-4 text-lg"
            >
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg border-primary text-primary hover:bg-primary hover:text-white"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Emergency Notice */}
      <section className="bg-red-50 border-t border-b border-red-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Phone className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">In Crisis Right Now?</h3>
          </div>
          <p className="text-red-700 mb-4">
            If you're having thoughts of suicide or are in immediate danger, please reach out for help:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.open('tel:988', '_self')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call 988 - Crisis Lifeline
            </Button>
            <Button 
              onClick={() => window.open('tel:911', '_self')}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              Call 911 - Emergency
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-neutral-800 mb-4">
            Comprehensive Crisis Support
          </h3>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Our app combines cutting-edge AI technology with human compassion 
            to provide 24/7 mental health support when you need it most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Emergency Alerts */}
          <Card className="border-red-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-neutral-800">
                One-Touch Emergency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Instant emergency alerts with GPS location sharing. 
                Notify emergency contacts via SMS, email, and push notifications.
              </p>
            </CardContent>
          </Card>

          {/* AI Crisis Detection */}
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-neutral-800">
                AI Crisis Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Advanced AI analyzes mood patterns to detect crisis situations 
                and provides early intervention recommendations.
              </p>
            </CardContent>
          </Card>

          {/* Support Network */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-neutral-800">
                Support Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Manage emergency contacts with tiered notification system. 
                Connect with family, friends, and mental health professionals.
              </p>
            </CardContent>
          </Card>

          {/* 24/7 Crisis Chat */}
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl text-neutral-800">
                24/7 Crisis Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Immediate access to trained crisis counselors and peer support. 
                Anonymous chat available when you need someone to talk to.
              </p>
            </CardContent>
          </Card>

          {/* Coping Tools */}
          <Card className="border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-neutral-800">
                Coping Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Guided breathing exercises, grounding techniques, meditation sessions, 
                and distraction activities for panic attacks and anxiety.
              </p>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle className="text-xl text-neutral-800">
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                End-to-end encryption, HIPAA compliance, and advanced privacy controls. 
                Your mental health data is secure and confidential.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Take Control of Your Mental Health
          </h3>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Join thousands of users who trust Emergency Friend for crisis support 
            and mental health management. Your journey to wellness starts here.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Get Started Free
          </Button>
          <p className="text-sm opacity-75 mt-4">
            No credit card required • Secure & confidential • Available 24/7
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Emergency Friend</span>
              </div>
              <p className="text-neutral-400 text-sm">
                Providing compassionate, AI-powered mental health crisis support 
                when you need it most.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Crisis Resources</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>988 Suicide & Crisis Lifeline</li>
                <li>Crisis Text Line: HOME to 741741</li>
                <li>SAMHSA National Helpline: 1-800-662-4357</li>
                <li>National Domestic Violence Hotline: 1-800-799-7233</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-700 pt-8 text-center text-sm text-neutral-400">
            <p>© 2025 Emergency Friend. All rights reserved.</p>
            <p className="mt-2">
              If you're in crisis, please call 988 (Suicide & Crisis Lifeline) or 911 immediately.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
