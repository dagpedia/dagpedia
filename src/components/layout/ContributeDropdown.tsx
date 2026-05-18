"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  CircleDot,
  GitGraph,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ContributeDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Contribute
            <ChevronDown className="ml-1.5 h-3 w-3 opacity-70" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          className="items-start py-2"
          render={<Link href="/contribute/dag" className="flex items-start gap-2" />}
        >
          <GitGraph className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Add a DAG</div>
            <div className="text-xs text-muted-foreground">
              Submit a new causal diagram
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="items-start py-2"
          render={<Link href="/contribute/node" className="flex items-start gap-2" />}
        >
          <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Register a node</div>
            <div className="text-xs text-muted-foreground">
              Add a variable to the node library
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="items-start py-2"
          render={
            <a
              href="https://github.com/dagpedia/dagpedia/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2"
            />
          }
        >
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Contribution guide</div>
            <div className="text-xs text-muted-foreground">
              How to contribute via PR
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
