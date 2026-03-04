import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages deployment
  // See: https://developers.cloudflare.com/pages/framework-guides/nextjs/
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "places.googleapis.com" },
    ],
    // Use unoptimized images on Cloudflare (no image optimization server)
    unoptimized: true,
  },
};

export default nextConfig;
