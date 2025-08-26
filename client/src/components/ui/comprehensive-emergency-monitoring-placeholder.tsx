import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Target, 
  Award, 
  Medal, 
  Crown, 
  Zap, 
  Flame, 
  Shield, 
  Heart,
  Calendar,
  TrendingUp,
  CheckCircle,
  Gift,
  Users,
  Lock,
  Unlock
} from "lucide-react";

export default function ComprehensiveEmergencyMonitoring() {
  const achievementCategories = [
    {
      title: "Safety Champion",
      achievements: [
        { name: "First Check-In", description: "Complete your first daily safety check-in", points: 50, earned: true, icon: CheckCircle },
        { name: "Week Warrior", description: "7 consecutive days of safety check-ins", points: 200, earned: true, icon: Calendar },
        { name: "Safety Streak", description: "30 days of consistent safety monitoring", points: 500, earned: false, icon: Flame },
        { name: "Emergency Ready", description: "Complete emergency contact setup", points: 100, earned: true, icon: Shield }
      ]
    },
    {
      title: "Wellness Master",
      achievements: [
        { name: "Breathing Beginner", description: "Complete your first breathing exercise", points: 25, earned: true, icon: Heart },
        { name: "Zen Master", description: "100 breathing exercise sessions completed", points: 1000, earned: false, icon: Star },
        { name: "Mood Tracker", description: "Log mood entries for 14 consecutive days", points: 300, earned: true, icon: TrendingUp },
        { name: "Crisis Crusher", description: "Successfully use crisis tools during stress", points: 150, earned: false, icon: Target }
      ]
    },
    {
      title: "Technology Pioneer",
      achievements: [
        { name: "Sensor Sync", description: "Connect all device sensors successfully", points: 100, earned: true, icon: Zap },
        { name: "Location Guardian", description: "Enable high-accuracy location tracking", points: 75, earned: true, icon: Shield },
        { name: "AI Ally", description: "Complete 10 AI-powered crisis chat sessions", points: 250, earned: false, icon: Crown },
        { name: "Network Guardian", description: "Maintain 99% system uptime for 30 days", points: 400, earned: false, icon: Award }
      ]
    }
  ];

  const userStats = {
    level: 4,
    currentXP: 1247,
    nextLevelXP: 1500,
    totalPoints: 3420,
    achievementsUnlocked: 8,
    totalAchievements: 24,
    currentStreak: 12,
    rank: "Safety Guardian"
  };

  return (
    <div className="space-y-8">
      {/* Achievement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
          <CardContent className="p-6 text-center">
            <div className="bg-purple-500 text-white p-3 rounded-xl w-fit mx-auto mb-3">
              <Crown className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{userStats.level}</div>
            <div className="text-sm text-muted-foreground">Current Level</div>
            <div className="text-xs text-purple-600 mt-1">{userStats.rank}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
          <CardContent className="p-6 text-center">
            <div className="bg-orange-500 text-white p-3 rounded-xl w-fit mx-auto mb-3">
              <Zap className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{userStats.currentXP}</div>
            <div className="text-sm text-muted-foreground">Total XP</div>
            <div className="text-xs text-orange-600 mt-1">{userStats.nextLevelXP - userStats.currentXP} to next level</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/50">
          <CardContent className="p-6 text-center">
            <div className="bg-blue-500 text-white p-3 rounded-xl w-fit mx-auto mb-3">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{userStats.achievementsUnlocked}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
            <div className="text-xs text-blue-600 mt-1">{userStats.totalAchievements - userStats.achievementsUnlocked} remaining</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
          <CardContent className="p-6 text-center">
            <div className="bg-green-500 text-white p-3 rounded-xl w-fit mx-auto mb-3">
              <Flame className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-green-600">{userStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
            <div className="text-xs text-green-600 mt-1">Personal best!</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-950/20 dark:to-blue-950/20 border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Progress to Next Level</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Level {userStats.level} → Level {userStats.level + 1}</span>
              <span className="text-sm text-muted-foreground">{userStats.currentXP} / {userStats.nextLevelXP} XP</span>
            </div>
            <Progress value={(userStats.currentXP / userStats.nextLevelXP) * 100} className="h-3" />
            <div className="text-sm text-muted-foreground">
              {userStats.nextLevelXP - userStats.currentXP} XP needed to unlock "{userStats.rank} Elite" rank
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <div className="space-y-6">
        {achievementCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="bg-white/50 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{category.title}</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {category.achievements.filter(a => a.earned).length}/{category.achievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border ${
                      achievement.earned 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.earned ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        <achievement.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">{achievement.name}</h4>
                          {achievement.earned ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                        <Badge className={`text-xs ${
                          achievement.earned 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {achievement.points} XP
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leaderboard & Social */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Safety Network Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500 text-white p-2 rounded-lg">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">Sarah M.</div>
                  <div className="text-sm text-muted-foreground">Safety Champion</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-yellow-600">4,890 XP</div>
                <div className="text-xs text-muted-foreground">#1</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-400 text-white p-2 rounded-lg">
                  <Medal className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">Alex K.</div>
                  <div className="text-sm text-muted-foreground">Guardian</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-600">3,650 XP</div>
                <div className="text-xs text-muted-foreground">#2</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 text-white p-2 rounded-lg">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">You</div>
                  <div className="text-sm text-muted-foreground">{userStats.rank}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{userStats.totalPoints} XP</div>
                <div className="text-xs text-muted-foreground">#3</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}