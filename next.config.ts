import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Article images uploaded to Vercel Blob
    remotePatterns: [{ protocol: "https", hostname: "**.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
