import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ตั้งค่าอนุญาตให้ดึงรูปภาพจากโดเมนภายนอกได้
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // (ออปชันเสริม) ถ้าคุณจะใส่ Security Headers ที่ผมแนะนำไปเมื่อกี้ด้วย ก็พิมพ์ต่อท้ายลงมาได้เลยครับแบบนี้
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;