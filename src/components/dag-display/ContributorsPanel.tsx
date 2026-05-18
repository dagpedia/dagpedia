import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PanelCard } from "./PanelCard";
import type { DagContributor } from "@/types/dag";

export function ContributorsPanel({
  contributors,
}: {
  contributors: DagContributor[];
}) {
  return (
    <PanelCard title="Contributors">
      <ul className="space-y-2">
        {contributors.map((person) => (
          <li key={person.name} className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {person.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{person.name}</p>
              {person.affiliation && (
                <p className="truncate text-xs text-muted-foreground">
                  {person.affiliation}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
