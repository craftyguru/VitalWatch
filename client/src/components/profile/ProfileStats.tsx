import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Users, 
  Brain, 
  Heart, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  Star,
  CheckCircle
} from "lucide-react";

interface ProfileStatsProps {
  totalMoodEntries: number;
  totalContacts: number;
  totalCopingSessions: number;
}

export function ProfileStats({ totalMoodEntries, totalContacts, totalCopingSessions }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Mood Entries</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalMoodEntries}</p>
            </div>
            <Brain className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Emergency Contacts</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">{totalContacts}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Coping Sessions</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{totalCopingSessions}</p>
            </div>
            <Heart className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Wellness Score</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">87%</p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-700 dark:text-yellow-300">Mood Tracker Pro</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">7 consecutive days logged</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">Safety First</p>
                <p className="text-sm text-green-600 dark:text-green-400">Emergency contacts set up</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold text-blue-700 dark:text-blue-300">Mindful Moments</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">5 breathing exercises completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}