import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";

const mdxSource = docs.toFumadocsSource();
const resolveAboutFiles = mdxSource.files as unknown as
  | typeof mdxSource.files
  | (() => typeof mdxSource.files);
const aboutFiles =
  typeof resolveAboutFiles === "function"
    ? resolveAboutFiles()
    : resolveAboutFiles;

export const aboutSource = loader({
  baseUrl: "/about",
  source: {
    files: aboutFiles,
  },
});
