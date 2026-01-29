import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <section role="region" aria-label="Authentication" className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  )
}
