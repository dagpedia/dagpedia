import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Topbar } from "@/components/layout/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <TooltipProvider>
        <Topbar />
        <main className="mx-auto max-w-7xl px-4 py-8 pt-13">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          DAGpedia — causal DAGs for epidemiology
        </footer>
        <Analytics />
        <SpeedInsights />
        </TooltipProvider>
      </body>
    </html>
  );
}
