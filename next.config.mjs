/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
    optimizePackageImports: [
      'lucide-react',
      '@clerk/nextjs',
      'recharts',
      'date-fns',
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      {
        source: '/ai-review',
        destination: '/ai-reviews',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/reviews',
        destination: '/ai-reviews',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
