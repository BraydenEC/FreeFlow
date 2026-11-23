import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. A stray package-lock.json in the home directory
  // otherwise makes Turbopack guess wrong and emit a warning on every start.
  turbopack: {
    root: __dirname,
  },
  // Old addresses keep working: Paste a brief was briefly /brief. /features
  // is switched in its own page (lib/flags.ts), so it isn't redirected here.
  async redirects() {
    return [
      {
        source: "/brief",
        destination: "/core",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
