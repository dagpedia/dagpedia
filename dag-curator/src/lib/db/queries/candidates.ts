import { eq, desc, and, inArray } from "drizzle-orm";
import { db } from "../index";
import { candidates, prSubmissions, type Candidate, type NewCandidate } from "../schema";
import { createId } from "@/lib/utils";

export async function createCandidate(data: Omit<NewCandidate, "id">): Promise<Candidate> {
  const [row] = await db
    .insert(candidates)
    .values({ id: createId(), ...data })
    .returning();
  return row;
}

export async function getCandidate(id: string): Promise<Candidate | undefined> {
  return db.query.candidates.findFirst({ where: eq(candidates.id, id) });
}

export async function listCandidates(opts?: {
  status?: Candidate["status"][];
  limit?: number;
  offset?: number;
}): Promise<Candidate[]> {
  const { status, limit = 50, offset = 0 } = opts ?? {};
  return db.query.candidates.findMany({
    where: status ? inArray(candidates.status, status) : undefined,
    orderBy: desc(candidates.createdAt),
    limit,
    offset,
  });
}

export async function updateCandidate(
  id: string,
  data: Partial<Omit<NewCandidate, "id" | "submittedBy" | "createdAt">>
): Promise<Candidate> {
  const [row] = await db
    .update(candidates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(candidates.id, id))
    .returning();
  return row;
}

export async function approveCandidate(
  id: string,
  reviewerLogin: string,
  notes?: string
): Promise<Candidate> {
  return updateCandidate(id, {
    status: "approved",
    reviewedBy: reviewerLogin,
    reviewedAt: new Date(),
    reviewNotes: notes ?? null,
  });
}

export async function rejectCandidate(
  id: string,
  reviewerLogin: string,
  notes?: string
): Promise<Candidate> {
  return updateCandidate(id, {
    status: "rejected",
    reviewedBy: reviewerLogin,
    reviewedAt: new Date(),
    reviewNotes: notes ?? null,
  });
}

export async function getCandidateWithPR(id: string) {
  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, id),
    with: { prSubmissions: true },
  });
  return candidate;
}

export async function countCandidatesByStatus(): Promise<Record<string, number>> {
  const rows = await db.select().from(candidates);
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}
