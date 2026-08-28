/** @type {import('next').NextConfig} */
const isStaticExport = Boolean(process.env.GITHUB_ACTIONS);
// Project Pages live at https://<user>.github.io/<repo>/ — assets must use that prefix.
const repoName = (process.env.GITHUB_REPOSITORY || '').split('/')[1] || '';
const isProjectPages = isStaticExport && repoName && !repoName.endsWith('.github.io');
const basePath = isProjectPages ? `/${repoName}` : '';

const nextConfig = {
  ...(isStaticExport
    ? { output: 'export', images: { unoptimized: true }, trailingSlash: true }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
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
