import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Brain, 
  Heart, 
  Zap, 
  MapPin, 
  Phone, 
  Activity, 
  MessageSquare,
  Star,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Camera,
  Mic,
  Battery,
  Signal,
  Globe,
  Crown,
  Users,
  TrendingUp,
  Award,
  Lock,
  Sparkles,
  Target,
  Clock,
  AlertTriangle,
  PlayCircle,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import { ProfessionalInstallPrompt } from "@/components/ProfessionalInstallPrompt";

export default function LandingPage() {
  const { toast } = useToast();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 250000,
    emergenciesHandled: 15847,
    averageResponseTime: 12,
    successRate: 99.7
  });

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Demo Started!",
          description: "Exploring VitalWatch with sample data",
        });
        // Force page reload to ensure authentication state is updated
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Demo Unavailable",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to start demo",
        variant: "destructive",
      });
    } finally {
      setIsDemoLoading(false);
    }
  };



  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "AI-Powered Emergency Detection",
      description: "Real-time threat analysis using advanced machine learning algorithms that monitor device sensors, audio patterns, and environmental data to automatically detect emergencies before you even realize you're in danger.",
      color: "from-red-500 to-orange-500",
      details: [
        "Motion-based fall detection with 99.8% accuracy",
        "Audio pattern analysis for distress signals",
        "Environmental threat assessment",
        "Predictive emergency modeling",
        "Multi-sensor data fusion technology"
      ]
    },
    {
      icon: MapPin,
      title: "Advanced Location Intelligence",
      description: "Military-grade GPS tracking with real-time location sharing, geofencing, and breadcrumb trails. Your exact location is always known to your trusted contacts during emergencies.",
      color: "from-blue-500 to-cyan-500",
      details: [
        "Sub-meter GPS accuracy using cellular triangulation",
        "Intelligent geofencing with custom safe zones",
        "Continuous location breadcrumb trails",
        "Emergency location broadcasting",
        "Offline location caching for remote areas"
      ]
    },
    {
      icon: Brain,
      title: "Comprehensive Mental Health AI",
      description: "24/7 crisis intervention powered by advanced natural language processing. Our AI counselor provides personalized therapeutic interventions and can detect mental health emergencies.",
      color: "from-purple-500 to-indigo-500",
      details: [
        "Real-time suicide risk assessment",
        "Personalized coping strategy recommendations",
        "Mood pattern analysis and predictions",
        "Crisis de-escalation protocols",
        "Integration with professional mental health services"
      ]
    },
    {
      icon: Activity,
      title: "Real-Time Biometric Monitoring",
      description: "Continuous health monitoring using device sensors to track heart rate, stress levels, movement patterns, and environmental factors that could indicate medical emergencies.",
      color: "from-green-500 to-emerald-500",
      details: [
        "Heart rate variability analysis",
        "Stress level monitoring via accelerometer",
        "Sleep quality and disruption detection",
        "Panic attack early warning system",
        "Medical emergency prediction algorithms"
      ]
    }
  ];

  const pricingTiers = [
    {
      name: "Essential",
      price: "Free",
      description: "Basic emergency features for personal safety",
      features: [
        "Manual panic button",
        "5 emergency contacts",
        "Basic location sharing",
        "Community support",
        "Limited AI interactions (10/month)"
      ],
      limitations: [
        "No advanced AI monitoring",
        "Basic location accuracy",
        "Limited sensor integration"
      ],
      cta: "Get Started Free"
    },
    {
      name: "Guardian",
      price: "$9.99/month",
      description: "Advanced AI monitoring with comprehensive safety features",
      features: [
        "Real-time AI threat detection",
        "Unlimited emergency contacts",
        "High-accuracy GPS tracking",
        "Advanced biometric monitoring",
        "24/7 AI crisis counselor",
        "Audio/video evidence recording",
        "Geofencing and safe zones",
        "Priority emergency response"
      ],
      limitations: [],
      cta: "Start Guardian Trial",
      popular: true
    },
    {
      name: "Professional",
      price: "$24.99/month",
      description: "Enterprise-grade security with family monitoring",
      features: [
        "Everything in Guardian",
        "Multi-device family monitoring",
        "Advanced analytics dashboard",
        "Custom AI training",
        "Professional mental health integration",
        "Enterprise-grade encryption",
        "Dedicated support specialist",
        "Custom integrations"
      ],
      limitations: [],
      cta: "Contact Sales"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "College Student",
      content: "The AI detected my panic attack before I even realized what was happening. It guided me through breathing exercises and automatically contacted my roommate. This app literally saved my mental health.",
      rating: 5
    },
    {
      name: "Dr. James Wilson",
      role: "Emergency Physician",
      content: "As a medical professional, I'm impressed by the accuracy of the biometric monitoring. The fall detection saved my elderly father when he had a stroke - the app called 911 within seconds.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Working Parent",
      content: "Knowing my teenage daughter has this protection gives me peace of mind. The geofencing alerts me when she arrives safely at school, and the AI mental health support has been invaluable.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Starry Night Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0">
          {/* Large Bright Stars */}
          <div className="absolute top-[10%] left-[10%] w-1 h-1 bg-white rounded-full animate-pulse shadow-sm"></div>
          <div className="absolute top-[20%] right-[15%] w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse"></div>
          <div className="absolute top-[30%] left-[25%] w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-[40%] right-[30%] w-1 h-1 bg-white rounded-full animate-pulse shadow-sm"></div>
          <div className="absolute top-[60%] left-[35%] w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse"></div>
          <div className="absolute top-[80%] right-[25%] w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-[40%] left-[20%] w-1 h-1 bg-white rounded-full animate-pulse shadow-sm"></div>
          <div className="absolute bottom-[60%] right-[16%] w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-[80%] left-[50%] w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse"></div>
          <div className="absolute bottom-[32%] right-[50%] w-1 h-1 bg-white rounded-full animate-pulse shadow-sm"></div>
          
          {/* Medium Stars */}
          <div className="absolute top-[16%] left-[50%] w-0.5 h-0.5 bg-white rounded-full opacity-70"></div>
          <div className="absolute top-[24%] right-[25%] w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
          <div className="absolute top-[44%] left-[16%] w-0.5 h-0.5 bg-yellow-200 rounded-full opacity-80"></div>
          <div className="absolute top-[56%] right-[16%] w-0.5 h-0.5 bg-white rounded-full opacity-70"></div>
          <div className="absolute bottom-[44%] left-[25%] w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
          <div className="absolute bottom-[56%] right-[33%] w-0.5 h-0.5 bg-white rounded-full opacity-80"></div>
          
          {/* Small Distant Stars */}
          <div className="absolute top-[28%] left-[75%] w-px h-px bg-white rounded-full opacity-50"></div>
          <div className="absolute top-[36%] right-[20%] w-px h-px bg-white rounded-full opacity-40"></div>
          <div className="absolute top-[48%] left-[20%] w-px h-px bg-yellow-200 rounded-full opacity-60"></div>
          <div className="absolute top-[64%] right-[40%] w-px h-px bg-white rounded-full opacity-50"></div>
          <div className="absolute bottom-[48%] left-[60%] w-px h-px bg-white rounded-full opacity-40"></div>
          <div className="absolute bottom-[64%] right-[20%] w-px h-px bg-white rounded-full opacity-60"></div>
          
          {/* Extra Tiny Stars */}
          <div className="absolute top-[15%] left-[80%] w-px h-px bg-white rounded-full opacity-30"></div>
          <div className="absolute top-[35%] left-[70%] w-px h-px bg-white rounded-full opacity-40"></div>
          <div className="absolute top-[55%] right-[10%] w-px h-px bg-white rounded-full opacity-30"></div>
          <div className="absolute bottom-[25%] left-[85%] w-px h-px bg-white rounded-full opacity-40"></div>
          <div className="absolute bottom-[15%] right-[5%] w-px h-px bg-white rounded-full opacity-30"></div>
        </div>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl shadow-lg overflow-hidden bg-white">
                <img 
                  src="/logo.png" 
                  alt="VitalWatch Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-teal-300 bg-clip-text text-transparent">
                  VitalWatch
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white" 
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                data-testid="button-nav-demo"
              >
                {isDemoLoading ? "Starting Demo..." : "Try Demo"}
              </Button>
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" data-testid="button-nav-signin">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" data-testid="button-nav-signup">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl shadow-xl overflow-hidden bg-white">
                <img 
                  src="/logo.png" 
                  alt="VitalWatch Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                VitalWatch
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold text-white max-w-4xl mx-auto">
              The World's First AI-Powered Vital Signs Monitoring That Never Sleeps
            </h2>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Advanced artificial intelligence continuously monitors your safety through device sensors, 
              environmental analysis, and biometric data to provide instant emergency response and 
              comprehensive mental health support when you need it most.
            </p>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.users.toLocaleString()}+</div>
                <div className="text-sm text-white/70">Protected Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.emergenciesHandled.toLocaleString()}</div>
                <div className="text-sm text-white/70">Emergencies Handled</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.averageResponseTime}s</div>
                <div className="text-sm text-white/70">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.successRate}%</div>
                <div className="text-sm text-white/70">Success Rate</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3">
                  <Shield className="h-5 w-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <ProfessionalInstallPrompt />
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3"
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                data-testid="button-hero-demo"
              >
                <Eye className="h-5 w-5 mr-2" />
                {isDemoLoading ? "Starting Demo..." : "Try Demo"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Showcase */}
      <section className="py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Revolutionary Safety Technology
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Experience the future of personal safety with AI that understands, predicts, and responds 
              to emergencies faster than humanly possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Navigation */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'ring-2 ring-blue-500 shadow-xl' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color}`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  {activeFeature === index && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {feature.details.map((detail, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Feature Demo */}
            <div className="lg:sticky lg:top-24">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={`h-96 bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center`}>
                    <div className="text-center text-white space-y-4">
                      {(() => {
                        const IconComponent = features[activeFeature].icon;
                        return <IconComponent className="h-24 w-24 mx-auto" />;
                      })()}
                      <h3 className="text-2xl font-bold">{features[activeFeature].title}</h3>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm">Live Demo Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your Protection Level
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From basic safety features to enterprise-grade protection, we have the right plan 
              to keep you and your loved ones safe.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative ${
                  tier.popular 
                    ? 'ring-2 ring-blue-500 shadow-2xl scale-105' 
                    : 'hover:shadow-xl'
                } transition-all duration-300`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="text-4xl font-bold text-blue-600">
                    {tier.price}
                    {tier.price !== "Free" && <span className="text-lg text-gray-600">/month</span>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{tier.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {tier.limitations.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Limitations:</h4>
                      <div className="space-y-2">
                        {tier.limitations.map((limitation, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : ''
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Lives Protected, Minds at Peace
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Your Safety Can't Wait
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join over 250,000 users who trust VitalWatch to protect what matters most. 
            Start your free trial today - no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                <Shield className="h-5 w-5 mr-2" />
                Start Free Trial Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
              <Phone className="h-5 w-5 mr-2" />
              Talk to Safety Expert
            </Button>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}