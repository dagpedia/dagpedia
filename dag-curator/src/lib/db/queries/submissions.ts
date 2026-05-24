import { eq, desc } from "drizzle-orm";
import { db } from "../index";
import {
  prSubmissions,
  candidates,
  type PrSubmission,
  type NewPrSubmission,
} from "../schema";
import { createId } from "@/lib/utils";

export async function createPrSubmission(
  data: Omit<NewPrSubmission, "id">
): Promise<PrSubmission> {
  const [row] = await db
    .insert(prSubmissions)
    .values({ id: createId(), ...data })
    .returning();

  // Update candidate status to "submitted"
  await db
    .update(candidates)
    .set({ status: "submitted", updatedAt: new Date() })
    .where(eq(candidates.id, data.candidateId));

  return row;
}

export async function getPrSubmission(id: string): Promise<PrSubmission | undefined> {
  return db.query.prSubmissions.findFirst({
    where: eq(prSubmissions.id, id),
  });
}

export async function listPrSubmissions(limit = 50): Promise<PrSubmission[]> {
  return db.query.prSubmissions.findMany({
    orderBy: desc(prSubmissions.submittedAt),
    limit,
  });
}

export async function updatePrStatus(
  candidateId: string,
  status: "open" | "merged" | "closed",
  mergedAt?: Date
): Promise<void> {
  const updates: Partial<PrSubmission> = { status };
  if (mergedAt) updates.mergedAt = mergedAt;

  await db
    .update(prSubmissions)
    .set(updates)
    .where(eq(prSubmissions.candidateId, candidateId));

  // Sync candidate status
  if (status === "merged") {
    await db
      .update(candidates)
      .set({ status: "merged", updatedAt: new Date() })
      .where(eq(candidates.id, candidateId));
  } else if (status === "closed") {
    await db
      .update(candidates)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(candidates.id, candidateId));
  }
}

export async function getPrByCandidate(candidateId: string): Promise<PrSubmission | undefined> {
  return db.query.prSubmissions.findFirst({
    where: eq(prSubmissions.candidateId, candidateId),
    orderBy: desc(prSubmissions.submittedAt),
  });
}
