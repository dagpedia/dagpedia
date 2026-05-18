import Link from "next/link";
import { getAllDags } from "@/lib/dag";

export default function DagsPage() {
  const dags = getAllDags();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">DAGs</h1>
      <p className="text-slate-600">
        Causal DAGs curated for epidemiology research.
      </p>
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {dags.map((dag) => (
          <li key={dag.slug}>
            <Link
              href={`/dags/${dag.slug}`}
              className="block px-4 py-4 hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">
                {dag.frontmatter.title}
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                {dag.frontmatter.exposure} → {dag.frontmatter.outcome}
                {" · "}
                evidence: {dag.frontmatter.evidence_level}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
