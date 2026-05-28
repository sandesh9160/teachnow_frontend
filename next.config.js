/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: 'https', hostname: '**.example.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: '**.jobsvedika.in' },
      { protocol: 'http', hostname: '**.jobsvedika.in' },
      { protocol: 'http', hostname: 'teachnowbackend.jobsvedika.in' },
      { protocol: 'https', hostname: 'teachnowbackend.jobsvedika.in' },
    ],
  },
  turbopack: {}, // ✅ just enable Turbopack
  distDir: '.next', // optional but safe
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

module.exports = nextConfig;