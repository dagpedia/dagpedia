export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Configure dag-curator environment variables
      </p>

      <div className="space-y-4">
        {[
          {
            group: "Authentication",
            vars: [
              { name: "NEXTAUTH_SECRET", desc: "Random secret for NextAuth.js sessions" },
              { name: "GITHUB_CLIENT_ID", desc: "GitHub OAuth App client ID" },
              { name: "GITHUB_CLIENT_SECRET", desc: "GitHub OAuth App client secret" },
              { name: "ALLOWED_GITHUB_ORGS", desc: "Comma-separated org names (empty = allow all)" },
            ],
          },
          {
            group: "Database",
            vars: [
              { name: "TURSO_DATABASE_URL", desc: "Turso libSQL URL (production)" },
              { name: "TURSO_AUTH_TOKEN", desc: "Turso auth token (production)" },
              { name: "DATABASE_URL", desc: "SQLite file URL (local dev, e.g. file:./local.db)" },
            ],
          },
          {
            group: "GitHub API",
            vars: [
              { name: "GITHUB_TOKEN", desc: "PAT with repo:write on dagpedia/dagpedia" },
              { name: "DAGPEDIA_REPO", desc: "Target repo (default: dagpedia/dagpedia)" },
              { name: "DAGPEDIA_BASE_BRANCH", desc: "Base branch for PRs (default: main)" },
            ],
          },
          {
            group: "AI Extraction",
            vars: [
              { name: "ANTHROPIC_API_KEY", desc: "Anthropic API key for Claude" },
              { name: "ANTHROPIC_MODEL", desc: "Model override (default: claude-opus-4-7)" },
            ],
          },
          {
            group: "Paper Sources",
            vars: [
              { name: "NCBI_API_KEY", desc: "NCBI API key for higher PubMed rate limits" },
              { name: "UNPAYWALL_EMAIL", desc: "Email for Unpaywall open-access lookup" },
              { name: "CRON_SECRET", desc: "Bearer token for Vercel Cron authorization" },
            ],
          },
        ].map(({ group, vars }) => (
          <div key={group} className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">{group}</h2>
            <div className="space-y-2">
              {vars.map(({ name, desc }) => (
                <div key={name} className="flex items-start gap-3">
                  <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-foreground w-52 shrink-0">
                    {name}
                  </code>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Set these in <code className="bg-muted px-1 rounded">.env.local</code> for local development
        or in the Vercel dashboard for production.
      </div>
    </div>
  );
}
