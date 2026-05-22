import fs from "fs";
import path from "path";
import { dagDataFileSchema, type DagDataFile } from "./dag-data-schema";

const DATA_DIR = path.join(process.cwd(), "_data");

export function loadDagData(slug: string): DagDataFile | null {
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const parsed = dagDataFileSchema.safeParse(
    JSON.parse(fs.readFileSync(filePath, "utf-8"))
  );
  return parsed.success ? parsed.data : null;
}

export function getAllDagDataSlugs(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}
