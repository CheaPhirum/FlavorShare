import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // "standalone" output is for self-hosting (see the bun start script).
  // Vercel builds its own serverless bundle and breaks if this is set
  // during its build, so disable it when VERCEL is set.
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["*.space-z.ai"],
  reactStrictMode: false,
};

export default nextConfig;