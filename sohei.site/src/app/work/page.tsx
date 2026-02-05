import type { Metadata } from 'next';
import { Suspense } from 'react';
import WorkPageClient from './WorkPageClient';
import { getPageContent, getPageImageKeys } from '@/lib/content-server';
import PageSkeleton from '@/components/PageSkeleton';

export const metadata: Metadata = {
  title: '作品紹介',
  description:
    '備前焼作家、高島聡平の公式サイトの作品紹介ページです。ここでは、高島の作品写真や、作品の特徴や新しい試み、器を使う上での注意点をご紹介しています。',
  alternates: {
    canonical: '/work',
  },
  openGraph: {
    title: '作品紹介 | 備前焼作家 高島聡平',
    description:
      '備前焼作家、高島聡平の公式サイトの作品紹介ページです。ここでは、高島の作品写真や、作品の特徴や新しい試み、器を使う上での注意点をご紹介しています。',
    url: '/work',
    images: [
      {
        url: '/img/thumbnail.png',
        width: 1200,
        height: 630,
        alt: '高島聡平の備前焼作品',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '作品紹介 | 備前焼作家 高島聡平',
    description: '備前焼作家、高島聡平の作品写真や、作品の特徴、新しい試みをご紹介。',
    images: ['/img/thumbnail.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': 'https://www.sohei-portfolio.com/work',
  name: '高島聡平の備前焼作品',
  description: '備前焼作家、高島聡平の作品紹介。作品の特徴や新しい試み、器を使う上での注意点をご紹介。',
  url: 'https://www.sohei-portfolio.com/work',
  isPartOf: {
    '@id': 'https://www.sohei-portfolio.com/#website',
  },
  about: {
    '@type': 'CreativeWork',
    name: '備前焼',
    material: '備前土',
  },
  author: {
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
        name: '作品紹介',
        item: 'https://www.sohei-portfolio.com/work',
      },
    ],
  },
};

export default function WorkPage() {
  const contentPromise = getPageContent('work');
  const imageKeysPromise = getPageImageKeys('work');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<PageSkeleton title="作品紹介" />}>
        <WorkPageClient contentPromise={contentPromise} imageKeysPromise={imageKeysPromise} />
      </Suspense>
    </>
  );
}
