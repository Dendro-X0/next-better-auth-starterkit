import { env } from "~/env";
import type { PremiumPlan } from "@/lib/premium/premium-plan";

type ResolvePremiumPlanParams = Readonly<{
  userId: string;
}>;

async function resolvePremiumPlan(_params: ResolvePremiumPlanParams): Promise<PremiumPlan> {
  const plan: PremiumPlan = env.PREMIUM_PLAN;
  return plan;
}

export default resolvePremiumPlan;
