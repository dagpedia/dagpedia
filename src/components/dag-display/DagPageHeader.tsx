import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DagTypeBadge } from "./badges";
import type { DagType } from "@/types/dag";

interface DagPageHeaderProps {
  dagType: DagType;
}

export function DagPageHeader({ dagType }: DagPageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <DagTypeBadge dagType={dagType} />
      <Button variant="outline" size="sm" type="button" disabled>
        <Pencil className="size-3.5" />
        Edit
      </Button>
    </div>
  );
}
