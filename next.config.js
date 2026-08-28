/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.git/**', '**/backend/**'],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
