/**
 * Fetch paper metadata and text from DOI, PMID, or URL.
 *
 * Sources:
 *  - CrossRef API  → title, authors, journal, year, abstract
 *  - Unpaywall API → open-access full-text URL
 *  - PubMed EFetch → abstract (XML)
 */

import type { PaperMetadata } from "@/types/curator";

const CROSSREF_BASE = "https://api.crossref.org";
const UNPAYWALL_BASE = "https://api.unpaywall.org/v2";
const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

// -----------------------------------------------
// CrossRef
// -----------------------------------------------
async function fetchCrossRef(doi: string): Promise<Partial<PaperMetadata>> {
  const url = `${CROSSREF_BASE}/works/${encodeURIComponent(doi)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "dag-curator/0.1 (mailto:dagpedia@example.com)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`CrossRef HTTP ${res.status} for DOI ${doi}`);

  const json = await res.json();
  const msg = json.message;

  const authors: string[] = (msg.author ?? []).map(
    (a: { given?: string; family?: string }) =>
      [a.given, a.family].filter(Boolean).join(" ")
  );

  const year =
    msg.published?.["date-parts"]?.[0]?.[0] ??
    msg["published-print"]?.["date-parts"]?.[0]?.[0];

  const abstract: string | undefined = msg.abstract
    ? (msg.abstract as string)
        .replace(/<\/?[^>]+(>|$)/g, "") // strip JATS XML tags
        .trim()
    : undefined;

  const journal: string | undefined =
    (msg["container-title"] as string[] | undefined)?.[0];

  return {
    doi,
    title: (msg.title as string[] | undefined)?.[0] ?? "Unknown",
    authors,
    journal,
    year,
    abstract,
    fullTextAvailable: false,
  };
}

// -----------------------------------------------
// Unpaywall
// -----------------------------------------------
async function fetchUnpaywall(doi: string): Promise<{ url?: string }> {
  const email = process.env.UNPAYWALL_EMAIL ?? "dagpedia@example.com";
  const url = `${UNPAYWALL_BASE}/${encodeURIComponent(doi)}?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return {};

  const json = await res.json();
  const bestOa = json.best_oa_location;
  return { url: bestOa?.url_for_landing_page ?? bestOa?.url ?? undefined };
}

// -----------------------------------------------
// PubMed EFetch (abstract via XML)
// -----------------------------------------------
async function fetchPubMedAbstract(pmid: string): Promise<string | undefined> {
  const apiKey = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : "";
  const url = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return undefined;
  const text = await res.text();
  // Strip header lines (first few lines) and return abstract section
  const lines = text.split("\n").filter((l) => l.trim());
  return lines.slice(0, 30).join(" ").trim() || undefined;
}

// PubMed search by DOI to get PMID
async function pmidFromDoi(doi: string): Promise<string | undefined> {
  const apiKey = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : "";
  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(doi + "[doi]")}&retmode=json${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return undefined;
  const json = await res.json();
  return json.esearchresult?.idlist?.[0];
}

// -----------------------------------------------
// Public API
// -----------------------------------------------

/** Fetch full paper metadata by DOI */
export async function fetchPaperByDoi(doi: string): Promise<PaperMetadata> {
  const [crossref, unpaywall, pmid] = await Promise.allSettled([
    fetchCrossRef(doi),
    fetchUnpaywall(doi),
    pmidFromDoi(doi),
  ]);

  const meta: Partial<PaperMetadata> =
    crossref.status === "fulfilled" ? crossref.value : { doi, title: doi, authors: [] };

  const oaUrl =
    unpaywall.status === "fulfilled" ? unpaywall.value.url : undefined;

  const resolvedPmid =
    pmid.status === "fulfilled" ? pmid.value : undefined;

  // Try to get abstract from PubMed if CrossRef didn't provide one
  let abstract = meta.abstract;
  if (!abstract && resolvedPmid) {
    abstract = await fetchPubMedAbstract(resolvedPmid).catch(() => undefined);
  }

  return {
    doi,
    pmid: resolvedPmid,
    title: meta.title ?? doi,
    authors: meta.authors ?? [],
    journal: meta.journal,
    year: meta.year,
    abstract,
    openAccessUrl: oaUrl,
    fullTextAvailable: !!oaUrl,
  };
}

/** Fetch paper metadata by PMID */
export async function fetchPaperByPmid(pmid: string): Promise<PaperMetadata> {
  const apiKey = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : "";
  // ESummary for metadata
  const summaryUrl = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json${apiKey}`;
  const res = await fetch(summaryUrl);
  if (!res.ok) throw new Error(`PubMed HTTP ${res.status} for PMID ${pmid}`);

  const json = await res.json();
  const doc = json.result?.[pmid];

  const title: string = doc?.title ?? pmid;
  const authors: string[] = (doc?.authors ?? []).map(
    (a: { name: string }) => a.name
  );
  const year = doc?.pubdate ? parseInt(doc.pubdate.slice(0, 4)) : undefined;
  const journal: string | undefined = doc?.source;
  // DOI from articleids
  const doi: string | undefined = (doc?.articleids ?? []).find(
    (a: { idtype: string; value: string }) => a.idtype === "doi"
  )?.value;

  const abstract = await fetchPubMedAbstract(pmid).catch(() => undefined);

  const oaInfo = doi ? await fetchUnpaywall(doi).catch(() => ({})) : {};

  return {
    doi,
    pmid,
    title,
    authors,
    journal,
    year,
    abstract,
    openAccessUrl: (oaInfo as { url?: string }).url,
    fullTextAvailable: !!(oaInfo as { url?: string }).url,
  };
}

/** Extract plain text from an open-access HTML page */
export async function fetchOpenAccessText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: "text/html,application/xhtml+xml" },
  });
  if (!res.ok) throw new Error(`Failed to fetch full text: HTTP ${res.status}`);

  const html = await res.text();
  // Simple extraction: strip HTML tags
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Return first 8000 chars (enough for Claude context)
  return text.slice(0, 8000);
}
