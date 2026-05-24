import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAG Curator",
  description: "Curate epidemiological DAGs for DAGpedia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
