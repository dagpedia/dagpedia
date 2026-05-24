/**
 * POST /api/candidates/[id]/submit-pr
 * Create a PR in dagpedia/dagpedia for an approved candidate.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentLogin } from "@/auth";
import { getCandidate } from "@/lib/db/queries/candidates";
import { getSource } from "@/lib/db/queries/sources";
import { createPrSubmission, getPrByCandidate } from "@/lib/db/queries/submissions";
import { createDagPr } from "@/lib/github/pr";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const login = await getCurrentLogin();
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  if (candidate.status !== "approved") {
    return NextResponse.json(
      { error: "Candidate must be approved before submitting a PR" },
      { status: 400 }
    );
  }

  // Check if already submitted
  const existingPr = await getPrByCandidate(id);
  if (existingPr && existingPr.status === "open") {
    return NextResponse.json(
      { error: "PR already submitted", prUrl: existingPr.prUrl },
      { status: 409 }
    );
  }

  // Get source paper info (if available)
  const source = candidate.sourceId ? await getSource(candidate.sourceId) : null;

  try {
    const result = await createDagPr(candidate, source, login);

    const submission = await createPrSubmission({
      candidateId: id,
      prNumber: result.prNumber,
      prUrl: result.prUrl,
      branchName: result.branchName,
      submittedBy: login,
    });

    return NextResponse.json({ submission, prUrl: result.prUrl }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to create PR", details: message },
      { status: 500 }
    );
  }
}
