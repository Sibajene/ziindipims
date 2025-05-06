/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Add this configuration to serve static files from the uploads directory
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*', // Assuming your backend runs on port 3001
      },
    ];
  },
  experimental: {
    esmExternals: true,
  },
};

export default nextConfig;
