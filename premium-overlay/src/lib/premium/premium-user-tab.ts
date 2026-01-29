import type { ReactNode } from "react";

type PremiumUserTab = Readonly<{
  value: string;
  label: string;
  content: ReactNode;
}>;

export type { PremiumUserTab };
