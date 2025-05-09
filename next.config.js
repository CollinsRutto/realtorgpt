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
  images: {
    domains: ['www.princecapital.co.ke'], // Add any external domains you're loading images from
  },
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
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig
