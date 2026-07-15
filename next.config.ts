import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Company logos come from arbitrary job sources/employers — the set of
    // domains isn't known in advance, so this can't be a fixed allowlist.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // isomorphic-dompurify pulls in jsdom, which breaks if bundled into the
  // serverless function rather than loaded via native require at runtime —
  // a well-documented Next.js/Vercel gotcha for this exact package.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
};

export default nextConfig;
