import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function ComprehensiveEmergencyMonitoring() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Wellness Analytics Dashboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Comprehensive wellness analytics and mood tracking insights coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}