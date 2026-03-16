import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables React Strict Mode
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  turbopack: {}, // Enable Turbopack for faster builds (default in Next.js 16)
};

export default nextConfig;