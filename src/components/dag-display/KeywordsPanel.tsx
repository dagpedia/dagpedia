import { Badge } from "@/components/ui/badge";
import { PanelCard } from "./PanelCard";

export function KeywordsPanel({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <PanelCard title="Keywords">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[0.65rem]">
            {tag}
          </Badge>
        ))}
      </div>
    </PanelCard>
  );
}
