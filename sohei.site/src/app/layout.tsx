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
  title: {
    default: '備前焼作家 高島聡平 公式サイト',
    template: '%s | 備前焼作家 高島聡平',
  },
  description:
    '備前焼作家、高島聡平の公式サイトへようこそ。ここでは、彼の作品の特徴、新しい試み、使用する際の注意点、制作過程、インタビュー、プロフィール、そして販売店舗情報をご紹介しています。',
  keywords: [
    '備前焼',
    '高島聡平',
    '陶芸',
    '陶芸家',
    '備前焼作家',
    '日本の伝統工芸',
    '焼き物',
    '器',
    '花器',
    '茶器',
    '岡山',
    'Bizen pottery',
    'Japanese ceramics',
  ],
  authors: [{ name: '高島聡平', url: 'https://www.sohei-portfolio.com' }],
  creator: '高島聡平',
  publisher: '高島聡平',
  metadataBase: new URL('https://www.sohei-portfolio.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ja-JP': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.sohei-portfolio.com',
    title: '備前焼作家 高島聡平 公式サイト',
    description:
      '備前焼作家、高島聡平の公式サイトへようこそ。ここでは、彼の作品の特徴、新しい試み、使用する際の注意点、制作過程、インタビュー、プロフィール、そして販売店舗情報をご紹介しています。',
    siteName: '備前焼作家 高島聡平 公式サイト',
    images: [
      {
        url: '/img/thumbnail.png',
        width: 1200,
        height: 630,
        alt: '備前焼作家 高島聡平の作品',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '備前焼作家 高島聡平 公式サイト',
    description: '備前焼作家、高島聡平の公式サイト。作品紹介、制作過程、インタビュー、プロフィールを掲載。',
    images: ['/img/thumbnail.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/img/favicon/favicon.ico', sizes: 'any' },
      { url: '/img/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/img/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/img/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/img/favicon/favicon-32x32.png', color: '#1a1714' }],
  },
  manifest: '/img/favicon/site.webmanifest',
  category: 'art',
  other: {
    'msapplication-TileColor': '#da532c',
    'format-detection': 'telephone=no',
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
