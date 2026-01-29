"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";

interface SidebarProps {
  sections: {
    title: string;
    url: string;
  }[];
}

export function Sidebar({ sections }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 shrink-0 py-10 pr-10">
      <nav className="flex flex-col space-y-2">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.url}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium",
              pathname === section.url.split("#")[0]
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            {section.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
