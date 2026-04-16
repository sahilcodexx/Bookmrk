import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // prevents double render in dev

  experimental: {
    serverActions: {}, // disable unstable features if causing issues
  },

  // Optional: helps avoid aggressive caching behavior
  onDemandEntries: {
    maxInactiveAge: 0, // disables page "hibernation"
    pagesBufferLength: 5,
  },
};

export default nextConfig;