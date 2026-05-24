import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentLogin } from "@/auth";
import { createCandidate, listCandidates } from "@/lib/db/queries/candidates";

const statusFilter = z.array(
  z.enum(["draft", "reviewing", "approved", "rejected", "submitted", "merged", "closed"])
);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const statusParam = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  let status: typeof statusFilter._type | undefined;
  if (statusParam) {
    const parsed = statusFilter.safeParse(statusParam.split(","));
    if (parsed.success) status = parsed.data;
  }

  const candidates = await listCandidates({ status, limit, offset });
  return NextResponse.json({ candidates });
}

export async function POST(req: NextRequest) {
  const login = await getCurrentLogin();
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const schema = z.object({
    dagId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: z.string().min(1).max(80),
    dagitty: z.string().min(10),
    evidence: z.record(z.string()),
    context: z.object({
      population: z.string(),
      geographic: z.string(),
      era: z.string(),
      note: z.string().optional(),
    }),
    keywords: z.array(z.string()).min(1),
    body: z.string().optional(),
    sourceId: z.string().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const candidate = await createCandidate({
    sourceId: data.sourceId ?? null,
    dagId: data.dagId,
    title: data.title,
    dagitty: data.dagitty,
    evidence: JSON.stringify(data.evidence),
    context: JSON.stringify(data.context),
    keywords: JSON.stringify(data.keywords),
    body: data.body ?? "",
    submittedBy: login,
  });

  return NextResponse.json({ candidate }, { status: 201 });
}
