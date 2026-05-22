import { execSync } from "child_process";

const ZERO_SHA = "0000000000000000000000000000000000000000";
export const MD_REL_PREFIX = "src/content/dags";

export type GitContributor = {
  name: string;
  email: string;
  commits: number;
};

export type GitMdCommit = {
  message: string;
  author: {
    login: string | null;
    name: string | null;
    avatar_url: string | null;
    profile_url: string | null;
  };
};

export type GitMetadata = {
  md_commit_sha: string;
  md_committed_at: string;
  md_commit: GitMdCommit | null;
  main_committed_at: string | null;
  pr_merged_at: string | null;
  pr_number: number | null;
  contributors: GitContributor[];
};

export function getLocalCommitDetails(sha: string): GitMdCommit | null {
  if (!sha || sha.startsWith("0000000")) return null;
  const message = git(`show -s --format=%B ${sha}`);
  const authorName = git(`show -s --format=%an ${sha}`);
  if (!message && !authorName) return null;
  return {
    message: message.trim(),
    author: {
      login: null,
      name: authorName || null,
      avatar_url: null,
      profile_url: null,
    },
  };
}

function git(args: string): string {
  try {
    return execSync(`git ${args}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function mdPath(slug: string): string {
  return `${MD_REL_PREFIX}/${slug}.md`;
}

function mainRef(): string {
  if (git("rev-parse --verify main")) return "main";
  if (git("rev-parse --verify origin/main")) return "origin/main";
  return "";
}

function parseShortlog(raw: string): GitContributor[] {
  const out: GitContributor[] = [];
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*(\d+)\s+(.+?)\s+<([^>]+)>$/);
    if (!m) continue;
    out.push({
      commits: Number(m[1]),
      name: m[2].trim(),
      email: m[3].trim(),
    });
  }
  return out.sort((a, b) => b.commits - a.commits);
}

function contributorsFromLog(rel: string): GitContributor[] {
  const raw = git(`log --format=%aN%x09%aE -- ${rel}`);
  if (!raw) return [];
  const counts = new Map<string, GitContributor>();
  for (const line of raw.split("\n")) {
    if (!line) continue;
    const tab = line.indexOf("\t");
    const name = tab >= 0 ? line.slice(0, tab).trim() : line.trim();
    const email = tab >= 0 ? line.slice(tab + 1).trim() : "";
    const key = email || name;
    const prev = counts.get(key);
    if (prev) {
      prev.commits += 1;
    } else {
      counts.set(key, { name, email, commits: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.commits - a.commits);
}

function getContributors(rel: string): GitContributor[] {
  const fromShortlog = parseShortlog(git(`shortlog -sne -- ${rel}`));
  if (fromShortlog.length > 0) return fromShortlog;
  return contributorsFromLog(rel);
}

function parsePrNumber(subject: string): number | null {
  const m = subject.match(/Merge pull request #(\d+)/i);
  return m ? Number(m[1]) : null;
}

export function getGitMetadata(slug: string): GitMetadata {
  const rel = mdPath(slug);
  const sha = git(`log -1 --format=%H -- ${rel}`) || ZERO_SHA;
  const mdCommittedAt = git(`log -1 --format=%aI -- ${rel}`) || "";
  const main = mainRef();
  const mainCommittedAt = main
    ? git(`log -1 --format=%aI ${main} -- ${rel}`) || null
    : null;
  const prMergedAt = main
    ? git(`log ${main} --merges -1 --format=%aI -- ${rel}`) || null
    : null;
  const mergeSubject = main
    ? git(`log ${main} --merges -1 --format=%s -- ${rel}`) || ""
    : "";
  const prNumber = mergeSubject ? parsePrNumber(mergeSubject) : null;
  const contributors = getContributors(rel);

  return {
    md_commit_sha: sha,
    md_committed_at: mdCommittedAt || new Date(0).toISOString(),
    md_commit: null,
    main_committed_at: mainCommittedAt,
    pr_merged_at: prMergedAt,
    pr_number: prNumber,
    contributors,
  };
}
