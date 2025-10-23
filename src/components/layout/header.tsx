import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserNav } from "@/components/user/user-nav";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Accessible name matches visible text to avoid label-content-name-mismatch */}
        <Link href="/" className="text-xl font-bold">
          AuthBoilerplate
        </Link>
        <nav aria-label="Primary" className="flex items-center space-x-4">
          <ThemeToggle />
          <UserNav />
        </nav>
      </div>
    </header>
  );
}
