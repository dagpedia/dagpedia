import { notFound } from "next/navigation";
import { DagPageView } from "@/components/dag-display/DagPageView";
import { getDagListItems } from "@/lib/dag";
import { getDagPageData } from "@/lib/dag-page";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getDagListItems().map((dag) => ({ slug: dag.slug }));
}

export default async function DagPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getDagPageData(slug);
  if (!data) notFound();

  return <DagPageView data={data} />;
}
