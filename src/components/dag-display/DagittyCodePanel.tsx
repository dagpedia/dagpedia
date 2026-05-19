"use client";

import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function DagittyCodePanel() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-fit shrink-0"
      onClick={toggleSidebar}
    >
      <Code2 className="size-3.5" />
      {open ? "Hide daggity code" : "Show daggity code"}
    </Button>
  );
}
