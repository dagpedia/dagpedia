import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import type { TOCItemType } from "fumadocs-core/toc";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { aboutSource } from "@/lib/about-source";

type AboutDocData = {
  title: string;
  description?: string;
  body: ComponentType;
  toc?: TOCItemType[];
};

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function AboutDocPage({ params }: PageProps) {
  const { slug } = await params;
  const page = aboutSource.getPage(slug);

  if (!page) notFound();

  const data = page.data as AboutDocData;
  const MDX = data.body;

  return (
    <DocsPage toc={data.toc}>
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      <DocsBody>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return aboutSource.generateParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = aboutSource.getPage(slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
