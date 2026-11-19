import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/discover', // เปลี่ยนเป็นหน้าเริ่มต้นที่ต้องการ
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
