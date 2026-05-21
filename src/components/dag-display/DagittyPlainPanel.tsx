"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, PanelRightClose } from "lucide-react";
import { DagittyHighlightedCode } from "@/components/dag-display/DagittyHighlightedCode";
import { useDagittyPanel } from "@/components/dag-display/DagittyPanelContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DagittyPlainPanel({ code }: { code: string }) {
  const { open, setOpen, width, setWidth } = useDagittyPanel();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  const onResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;

      function onMouseMove(moveEvent: MouseEvent) {
        const delta = startX - moveEvent.clientX;
        setWidth(startWidth + delta);
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [setWidth, width]
  );

  if (!open) {
    return null;
  }

  return (
    <>
      <aside
        style={{ width, maxWidth: "100vw" }}
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex max-w-[100vw] flex-col border-l bg-background",
          "animate-in slide-in-from-right duration-200"
        )}
        aria-label="dagitty code"
      >
        <button
          type="button"
          aria-label="Resize dagitty panel"
          className="absolute top-0 left-0 z-10 h-full w-1.5 cursor-col-resize border-0 bg-transparent p-0 hover:bg-sidebar-border/80 active:bg-sidebar-border"
          onMouseDown={onResizeStart}
        />
        <header className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5">
          <span className="text-sm font-semibold tracking-tight">dagitty</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-sm"
            onClick={copyCode}
          >
            {copied ? (
              <Check className="size-3.5 text-green-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DagittyHighlightedCode code={code} />
        </div>
      </aside>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="fixed top-11 z-[60] size-8 bg-background shadow-sm"
        style={{ right: width + 16 }}
        onClick={() => setOpen(false)}
        aria-label="Close dagitty code panel"
      >
        <PanelRightClose className="size-4" />
      </Button>
    </>
  );
}
