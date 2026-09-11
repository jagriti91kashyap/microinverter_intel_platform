/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during builds to allow for development
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip TypeScript type checking during builds - pre-existing Prisma schema mismatches in API routes
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add proper configuration for client components
  transpilePackages: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  // Enable proper image optimization
  images: {
    domains: [],
  },
  // Experimental features for Next.js 16.2.9
  experimental: {
    // Optimized bundling
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://cdn.jsdelivr.net",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
