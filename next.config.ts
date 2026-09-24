import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit `.next/standalone` — a self-contained server.js with only the
  // dependencies @vercel/nft can prove are reachable, instead of a full
  // node_modules. This is what docker/app-front.Dockerfile ships.
  //
  // `output` is a BUILD-time setting: `next dev` ignores it entirely, so the
  // native dev run in this repo is unaffected (verified via
  // scripts/harness/smoke_frontend.py --project app-front).
  //
  // `.next/static` and `public/` are NOT traced into the standalone bundle;
  // the Dockerfile copies them explicitly, per the upstream with-docker
  // example.
  output: "standalone",
};

export default nextConfig;
