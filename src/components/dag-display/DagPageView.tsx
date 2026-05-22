"use client";

import { useState } from "react";
import { MarkdownBody } from "@/components/MarkdownBody";
import { useIsLgUp } from "@/hooks/use-media-query";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { AdjustmentSets } from "./AdjustmentSets";
import { AlternativeDags } from "./AlternativeDags";
import { ConditionalIndep } from "./ConditionalIndep";
import { DagCanvas } from "./DagCanvas";
import { EdgeList } from "./EdgeList";
import { EdgesAndConditionalIndep } from "./EdgesAndConditionalIndep";
import { KeywordsPanel } from "./KeywordsPanel";
import { MobileDetailAccordion } from "./MobileDetailAccordion";
import { NodeList } from "./NodeList";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { cn } from "@/lib/utils";
import type { DagPageData } from "@/types/dag";

export function DagPageView({ data }: { data: DagPageData }) {
  const isDesktop = useIsLgUp();
  const [hoveredEdgeKey, setHoveredEdgeKey] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const onEdgeHover = (key: string | null) => {
    setHoveredEdgeKey(key);
    if (key) setHoveredNodeId(null);
  };

  const onNodeHover = (id: string | null) => {
    setHoveredNodeId(id);
    if (id) setHoveredEdgeKey(null);
  };

  const dagCanvasProps = {
    nodes: data.nodes,
    edges: data.edges,
    exposure: data.exposure,
    outcome: data.outcome,
    highlightedEdgeKey: hoveredEdgeKey,
    highlightedNodeId: hoveredNodeId,
    onEdgeHover,
    onNodeHover,
  };

  const edgesSection = (
    <EdgesAndConditionalIndep
      edges={data.edges}
      nodes={data.nodes}
      conditionalIndependencies={data.conditionalIndependencies}
      highlightedEdgeKey={hoveredEdgeKey}
      onEdgeHover={onEdgeHover}
    />
  );

  const metadataScrollSection = (
    <>
      <AdjustmentSets sets={data.adjustmentSets} nodes={data.nodes} />
      {data.alternativeDags.length > 0 && (
        <>
          <Separator />
          <AlternativeDags items={data.alternativeDags} />
        </>
      )}
      {data.keywords.length > 0 && (
        <>
          <Separator />
          <KeywordsPanel keywords={data.keywords} />
        </>
      )}
    </>
  );

  const mobileAccordionSections = [
    {
      value: "edges",
      title: "Edges",
      content: (
        <EdgeList
          bare
          edges={data.edges}
          nodes={data.nodes}
          highlightedEdgeKey={hoveredEdgeKey}
          onEdgeHover={onEdgeHover}
        />
      ),
    },
    {
      value: "conditional-indep",
      title: "Conditional independencies",
      content: (
        <ConditionalIndep bare items={data.conditionalIndependencies} />
      ),
    },
    {
      value: "nodes",
      title: `Nodes (${data.nodes.length})`,
      content: (
        <NodeList
          bare
          nodes={data.nodes}
          exposureId={data.exposure}
          outcomeId={data.outcome}
          highlightedNodeId={hoveredNodeId}
          onNodeHover={onNodeHover}
        />
      ),
    },
    {
      value: "adjustment-sets",
      title: "Adjustment sets",
      content: (
        <AdjustmentSets bare sets={data.adjustmentSets} nodes={data.nodes} />
      ),
    },
    ...(data.alternativeDags.length > 0
      ? [
          {
            value: "alternative-dags",
            title: "Alternative DAGs",
            content: <AlternativeDags bare items={data.alternativeDags} />,
          },
        ]
      : []),
    ...(data.keywords.length > 0
      ? [
          {
            value: "keywords",
            title: "Keywords",
            content: <KeywordsPanel bare keywords={data.keywords} />,
          },
        ]
      : []),
    ...(data.body.trim()
      ? [
          {
            value: "description",
            title: "Description",
            content: <MarkdownBody body={data.body} />,
          },
        ]
      : []),
  ];

  const desktopWorkspace = (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full min-h-0 overflow-hidden rounded-xl border bg-card"
    >
      <ResizablePanel defaultSize="67%" minSize="40%">
        <ResizablePanelGroup orientation="vertical" className="h-full">
          <ResizablePanel defaultSize="50%" minSize="25%">
            <div className="h-full min-h-[240px] p-0 lg:min-h-0">
              <DagCanvas {...dagCanvasProps} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%" minSize="20%">
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              {edgesSection}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="33%" minSize="22%" maxSize="50%">
        <ResizablePanelGroup orientation="vertical" className="h-full">
          <ResizablePanel defaultSize="50%" minSize="20%">
            <div className="h-full min-h-0 overflow-hidden">
              <NodeList
                fill
                nodes={data.nodes}
                exposureId={data.exposure}
                outcomeId={data.outcome}
                highlightedNodeId={hoveredNodeId}
                onNodeHover={onNodeHover}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%" minSize="20%">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {metadataScrollSection}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  const mobileScrollContent = (
    <>
      <MobileDetailAccordion sections={mobileAccordionSections} />
      <SiteFooter />
    </>
  );

  const hasDesktopScrollBelow = data.body.trim().length > 0;

  return (
    <article
      className={cn(
        "w-full",
        isDesktop
          ? cn(
              hasDesktopScrollBelow
                ? "min-h-full"
                : "grid h-full min-h-0 grid-rows-[minmax(0,1fr)]"
            )
          : "flex h-full min-h-0 flex-col"
      )}
    >
      <div
        className={cn(
          "min-h-0 overflow-hidden",
          isDesktop &&
            hasDesktopScrollBelow &&
            "h-[calc(100svh-var(--dag-topbar-h)-var(--dag-meta-bar-h)-var(--dag-content-pb))] shrink-0",
          isDesktop && !hasDesktopScrollBelow && "h-full",
          !isDesktop && "flex min-h-0 flex-1 flex-col"
        )}
      >
        {!isDesktop ? (
          <ResizablePanelGroup
            orientation="vertical"
            className="min-h-0 flex-1"
          >
            <ResizablePanel defaultSize="50%" minSize="20%">
              <div className="flex h-full min-h-[160px] flex-col pb-1">
                <div className="min-h-0 flex-1 overflow-hidden rounded-xl border bg-card">
                  <DagCanvas {...dagCanvasProps} />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="50%" minSize="25%">
              <div className="flex h-full min-h-0 flex-col pt-1">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
                    {mobileScrollContent}
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-full min-h-0">{desktopWorkspace}</div>
        )}
      </div>

      {isDesktop && hasDesktopScrollBelow && (
        <div className="mt-4 space-y-4">
          <section className="border-t pt-6">
            <MarkdownBody body={data.body} />
          </section>
        </div>
      )}

      {isDesktop && <SiteFooter />}
    </article>
  );
}
