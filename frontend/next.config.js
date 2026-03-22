/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: 'export' mode works for static sites but prevents API routes at runtime
  // For Vercel deployment with API routes (/api/blitz/*), use default mode
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
