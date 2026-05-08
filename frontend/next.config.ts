/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // 配置 API 代理
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  // 添加空的 turbopack 配置以消除警告
  turbopack: {},
};

export default nextConfig;