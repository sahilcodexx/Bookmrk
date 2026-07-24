import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  experimental: {
    serverActions: {},
  },

  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 5,
  },

  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;