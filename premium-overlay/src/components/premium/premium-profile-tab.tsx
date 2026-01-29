import type { ReactElement } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumProfileForm } from "@/components/premium/premium-profile-form";
import { getPremiumProfile } from "@/actions/premium-profile/get-premium-profile";
import type { PremiumProfile } from "@/lib/types/premium-profile";

export async function PremiumProfileTab(): Promise<ReactElement> {
  const result = await getPremiumProfile();
  if ("error" in result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile+</CardTitle>
          <CardDescription>Unable to load premium profile.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const profile: PremiumProfile = result.profile;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile+</CardTitle>
        <CardDescription>Premium profile fields (job title, company, social links).</CardDescription>
      </CardHeader>
      <CardContent>
        <PremiumProfileForm profile={profile} />
      </CardContent>
    </Card>
  );
}
