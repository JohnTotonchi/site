import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove problematic configs for now
  experimental: {
    // Disable features that might cause the routesManifest error
  }
};

export default nextConfig;
