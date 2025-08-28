import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Activity, 
  Heart, 
  Brain,
  Award,
  Star,
  Target,
  Trophy,
  Zap,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Phone,
  Bell,
  AlertTriangle,
  Gift,
  Crown,
  Sparkles,
  Medal,
  Flame,
  Lock,
  Unlock,
  BarChart3,
  Info,
  Plus
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  completed: boolean;
  category: string;
  points: number;
  unlockedAt?: Date;
}

export default function ComprehensiveEmergencyMonitoring() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "safety-streak-7",
      title: "Safety Guardian",
      description: "Complete 7 consecutive daily safety check-ins",
      icon: <img src="/logo.png" alt="VitalWatch Logo" className="h-6 w-6 object-contain" />,
      progress: 7,
      maxProgress: 7,
      completed: true,
      category: "Safety",
      points: 50,
      unlockedAt: new Date()
    },
    {
      id: "emergency-drill-5",
      title: "Emergency Expert",
      description: "Complete 5 emergency drills successfully",
      icon: <AlertTriangle className="h-6 w-6" />,
      progress: 3,
      maxProgress: 5,
      completed: false,
      category: "Preparedness",
      points: 75
    },
    {
      id: "mood-tracker-30",
      title: "Emotional Awareness Master",
      description: "Track your mood for 30 consecutive days",
      icon: <Heart className="h-6 w-6" />,
      progress: 18,
      maxProgress: 30,
      completed: false,
      category: "Wellness",
      points: 100
    },
    {
      id: "breathing-sessions-25",
      title: "Zen Master",
      description: "Complete 25 breathing exercise sessions",
      icon: <Activity className="h-6 w-6" />,
      progress: 25,
      maxProgress: 25,
      completed: true,
      category: "Mindfulness",
      points: 75,
      unlockedAt: new Date(Date.now() - 86400000) // Yesterday
    },
    {
      id: "contacts-network-5",
      title: "Safety Network Builder",
      description: "Add 5 verified emergency contacts",
      icon: <Users className="h-6 w-6" />,
      progress: 2,
      maxProgress: 5,
      completed: false,
      category: "Network",
      points: 60
    },
    {
      id: "ai-insights-10",
      title: "AI Wellness Explorer",
      description: "Review 10 AI-generated wellness insights",
      icon: <Brain className="h-6 w-6" />,
      progress: 7,
      maxProgress: 10,
      completed: false,
      category: "Innovation",
      points: 40
    },
    {
      id: "location-sharing-10",
      title: "Guardian Angel",
      description: "Share location during 10 risky situations",
      icon: <MapPin className="h-6 w-6" />,
      progress: 4,
      maxProgress: 10,
      completed: false,
      category: "Safety",
      points: 80
    },
    {
      id: "crisis-support-first",
      title: "Brave Survivor",
      description: "Complete your first crisis support session",
      icon: <Crown className="h-6 w-6" />,
      progress: 1,
      maxProgress: 1,
      completed: true,
      category: "Courage",
      points: 150,
      unlockedAt: new Date(Date.now() - 172800000) // 2 days ago
    }
  ]);

  const [userLevel, setUserLevel] = useState(8);
  const [totalPoints, setTotalPoints] = useState(890);
  const [nextLevelPoints, setNextLevelPoints] = useState(1000);
  const [weeklyGoalProgress, setWeeklyGoalProgress] = useState(85);

  const completedAchievements = achievements.filter(a => a.completed);
  const inProgressAchievements = achievements.filter(a => !a.completed);

  const categories = [...new Set(achievements.map(a => a.category))];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Safety": return <img src="/logo.png" alt="VitalWatch Logo" className="h-4 w-4 object-contain" />;
      case "Preparedness": return <AlertTriangle className="h-4 w-4" />;
      case "Wellness": return <Heart className="h-4 w-4" />;
      case "Mindfulness": return <Activity className="h-4 w-4" />;
      case "Network": return <Users className="h-4 w-4" />;
      case "Innovation": return <Brain className="h-4 w-4" />;
      case "Courage": return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Safety": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Preparedness": return "bg-red-100 text-red-800 border-red-200";
      case "Wellness": return "bg-green-100 text-green-800 border-green-200";
      case "Mindfulness": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Network": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Innovation": return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "Courage": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRarityColor = (points: number) => {
    if (points >= 150) return "from-yellow-400 to-orange-500"; // Legendary
    if (points >= 100) return "from-purple-400 to-pink-500"; // Epic
    if (points >= 75) return "from-blue-400 to-cyan-500"; // Rare
    return "from-gray-400 to-gray-500"; // Common
  };

  const getRarityLabel = (points: number) => {
    if (points >= 150) return "Legendary";
    if (points >= 100) return "Epic";
    if (points >= 75) return "Rare";
    return "Common";
  };

  return (
    <div className="space-y-8">
      {/* User Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
              <Trophy className="h-5 w-5" />
              <span>Your Achievement Journey</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-4 rounded-xl w-fit mx-auto mb-3">
                  <Crown className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">Level {userLevel}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Wellness Guardian</div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-4 rounded-xl w-fit mx-auto mb-3">
                  <Zap className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">{totalPoints}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Total Points</div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-xl w-fit mx-auto mb-3">
                  <Medal className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{completedAchievements.length}</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Achievements Unlocked</div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress to Level {userLevel + 1}</span>
                <span className="text-sm text-muted-foreground">{totalPoints}/{nextLevelPoints} XP</span>
              </div>
              <Progress value={(totalPoints / nextLevelPoints) * 100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Weekly Goal Progress</span>
                <span className="text-sm text-muted-foreground">{weeklyGoalProgress}%</span>
              </div>
              <Progress value={weeklyGoalProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Weekly Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Safety Check-ins</span>
              </div>
              <Badge className="bg-green-100 text-green-800">7/7</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span className="text-sm">Mood Entries</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">5/7</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Breathing Sessions</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">12</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-cyan-600" />
                <span className="text-sm">AI Insights</span>
              </div>
              <Badge className="bg-cyan-100 text-cyan-800">3</Badge>
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+240</div>
              <div className="text-sm text-muted-foreground">Points this week</div>
              <div className="text-xs text-green-600 mt-1">Personal best!</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Unlocked */}
      {completedAchievements.filter(a => a.unlockedAt && Date.now() - a.unlockedAt.getTime() < 604800000).length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-900 dark:text-yellow-100">
              <Sparkles className="h-5 w-5" />
              <span>Recently Unlocked</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedAchievements
                .filter(a => a.unlockedAt && Date.now() - a.unlockedAt.getTime() < 604800000)
                .map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-4 bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                  <div className={`bg-gradient-to-br ${getRarityColor(achievement.points)} text-white p-3 rounded-xl shadow-lg`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{achievement.title}</h3>
                      <Badge className={getCategoryColor(achievement.category)}>
                        {getCategoryIcon(achievement.category)}
                        <span className="ml-1">{achievement.category}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{achievement.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-yellow-100 text-yellow-800">+{achievement.points} XP</Badge>
                      <Badge variant="outline">{getRarityLabel(achievement.points)}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Categories */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Achievement Gallery</h2>
          <Badge className="bg-slate-100 text-slate-800">
            {completedAchievements.length}/{achievements.length} Complete
          </Badge>
        </div>

        {categories.map((category) => {
          const categoryAchievements = achievements.filter(a => a.category === category);
          const completedInCategory = categoryAchievements.filter(a => a.completed).length;
          
          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </CardTitle>
                  <Badge className={getCategoryColor(category)}>
                    {completedInCategory}/{categoryAchievements.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryAchievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`relative rounded-xl p-4 border-2 transition-all ${
                        achievement.completed 
                          ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-800 shadow-lg' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-75'
                      }`}
                    >
                      {achievement.completed && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-green-500 text-white rounded-full p-1.5">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-3 mb-3">
                        <div className={`${
                          achievement.completed 
                            ? `bg-gradient-to-br ${getRarityColor(achievement.points)} text-white` 
                            : 'bg-slate-200 text-slate-400'
                        } p-3 rounded-xl transition-all`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold ${achievement.completed ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                            {achievement.title}
                          </h3>
                          <p className={`text-sm ${achievement.completed ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400'}`}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      
                      {!achievement.completed && (
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2" 
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Zap className="h-3 w-3 mr-1" />
                          {achievement.points} XP
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getRarityLabel(achievement.points)}
                        </Badge>
                      </div>
                      
                      {achievement.completed && achievement.unlockedAt && (
                        <div className="text-xs text-green-600 mt-2">
                          Unlocked {achievement.unlockedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leaderboard Preview */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-900 dark:text-purple-100">
            <Users className="h-5 w-5" />
            <span>Community Leaderboard</span>
            <Badge className="bg-purple-100 text-purple-800">Anonymous</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <div>
                  <div className="font-semibold">Guardian Angel ⭐</div>
                  <div className="text-sm text-muted-foreground">Level 15</div>
                </div>
              </div>
              <Badge className="bg-yellow-500 text-white">2,450 XP</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <div>
                  <div className="font-semibold">Safety Hero 🛡️</div>
                  <div className="text-sm text-muted-foreground">Level 12</div>
                </div>
              </div>
              <Badge className="bg-slate-500 text-white">1,890 XP</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <div>
                  <div className="font-semibold">Wellness Warrior 💚</div>
                  <div className="text-sm text-muted-foreground">Level 10</div>
                </div>
              </div>
              <Badge className="bg-orange-500 text-white">1,240 XP</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">7</div>
                <div>
                  <div className="font-semibold">You (Anonymous) 🎯</div>
                  <div className="text-sm text-muted-foreground">Level {userLevel}</div>
                </div>
              </div>
              <Badge className="bg-blue-500 text-white">{totalPoints} XP</Badge>
            </div>
          </div>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Rankings are based on total experience points. Your data remains completely private and anonymous.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}