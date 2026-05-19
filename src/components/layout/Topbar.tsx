"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContributeDropdown } from "@/components/layout/ContributeDropdown";
import { DagLogoIcon } from "@/components/layout/DagLogoIcon";
import { SearchCommand } from "@/components/layout/SearchCommand";
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

export function Topbar() {
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
    <header className="fixed top-0 z-50 flex h-13 w-full items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
          >
            <DagLogoIcon />
            DAGpedia
          </Link>
          <Badge variant="secondary">beta</Badge>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ label, href }) => (
            <Button
              key={href}
              variant={isNavActive(pathname, href) ? "secondary" : "ghost"}
              size="sm"
              render={<Link href={href} />}
            >
              {label}
            </Button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-48 justify-between text-sm text-muted-foreground"
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

        <Button
          variant="ghost"
          size="icon"
          render={
            <a
              href="https://github.com/dagpedia/dagpedia"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <GitHubIcon className="h-4 w-4" />
          <span className="sr-only">GitHub</span>
        </Button>

        <ContributeDropdown />
      </div>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
