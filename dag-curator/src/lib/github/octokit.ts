import { Octokit } from "@octokit/rest";

let octokit: Octokit | null = null;

export function getOctokit(): Octokit {
  if (!octokit) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN not set");
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

export function parseDagpediaRepo(): { owner: string; repo: string } {
  const repoEnv = process.env.DAGPEDIA_REPO ?? "dagpedia/dagpedia";
  const [owner, repo] = repoEnv.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid DAGPEDIA_REPO: ${repoEnv}`);
  }
  return { owner, repo };
}

export const DAGPEDIA_BASE_BRANCH =
  process.env.DAGPEDIA_BASE_BRANCH ?? "main";
