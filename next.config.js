/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["placeholder.svg", "images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
