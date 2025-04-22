import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "peaceful-perch-557.convex.cloud", protocol: "https" },
      { hostname: "animated-rooster-655.convex.cloud", protocol: "https" },
    ],
  },
};

export default nextConfig;
