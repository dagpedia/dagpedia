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
import { ContributorsPanel } from "./ContributorsPanel";
import { DagCanvas } from "./DagCanvas";
import { EdgeList } from "./EdgeList";
import { KeywordsPanel } from "./KeywordsPanel";
import { NodeList } from "./NodeList";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { VersionPanel } from "./VersionPanel";
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
    <>
      <EdgeList
        edges={data.edges}
        nodes={data.nodes}
        highlightedEdgeKey={hoveredEdgeKey}
        onEdgeHover={onEdgeHover}
      />
      <ConditionalIndep items={data.conditionalIndependencies} divided />
    </>
  );

  const nodeList = (
    <NodeList
      nodes={data.nodes}
      exposureId={data.exposure}
      outcomeId={data.outcome}
      highlightedNodeId={hoveredNodeId}
      onNodeHover={onNodeHover}
    />
  );

  const metadataSection = (
    <>
      <AdjustmentSets sets={data.adjustmentSets} nodes={data.nodes} />
      <Separator />
      <VersionPanel
        version={data.version}
        updatedAt={data.updatedAt}
        status={data.workflowStatus}
        slug={data.slug}
      />
      <Separator />
      <ContributorsPanel contributors={data.contributors} />
      {data.alternativeDags.length > 0 && (
        <>
          <Separator />
          <AlternativeDags items={data.alternativeDags} />
        </>
      )}
      {data.tags.length > 0 && (
        <>
          <Separator />
          <KeywordsPanel tags={data.tags} />
        </>
      )}
    </>
  );

  const mobileScrollContent = (
    <>
      {edgesSection}
      <Separator />
      {nodeList}
      <Separator />
      {metadataSection}
      {data.body.trim() && (
        <section className="border-t px-4 pt-6">
          <MarkdownBody body={data.body} />
        </section>
      )}
      {data.references.length > 0 && (
        <section className="border-t px-4 pt-6">
          <h2 className="mb-3 text-xl font-semibold">References</h2>
          <ul className="space-y-2 text-base text-muted-foreground">
            {data.references.map((ref, i) => (
              <li key={i}>
                {ref.citation}
                {ref.doi && (
                  <>
                    {" "}
                    <a
                      href={`https://doi.org/${ref.doi}`}
                      className="text-brand hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      DOI
                    </a>
                  </>
                )}
                {ref.pmid && (
                  <>
                    {" "}
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                      className="text-brand hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PubMed
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <SiteFooter />
    </>
  );

  return (
    <article
      className={cn(
        "w-full",
        isDesktop ? "space-y-4" : "flex h-full min-h-0 flex-col"
      )}
    >
      <div
        className={cn(
          isDesktop && "lg:h-[calc(100svh-2.75rem-1rem)] lg:shrink-0",
          !isDesktop && "flex min-h-0 flex-1 flex-col"
        )}
      >
        {!isDesktop ? (
          <ResizablePanelGroup
            orientation="vertical"
            className="min-h-0 flex-1"
          >
            <ResizablePanel defaultSize="40%" minSize="20%">
              <div className="flex h-full min-h-[160px] flex-col pb-1.5">
                <div className="min-h-0 flex-1 overflow-hidden rounded-xl border bg-card">
                  <DagCanvas {...dagCanvasProps} />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="60%" minSize="25%">
              <div className="flex h-full min-h-0 flex-col pt-1.5">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
                    {mobileScrollContent}
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full min-h-[560px] overflow-hidden rounded-xl border bg-card lg:min-h-0"
          >
          <ResizablePanel defaultSize="65%" minSize="40%">
            <ResizablePanelGroup orientation="vertical" className="h-full">
              <ResizablePanel defaultSize="55%" minSize="25%">
                <div className="h-full min-h-[240px] p-0 lg:min-h-0">
                  <DagCanvas {...dagCanvasProps} />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize="45%" minSize="20%">
                <div className="flex h-full flex-col overflow-y-auto">
                  {edgesSection}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="35%" minSize="22%" maxSize="50%">
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
                <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain">
                  {metadataSection}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {isDesktop && data.body.trim() && (
        <section className="border-t pt-6">
          <MarkdownBody body={data.body} />
        </section>
      )}

      {isDesktop && data.references.length > 0 && (
        <section className="border-t pt-6">
          <h2 className="mb-3 text-xl font-semibold">References</h2>
          <ul className="space-y-2 text-base text-muted-foreground">
            {data.references.map((ref, i) => (
              <li key={i}>
                {ref.citation}
                {ref.doi && (
                  <>
                    {" "}
                    <a
                      href={`https://doi.org/${ref.doi}`}
                      className="text-brand hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      DOI
                    </a>
                  </>
                )}
                {ref.pmid && (
                  <>
                    {" "}
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                      className="text-brand hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PubMed
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
