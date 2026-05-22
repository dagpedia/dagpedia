import fs from "fs";
import path from "path";
import { parse as parseYaml } from "yaml";
import type { EvidenceLevel, EvidenceLevelLegendItem } from "@/types/dag";

const REPO_ROOT = process.cwd();
const SCHEMA_DIR = path.join(REPO_ROOT, "docs", "schema");
const MANIFEST_PATH = path.join(SCHEMA_DIR, "dag-validation.json");

export type VocabularyEntry = {
  id: string;
  label: string;
  description?: string;
};

export type Vocabulary = {
  key: string;
  open: boolean;
  entries: VocabularyEntry[];
  suggestedIds: Set<string>;
  labels: Record<string, string>;
};

type VocabularySection = {
  open: boolean;
  entries: VocabularyEntry[];
};

type VocabularyFileYaml = {
  vocabularies: Record<string, VocabularySection>;
};

type VocabularyFileEntry = {
  file: string;
  field: string;
  wiredAt: string;
};

type DagValidationManifest = {
  slugPattern?: string;
  requiredFrontmatter: string[];
  optionalFrontmatter: string[];
  vocabularies: Record<string, VocabularyFileEntry | string>;
  fields: {
    id: { pattern: string; mustMatchFilename: boolean };
    title: { minLength: number; maxLength: number };
    context: {
      required: string[];
      optional: string[];
      properties: {
        population: { vocabulary: string; open: boolean };
        geographic: { vocabulary: string; open: boolean };
        era: { vocabulary: string; open: boolean };
        note: { maxLength: number };
      };
    };
    keywords: { minItems: number; vocabulary: string; open: boolean };
    evidence: {
      vocabulary: string;
      open: boolean;
      keysMustMatchDagittyEdges: boolean;
    };
    dagitty: {
      minLength: number;
      requiredNodeTags: string[];
      forbiddenNodeTags: string[];
      nodeLibraryPath: string;
    };
    alternatives: { type: string; itemsMustExistAsDagId: boolean };
  };
};

let manifestCache: DagValidationManifest | null = null;
const vocabularyCache = new Map<string, Vocabulary>();

export function loadManifest(): DagValidationManifest {
  if (!manifestCache) {
    manifestCache = JSON.parse(
      fs.readFileSync(MANIFEST_PATH, "utf-8")
    ) as DagValidationManifest;
  }
  return manifestCache;
}

export function getSlugPattern(): RegExp {
  const pattern =
    loadManifest().slugPattern ?? loadManifest().fields.id.pattern;
  return new RegExp(pattern);
}

function resolveVocabularyFilename(entry: VocabularyFileEntry | string): string {
  return typeof entry === "string" ? entry : entry.file;
}

function parseVocabularyEntry(
  filePath: string,
  raw: unknown
): VocabularyEntry {
  if (!raw || typeof raw !== "object" || !("id" in raw)) {
    throw new Error(`${filePath}: each entry must be { id, label, description? }`);
  }
  const { id, label, description } = raw as VocabularyEntry;
  if (!getSlugPattern().test(id)) {
    throw new Error(`${filePath}: invalid id '${id}'`);
  }
  if (typeof label !== "string" || !label.trim()) {
    throw new Error(`${filePath}: label for '${id}' must be non-empty`);
  }
  if (description !== undefined && !description.trim()) {
    throw new Error(`${filePath}: description for '${id}' must be non-empty when set`);
  }
  return {
    id,
    label: label.trim(),
    description: description?.trim(),
  };
}

function resolveVocabularySection(
  filePath: string,
  vocabularyKey: string,
  data: VocabularyFileYaml
): { entriesRaw: VocabularyEntry[]; open: boolean } {
  const bundled = data.vocabularies;
  if (!bundled || !(vocabularyKey in bundled)) {
    const keys = bundled ? Object.keys(bundled).join(", ") : "(none)";
    throw new Error(
      `${filePath}: vocabularies.${vocabularyKey} not found (keys: ${keys})`
    );
  }
  const section = bundled[vocabularyKey];
  const entriesRaw = section.entries;
  if (!Array.isArray(entriesRaw) || entriesRaw.length === 0) {
    throw new Error(
      `${filePath}: vocabularies.${vocabularyKey}.entries must be a non-empty list`
    );
  }
  return { entriesRaw, open: Boolean(section.open) };
}

export function loadVocabulary(vocabularyKey: string): Vocabulary {
  const cached = vocabularyCache.get(vocabularyKey);
  if (cached) return cached;

  const manifest = loadManifest();
  const entry = manifest.vocabularies[vocabularyKey];
  if (!entry) {
    throw new Error(`Unknown vocabulary key '${vocabularyKey}' in dag-validation.json`);
  }
  const filePath = path.join(SCHEMA_DIR, resolveVocabularyFilename(entry));
  if (!fs.existsSync(filePath)) {
    throw new Error(`Vocabulary file not found: ${filePath}`);
  }

  const data = parseYaml(fs.readFileSync(filePath, "utf-8")) as VocabularyFileYaml;
  const { entriesRaw, open } = resolveVocabularySection(
    filePath,
    vocabularyKey,
    data
  );

  const seen = new Set<string>();
  const entries: VocabularyEntry[] = [];
  for (const raw of entriesRaw) {
    const entry = parseVocabularyEntry(filePath, raw);
    if (seen.has(entry.id)) {
      throw new Error(`${filePath}: duplicate id '${entry.id}'`);
    }
    seen.add(entry.id);
    entries.push(entry);
  }

  const labels: Record<string, string> = {};
  for (const e of entries) {
    labels[e.id] = e.label;
  }

  const vocabulary: Vocabulary = {
    key: vocabularyKey,
    open,
    entries,
    suggestedIds: new Set(entries.map((e) => e.id)),
    labels,
  };
  vocabularyCache.set(vocabularyKey, vocabulary);
  return vocabulary;
}

export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function vocabularyLabel(vocabularyKey: string, entryId: string): string {
  return loadVocabulary(vocabularyKey).labels[entryId] ?? humanizeSlug(entryId);
}

export function loadEvidenceLevels(): string[] {
  return [...loadVocabulary("evidenceLevels").suggestedIds];
}

export function loadEvidenceLevelLegend(): EvidenceLevelLegendItem[] {
  const vocab = loadVocabulary("evidenceLevels");
  return vocab.entries.map((e) => {
    if (!e.description) {
      throw new Error(`evidenceLevels: entry '${e.id}' requires description`);
    }
    return {
      level: e.id as EvidenceLevel,
      label: e.label,
      description: e.description,
    };
  });
}

export function asZodEnumTuple(values: string[]): [string, ...string[]] {
  if (values.length === 0) {
    throw new Error("Closed vocabulary must not be empty");
  }
  return values as [string, ...string[]];
}

export function loadPopulations(): string[] {
  return [...loadVocabulary("populations").suggestedIds];
}
export function loadGeographics(): string[] {
  return [...loadVocabulary("geographics").suggestedIds];
}
export function loadEras(): string[] {
  return [...loadVocabulary("eras").suggestedIds];
}
export function loadKeywords(): string[] {
  return [...loadVocabulary("keywords").suggestedIds];
}
export function getEnumRegistry(vocabularyKey: string): VocabularyFileEntry {
  const entry = loadManifest().vocabularies[vocabularyKey];
  if (!entry) {
    throw new Error(`Unknown vocabulary key '${vocabularyKey}'`);
  }
  if (typeof entry === "string") {
    return { file: entry, field: "", wiredAt: "" };
  }
  return entry;
}
