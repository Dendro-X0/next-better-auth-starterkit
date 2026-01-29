"use client"

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AvatarUpload } from "./avatar-upload"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormMessage } from "@/components/auth/form-message";
import { FieldMessage } from "@/components/auth/field-message";
import { updateProfileAction } from "@/actions/user"
import type { UserProfile } from "@/lib/types/user"
import toastUtils from "@/lib/ui/toast"

interface ProfileFormProps {
  profile: UserProfile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, null);

  useEffect(() => {
    toastUtils.fromFormState(state, "Profile updated successfully");
  }, [state]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture to personalize your account</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload currentAvatar={profile.avatar} userName={profile.name || profile.username} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and public profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMessage state={state} />
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={profile.name} placeholder="Enter your full name" required />
                <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.name : undefined} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={profile.username}
                  placeholder="Choose a username"
                  required
                />
                <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.username : undefined} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground">
                {profile.emailVerified ? "✓ Email verified" : "⚠ Email not verified"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile.bio}
                placeholder="Tell us about yourself"
                rows={3}
                className="resize-none"
              />
              <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.bio : undefined} />
              <p className="text-xs text-muted-foreground">
                Brief description for your profile. Maximum 160 characters.
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={profile.location} placeholder="City, Country" />
                <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.location : undefined} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={profile.website}
                  placeholder="https://yourwebsite.com"
                />
                <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.website : undefined} />
              </div>
            </div>

            <div className="flex justify-end">
              <SubmitButton>Save Changes</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Account Created</Label>
              <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Updated</Label>
              <p>{new Date(profile.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
