import { Badge } from "@/components/ui/badge";
import { PanelCard } from "./PanelCard";
import type { LabeledSlug } from "@/types/dag";

export function KeywordsPanel({
  keywords,
  divided = false,
  bare = false,
}: {
  keywords: LabeledSlug[];
  divided?: boolean;
  bare?: boolean;
}) {
  if (keywords.length === 0) return null;

  return (
    <PanelCard title="Keywords" divided={divided} bare={bare}>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((keyword) => (
          <Badge key={keyword.id} variant="secondary" className="text-xs">
            {keyword.label}
          </Badge>
        ))}
      </div>
    </PanelCard>
  );
}
