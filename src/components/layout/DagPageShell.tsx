"use client";

import { DagittyCodeSidebarLayout } from "@/components/dag-display/DagittyCodeSidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DagTopbar } from "@/components/layout/DagTopbar";
import type { DagTier } from "@/types/dag";

interface DagPageShellProps {
  title: string;
  nodeCount: number;
  edgeCount: number;
  tier: DagTier;
  dagittyCode: string;
  children: React.ReactNode;
}

export function DagPageShell({
  title,
  nodeCount,
  edgeCount,
  tier,
  dagittyCode,
  children,
}: DagPageShellProps) {
  return (
    <DagittyCodeSidebarLayout code={dagittyCode}>
      <div className="min-h-svh w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col pl-52">
          <DagTopbar
            title={title}
            nodeCount={nodeCount}
            edgeCount={edgeCount}
            tier={tier}
          />
          <div className="min-w-0 px-4 py-6 pt-11 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </DagittyCodeSidebarLayout>
  );
}
