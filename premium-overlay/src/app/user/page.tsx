import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/user/profile-form"
import { PasswordForm } from "@/components/user/password-form"
import { ChangeEmail } from "@/components/user/change-email"
import { DeleteAccount } from "@/components/user/delete-account"
import { LinkedAccounts } from "@/components/user/linked-accounts"
import { PhoneNumberSettings } from "@/components/user/phone-number-settings"
import { TwoFactorSettings } from "@/components/user/two-factor-settings"
import { NotificationSettings } from "@/components/user/notification-settings"
import { TrustedDevices } from "@/components/user/trusted-devices"
import { getUserProfile, getUserSettings } from "@/actions/user"
import { getLinkedAccounts } from "@/actions/get-linked-accounts"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Settings } from "lucide-react"
import getPremiumUserTabs from "@/lib/premium/premium-user-tabs"

async function UserContent({ searchParamsPromise }: { searchParamsPromise: Promise<{ hasPassword?: string }> }) {
  const [profileResult, settingsResult, linkedAccountsResult] = await Promise.all([
    getUserProfile(),
    getUserSettings(),
    getLinkedAccounts(),
  ]);

  if (!profileResult.ok) {
    const message: string = profileResult.error.message;
    return <div>Error loading user data: {message}</div>;
  }

  if (!settingsResult.ok) {
    const message: string = settingsResult.error.message;
    return <div>Error loading user data: {message}</div>;
  }

  // Resolve the searchParams promise to get the hasPassword value
  const searchParams = await searchParamsPromise;
  const hasPassword: boolean = searchParams.hasPassword
    ? searchParams.hasPassword === "true"
    : Boolean(settingsResult.data.settings.hasPassword);
  const premiumUserTabs = await getPremiumUserTabs();
  const tabCount: number = 2 + premiumUserTabs.length;

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
        {premiumUserTabs.map((tab: (typeof premiumUserTabs)[number]) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <ProfileForm profile={profileResult.data.profile} />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <PasswordForm hasPassword={hasPassword} />
        <ChangeEmail currentEmail={profileResult.data.profile.email} />
        {linkedAccountsResult.ok ? (
          <LinkedAccounts accounts={linkedAccountsResult.data.accounts} />
        ) : (
          <div>Error loading linked accounts: {linkedAccountsResult.error.message}</div>
        )}
        <PhoneNumberSettings
          phoneNumber={profileResult.data.profile.phoneNumber ?? ""}
          phoneNumberVerified={Boolean(profileResult.data.profile.phoneNumberVerified)}
        />
        <TwoFactorSettings
          isEnabled={settingsResult.data.settings.twoFactorEnabled}
          backupCodes={settingsResult.data.settings.backupCodes}
        />
        <NotificationSettings settings={settingsResult.data.settings.notifications} />
        <TrustedDevices devices={settingsResult.data.settings.trustedDevices} />
        <DeleteAccount hasPassword={hasPassword} twoFactorEnabled={settingsResult.data.settings.twoFactorEnabled} />
      </TabsContent>

      {premiumUserTabs.map((tab: (typeof premiumUserTabs)[number]) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function UserSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex space-x-1">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export default function UserPage({ searchParams }: { searchParams: Promise<{ hasPassword?: string }> }) {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and account settings</p>
      </div>

      <Suspense fallback={<UserSkeleton />}>
        <UserContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  )
}
