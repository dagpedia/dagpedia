import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentLogin } from "@/auth";
import { getCandidate, rejectCandidate } from "@/lib/db/queries/candidates";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const login = await getCurrentLogin();
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { notes } = z.object({ notes: z.string().optional() }).parse(body);

  const updated = await rejectCandidate(id, login, notes);
  return NextResponse.json({ candidate: updated });
}
