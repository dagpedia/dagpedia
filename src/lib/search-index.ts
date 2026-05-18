export type SearchItem =
  | {
      type: "dag";
      id: string;
      title: string;
      exposure: string;
      outcome: string;
      tags: string[];
    }
  | {
      type: "node";
      id: string;
      label: string;
      category: string;
    };

let cache: SearchItem[] | null = null;

export async function fetchSearchIndex(): Promise<SearchItem[]> {
  if (cache) return cache;
  try {
    const res = await fetch("/search-index.json");
    if (!res.ok) throw new Error(`Failed to fetch search index: ${res.status}`);
    const data = (await res.json()) as SearchItem[];
    cache = data;
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}
