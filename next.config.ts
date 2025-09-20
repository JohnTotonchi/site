import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for routesManifest.dataRoutes error
  serverExternalPackages: [],
  // Ensure proper handling of routes
  async rewrites() {
    return [];
  },
};

export default nextConfig;
