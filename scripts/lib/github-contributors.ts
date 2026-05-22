import type { GitContributor, GitMdCommit } from "./git-metadata";
import { getLocalCommitDetails } from "./git-metadata";

const REPO = "dagpedia/dagpedia";

export type GithubContributor = {
  login: string;
  name: string | null;
  avatar_url: string;
  profile_url: string;
  commits: number;
};

type GithubProfile = {
  login: string;
  name: string | null;
  avatar_url: string;
  profile_url: string;
};

const profileCache = new Map<string, GithubProfile>();

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "dagpedia-generate-dag-data",
  };
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function loginFromNoreply(email: string): string | null {
  const m = email.match(/^\d+\+([^@]+)@users\.noreply\.github\.com$/i);
  return m ? m[1] : null;
}

async function fetchGithubProfile(login: string): Promise<GithubProfile | null> {
  const cached = profileCache.get(login);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.github.com/users/${login}`, {
      headers: githubHeaders(),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      login: string;
      name: string | null;
      avatar_url: string;
      html_url: string;
    };
    const profile: GithubProfile = {
      login: data.login,
      name: data.name?.trim() || null,
      avatar_url: data.avatar_url,
      profile_url: data.html_url,
    };
    profileCache.set(login, profile);
    return profile;
  } catch {
    return null;
  }
}

type GhCommit = {
  author: { login: string; avatar_url: string; html_url: string } | null;
};

async function fetchCommitsForPath(relPath: string): Promise<GhCommit[]> {
  const all: GhCommit[] = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.github.com/repos/${REPO}/commits?path=${encodeURIComponent(relPath)}&per_page=100&page=${page}`;
    try {
      const res = await fetch(url, { headers: githubHeaders() });
      if (!res.ok) {
        if (page === 1) {
          console.warn(
            `  ⚠ GitHub commits API ${res.status} for ${relPath}; using git author fallback`
          );
        }
        break;
      }
      const batch = (await res.json()) as GhCommit[];
      if (!Array.isArray(batch) || batch.length === 0) break;
      all.push(...batch);
      if (batch.length < 100) break;
    } catch {
      if (page === 1) {
        console.warn(`  ⚠ GitHub commits API failed for ${relPath}; using git author fallback`);
      }
      break;
    }
  }
  return all;
}

function aggregateFromCommits(commits: GhCommit[]): GithubContributor[] {
  const map = new Map<string, GithubContributor>();
  for (const c of commits) {
    const author = c.author;
    if (!author?.login) continue;
    const prev = map.get(author.login);
    if (prev) {
      prev.commits += 1;
    } else {
      map.set(author.login, {
        login: author.login,
        name: null,
        avatar_url: author.avatar_url,
        profile_url: author.html_url,
        commits: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.commits - a.commits);
}

async function enrichFromProfiles(
  contributors: GithubContributor[]
): Promise<GithubContributor[]> {
  return Promise.all(
    contributors.map(async (c) => {
      const profile = await fetchGithubProfile(c.login);
      if (!profile) return c;
      return {
        ...c,
        name: profile.name,
        avatar_url: profile.avatar_url,
        profile_url: profile.profile_url,
      };
    })
  );
}

export async function fetchGithubCommit(sha: string): Promise<GitMdCommit | null> {
  if (!sha || sha.startsWith("0000000")) return null;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/commits/${sha}`,
      { headers: githubHeaders() }
    );
    if (!res.ok) return getLocalCommitDetails(sha);

    const data = (await res.json()) as {
      commit: { message: string; author: { name: string } };
      author: {
        login: string;
        avatar_url: string;
        html_url: string;
      } | null;
    };

    const message = data.commit?.message?.trim() ?? "";
    const ghAuthor = data.author;
    const gitName = data.commit?.author?.name?.trim() || null;

    if (ghAuthor?.login) {
      const profile = await fetchGithubProfile(ghAuthor.login);
      return {
        message,
        author: {
          login: ghAuthor.login,
          name: profile?.name ?? gitName,
          avatar_url: profile?.avatar_url ?? ghAuthor.avatar_url,
          profile_url: profile?.profile_url ?? ghAuthor.html_url,
        },
      };
    }

    return {
      message,
      author: {
        login: null,
        name: gitName,
        avatar_url: null,
        profile_url: null,
      },
    };
  } catch {
    return getLocalCommitDetails(sha);
  }
}

export async function resolveGithubContributors(
  relPath: string,
  gitFallback: GitContributor[]
): Promise<GithubContributor[]> {
  const commits = await fetchCommitsForPath(relPath);
  const fromApi = aggregateFromCommits(commits);
  if (fromApi.length > 0) return enrichFromProfiles(fromApi);

  const out: GithubContributor[] = [];
  for (const c of gitFallback) {
    const login = loginFromNoreply(c.email);
    if (!login) continue;
    const profile = await fetchGithubProfile(login);
    if (!profile) continue;
    out.push({
      login: profile.login,
      name: profile.name,
      avatar_url: profile.avatar_url,
      profile_url: profile.profile_url,
      commits: c.commits,
    });
  }
  return out.sort((a, b) => b.commits - a.commits);
}
