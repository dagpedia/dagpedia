"use client";

import Script from "next/script";
import { useState } from "react";
import { useDagitty } from "./useDagitty";
import "@/styles/dagitty.css";

type DagViewerProps = {
  dagittyString: string;
  height?: number;
  showControls?: boolean;
};

export function DagViewer({
  dagittyString,
  height = 380,
  showControls = true,
}: DagViewerProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { canvasRef, error, mount } = useDagitty(dagittyString, scriptLoaded);

  const encoded = encodeURIComponent(dagittyString);
  const externalUrl = `https://dagitty.net/dags.html#${encoded}`;

  const copyCode = () => {
    void navigator.clipboard.writeText(dagittyString);
  };

  return (
    <>
      <Script
        src="/vendor/dagitty.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="dagitty-wrapper">
        {error ? (
          <div
            className="dagitty-canvas dagitty-fallback"
            style={{ height: "auto", padding: "1rem" }}
          >
            <p className="mb-2 text-sm text-slate-600">
              Interactive rendering unavailable ({error}).
            </p>
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline"
            >
              View this DAG on dagitty.net ↗
            </a>
          </div>
        ) : (
          <div
            ref={canvasRef}
            className="dagitty-canvas"
            style={{ width: "100%", height }}
          />
        )}
        {showControls && !error && (
          <div className="dagitty-controls">
            <button
              type="button"
              className="dagitty-btn"
              onClick={() => mount?.resetLayout()}
            >
              Reset layout
            </button>
            <button type="button" className="dagitty-btn" onClick={copyCode}>
              Copy code
            </button>
            <a
              className="dagitty-btn dagitty-external"
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in dagitty.net ↗
            </a>
          </div>
        )}
        <noscript>
          <pre className="mt-2 overflow-x-auto rounded bg-slate-100 p-4 text-sm">
            <code>{dagittyString}</code>
          </pre>
        </noscript>
      </div>
    </>
  );
}
