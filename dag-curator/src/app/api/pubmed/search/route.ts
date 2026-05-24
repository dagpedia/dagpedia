import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentLogin } from "@/auth";
import { searchPubMed } from "@/lib/pubmed/search";
import { sourceExistsByPmid, createSource } from "@/lib/db/queries/sources";

export async function POST(req: NextRequest) {
  const login = await getCurrentLogin();
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = z
    .object({ query: z.string().min(3), maxResults: z.number().int().min(1).max(50).default(10) })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { query, maxResults } = parsed.data;

  const results = await searchPubMed(query, maxResults);

  // Auto-add new results as sources
  const added: string[] = [];
  const skipped: string[] = [];

  for (const paper of results) {
    const exists = await sourceExistsByPmid(paper.pmid);
    if (exists) {
      skipped.push(paper.pmid);
      continue;
    }
    await createSource({
      sourceType: "pubmed",
      pmid: paper.pmid,
      doi: paper.doi,
      title: paper.title,
      submittedBy: login,
    });
    added.push(paper.pmid);
  }

  return NextResponse.json({ results, added, skipped });
}
