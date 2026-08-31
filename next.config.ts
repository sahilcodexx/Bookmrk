import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, Next.js walks
  // up the directory tree and picks up stray lockfiles from ~/package-lock.json
  // and ~/skills-lock.json, which makes it scan the whole home dir
  // (and spawn 25+ workers to compile half of it).
  turbopack: {
    root: path.resolve(__dirname),
  },

  // `optimizePackageImports` lets Next rewrite `import { Foo } from 'pkg'`
  // into `import Foo from 'pkg/foo'` at build time, so the bundler only
  // pulls the icons the page actually uses. Both icon libs are heavy
  // barrel exports otherwise.
  experimental: {
    optimizePackageImports: ["lucide-react", "@hugeicons/react"],
    // Cap CPU work — by default Next spawns one worker per logical core,
    // which on a beefy machine can mean 25+ threads each holding a chunk
    // of the dev graph. 4 is plenty for a project this size.
    cpus: 4,
  },

  // Keep client bundles from shipping source maps in dev — they bloat
  // the watch graph and aren't useful unless you're stepping through
  // the component itself.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
