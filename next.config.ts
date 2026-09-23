import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@puppeteer/browsers",
    "chromium-bidi",
    "highlight.js",
    "markdown-it",
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
