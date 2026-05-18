import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownBody } from "@/components/MarkdownBody";
import { getAllDags, getDag } from "@/lib/dag";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllDags().map((dag) => ({ slug: dag.slug }));
}

export default async function DagPage({ params }: PageProps) {
  const { slug } = await params;
  const dag = getDag(slug);
  if (!dag) notFound();

  const { frontmatter } = dag;

  return (
    <article className="space-y-6">
      <Link href="/dags" className="text-sm text-brand hover:underline">
        ← All DAGs
      </Link>
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {frontmatter.title}
        </h1>
        <dl className="flex flex-wrap gap-4 text-sm text-slate-600">
          <div>
            <dt className="inline font-medium">Exposure: </dt>
            <dd className="inline">{frontmatter.exposure}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Outcome: </dt>
            <dd className="inline">{frontmatter.outcome}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Evidence: </dt>
            <dd className="inline">{frontmatter.evidence_level}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Version: </dt>
            <dd className="inline">{frontmatter.version}</dd>
          </div>
        </dl>
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <MarkdownBody body={dag.body} renderDagitty />

      {frontmatter.references && frontmatter.references.length > 0 && (
        <section className="border-t border-slate-200 pt-6">
          <h2 className="mb-3 text-lg font-semibold">References</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            {frontmatter.references.map((ref, i) => (
              <li key={i}>
                {ref.label}
                {ref.doi && (
                  <>
                    {" "}
                    <a
                      href={`https://doi.org/${ref.doi}`}
                      className="text-brand hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      DOI
                    </a>
                  </>
                )}
                {ref.pmid && (
                  <>
                    {" "}
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                      className="text-brand hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PubMed
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
