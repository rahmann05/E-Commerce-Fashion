import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ghdadhlyhzdkrjlurifj.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
