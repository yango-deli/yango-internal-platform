/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do NOT set output:standalone on Vercel — it uses its own build pipeline
  experimental: {
    // Correct key for Next.js 14 — keeps Prisma out of the edge bundle
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  // Required for xlsx to work in API routes (it uses fs/stream)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "xlsx"];
    }
    return config;
  },
};

export default nextConfig;
