"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Search,
  Settings,
  GitPullRequest,
  Microscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sources", label: "Sources", icon: BookOpen },
  { href: "/candidates", label: "Candidates", icon: Microscope },
  { href: "/searches", label: "PubMed Searches", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border flex flex-col bg-card">
        {/* Brand */}
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
          <GitPullRequest className="h-5 w-5 text-primary" />
          <Link href="/" className="font-semibold text-sm tracking-tight">
            DAG Curator
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <UserMenu />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
