import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          Built with Next.js and shadcn/ui.{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>
        </p>
      </div>
    </footer>
  )
}
