"use client";

import Script from "next/script";
import { useState } from "react";
import { MarkdownBody } from "@/components/MarkdownBody";
import { AdjustmentSets } from "./AdjustmentSets";
import { AlternativeDags } from "./AlternativeDags";
import { ConditionalIndep } from "./ConditionalIndep";
import { ContributorsPanel } from "./ContributorsPanel";
import { DagCanvas } from "./DagCanvas";
import { DagPageHeader } from "./DagPageHeader";
import { EdgeList } from "./EdgeList";
import { KeywordsPanel } from "./KeywordsPanel";
import { NodeList } from "./NodeList";
import { VersionPanel } from "./VersionPanel";
import { useDagittyAnalysis } from "./useDagittyAnalysis";
import type { DagPageData } from "@/types/dag";

export function DagPageView({ data }: { data: DagPageData }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const exposureNode = data.nodes.find((n) => n.id === data.exposure);
  const outcomeNode = data.nodes.find((n) => n.id === data.outcome);
  const analysis = useDagittyAnalysis(
    data.dagittyCode,
    exposureNode?.label ?? data.exposure,
    outcomeNode?.label ?? data.outcome,
    scriptLoaded
  );

  return (
    <>
      <Script
        src="/vendor/dagitty.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <article className="space-y-6">
        <DagPageHeader
          title={data.title}
          exposure={{
            id: data.exposure,
            label: exposureNode?.label ?? data.exposure,
          }}
          outcome={{
            id: data.outcome,
            label: outcomeNode?.label ?? data.outcome,
          }}
          nodeCount={data.nodes.length}
          edgeCount={data.edges.length}
          tier={data.tier}
          dagType={data.dagType}
          version={data.version}
        />

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex min-w-0 flex-[2] flex-col gap-4">
            <DagCanvas
              nodes={data.nodes}
              edges={data.edges}
              exposure={data.exposure}
              outcome={data.outcome}
            />
            <EdgeList edges={data.edges} nodes={data.nodes} />
            <ConditionalIndep
              items={analysis.conditionalIndependencies}
              loading={analysis.loading}
            />
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-[220px]">
            <NodeList nodes={data.nodes} />
            <AdjustmentSets
              sets={analysis.adjustmentSets}
              nodes={data.nodes}
              loading={analysis.loading}
            />
            <VersionPanel
              version={data.version}
              updatedAt={data.updatedAt}
              status={data.workflowStatus}
              slug={data.slug}
            />
            <ContributorsPanel contributors={data.contributors} />
            <AlternativeDags items={data.alternativeDags} />
            <KeywordsPanel tags={data.tags} />
          </aside>
        </div>

        {data.body.trim() && (
          <section className="border-t pt-6">
            <MarkdownBody body={data.body} />
          </section>
        )}

        {data.references.length > 0 && (
          <section className="border-t pt-6">
            <h2 className="mb-3 text-lg font-semibold">References</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
    </>
  );
}
