export type SearchItem =
  | {
      type: "dag";
      id: string;
      title: string;
      exposure: string;
      outcome: string;
      tags: string[];
    }
  | {
      type: "node";
      id: string;
      label: string;
      category: string;
    };

// Production: fetch("/search-index.json") or import from generated file
export const SEARCH_INDEX: SearchItem[] = [
  {
    type: "dag",
    id: "smoking-lung-cancer",
    title: "Smoking and lung cancer",
    exposure: "Smoking",
    outcome: "Lung Cancer",
    tags: ["smoking", "respiratory"],
  },
  {
    type: "dag",
    id: "ses-cvd-classic",
    title: "SES and cardiovascular disease",
    exposure: "SES",
    outcome: "CVD",
    tags: ["socioeconomic", "cardiovascular"],
  },
  {
    type: "dag",
    id: "housing-instability-health",
    title: "Housing instability and health outcomes",
    exposure: "Housing",
    outcome: "Health",
    tags: ["housing", "sdoh"],
  },
  {
    type: "node",
    id: "smoking",
    label: "Smoking",
    category: "behavioral",
  },
  {
    type: "node",
    id: "ses",
    label: "Socioeconomic Status",
    category: "social-determinants",
  },
  {
    type: "node",
    id: "lung-cancer",
    label: "Lung Cancer",
    category: "respiratory",
  },
  {
    type: "node",
    id: "cvd",
    label: "Cardiovascular Disease",
    category: "cardiovascular",
  },
  {
    type: "node",
    id: "age",
    label: "Age",
    category: "demographic",
  },
];
