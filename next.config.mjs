/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  experimental: {
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
};

export default nextConfig;
