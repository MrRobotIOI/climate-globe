/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to the backend so the browser never calls localhost:8000 directly
  // (avoids "local network access" prompts). In production, set NEXT_PUBLIC_API_URL to your backend URL.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
      const target = apiUrl.replace(/\/$/, '');
      return [{ source: '/api/proxy/:path*', destination: `${target}/:path*` }];
    }
    return [];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    return config;
  },
};

module.exports = nextConfig;
