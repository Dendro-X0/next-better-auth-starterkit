"use client";

import { useActionState, useEffect } from "react";
import type { ReactElement } from "react";

import { FieldMessage } from "@/components/auth/field-message";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import toastUtils from "@/lib/ui/toast";
import { updatePremiumProfileAction } from "@/actions/premium-profile/update-premium-profile";
import type { PremiumProfile } from "@/lib/types/premium-profile";
import type { FormState } from "@/lib/types/actions";

interface PremiumProfileFormProps {
  profile: PremiumProfile;
}

export function PremiumProfileForm({ profile }: PremiumProfileFormProps): ReactElement {
  const initialState: FormState | null = null;
  const [state, formAction] = useActionState(updatePremiumProfileAction, initialState);
  useEffect((): void => {
    toastUtils.fromFormState(state, "Premium profile updated successfully");
  }, [state]);
  return (
    <div className="space-y-6">
      <FormMessage state={state} />
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job title</Label>
            <Input id="jobTitle" name="jobTitle" defaultValue={profile.jobTitle} placeholder="Senior Developer" />
            <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.jobTitle : undefined} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" defaultValue={profile.company} placeholder="Acme Inc." />
            <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.company : undefined} />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              name="twitter"
              defaultValue={profile.social.twitter ?? ""}
              placeholder="https://x.com/yourhandle"
            />
            <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.twitter : undefined} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              name="github"
              defaultValue={profile.social.github ?? ""}
              placeholder="https://github.com/yourhandle"
            />
            <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.github : undefined} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              name="linkedin"
              defaultValue={profile.social.linkedin ?? ""}
              placeholder="https://linkedin.com/in/yourhandle"
            />
            <FieldMessage messages={state?.error && "fields" in state.error ? state.error.fields?.linkedin : undefined} />
          </div>
        </div>
        <div className="flex justify-end">
          <SubmitButton>Save</SubmitButton>
        </div>
      </form>
    </div>
  );
}
