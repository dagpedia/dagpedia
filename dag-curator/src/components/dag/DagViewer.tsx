"use client";

/**
 * Client-side DAG viewer using dagitty.js
 * Adapted from dagpedia/src/components/dag/DagViewer.tsx
 */

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { getBrowserDagittyRuntime } from "@/lib/dagitty/runtime";
import {
  parseDagittyStructureFromCode,
  LAYOUT_SCALE,
} from "@/lib/dagitty/adapter";
import type { DagittyStructure } from "@/lib/dagitty/adapter";
import type { NodeRole } from "@/types/dag";

interface Props {
  dagitty: string;
  className?: string;
}

const ROLE_COLORS: Record<NodeRole | "default", string> = {
  exposure: "#0d9488",    // teal (brand)
  outcome: "#7c3aed",     // violet
  mediator: "#2563eb",    // blue
  covariate: "#6b7280",   // gray
  instrument: "#d97706",  // amber
  collider: "#dc2626",    // red
  default: "#6b7280",
};

export function DagViewer({ dagitty, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [structure, setStructure] = useState<DagittyStructure | null>(null);

  // Attempt to parse when dagitty.js loads
  useEffect(() => {
    if (!loaded) return;
    try {
      const runtime = getBrowserDagittyRuntime();
      if (!runtime) return;
      const s = parseDagittyStructureFromCode(dagitty, runtime);
      setStructure(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse error");
    }
  }, [loaded, dagitty]);

  // Draw on canvas
  useEffect(() => {
    if (!structure || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nodes = Array.from(structure.nodes.entries());
    const edges = structure.edges;

    // Layout
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const positions = new Map<string, { x: number; y: number }>();

    if (structure.hasExplicitLayout) {
      for (const [id, info] of nodes) {
        if (info.x !== undefined && info.y !== undefined) {
          positions.set(id, { x: info.x, y: info.y });
          minX = Math.min(minX, info.x);
          minY = Math.min(minY, info.y);
          maxX = Math.max(maxX, info.x);
          maxY = Math.max(maxY, info.y);
        }
      }
    } else {
      // Auto-layout: arrange in rows
      const n = nodes.length;
      const cols = Math.ceil(Math.sqrt(n));
      nodes.forEach(([id], i) => {
        const x = (i % cols) * LAYOUT_SCALE * 1.5;
        const y = Math.floor(i / cols) * LAYOUT_SCALE;
        positions.set(id, { x, y });
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      });
    }

    const PAD = 40;
    const W = Math.max(maxX - minX + PAD * 2, 200);
    const H = Math.max(maxY - minY + PAD * 2, 120);

    canvas.width = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    // Draw edges
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1.5;
    for (const edge of edges) {
      const from = positions.get(edge.from);
      const to = positions.get(edge.to);
      if (!from || !to) continue;

      const fx = from.x - minX + PAD;
      const fy = from.y - minY + PAD;
      const tx = to.x - minX + PAD;
      const ty = to.y - minY + PAD;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(ty - fy, tx - fx);
      const aLen = 8;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - aLen * Math.cos(angle - 0.4), ty - aLen * Math.sin(angle - 0.4));
      ctx.lineTo(tx - aLen * Math.cos(angle + 0.4), ty - aLen * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = "#9ca3af";
      ctx.fill();
    }

    // Draw nodes
    const R = 22;
    for (const [id, info] of nodes) {
      const pos = positions.get(id);
      if (!pos) continue;

      const x = pos.x - minX + PAD;
      const y = pos.y - minY + PAD;
      const color = ROLE_COLORS[info.role ?? "default"] ?? ROLE_COLORS.default;

      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fillStyle = color + "22";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = color;
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = id.replace(/_/g, " ");
      ctx.fillText(label.length > 12 ? label.slice(0, 11) + "…" : label, x, y);
    }
  }, [structure]);

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded p-3 text-xs text-red-600 ${className ?? ""}`}>
        DAG parse error: {error}
      </div>
    );
  }

  return (
    <>
      <Script
        src="/vendor/dagitty.js"
        onLoad={() => setLoaded(true)}
        strategy="lazyOnload"
      />
      <div className={`overflow-auto ${className ?? ""}`}>
        {!loaded && (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={loaded && structure ? "block" : "hidden"}
          style={{ maxWidth: "100%" }}
        />
      </div>
    </>
  );
}
