import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: [
    '@open-wa/wa-automate',
    'puppeteer',
    'puppeteer-core',
    'puppeteer-extra',
    'puppeteer-extra-plugin',
    'puppeteer-extra-plugin-devtools',
    'got',
    'http-auth',
    'passport',
    'electron',
  ],
};

export default nextConfig;
