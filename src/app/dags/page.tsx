import { DagListCard } from "@/components/dag-display/DagListCard";
import { getDagListItems } from "@/lib/dag";

export default function DagsPage() {
  const dags = getDagListItems();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">DAGs</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Causal DAGs curated for epidemiology research.
        </p>
      </div>
      {dags.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No DAGs published yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {dags.map((dag) => (
            <DagListCard key={dag.slug} dag={dag} />
          ))}
        </ul>
      )}
    </div>
  );
}
