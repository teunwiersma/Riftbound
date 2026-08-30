import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    remotePatterns: [new URL('https://cmsassets.rgpub.io/**')]
  }
};

export default nextConfig;
