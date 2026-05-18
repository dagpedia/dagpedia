import Link from "next/link";
import { PanelCard } from "./PanelCard";
import type { AlternativeDag } from "@/types/dag";

export function AlternativeDags({ items }: { items: AlternativeDag[] }) {
  if (items.length === 0) return null;

  return (
    <PanelCard title="Alternative DAGs">
      <ul className="space-y-2">
        {items.map((alt) => (
          <li key={alt.slug}>
            <Link
              href={`/dags/${alt.slug}`}
              className="text-sm font-medium text-brand hover:underline"
            >
              {alt.title}
            </Link>
            <p className="text-xs text-muted-foreground">
              {alt.nodeCount > 0 && `${alt.nodeCount} nodes · `}
              {alt.note}
            </p>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
