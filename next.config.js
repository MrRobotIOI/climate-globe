/** @type {import('next').NextConfig} */
const isStaticExport = Boolean(process.env.GITHUB_ACTIONS);

const nextConfig = {
  // GitHub Pages (`configure-pages`) is a static HTML export — no API routes.
  ...(isStaticExport ? { output: 'export', images: { unoptimized: true } } : {}),
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/backend/**',
          '**/.idea/**',
          '**/.next/**',
          '**/out/**',
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
