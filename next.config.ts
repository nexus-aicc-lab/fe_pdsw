
import type { NextConfig } from "next";
import packageJson from './package.json';


const nextConfig: NextConfig = {
  reactStrictMode: false,
  // distDir: '.next_upds',
  images: {
    unoptimized: true,
    loader: "default",
    /*
    domains: ['localhost', '10.10.40.145'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    */
    // 환경 변수 추가
  },

  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version || '0.0.0',
  },

  async rewrites() {
    return [
      {
        source: '/api_upds/v1/:path*',
        destination: 'http://10.10.30.228:4000/api_upds/v1/:path*'
        //destination: 'http://localhost:4000/api_upds/v1/:path*'
      },
      {
        source: '/pds/:path*',
        destination: 'http://10.10.40.145:8010/pds/:path*'
      }
    ]
  }
};

export default nextConfig;