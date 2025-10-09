import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/docs',
        destination: '/api/docs/route',
      },
    ]
  },
};

export default nextConfig;
