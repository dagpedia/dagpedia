import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import type { Candidate } from "@/lib/db/schema";
import { CandidateStatusBadge } from "./StatusBadge";
import { formatDate, truncate } from "@/lib/utils";

interface Props {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: Props) {
  const context = JSON.parse(candidate.context) as {
    population: string;
    geographic: string;
    era: string;
  };
  const keywords = JSON.parse(candidate.keywords) as string[];

  return (
    <Link
      href={`/candidates/${candidate.id}`}
      className="block bg-card border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CandidateStatusBadge status={candidate.status} />
            <code className="text-xs text-muted-foreground">{candidate.dagId}</code>
          </div>

          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {candidate.title}
          </h3>

          <div className="flex flex-wrap gap-1 mt-2">
            {keywords.slice(0, 4).map((kw) => (
              <span
                key={kw}
                className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
              >
                {kw}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{context.population}</span>
            <span>·</span>
            <span>{context.geographic}</span>
            <span>·</span>
            <span>{context.era}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(candidate.createdAt)}
          </div>
          {candidate.submittedBy && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {candidate.submittedBy}
            </div>
          )}
          <ArrowRight className="h-4 w-4 mt-1 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
