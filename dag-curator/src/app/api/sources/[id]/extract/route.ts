/**
 * POST /api/sources/[id]/extract
 * Trigger LLM extraction for a source paper.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentLogin } from "@/auth";
import { getSource, updateSourceStatus } from "@/lib/db/queries/sources";
import { createCandidate } from "@/lib/db/queries/candidates";
import { extractDagFromPaper } from "@/lib/extractor/claude";
import {
  fetchPaperByDoi,
  fetchPaperByPmid,
  fetchOpenAccessText,
} from "@/lib/extractor/paper-fetch";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const login = await getCurrentLogin();
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const source = await getSource(id);
  if (!source) return NextResponse.json({ error: "Source not found" }, { status: 404 });

  if (source.status === "processing") {
    return NextResponse.json({ error: "Already processing" }, { status: 409 });
  }

  await updateSourceStatus(id, "processing");

  try {
    // Build paper context
    let abstract = source.abstract ?? undefined;
    let fullText: string | undefined;

    // Re-fetch if we don't have an abstract
    if (!abstract) {
      if (source.doi) {
        const meta = await fetchPaperByDoi(source.doi);
        abstract = meta.abstract;
        // Try to fetch full text
        if (meta.openAccessUrl) {
          fullText = await fetchOpenAccessText(meta.openAccessUrl).catch(() => undefined);
        }
      } else if (source.pmid) {
        const meta = await fetchPaperByPmid(source.pmid);
        abstract = meta.abstract;
        if (meta.openAccessUrl) {
          fullText = await fetchOpenAccessText(meta.openAccessUrl).catch(() => undefined);
        }
      }
    }

    const result = await extractDagFromPaper({
      abstract,
      fullText,
      doi: source.doi ?? undefined,
      title: source.title ?? undefined,
    });

    if (!result) {
      await updateSourceStatus(id, "skipped", "LLM could not identify a DAG");
      return NextResponse.json({
        status: "skipped",
        message: "No DAG found in paper",
      });
    }

    // Create candidate
    const candidate = await createCandidate({
      sourceId: id,
      dagId: result.dagId,
      title: result.title,
      dagitty: result.dagitty,
      evidence: JSON.stringify(result.evidence),
      context: JSON.stringify(result.context),
      keywords: JSON.stringify(result.keywords),
      body: result.body,
      extractionModel: result.model,
      extractionPromptVersion: result.promptVersion,
      submittedBy: login,
    });

    await updateSourceStatus(id, "extracted");

    return NextResponse.json({ status: "extracted", candidateId: candidate.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateSourceStatus(id, "failed", message);
    return NextResponse.json({ error: "Extraction failed", details: message }, { status: 500 });
  }
}
