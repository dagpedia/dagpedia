/**
 * PubMed E-utils search for epidemiological papers mentioning DAGs.
 */

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export interface PubMedSearchResult {
  pmid: string;
  title: string;
  abstract?: string;
  doi?: string;
  year?: number;
  authors: string[];
  journal?: string;
}

/** Run a PubMed ESearch and return PMIDs */
export async function pubmedSearch(
  query: string,
  maxResults = 20
): Promise<string[]> {
  const apiKey = process.env.NCBI_API_KEY
    ? `&api_key=${process.env.NCBI_API_KEY}`
    : "";
  const encoded = encodeURIComponent(query);
  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encoded}&retmax=${maxResults}&retmode=json&sort=relevance${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`PubMed ESearch HTTP ${res.status}`);

  const json = await res.json();
  return json.esearchresult?.idlist ?? [];
}

/** Fetch summaries for a list of PMIDs */
export async function fetchPubMedSummaries(
  pmids: string[]
): Promise<PubMedSearchResult[]> {
  if (pmids.length === 0) return [];

  const apiKey = process.env.NCBI_API_KEY
    ? `&api_key=${process.env.NCBI_API_KEY}`
    : "";
  const ids = pmids.join(",");
  const url = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${ids}&retmode=json${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`PubMed ESummary HTTP ${res.status}`);

  const json = await res.json();
  const results: PubMedSearchResult[] = [];

  for (const pmid of pmids) {
    const doc = json.result?.[pmid];
    if (!doc) continue;

    const doi = (doc.articleids ?? []).find(
      (a: { idtype: string; value: string }) => a.idtype === "doi"
    )?.value;

    const year = doc.pubdate
      ? parseInt(doc.pubdate.slice(0, 4))
      : undefined;

    results.push({
      pmid,
      title: doc.title ?? pmid,
      doi,
      year: isNaN(year ?? NaN) ? undefined : year,
      authors: (doc.authors ?? []).map((a: { name: string }) => a.name),
      journal: doc.source,
    });
  }

  return results;
}

/** Search PubMed and return full result objects */
export async function searchPubMed(
  query: string,
  maxResults = 20
): Promise<PubMedSearchResult[]> {
  const pmids = await pubmedSearch(query, maxResults);
  return fetchPubMedSummaries(pmids);
}

/** Default DAG-focused search queries */
export const DEFAULT_DAG_QUERIES = [
  'epidemiology[ti] AND "directed acyclic graph"[tiab]',
  '"causal DAG" OR "DAG" AND epidemiology[mh] AND 2020:2030[dp]',
  '"causal diagram" AND confounding AND epidemiology',
];
