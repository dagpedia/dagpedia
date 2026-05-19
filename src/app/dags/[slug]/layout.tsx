import { notFound } from "next/navigation";
import { DagPageShell } from "@/components/layout/DagPageShell";
import { getDagPageData } from "@/lib/dag-page";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function DagSlugLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const data = getDagPageData(slug);
  if (!data) notFound();

  return (
    <DagPageShell
      title={data.title}
      nodeCount={data.nodes.length}
      edgeCount={data.edges.length}
      tier={data.tier}
      dagittyCode={data.dagittyCode}
    >
      {children}
    </DagPageShell>
  );
}
