import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. A stray package-lock.json in the home directory
  // otherwise makes Turbopack guess wrong and emit a warning on every start.
  turbopack: {
    root: __dirname,
  },
  // Old addresses keep working: Paste a brief was /core, Features was /product.
  async redirects() {
    return [
      {
        source: "/core",
        destination: "/brief",
        permanent: true,
      },
      {
        source: "/product",
        destination: "/features",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
