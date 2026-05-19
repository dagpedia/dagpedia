"use client";

import { Code2 } from "lucide-react";
import { useDagittyPanel } from "@/components/dag-display/DagittyPanelContext";
import { Button } from "@/components/ui/button";

export function DagittyCodePanel() {
  const { open, toggle } = useDagittyPanel();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-fit shrink-0"
      onClick={toggle}
    >
      <Code2 className="size-3.5" />
      {open ? "Hide daggity code" : "Show daggity code"}
    </Button>
  );
}
