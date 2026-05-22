import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import { aboutSource } from "@/lib/about-source";
import "fumadocs-ui/style.css";

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <DocsLayout
        tree={aboutSource.pageTree}
        nav={{ title: "About DAGpedia" }}
        sidebar={{ enabled: true }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
