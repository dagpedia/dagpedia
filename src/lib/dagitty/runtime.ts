import fs from "fs";
import path from "path";
import { runInContext } from "vm";
import { JSDOM } from "jsdom";
import type { DagittyRuntime } from "./types";

let nodeRuntime: DagittyRuntime | null = null;

function readVendorScript(): string {
  return fs.readFileSync(
    path.join(process.cwd(), "public", "vendor", "dagitty.js"),
    "utf-8"
  );
}

/** Load dagitty.js in Node (build scripts, getDagPageData on server). */
export function getNodeDagittyRuntime(): DagittyRuntime {
  if (nodeRuntime) return nodeRuntime;

  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    runScripts: "outside-only",
    url: "http://localhost/",
  });
  const context = dom.getInternalVMContext();
  runInContext(readVendorScript(), context);

  const w = dom.window as unknown as DagittyRuntime;
  if (!w.GraphParser?.parseGuess || !w.GraphAnalyzer?.listMinimalImplications) {
    throw new Error("dagitty.js failed to initialize GraphParser/GraphAnalyzer");
  }

  nodeRuntime = {
    GraphParser: w.GraphParser,
    GraphAnalyzer: w.GraphAnalyzer,
  };
  return nodeRuntime;
}

/** Browser runtime from the vendored script tag on globalThis. */
export function getBrowserDagittyRuntime(): DagittyRuntime | null {
  const g = globalThis as unknown as DagittyRuntime;
  if (!g.GraphParser?.parseGuess || !g.GraphAnalyzer?.listMinimalImplications) {
    return null;
  }
  return {
    GraphParser: g.GraphParser,
    GraphAnalyzer: g.GraphAnalyzer,
  };
}

/** Prefer Node loader when `window` is undefined; otherwise browser globals. */
export function getDagittyRuntime(): DagittyRuntime {
  if (typeof window === "undefined") {
    return getNodeDagittyRuntime();
  }
  const browser = getBrowserDagittyRuntime();
  if (browser) return browser;
  return getNodeDagittyRuntime();
}
