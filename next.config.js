/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "upload.wikimedia.org",
      "companieslogo.com",
      "www.indusind.com"
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    return config;
  },
};

module.exports = nextConfig; 