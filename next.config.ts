import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;

