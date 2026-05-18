"use client";

import { useRouter } from "next/navigation";
import { CircleDot, GitGraph } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { SEARCH_INDEX } from "@/lib/search-index";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: Props) {
  const router = useRouter();

  function handleSelect(href: string) {
    router.push(href);
    onOpenChange(false);
  }

  const dags = SEARCH_INDEX.filter((item) => item.type === "dag");
  const nodes = SEARCH_INDEX.filter((item) => item.type === "node");

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search DAGpedia"
      description="Search DAGs and nodes"
    >
      <Command>
        <CommandInput placeholder="Search DAGs and nodes..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="DAGs">
            {dags.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.tags.join(" ")}`}
                onSelect={() => handleSelect(`/dags/${item.id}`)}
              >
                <GitGraph className="mr-2 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.exposure} → {item.outcome}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Nodes">
            {nodes.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.category}`}
                onSelect={() => handleSelect(`/nodes/${item.id}`)}
              >
                <CircleDot className="mr-2 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.category}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
