import { cn } from "@/lib/utils";

export function DagpediaLogoText({ className }: { className?: string }) {
  return (
    <span className={cn("dagpedia-logo text-base leading-none", className)}>
      DAGpedia
    </span>
  );
}
