import type { Metadata } from 'next';
import { Shippori_Mincho, Noto_Sans_JP, Zen_Old_Mincho } from 'next/font/google';
import './globals.scss';

const shipporiMincho = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-shippori-mincho',
  preload: true,
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
  preload: true,
});

const zenOldMincho = Zen_Old_Mincho({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-zen-old-mincho',
  preload: true,
});

export const metadata: Metadata = {
  title: '備前焼作家 高島聡平 公式サイト',
  description:
    '備前焼作家、高島聡平の公式サイトへようこそ。ここでは、彼の作品の特徴、新しい試み、使用する際の注意点、制作過程、インタビュー、プロフィール、そして販売店舗情報をご紹介しています。',
  metadataBase: new URL('https://www.sohei-portfolio.com'),
  openGraph: {
    type: 'website',
    url: 'https://www.sohei-portfolio.com',
    title: '備前焼作家 高島聡平 公式サイト',
    description:
      '備前焼作家、高島聡平の公式サイトへようこそ。ここでは、彼の作品の特徴、新しい試み、使用する際の注意点、制作過程、インタビュー、プロフィール、そして販売店舗情報をご紹介しています。',
    siteName: '備前焼作家 高島聡平 公式サイト',
    images: ['/img/thumbnail.png'],
  },
  twitter: {
    card: 'summary',
  },
  icons: {
    icon: [
      { url: '/img/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/img/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/img/favicon/apple-touch-icon.png',
  },
  manifest: '/img/favicon/site.webmanifest',
  other: {
    'msapplication-TileColor': '#da532c',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://www.sohei-portfolio.com/#person',
      name: '高島聡平',
      alternateName: 'Takashima Sohei',
      description: '備前焼作家。伝統的な技法を継承しながら、現代的な感性を融合させた作品を制作。',
      url: 'https://www.sohei-portfolio.com',
      image: 'https://www.sohei-portfolio.com/img/thumbnail.png',
      jobTitle: '備前焼作家',
      knowsAbout: ['備前焼', '陶芸', '日本の伝統工芸'],
      sameAs: ['https://www.instagram.com/sohei_takashima/'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.sohei-portfolio.com/#website',
      url: 'https://www.sohei-portfolio.com',
      name: '備前焼作家 高島聡平 公式サイト',
      description:
        '備前焼作家、高島聡平の公式サイト。作品紹介、制作過程、インタビュー、プロフィール、販売店舗情報を掲載。',
      publisher: {
        '@id': 'https://www.sohei-portfolio.com/#person',
      },
      inLanguage: 'ja',
    },
    {
      '@type': 'CreativeWork',
      '@id': 'https://www.sohei-portfolio.com/#works',
      name: '高島聡平の備前焼作品',
      description: '伝統的な備前焼の技法を用いながら、現代的なデザインを取り入れた器や花器などの作品。',
      creator: {
        '@id': 'https://www.sohei-portfolio.com/#person',
      },
      material: '備前土',
      artform: '陶芸',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${shipporiMincho.variable} ${notoSansJP.variable} ${zenOldMincho.variable}`}>
      <head>
        <meta name="theme-color" content="#1a1714" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
