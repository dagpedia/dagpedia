import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        DAGpedia
      </h1>
      <p className="text-lg leading-relaxed text-slate-600">
        A living repository of causal directed acyclic graphs (DAGs) for
        epidemiology — curated, versioned, and open to community contribution.
      </p>
      <Link
        href="/dags"
        className="inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Browse DAGs
      </Link>
    </div>
  );
}
