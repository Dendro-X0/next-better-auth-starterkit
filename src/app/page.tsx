import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users, Shield, Zap } from 'lucide-react';

export default function HomePage() {
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
          <span className="text-sm font-medium">Powered by Next.js, Drizzle & Better-Auth</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          Production-Ready Authentication for Your Next.js App
        </h1>

        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
          A feature-complete, secure, and beautiful authentication boilerplate. Get started in minutes, not weeks.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="https://github.com/Dendro-X0/next-better-auth-starter" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              View on GitHub
            </Link>
          </Button>
        </div>

        <div className="mt-20 w-full max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Next.js 16</div>
                <div className="text-sm text-muted-foreground">Built on App Router</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Better-Auth</div>
                <div className="text-sm text-muted-foreground">Robust & type-safe</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Drizzle ORM</div>
                <div className="text-sm text-muted-foreground">Modern & type-safe</div>
              </div>
            </div>

             <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Customizable</div>
                <div className="text-sm text-muted-foreground">Adapt to your brand</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};