import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dagpedia GitHub avatars
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // Vercel Cron: allow all origins for cron endpoints in prod
  async headers() {
    return [
      {
        source: "/api/cron/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
