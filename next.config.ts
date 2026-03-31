import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Disable source maps in production — biggest single perf win
  productionBrowserSourceMaps: false,

  // Enable gzip compression
  compress: true,

  env: {
    googleAnalyticsId: process.env.NODE_ENV === "production" ? process.env.GA_MEASUREMENT_ID : "",
  },

  // Auto tree-shake unused exports from heavy packages
  experimental: {
    optimizePackageImports: ['three', 'gsap', 'three-stdlib', '@react-three/fiber', '@react-three/drei'],
  },

  // Cache 3D models and fonts aggressively — they never change between deploys
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.woff',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*.ttf',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  webpack: (config, { dev }) => {
    // Skip minification in dev for faster rebuilds
    if (dev) {
      config.optimization.minimize = false;
    }

    return config;
  },
};

export default nextConfig;
