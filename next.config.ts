import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@puppeteer/browsers",
    "chromium-bidi",
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
