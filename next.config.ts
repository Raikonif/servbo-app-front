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
  // Product images come from public S3 URLs (AWS_S3_PUBLIC_URL on the API).
  // They are rendered `unoptimized`: the optimizer would fetch them from the
  // server, which in containers cannot reach the browser-facing host
  // (design D11). STOREFRONT_IMAGE_ORIGINS lists allowed origins per env.
  images: {
    remotePatterns: (
      process.env.STOREFRONT_IMAGE_ORIGINS ??
      "http://localhost:9000,http://127.0.0.1:9000"
    )
      .split(",")
      .filter(Boolean)
      .map((origin) => new URL(origin.trim())),
  },
  // The catalog lives at the storefront home.
  async redirects() {
    return [{ source: "/products", destination: "/", permanent: true }];
  },
};

export default nextConfig;
