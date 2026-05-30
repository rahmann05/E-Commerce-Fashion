import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  // This helps Next.js trace dependencies correctly in a monorepo
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  async rewrites() {
    // If INTERNAL_API_URL is set, we are in Docker. Otherwise, we are local.
    const internalApiUrl = process.env.INTERNAL_API_URL;
    let gatewayUrl = 'http://localhost:8000';
    
    if (internalApiUrl) {
      try {
        const url = new URL(internalApiUrl);
        gatewayUrl = url.origin;
      } catch (e) {
        gatewayUrl = 'http://api-gateway:8000';
      }
    }

    return [
      {
        source: '/api/assets/:path*',
        destination: `${gatewayUrl}/api/assets/:path*`,
      },
    ];
  },
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
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'api-gateway',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
