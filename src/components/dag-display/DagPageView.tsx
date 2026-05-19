"use client";

import { useState } from "react";
import { MarkdownBody } from "@/components/MarkdownBody";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { AdjustmentSets } from "./AdjustmentSets";
import { AlternativeDags } from "./AlternativeDags";
import { ConditionalIndep } from "./ConditionalIndep";
import { ContributorsPanel } from "./ContributorsPanel";
import { DagCanvas } from "./DagCanvas";
import { EdgeList } from "./EdgeList";
import { KeywordsPanel } from "./KeywordsPanel";
import { NodeList } from "./NodeList";
import { VersionPanel } from "./VersionPanel";
import type { DagPageData } from "@/types/dag";

export function DagPageView({ data }: { data: DagPageData }) {
  const [hoveredEdgeKey, setHoveredEdgeKey] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  return (
    <article className="w-full space-y-4">
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-[560px] rounded-xl border"
      >
        <ResizablePanel defaultSize="65%" minSize="40%">
          <ResizablePanelGroup orientation="vertical" className="h-full">
            <ResizablePanel defaultSize="55%" minSize="25%">
              <div className="h-full min-h-[240px] p-2">
                <DagCanvas
                  nodes={data.nodes}
                  edges={data.edges}
                  exposure={data.exposure}
                  outcome={data.outcome}
                  highlightedEdgeKey={hoveredEdgeKey}
                  highlightedNodeId={hoveredNodeId}
                  onEdgeHover={(key) => {
                    setHoveredEdgeKey(key);
                    if (key) setHoveredNodeId(null);
                  }}
                  onNodeHover={(id) => {
                    setHoveredNodeId(id);
                    if (id) setHoveredEdgeKey(null);
                  }}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="45%" minSize="20%">
              <div className="flex h-full flex-col gap-4 overflow-y-auto p-2">
                <EdgeList
                  edges={data.edges}
                  nodes={data.nodes}
                  highlightedEdgeKey={hoveredEdgeKey}
                />
                <ConditionalIndep items={data.conditionalIndependencies} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="35%" minSize="22%" maxSize="50%">
          <div className="flex h-full flex-col gap-3 overflow-y-auto p-2">
            <NodeList
              nodes={data.nodes}
              exposureId={data.exposure}
              outcomeId={data.outcome}
              highlightedNodeId={hoveredNodeId}
            />
            <AdjustmentSets sets={data.adjustmentSets} nodes={data.nodes} />
            <VersionPanel
              version={data.version}
              updatedAt={data.updatedAt}
              status={data.workflowStatus}
              slug={data.slug}
            />
            <ContributorsPanel contributors={data.contributors} />
            <AlternativeDags items={data.alternativeDags} />
            <KeywordsPanel tags={data.tags} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {data.body.trim() && (
        <section className="border-t pt-6">
          <MarkdownBody body={data.body} />
        </section>
      )}

      {data.references.length > 0 && (
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
