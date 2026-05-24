import { eq, desc, and, inArray } from "drizzle-orm";
import { db } from "../index";
import { sources, type NewSource, type Source } from "../schema";
import { createId } from "@/lib/utils";

export async function createSource(data: Omit<NewSource, "id">): Promise<Source> {
  const [row] = await db
    .insert(sources)
    .values({ id: createId(), ...data })
    .returning();
  return row;
}

export async function getSource(id: string): Promise<Source | undefined> {
  return db.query.sources.findFirst({ where: eq(sources.id, id) });
}

export async function listSources(limit = 50, offset = 0): Promise<Source[]> {
  return db.query.sources.findMany({
    orderBy: desc(sources.createdAt),
    limit,
    offset,
  });
}

export async function updateSourceStatus(
  id: string,
  status: Source["status"],
  errorMessage?: string
): Promise<void> {
  await db
    .update(sources)
    .set({
      status,
      errorMessage: errorMessage ?? null,
      processedAt: status === "extracted" || status === "failed" ? new Date() : undefined,
    })
    .where(eq(sources.id, id));
}

export async function sourceExistsByDoi(doi: string): Promise<boolean> {
  const row = await db.query.sources.findFirst({
    where: eq(sources.doi, doi),
    columns: { id: true },
  });
  return !!row;
}

export async function sourceExistsByPmid(pmid: string): Promise<boolean> {
  const row = await db.query.sources.findFirst({
    where: eq(sources.pmid, pmid),
    columns: { id: true },
  });
  return !!row;
}

export async function getPendingSources(limit = 10): Promise<Source[]> {
  return db.query.sources.findMany({
    where: inArray(sources.status, ["pending"]),
    orderBy: desc(sources.createdAt),
    limit,
  });
}

export async function countSourcesByStatus(): Promise<Record<string, number>> {
  const rows = await db.select().from(sources);
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

export async function deleteSource(id: string): Promise<void> {
  await db.delete(sources).where(eq(sources.id, id));
}
