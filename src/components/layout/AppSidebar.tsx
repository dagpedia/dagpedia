"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "@/components/layout/SearchCommand";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NAV_ITEMS, isNavActive } from "@/lib/nav";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 1.005 0 1.23.405 1.23.405.36-.105 1.185-.45 2.31-.45.855 0 1.71.12 2.385.45 0 0 .225-.405 1.23-.405.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <aside className="fixed top-0 left-0 z-50 flex h-svh w-52 flex-col border-r bg-background">
        <div className="flex flex-col gap-2 p-3 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between text-sm text-muted-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              Search...
            </span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
              ⌘K
            </kbd>
          </Button>

          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ label, href }) => (
              <Button
                key={href}
                variant={isNavActive(pathname, href) ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                render={<Link href={href} />}
              >
                {label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            disabled
            title="GitHub sign-in coming soon"
          >
            <GitHubIcon className="size-3.5" />
            Sign in with GitHub to Contribute
          </Button>
          <ThemeToggle />
        </div>
      </aside>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
