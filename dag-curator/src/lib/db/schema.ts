import { sql, relations } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  index,
} from "drizzle-orm/sqlite-core";

// -----------------------------------------------
// sources — papers / files submitted for DAG extraction
// -----------------------------------------------
export const sources = sqliteTable(
  "sources",
  {
    id: text("id").primaryKey(), // cuid2
    url: text("url"),
    doi: text("doi"),
    pmid: text("pmid"),
    title: text("title"),
    abstract: text("abstract"),
    fullText: text("full_text"),
    sourceType: text("source_type", {
      enum: ["manual", "pubmed", "community", "file_import"],
    })
      .notNull()
      .default("manual"),
    status: text("status", {
      enum: ["pending", "processing", "extracted", "failed", "skipped"],
    })
      .notNull()
      .default("pending"),
    errorMessage: text("error_message"),
    submittedBy: text("submitted_by").notNull(), // GitHub login
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    processedAt: integer("processed_at", { mode: "timestamp" }),
  },
  (t) => [
    index("sources_status_idx").on(t.status),
    index("sources_doi_idx").on(t.doi),
    index("sources_pmid_idx").on(t.pmid),
  ]
);

// -----------------------------------------------
// candidates — extracted DAG drafts awaiting review
// -----------------------------------------------
export const candidates = sqliteTable(
  "candidates",
  {
    id: text("id").primaryKey(), // cuid2
    sourceId: text("source_id").references(() => sources.id, {
      onDelete: "set null",
    }),

    // dagpedia content fields
    dagId: text("dag_id").notNull(), // target kebab-case filename
    title: text("title").notNull(),
    dagitty: text("dagitty").notNull(), // dagitty DSL code
    // JSON-encoded maps/arrays stored as text
    evidence: text("evidence").notNull().default("{}"), // { "a -> b": "strong" }
    context: text("context").notNull().default("{}"), // { population, geographic, era }
    keywords: text("keywords").notNull().default("[]"), // string[]
    body: text("body").notNull().default(""), // Markdown body

    // extraction metadata
    extractionModel: text("extraction_model"),
    extractionPromptVersion: text("extraction_prompt_version"),

    // review workflow
    status: text("status", {
      enum: [
        "draft",
        "reviewing",
        "approved",
        "rejected",
        "submitted",
        "merged",
        "closed",
      ],
    })
      .notNull()
      .default("draft"),
    reviewNotes: text("review_notes"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: integer("reviewed_at", { mode: "timestamp" }),

    submittedBy: text("submitted_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("candidates_status_idx").on(t.status),
    index("candidates_source_idx").on(t.sourceId),
    index("candidates_dag_id_idx").on(t.dagId),
  ]
);

// -----------------------------------------------
// pr_submissions — GitHub PRs sent to dagpedia
// -----------------------------------------------
export const prSubmissions = sqliteTable(
  "pr_submissions",
  {
    id: text("id").primaryKey(), // cuid2
    candidateId: text("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    prNumber: integer("pr_number").notNull(),
    prUrl: text("pr_url").notNull(),
    branchName: text("branch_name").notNull(),
    status: text("status", {
      enum: ["open", "merged", "closed"],
    })
      .notNull()
      .default("open"),
    submittedBy: text("submitted_by").notNull(),
    submittedAt: integer("submitted_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    mergedAt: integer("merged_at", { mode: "timestamp" }),
  },
  (t) => [
    index("pr_candidate_idx").on(t.candidateId),
    index("pr_status_idx").on(t.status),
  ]
);

// -----------------------------------------------
// pubmed_searches — saved PubMed search configurations
// -----------------------------------------------
export const pubmedSearches = sqliteTable("pubmed_searches", {
  id: text("id").primaryKey(), // cuid2
  query: text("query").notNull(),
  schedule: text("schedule").notNull().default("0 0 * * *"), // cron expression
  lastRunAt: integer("last_run_at", { mode: "timestamp" }),
  nextRunAt: integer("next_run_at", { mode: "timestamp" }),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// -----------------------------------------------
// Relations (for query builder with `with:`)
// -----------------------------------------------
export const sourcesRelations = relations(sources, ({ many }) => ({
  candidates: many(candidates),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  source: one(sources, {
    fields: [candidates.sourceId],
    references: [sources.id],
  }),
  prSubmissions: many(prSubmissions),
}));

export const prSubmissionsRelations = relations(prSubmissions, ({ one }) => ({
  candidate: one(candidates, {
    fields: [prSubmissions.candidateId],
    references: [candidates.id],
  }),
}));

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
export type PrSubmission = typeof prSubmissions.$inferSelect;
export type NewPrSubmission = typeof prSubmissions.$inferInsert;
export type PubmedSearch = typeof pubmedSearches.$inferSelect;
export type NewPubmedSearch = typeof pubmedSearches.$inferInsert;
