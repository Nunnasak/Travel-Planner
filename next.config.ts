import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [new URL('https://images.unsplash.com/**')],
  },
};

export default nextConfig;
