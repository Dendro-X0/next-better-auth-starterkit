"use client"

import { useActionState, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message"
import { updateNotificationSettingsAction } from "@/actions/user"
import { Mail, Smartphone } from "lucide-react"
import toastUtils from "@/lib/ui/toast"

interface NotificationSettingsProps {
  settings: {
    email: {
      security: boolean;
      marketing: boolean;
      updates: boolean;
    };
    push: {
      security: boolean;
      mentions: boolean;
      updates: boolean;
    };
  }
}

export function NotificationSettings({ settings: initialSettings }: NotificationSettingsProps) {
  const [state, formAction] = useActionState(updateNotificationSettingsAction, null);
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    toastUtils.fromFormState(state, "Notification settings updated successfully");
  }, [state]);

  const updateSetting = (category: string, key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified about account activity and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="emailSecurity" value={String(settings.email.security)} />
          <input type="hidden" name="emailUpdates" value={String(settings.email.updates)} />
          <input type="hidden" name="emailMarketing" value={String(settings.email.marketing)} />
          <input type="hidden" name="pushSecurity" value={String(settings.push.security)} />
          <input type="hidden" name="pushMentions" value={String(settings.push.mentions)} />
          <input type="hidden" name="pushUpdates" value={String(settings.push.updates)} />
          <FormMessage state={state} />

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <h3 className="text-lg font-medium">Email Notifications</h3>
              </div>

              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-security">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about important security events like login attempts and password changes
                    </p>
                  </div>
                  <Switch
                    id="email-security"
                    checked={settings.email.security}
                    onCheckedChange={(checked) => updateSetting("email", "security", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-updates">Product Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features, improvements, and important announcements
                    </p>
                  </div>
                  <Switch
                    id="email-updates"
                    checked={settings.email.updates}
                    onCheckedChange={(checked) => updateSetting("email", "updates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-marketing">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails, newsletters, and marketing content
                    </p>
                  </div>
                  <Switch
                    id="email-marketing"
                    checked={settings.email.marketing}
                    onCheckedChange={(checked) => updateSetting("email", "marketing", checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Push Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <h3 className="text-lg font-medium">Push Notifications</h3>
              </div>

              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-security">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get instant notifications about security events on your mobile device
                    </p>
                  </div>
                  <Switch
                    id="push-security"
                    checked={settings.push.security}
                    onCheckedChange={(checked) => updateSetting("push", "security", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-mentions">Mentions & Replies</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone mentions you or replies to your content
                    </p>
                  </div>
                  <Switch
                    id="push-mentions"
                    checked={settings.push.mentions}
                    onCheckedChange={(checked) => updateSetting("push", "mentions", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-updates">Product Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications about new features and updates
                    </p>
                  </div>
                  <Switch
                    id="push-updates"
                    checked={settings.push.updates}
                    onCheckedChange={(checked) => updateSetting("push", "updates", checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <SubmitButton>Save Preferences</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
