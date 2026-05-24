import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentLogin } from "@/auth";
import { createSource, listSources } from "@/lib/db/queries/sources";
import { fetchPaperByDoi, fetchPaperByPmid } from "@/lib/extractor/paper-fetch";

const createSourceSchema = z.discriminatedUnion("sourceType", [
  z.object({
    sourceType: z.literal("manual"),
    doi: z.string().optional(),
    url: z.string().url().optional(),
    pmid: z.string().optional(),
  }),
  z.object({
    sourceType: z.literal("file_import"),
    title: z.string(),
    dagitty: z.string(),
  }),
]);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const sources = await listSources(limit, offset);
  return NextResponse.json({ sources });
}

export async function POST(req: NextRequest) {
  const login = await getCurrentLogin();
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.sourceType === "manual") {
    // Fetch metadata from DOI/PMID
    let paperMeta = null;
    if (data.doi) {
      try {
        paperMeta = await fetchPaperByDoi(data.doi);
      } catch {
        // Non-fatal: store URL/DOI without metadata
      }
    } else if (data.pmid) {
      try {
        paperMeta = await fetchPaperByPmid(data.pmid);
      } catch {}
    }

    const source = await createSource({
      sourceType: "manual",
      doi: data.doi ?? paperMeta?.doi,
      pmid: data.pmid ?? paperMeta?.pmid,
      url: data.url,
      title: paperMeta?.title,
      abstract: paperMeta?.abstract,
      submittedBy: login,
    });

    return NextResponse.json({ source }, { status: 201 });
  }

  // file_import
  return NextResponse.json({ error: "File import not yet implemented" }, { status: 501 });
}
