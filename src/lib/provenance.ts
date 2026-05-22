export type DagContributor = {
  name: string;
  email: string;
  commits: number;
};

export type DagProvenance = {
  mdCommitSha: string;
  mdCommittedAt: string;
  mainCommittedAt: string | null;
  prMergedAt: string | null;
  prNumber: number | null;
  contributors: DagContributor[];
};

export function shortSha(sha: string): string {
  if (!sha || sha.length < 7) return sha || "unknown";
  return sha.slice(0, 7);
}

export function formatProvenanceDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function contributorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function contributorHue(email: string): number {
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = (h * 31 + email.charCodeAt(i)) % 360;
  }
  return h;
}
