import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { listSources } from "@/lib/db/queries/sources";
import { SourceStatusBadge } from "@/components/candidates/StatusBadge";
import { formatDate } from "@/lib/utils";

export default async function SourcesPage() {
  const sources = await listSources(100);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sources</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Papers and files submitted for DAG extraction
          </p>
        </div>
        <Link
          href="/sources/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add source
        </Link>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No sources yet</p>
          <p className="text-sm mt-1">Add a paper DOI or URL to get started</p>
          <Link
            href="/sources/new"
            className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add first source
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">DOI/PMID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <Link
                      href={`/sources/${source.id}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {source.title ?? source.url ?? source.doi ?? source.pmid ?? "Untitled"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {source.doi ?? source.pmid ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {source.sourceType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SourceStatusBadge status={source.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(source.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/sources/${source.id}`}
                      className="text-primary hover:underline text-xs"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
