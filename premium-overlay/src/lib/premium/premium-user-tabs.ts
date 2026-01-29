import type { PremiumUserTab } from "@/lib/premium/premium-user-tab";

type GetPremiumUserTabsParams = Readonly<{
  headers?: Headers;
}>;

async function getPremiumUserTabs(_params: GetPremiumUserTabsParams = {}): Promise<ReadonlyArray<PremiumUserTab>> {
  const tabs: ReadonlyArray<PremiumUserTab> = [];
  return tabs;
}

export default getPremiumUserTabs;
