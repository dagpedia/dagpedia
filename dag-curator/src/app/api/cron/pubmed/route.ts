/**
 * GET /api/cron/pubmed
 * Vercel Cron — runs all enabled PubMed searches and adds new sources.
 * Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pubmedSearches, sources } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { searchPubMed } from "@/lib/pubmed/search";
import { sourceExistsByPmid, createSource } from "@/lib/db/queries/sources";
import { createId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Load all enabled searches
  const searches = await db.query.pubmedSearches.findMany({
    where: eq(pubmedSearches.enabled, true),
  });

  if (searches.length === 0) {
    return NextResponse.json({ message: "No enabled searches", added: 0 });
  }

  let totalAdded = 0;
  const details: Array<{ query: string; added: number; error?: string }> = [];

  for (const search of searches) {
    try {
      const results = await searchPubMed(search.query, 20);
      let added = 0;

      for (const paper of results) {
        const exists = await sourceExistsByPmid(paper.pmid);
        if (!exists) {
          await createSource({
            sourceType: "pubmed",
            pmid: paper.pmid,
            doi: paper.doi,
            title: paper.title,
            submittedBy: "cron",
          });
          added++;
          totalAdded++;
        }
      }

      // Update last_run_at
      await db
        .update(pubmedSearches)
        .set({ lastRunAt: new Date() })
        .where(eq(pubmedSearches.id, search.id));

      details.push({ query: search.query, added });
    } catch (err) {
      details.push({
        query: search.query,
        added: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log(`[cron/pubmed] Ran ${searches.length} searches, added ${totalAdded} sources`);

  return NextResponse.json({
    ran: searches.length,
    totalAdded,
    details,
    timestamp: new Date().toISOString(),
  });
}
