"use client";

import { useState } from "react";
import { Check, Copy, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function DagittyCodeSidebarClose() {
  const { open, setOpen, isMobile } = useSidebar();

  if (isMobile || !open) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="fixed top-11 right-4 z-[60] size-8 bg-background shadow-sm"
      onClick={() => setOpen(false)}
      aria-label="Close DAGitty code sidebar"
    >
      <PanelRightClose className="size-4" />
    </Button>
  );
}

function DagittyCodeSidebarPanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border pr-12">
        <div className="flex items-center justify-between gap-2 px-1 py-1">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            DAGitty
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-sm"
            onClick={copyCode}
          >
            {copied ? (
              <Check className="size-3.5 text-green-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <pre
          className={cn(
            "p-3 font-mono text-sm leading-relaxed",
            "whitespace-pre-wrap break-words text-foreground"
          )}
        >
          {code}
        </pre>
      </SidebarContent>
    </Sidebar>
  );
}

export function DagittyCodeSidebarLayout({
  code,
  children,
}: {
  code: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "28rem",
          "--sidebar-width-mobile": "18rem",
        } as React.CSSProperties
      }
    >
      {/* SidebarInset must come before Sidebar so the gap reserves space on the right, not the left. */}
      <SidebarInset className="min-w-0 bg-transparent">{children}</SidebarInset>
      <DagittyCodeSidebarPanel code={code} />
      <DagittyCodeSidebarClose />
    </SidebarProvider>
  );
}
