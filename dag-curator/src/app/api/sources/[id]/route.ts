import { NextRequest, NextResponse } from "next/server";
import { getSource, deleteSource } from "@/lib/db/queries/sources";
import { getCurrentLogin } from "@/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const source = await getSource(id);
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ source });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const login = await getCurrentLogin();
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const source = await getSource(id);
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteSource(id);
  return NextResponse.json({ ok: true });
}
