import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const DAGPEDIA_GITHUB_URL = "https://github.com/dagpedia/dagpedia";

export function DagpediaBetaBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "dagpedia-logo h-5 px-2 text-xs font-bold tracking-normal",
        className
      )}
      render={
        <Link
          href={DAGPEDIA_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="DAGpedia repository on GitHub"
        />
      }
    >
      beta
    </Badge>
  );
}
