import type { Metadata } from 'next';
import { Suspense } from 'react';
import ArtistPageClient from './ArtistPageClient';
import { getPageContent, getPageImageKeys } from '@/lib/content-server';
import PageSkeleton from '@/components/PageSkeleton';

export const metadata: Metadata = {
  title: '作家紹介',
  description:
    '備前焼作家、高島聡平の公式サイトの作家紹介ページです。ここでは、高島の実績やプロフィールをご紹介します。',
  alternates: {
    canonical: '/artist',
  },
  openGraph: {
    title: '作家紹介 | 備前焼作家 高島聡平',
    description:
      '備前焼作家、高島聡平の公式サイトの作家紹介ページです。ここでは、高島の実績やプロフィールをご紹介します。',
    url: '/artist',
    images: [
      {
        url: '/img/thumbnail.png',
        width: 1200,
        height: 630,
        alt: '備前焼作家 高島聡平',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '作家紹介 | 備前焼作家 高島聡平',
    description: '備前焼作家、高島聡平の実績やプロフィールをご紹介。',
    images: ['/img/thumbnail.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': 'https://www.sohei-portfolio.com/artist',
  name: '高島聡平 プロフィール',
  description: '備前焼作家、高島聡平の実績やプロフィール。',
  url: 'https://www.sohei-portfolio.com/artist',
  isPartOf: {
    '@id': 'https://www.sohei-portfolio.com/#website',
  },
  mainEntity: {
    '@id': 'https://www.sohei-portfolio.com/#person',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: 'https://www.sohei-portfolio.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '作家紹介',
        item: 'https://www.sohei-portfolio.com/artist',
      },
    ],
  },
};

export default function ArtistPage() {
  const contentPromise = getPageContent('artist');
  const imageKeysPromise = getPageImageKeys('artist');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<PageSkeleton title="作家紹介" />}>
        <ArtistPageClient contentPromise={contentPromise} imageKeysPromise={imageKeysPromise} />
      </Suspense>
    </>
  );
}
