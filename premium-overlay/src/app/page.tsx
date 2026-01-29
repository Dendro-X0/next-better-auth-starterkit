import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  KeyRound,
  Lock,
  type LucideIcon,
  Shield,
  Star,
  Timer,
  Users,
  Zap,
} from "lucide-react";

type LandingCard = Readonly<{
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgClassName: string;
  iconClassName: string;
}>;

type LandingSectionItem = Readonly<{
  title: string;
  description: string;
  icon: LucideIcon;
}>;

const heroPills: readonly LandingCard[] = [
  {
    title: "Next.js 16",
    description: "App Router-first",
    icon: Zap,
    iconBgClassName: "bg-blue-500/10",
    iconClassName: "text-blue-600",
  },
  {
    title: "Better Auth",
    description: "Robust & type-safe",
    icon: Shield,
    iconBgClassName: "bg-purple-500/10",
    iconClassName: "text-purple-600",
  },
  {
    title: "Drizzle ORM",
    description: "Type-safe SQL",
    icon: Users,
    iconBgClassName: "bg-green-500/10",
    iconClassName: "text-green-600",
  },
  {
    title: "Pro-ready",
    description: "Secure by default",
    icon: Star,
    iconBgClassName: "bg-red-500/10",
    iconClassName: "text-red-600",
  },
] as const;

const proHighlights: readonly LandingSectionItem[] = [
  {
    title: "MFA + step-up auth",
    description: "Protect sensitive actions with TOTP, SMS OTP, backup codes, and re-auth flows.",
    icon: Lock,
  },
  {
    title: "Admin + roles/entitlements",
    description: "Pluggable role and entitlement resolvers to match your billing or org model.",
    icon: KeyRound,
  },
  {
    title: "Audit logging",
    description: "A consistent audit trail for security-critical events and admin actions.",
    icon: BadgeCheck,
  },
  {
    title: "Pro-ready primitives",
    description: "Everything you need for a production-grade authentication system.",
    icon: Shield,
  },
] as const;

const whyItShipsFast: readonly LandingSectionItem[] = [
  {
    title: "Server-first primitives",
    description: "Centralized auth helpers for Server Actions, Route Handlers, and Server Components.",
    icon: Boxes,
  },
  {
    title: "Reasonable defaults",
    description: "Secure flows, validated env, and guardrails that prevent footguns.",
    icon: Shield,
  },
  {
    title: "Docs built for devs + LLMs",
    description: "Clear entry points and integration guides so you can customize quickly.",
    icon: BookOpen,
  },
  {
    title: "Minutes to running",
    description: "Install, migrate, and start shipping without weeks of auth plumbing.",
    icon: Timer,
  },
] as const;

export default function HomePage(): React.JSX.Element {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-500/10 rounded-full blur-xl animate-pulse delay-500" />
      <div className="absolute bottom-20 right-10 w-28 h-28 bg-red-500/10 rounded-full blur-xl animate-pulse delay-1500" />

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium">Ship auth that feels premium, not bolted-on</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          Production-ready auth, profiles, and security for Next.js
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
          Launch faster with a secure-by-default foundation: complete auth flows, Pro-grade controls, and clean entry points you can extend.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              Get started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link
              href="https://github.com/Dendro-X0/next-better-auth-starterkit-pro/blob/main/docs/README.md"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Read the documentation"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Read docs
            </Link>
          </Button>
        </div>
        <div className="mt-14 w-full max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {heroPills.map((pill: LandingCard) => (
              <div key={pill.title} className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className={`w-10 h-10 rounded-full ${pill.iconBgClassName} flex items-center justify-center`}>
                  <pill.icon className={`w-5 h-5 ${pill.iconClassName}`} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">{pill.title}</div>
                  <div className="text-sm text-muted-foreground">{pill.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 w-full max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="rounded-xl bg-card/40 border border-border/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold">Pro security & access control</h2>
              </div>
              <div className="grid gap-4">
                {proHighlights.map((item: LandingSectionItem) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="mt-0.5 w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-foreground/80" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-card/40 border border-border/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold">Designed to ship fast</h2>
              </div>
              <div className="grid gap-4">
                {whyItShipsFast.map((item: LandingSectionItem) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="mt-0.5 w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-foreground/80" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 w-full max-w-5xl rounded-xl bg-card/40 border border-border/50 backdrop-blur-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
            <div>
              <div className="text-sm text-muted-foreground">Want to integrate the headless auth core into an existing app?</div>
              <div className="text-lg font-semibold">Start with the integration guide and the resolver entry points.</div>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/examples/headless">
                Integration guide
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}