import type { NextConfig } from 'next';

function buildStorageImagePattern() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const parsedUrl = new URL(apiUrl);

  return {
    protocol: parsedUrl.protocol.replace(':', '') as 'http' | 'https',
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    pathname: '/storage/**',
  };
}

const isLocalApi =
  process.env.NEXT_PUBLIC_API_URL?.includes('localhost') ||
  process.env.NEXT_PUBLIC_API_URL?.includes('127.0.0.1');

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },

  images: {
    dangerouslyAllowLocalIP: isLocalApi,

    remotePatterns: [
      buildStorageImagePattern(),

      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
