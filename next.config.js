/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  serverRuntimeConfig: {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  },
  // Images configuration moved to the export section below
  async rewrites() {
    return [
      // Remove these PostHog-related rewrites
      // {
      //   source: "/ingest/static/:path*",
      //   destination: "https://us-assets.i.posthog.com/static/:path*",
      // },
      // {
      //   source: "/ingest/:path*",
      //   destination: "https://us.i.posthog.com/:path*",
      // },
      // {
      //   source: "/ingest/decide",
      //   destination: "https://us.i.posthog.com/decide",
      // },
    ];
  },
  // Output configuration for static hosting
  output: 'export',
  // Disable image optimization for static export
  images: {
    domains: ['www.princecapital.co.ke'],
    unoptimized: true
  },
};

module.exports = nextConfig
