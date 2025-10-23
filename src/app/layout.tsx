import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppWithQueryClient } from "@/hooks/use-session";
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "sonner";
import { RouteToasts } from "@/components/user/route-toasts";
import { DevEnvWarning } from "@/components/dev-env-warning";
import { Suspense } from "react";
import { WebVitals } from "@/components/analytics/web-vitals";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Auth Boilerplate",
  description: "A modern authentication boilerplate built with Next.js and shadcn/ui",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppWithQueryClient>
            <DevEnvWarning />
            <div className="min-h-screen flex flex-col bg-background">
              <Header />
              <main id="main-content" tabIndex={-1} className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
            <Suspense>
              <RouteToasts />
            </Suspense>
            <WebVitals />
          </AppWithQueryClient>
        </ThemeProvider>
      </body>
    </html>
  )
}
