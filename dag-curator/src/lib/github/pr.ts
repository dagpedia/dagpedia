/**
 * Create a PR in dagpedia/dagpedia for a curated DAG candidate.
 */

import { getOctokit, parseDagpediaRepo, DAGPEDIA_BASE_BRANCH } from "./octokit";
import { formatDagMarkdown } from "@/lib/dag-format";
import type { Candidate, Source } from "@/lib/db/schema";

export interface CreatePrResult {
  prNumber: number;
  prUrl: string;
  branchName: string;
}

export async function createDagPr(
  candidate: Candidate,
  source: Source | null,
  submitterLogin: string
): Promise<CreatePrResult> {
  const octokit = getOctokit();
  const { owner, repo } = parseDagpediaRepo();

  const branchName = `dag-curator/${candidate.id}`;
  const filePath = `src/content/dags/${candidate.dagId}.md`;
  const markdownContent = formatDagMarkdown(candidate);

  // 1. Get base branch SHA
  const { data: baseBranch } = await octokit.repos.getBranch({
    owner,
    repo,
    branch: DAGPEDIA_BASE_BRANCH,
  });
  const baseSha = baseBranch.commit.sha;

  // 2. Create new branch
  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  // 3. Commit the new DAG markdown file
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: `feat: add DAG "${candidate.title}" from dag-curator`,
    content: Buffer.from(markdownContent).toString("base64"),
    branch: branchName,
  });

  // 4. Build PR body
  const prBody = buildPrBody(candidate, source, submitterLogin, filePath);

  // 5. Create PR
  const { data: pr } = await octokit.pulls.create({
    owner,
    repo,
    title: `Add DAG: ${candidate.title}`,
    head: branchName,
    base: DAGPEDIA_BASE_BRANCH,
    body: prBody,
    draft: false,
  });

  // 6. Add labels
  try {
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: pr.number,
      labels: ["new-dag", "dag-curator"],
    });
  } catch {
    // Labels may not exist; non-fatal
  }

  return {
    prNumber: pr.number,
    prUrl: pr.html_url,
    branchName,
  };
}

function buildPrBody(
  candidate: Candidate,
  source: Source | null,
  submitterLogin: string,
  filePath: string
): string {
  const context = JSON.parse(candidate.context) as {
    population: string;
    geographic: string;
    era: string;
  };
  const keywords = JSON.parse(candidate.keywords) as string[];

  const sections: string[] = [
    `## DAG: ${candidate.title}`,
    "",
    `**ID:** \`${candidate.dagId}\``,
    `**Population:** ${context.population}`,
    `**Geographic:** ${context.geographic}`,
    `**Era:** ${context.era}`,
    `**Keywords:** ${keywords.join(", ")}`,
    "",
  ];

  // Source paper info
  if (source) {
    sections.push("## Source Paper", "");
    if (source.title) sections.push(`**Title:** ${source.title}`);
    if (source.doi) {
      sections.push(`**DOI:** [${source.doi}](https://doi.org/${source.doi})`);
    }
    if (source.pmid) {
      sections.push(
        `**PubMed:** [PMID ${source.pmid}](https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/)`
      );
    }
    if (source.url && !source.doi && !source.pmid) {
      sections.push(`**URL:** ${source.url}`);
    }
    sections.push("");
  }

  // Curator notes
  if (candidate.reviewNotes) {
    sections.push("## Curator Notes", "", candidate.reviewNotes, "");
  }

  // Extraction info
  if (candidate.extractionModel) {
    sections.push(
      "## Extraction",
      "",
      `- Extracted by: dag-curator (${candidate.extractionModel})`,
      `- Prompt version: ${candidate.extractionPromptVersion ?? "unknown"}`,
      `- Reviewed by: @${candidate.reviewedBy ?? submitterLogin}`,
      `- Submitted by: @${submitterLogin}`,
      ""
    );
  }

  sections.push(
    "## Checklist",
    "",
    "- [x] Nodes defined or already exist in `src/content/nodes/`",
    "- [x] dagitty syntax validated",
    "- [x] Evidence levels assigned for all edges",
    "- [ ] Reviewed by epidemiology maintainer",
    "",
    "---",
    `_Created by [dag-curator](https://github.com/dagpedia/dag-curator)_`
  );

  return sections.join("\n");
}

/** Fetch PR status from GitHub */
export async function getPrStatus(
  prNumber: number
): Promise<"open" | "merged" | "closed"> {
  const octokit = getOctokit();
  const { owner, repo } = parseDagpediaRepo();

  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  if (pr.merged) return "merged";
  if (pr.state === "closed") return "closed";
  return "open";
}

/** Read dagpedia GitHub Issues with the "new-dag" label for community submissions */
export async function fetchCommunityIssues(): Promise<
  Array<{
    number: number;
    title: string;
    body: string;
    author: string;
    url: string;
    createdAt: string;
  }>
> {
  const octokit = getOctokit();
  const { owner, repo } = parseDagpediaRepo();

  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    labels: "new-dag",
    state: "open",
    per_page: 30,
  });

  return issues.map((issue) => ({
    number: issue.number,
    title: issue.title,
    body: issue.body ?? "",
    author: issue.user?.login ?? "unknown",
    url: issue.html_url,
    createdAt: issue.created_at,
  }));
}
