import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@prep-meds/clinical-engine', '@prep-meds/terminology'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
