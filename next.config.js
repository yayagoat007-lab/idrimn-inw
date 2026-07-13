/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for Capacitor mobile export & static serving
  images: {
    unoptimized: true, // Required for static exports
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
