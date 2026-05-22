"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleDot, GitGraph, Loader2 } from "lucide-react";
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
import { fetchSearchIndex, type SearchItem } from "@/lib/search-index";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || items.length > 0) return;
    setLoading(true);
    fetchSearchIndex().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [open, items.length]);

  function handleSelect(href: string) {
    router.push(href);
    onOpenChange(false);
  }

  const dags = items.filter((i) => i.type === "dag");
  const nodes = items.filter((i) => i.type === "node");

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
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          )}
          {!loading && <CommandEmpty>No results found.</CommandEmpty>}

          {dags.length > 0 && (
            <CommandGroup heading="DAGs">
              {dags.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.keywords.join(" ")}`}
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
          )}

          {nodes.length > 0 && (
            <>
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
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
