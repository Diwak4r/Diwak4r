import type { NextConfig } from "next";

// Static export keeps the site deployable to GitHub Pages (current host)
// without a Node server. The whole OS experience is client-side anyway.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
