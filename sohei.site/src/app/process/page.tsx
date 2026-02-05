import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProcessPageClient from './ProcessPageClient';
import { getPageContent, getPageImageKeys } from '@/lib/content-server';
import PageSkeleton from '@/components/PageSkeleton';

export const metadata: Metadata = {
  title: '制作の様子',
  description:
    '備前焼作家、高島聡平の公式サイトの制作の様子ページです。ここでは、高島の作品の作り方の動画や、備前焼ができるまでの流れを画像と共にご紹介します。',
  alternates: {
    canonical: '/process',
  },
  openGraph: {
    title: '制作の様子 | 備前焼作家 高島聡平',
    description:
      '備前焼作家、高島聡平の公式サイトの制作の様子ページです。ここでは、高島の作品の作り方の動画や、備前焼ができるまでの流れを画像と共にご紹介します。',
    url: '/process',
    images: [
      {
        url: '/img/thumbnail.png',
        width: 1200,
        height: 630,
        alt: '高島聡平の備前焼制作過程',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '制作の様子 | 備前焼作家 高島聡平',
    description: '備前焼ができるまでの流れを動画と画像でご紹介。',
    images: ['/img/thumbnail.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': 'https://www.sohei-portfolio.com/process',
  name: '備前焼の制作過程',
  description: '高島聡平による備前焼の制作過程。土づくりから窯焚きまでの流れをご紹介。',
  url: 'https://www.sohei-portfolio.com/process',
  isPartOf: {
    '@id': 'https://www.sohei-portfolio.com/#website',
  },
  author: {
    '@id': 'https://www.sohei-portfolio.com/#person',
  },
  step: [
    {
      '@type': 'HowToStep',
      name: '土づくり',
      text: '備前焼に適した土を選び、準備する工程',
    },
    {
      '@type': 'HowToStep',
      name: '成形',
      text: '轆轤や手びねりで形を作る工程',
    },
    {
      '@type': 'HowToStep',
      name: '乾燥',
      text: '成形した作品を乾燥させる工程',
    },
    {
      '@type': 'HowToStep',
      name: '窯焚き',
      text: '窯で焼成する工程',
    },
  ],
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
        name: '制作の様子',
        item: 'https://www.sohei-portfolio.com/process',
      },
    ],
  },
};

export default function ProcessPage() {
  const contentPromise = getPageContent('production');
  const imageKeysPromise = getPageImageKeys('production');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<PageSkeleton title="制作の様子" />}>
        <ProcessPageClient contentPromise={contentPromise} imageKeysPromise={imageKeysPromise} />
      </Suspense>
    </>
  );
}
