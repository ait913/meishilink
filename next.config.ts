import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  experimental: {},
};

export default config;

