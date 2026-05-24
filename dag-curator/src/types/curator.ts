/**
 * Curator-specific types (not in dagpedia)
 */

export type SourceStatus = "pending" | "processing" | "extracted" | "failed" | "skipped";
export type SourceType = "manual" | "pubmed" | "community" | "file_import";

export type CandidateStatus =
  | "draft"
  | "reviewing"
  | "approved"
  | "rejected"
  | "submitted"
  | "merged"
  | "closed";

export type PrStatus = "open" | "merged" | "closed";

/** Cross-Ref / Unpaywall paper metadata */
export interface PaperMetadata {
  doi?: string;
  pmid?: string;
  title: string;
  authors: string[];
  journal?: string;
  year?: number;
  abstract?: string;
  openAccessUrl?: string;
  fullTextAvailable: boolean;
}

/** LLM extraction result (before saving as Candidate) */
export interface ExtractionResult {
  dagId: string;
  title: string;
  dagitty: string;
  evidence: Record<string, string>;
  context: {
    population: string;
    geographic: string;
    era: string;
    note?: string;
  };
  keywords: string[];
  body: string;
  model: string;
  promptVersion: string;
  confidence?: number;
  notes?: string;
}

/** Dashboard stats */
export interface DashboardStats {
  sources: Record<string, number>;
  candidates: Record<string, number>;
  totalPRs: number;
  mergedPRs: number;
}

/** Status color mapping */
export const STATUS_COLORS: Record<CandidateStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  reviewing: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  submitted: "bg-purple-100 text-purple-700",
  merged: "bg-teal-100 text-teal-700",
  closed: "bg-gray-100 text-gray-500",
};

export const SOURCE_STATUS_COLORS: Record<SourceStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  extracted: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-gray-500",
};
