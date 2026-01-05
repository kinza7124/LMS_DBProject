import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable standalone output for better serverless deployment
  output: 'standalone',
  // Optimize images if using external image domains
  images: {
    domains: [],
  },
  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
