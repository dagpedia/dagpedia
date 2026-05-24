import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentLogin } from "@/auth";
import { getCandidate, updateCandidate } from "@/lib/db/queries/candidates";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ candidate });
}

const patchSchema = z.object({
  dagId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
  title: z.string().min(1).max(80).optional(),
  dagitty: z.string().optional(),
  evidence: z.record(z.string()).optional(),
  context: z
    .object({
      population: z.string(),
      geographic: z.string(),
      era: z.string(),
      note: z.string().optional(),
    })
    .optional(),
  keywords: z.array(z.string()).optional(),
  body: z.string().optional(),
  status: z
    .enum(["draft", "reviewing", "approved", "rejected", "submitted", "merged", "closed"])
    .optional(),
  reviewNotes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const login = await getCurrentLogin();
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const update: Parameters<typeof updateCandidate>[1] = {};

  if (data.dagId !== undefined) update.dagId = data.dagId;
  if (data.title !== undefined) update.title = data.title;
  if (data.dagitty !== undefined) update.dagitty = data.dagitty;
  if (data.evidence !== undefined) update.evidence = JSON.stringify(data.evidence);
  if (data.context !== undefined) update.context = JSON.stringify(data.context);
  if (data.keywords !== undefined) update.keywords = JSON.stringify(data.keywords);
  if (data.body !== undefined) update.body = data.body;
  if (data.status !== undefined) update.status = data.status;
  if (data.reviewNotes !== undefined) update.reviewNotes = data.reviewNotes;

  const updated = await updateCandidate(id, update);
  return NextResponse.json({ candidate: updated });
}
