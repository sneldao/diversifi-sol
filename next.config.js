/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel handles hosting - no static export needed
  images: {
    unoptimized: true,
  },
  // Transpile packages with ESM issues
  transpilePackages: ['canvas-confetti'],
  // Performance optimizations
  compress: true,
  // Reduce bundle size by removing console logs in production
  env: {
    NEXT_PUBLIC_APP_NAME: 'DiversiFi',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig
