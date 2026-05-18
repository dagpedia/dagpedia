"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ResizableHeightProps = {
  children: React.ReactNode;
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
};

export function ResizableHeight({
  children,
  defaultHeight = 420,
  minHeight = 280,
  maxHeight = 800,
  className,
}: ResizableHeightProps) {
  const [height, setHeight] = useState(defaultHeight);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const top = containerRef.current.getBoundingClientRect().top;
      setHeight(
        Math.min(maxHeight, Math.max(minHeight, event.clientY - top))
      );
    },
    [maxHeight, minHeight]
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
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div
      ref={containerRef}
      className={cn("flex w-full flex-col", className)}
      style={{ height }}
    >
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize DAG canvas height"
        onPointerDown={startDragging}
        className="group flex h-2 shrink-0 cursor-row-resize items-center justify-center"
      >
        <div className="h-px w-full max-w-[120px] rounded-full bg-border transition-colors group-hover:bg-foreground/30 group-active:bg-foreground/50" />
      </div>
    </div>
  );
}
