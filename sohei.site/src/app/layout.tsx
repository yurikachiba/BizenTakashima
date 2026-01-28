import type { Metadata } from 'next';
import './globals.scss';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="theme-color" content="#1a1714" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout applies to all pages */}
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&family=Zen+Old+Mincho:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
