export type DagContributor = {
  login: string;
  name: string | null;
  avatarUrl: string;
  profileUrl: string;
  commits: number;
};

export type DagCommitAuthor = {
  login: string | null;
  name: string | null;
  avatarUrl: string | null;
  profileUrl: string | null;
};

export type DagMdCommit = {
  message: string;
  author: DagCommitAuthor;
};

export type DagProvenance = {
  mdCommitSha: string;
  mdCommittedAt: string;
  mdCommit: DagMdCommit | null;
  mainCommittedAt: string | null;
  prMergedAt: string | null;
  prNumber: number | null;
  contributors: DagContributor[];
};

export function mapMdCommitFromData(
  raw: {
    message: string;
    author: {
      login?: string | null;
      name?: string | null;
      avatar_url?: string | null;
      profile_url?: string | null;
    };
  } | null
  | undefined
): DagMdCommit | null {
  if (!raw?.message) return null;
  return {
    message: raw.message,
    author: {
      login: raw.author.login ?? null,
      name: raw.author.name ?? null,
      avatarUrl: raw.author.avatar_url ?? null,
      profileUrl: raw.author.profile_url ?? null,
    },
  };
}

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

export function mapContributorsFromData(
  raw: {
    login: string;
    name?: string | null;
    avatar_url: string;
    profile_url: string;
    commits: number;
  }[]
): DagContributor[] {
  return raw.map((c) => ({
    login: c.login,
    name: c.name ?? null,
    avatarUrl: c.avatar_url,
    profileUrl: c.profile_url,
    commits: c.commits,
  }));
}
