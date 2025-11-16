import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: false },
      { source: "/signup", destination: "/auth/signup", permanent: false },
    ];
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },
};

export default nextConfig;
