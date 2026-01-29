import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/workIntroduction.html', destination: '/work', permanent: true },
      { source: '/productionProcess.html', destination: '/process', permanent: true },
      { source: '/interview.html', destination: '/interview', permanent: true },
      { source: '/artistIntroduction.html', destination: '/artist', permanent: true },
      { source: '/sohei-kiln-room-m7x9.html', destination: '/sohei-kiln-room-m7x9', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/sohei-kiln-room-m7x9',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
