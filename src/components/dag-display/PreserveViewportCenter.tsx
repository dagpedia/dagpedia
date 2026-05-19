"use client";

import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef, type RefObject } from "react";

/**
 * Keeps the same flow-coordinate point at the visual center when the
 * canvas container is resized (height split, width split, fullscreen).
 */
export function PreserveViewportCenter({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const { getViewport, setViewport } = useReactFlow();
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      const prev = sizeRef.current;

      if (prev.width === 0 || prev.height === 0) {
        sizeRef.current = { width, height };
        return;
      }

      if (prev.width === width && prev.height === height) return;

      const { x, y, zoom } = getViewport();
      const centerFlowX = (-x + prev.width / 2) / zoom;
      const centerFlowY = (-y + prev.height / 2) / zoom;

      setViewport({
        x: -centerFlowX * zoom + width / 2,
        y: -centerFlowY * zoom + height / 2,
        zoom,
      });

      sizeRef.current = { width, height };
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, getViewport, setViewport]);

  return null;
}
