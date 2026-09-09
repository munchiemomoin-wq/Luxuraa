import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel deployment - do NOT use output: "standalone" */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
