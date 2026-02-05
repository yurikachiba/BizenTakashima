import type { Metadata } from 'next';
import { Suspense } from 'react';
import InterviewPageClient from './InterviewPageClient';
import { getPageContent, getPageImageKeys } from '@/lib/content-server';
import PageSkeleton from '@/components/PageSkeleton';

export const metadata: Metadata = {
  title: 'インタビュー',
  description:
    '備前焼作家、高島聡平の公式サイトのインタビューページです。ここでは、高島の作品や岡山に対する想いや、師匠との関係などを少しご紹介します。',
  alternates: {
    canonical: '/interview',
  },
  openGraph: {
    title: 'インタビュー | 備前焼作家 高島聡平',
    description:
      '備前焼作家、高島聡平の公式サイトのインタビューページです。ここでは、高島の作品や岡山に対する想いや、師匠との関係などを少しご紹介します。',
    url: '/interview',
    images: [
      {
        url: '/img/thumbnail.png',
        width: 1200,
        height: 630,
        alt: '高島聡平インタビュー',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'インタビュー | 備前焼作家 高島聡平',
    description: '高島聡平の作品や岡山に対する想い、師匠との関係などをご紹介。',
    images: ['/img/thumbnail.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': 'https://www.sohei-portfolio.com/interview',
  headline: '高島聡平 インタビュー',
  description: '備前焼作家、高島聡平の作品や岡山に対する想い、師匠との関係についてのインタビュー。',
  url: 'https://www.sohei-portfolio.com/interview',
  isPartOf: {
    '@id': 'https://www.sohei-portfolio.com/#website',
  },
  author: {
    '@id': 'https://www.sohei-portfolio.com/#person',
  },
  about: {
    '@id': 'https://www.sohei-portfolio.com/#person',
  },
  articleSection: 'インタビュー',
  inLanguage: 'ja',
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
        name: 'インタビュー',
        item: 'https://www.sohei-portfolio.com/interview',
      },
    ],
  },
};

export default function InterviewPage() {
  const contentPromise = getPageContent('interview');
  const imageKeysPromise = getPageImageKeys('interview');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<PageSkeleton title="インタビュー" />}>
        <InterviewPageClient contentPromise={contentPromise} imageKeysPromise={imageKeysPromise} />
      </Suspense>
    </>
  );
}
