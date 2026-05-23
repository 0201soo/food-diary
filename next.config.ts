import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (default in Next.js 16) handles WASM natively for client bundles.
  // An empty turbopack config silences the "webpack config without turbopack" warning.
  turbopack: {},
};

export default nextConfig;
