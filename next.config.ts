import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@pulumi/pulumi", "@pulumi/gcp", "@pulumi/pulumi/automation"],
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/@pulumi\/pulumi\/typescript-shim\.js/ },
    ];
    return config;
  },
};

export default nextConfig;
