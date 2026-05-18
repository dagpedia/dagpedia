"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ResizableSplitProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultRightWidth?: number;
  minRightWidth?: number;
  /** Max right panel width as a fraction of the split container (default 50%). */
  maxRightRatio?: number;
  minLeftWidth?: number;
  className?: string;
};

export function ResizableSplit({
  left,
  right,
  defaultRightWidth = 300,
  minRightWidth = 220,
  maxRightRatio = 0.5,
  minLeftWidth = 360,
  className,
}: ResizableSplitProps) {
  const [rightWidth, setRightWidth] = useState(defaultRightWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const next = rect.right - event.clientX;
      const maxByLeft = rect.width - minLeftWidth - 8;
      const maxByRatio = rect.width * maxRightRatio;
      setRightWidth(
        Math.min(maxByRatio, maxByLeft, Math.max(minRightWidth, next))
      );
    },
    [maxRightRatio, minLeftWidth, minRightWidth]
  );

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    const onPointerUp = () => stopDragging();
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, stopDragging]);

  const startDragging = (event: React.PointerEvent) => {
    event.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div
      ref={containerRef}
      className={cn("flex min-h-[520px] w-full items-stretch gap-0", className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden">
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        onPointerDown={startDragging}
        className="group mx-1 flex w-2 shrink-0 cursor-col-resize items-stretch justify-center"
      >
        <div className="w-px bg-border transition-colors group-hover:bg-foreground/30 group-active:bg-foreground/50" />
      </div>
      <aside
        className="flex shrink-0 flex-col gap-3 overflow-y-auto"
        style={{ width: rightWidth }}
      >
        {right}
      </aside>
    </div>
  );
}
