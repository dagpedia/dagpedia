import { vocabularyLabel } from "./schema-loader";
import type { LabeledSlug } from "@/types/dag";

export function labelSlug(vocabularyKey: string, id: string): LabeledSlug {
  return { id, label: vocabularyLabel(vocabularyKey, id) };
}

export function labelSlugs(vocabularyKey: string, ids: string[]): LabeledSlug[] {
  return ids.map((id) => labelSlug(vocabularyKey, id));
}
