import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  Phone, 
  Timer,
  Volume2,
  Vibrate
} from "lucide-react";

interface NotificationSettingsProps {
  form: any;
  isLoading: boolean;
}

export function NotificationSettings({ form, isLoading }: NotificationSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Emergency Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-red-500" />
            <span>Emergency Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <FormField
              control={form.control}
              name="notificationPreferences.sms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>SMS Notifications</span>
                    </FormLabel>
                    <FormDescription>
                      Receive emergency alerts via SMS
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notificationPreferences.email"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Notifications</span>
                    </FormLabel>
                    <FormDescription>
                      Receive emergency alerts via email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notificationPreferences.push"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Push Notifications</span>
                    </FormLabel>
                    <FormDescription>
                      Receive emergency alerts as push notifications
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emergencyCountdown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base flex items-center space-x-2">
                    <Timer className="h-4 w-4" />
                    <span>Emergency Countdown Timer</span>
                  </FormLabel>
                  <FormControl>
                    <div className="px-3">
                      <Slider
                        min={30}
                        max={300}
                        step={30}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <span>30s</span>
                        <span className="font-medium">{field.value}s</span>
                        <span>5min</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Time before emergency alert is sent automatically
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Sound & Vibration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-blue-500" />
            <span>Sound & Vibration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Emergency Alert Sound</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Play sound for emergency notifications
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Vibration</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Vibrate device for emergency alerts
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label>Alert Volume</Label>
            <Slider
              defaultValue={[80]}
              max={100}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Quiet</span>
              <span>Loud</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Ringtone Selection</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose emergency alert sound
              </p>
            </div>
            <Select defaultValue="default">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Wellness Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellOff className="h-5 w-5 text-green-500" />
            <span>Wellness Reminders</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Daily Mood Check-ins</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Remind me to log my mood daily
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Breathing Exercise Reminders</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Gentle reminders to practice breathing
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Hydration Reminders</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Remind me to stay hydrated
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}