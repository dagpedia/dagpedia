import { Badge } from "@/components/ui/badge";
import { PanelCard } from "./PanelCard";

export function KeywordsPanel({
  keywords,
  divided = false,
  bare = false,
}: {
  keywords: string[];
  divided?: boolean;
  bare?: boolean;
}) {
  if (keywords.length === 0) return null;

  return (
    <PanelCard title="Keywords" divided={divided} bare={bare}>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((keyword) => (
          <Badge key={keyword} variant="secondary" className="text-xs">
            {keyword}
          </Badge>
        ))}
      </div>
    </PanelCard>
  );
}
