import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'skillicons.dev',
      },
      {
        protocol: 'https',
        hostname: 'r2.better-t-stack.dev',
      },
      {
        protocol: 'https',
        hostname: 'www.jwt.io',
      },
    ],
  },
};

export default withMDX(config);
