import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/workIntroduction.html', destination: '/work', permanent: true },
      { source: '/productionProcess.html', destination: '/process', permanent: true },
      { source: '/interview.html', destination: '/interview', permanent: true },
      { source: '/artistIntroduction.html', destination: '/artist', permanent: true },
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
