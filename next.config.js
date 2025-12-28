/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      // Add your production image domains here if needed
      // {
      //   protocol: 'https',
      //   hostname: 'your-image-host.com',
      //   pathname: '/**',
      // },
    ],
  },
  // Enable compression (swcMinify is enabled by default in Next.js 16)
  compress: true,
}

module.exports = nextConfig

