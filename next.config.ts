import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Company logos come from arbitrary job sources/employers — the set of
    // domains isn't known in advance, so this can't be a fixed allowlist.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
