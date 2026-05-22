import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LayoutChrome } from "@/components/layout/LayoutChrome";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
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
    <html lang="en" className="font-sans" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/wkh3edn.css" />
      </head>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <LayoutChrome>{children}</LayoutChrome>
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
