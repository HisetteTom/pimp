import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  basePath: basePath || undefined,
};

export default nextConfig;
