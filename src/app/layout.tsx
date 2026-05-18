import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAGpedia",
  description: "A living repository of causal DAGs for epidemiology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-brand">
              DAGpedia
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/dags" className="text-slate-600 hover:text-brand">
                DAGs
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          DAGpedia — causal DAGs for epidemiology
        </footer>
      </body>
    </html>
  );
}
