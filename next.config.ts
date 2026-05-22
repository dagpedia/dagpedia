import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const withMDX = createMDX();
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["jsdom"],
  pageExtensions: ["ts", "tsx", "md", "mdx"],

  turbopack: {
    resolveAlias: {
      "@/.source": path.join(projectRoot, ".source"),
    },
  },

  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias["@/.source"] = path.join(projectRoot, ".source");
    return config;
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default withMDX(nextConfig);
