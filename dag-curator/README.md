# dag-curator

A web application that automates the collection of epidemiological DAGs for [DAGpedia](https://github.com/dagpedia/dagpedia).

## Features

- **Source management** — Add papers via DOI, PubMed ID, or URL
- **LLM extraction** — Extract DAG structure from papers using Claude (Anthropic API)
- **PubMed search** — Search PubMed for DAG-containing papers, with daily auto-search via Vercel Cron
- **Review UI** — Visual DAG viewer, metadata editor, evidence level assignment
- **PR submission** — Automatically create PRs to dagpedia/dagpedia with formatted Markdown
- **GitHub OAuth** — Authentication restricted to dagpedia collaborators

## Tech Stack

Matches [DAGpedia](https://github.com/dagpedia/dagpedia):

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS 4.3 + shadcn/ui |
| Language | TypeScript 5.6 |
| Database | Drizzle ORM + Turso (libSQL/SQLite) |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| LLM | Anthropic SDK (Claude) |
| GitHub API | @octokit/rest |
| Deployment | Vercel |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Required variables:
- `NEXTAUTH_SECRET` — Random string (run `openssl rand -base64 32`)
- `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` — From [GitHub OAuth Apps](https://github.com/settings/developers)
- `ANTHROPIC_API_KEY` — From [Anthropic Console](https://console.anthropic.com)
- `GITHUB_TOKEN` — PAT with `repo:write` on dagpedia/dagpedia

### 3. Initialize database

```bash
# Local development
npm run db:push

# Or generate + apply migrations
npm run db:generate
npm run db:migrate
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Create a project on Vercel linked to this repo
2. Set environment variables in the Vercel dashboard:
   - Use `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` for the database
   - All other vars from `.env.example`
3. Deploy

The Vercel Cron job (`vercel.json`) runs PubMed searches daily at midnight UTC.

## Workflow

```
Paper (DOI/PMID/URL)
  ↓ CrossRef + Unpaywall + PubMed
Source (metadata + abstract)
  ↓ Claude API extraction
Candidate (draft DAG)
  ↓ Human review (edit + approve)
Approved Candidate
  ↓ Submit PR button
PR in dagpedia/dagpedia
  ↓ DAGpedia CI validates + merges
Published DAG on dagpedia
```

## PubMed Cron

The cron endpoint (`/api/cron/pubmed`) runs all enabled PubMed searches and adds new papers as sources.

**Local testing:**
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/pubmed
```

## DAGpedia Format

Approved candidates generate Markdown files matching the [dagpedia schema](https://github.com/dagpedia/dagpedia/tree/main/docs/schema):

```markdown
---
id: smoking-lung-cancer
title: Smoking and lung cancer
context:
  population: general-adults
  geographic: north-america-europe
  era: 1990s-present
dagitty: |
  dag {
    smoking [exposure]
    lung_cancer [outcome]
    ...
  }
evidence:
  smoking -> lung_cancer: strong
keywords: [smoking, lung-cancer]
---
## Operationalization
...
```

## License

Code: MIT | Content submitted to dagpedia: CC BY 4.0
