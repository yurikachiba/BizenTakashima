import type { Metadata } from 'next';
import { Suspense } from 'react';
import InterviewPageClient from './InterviewPageClient';
import { getPageContent, getPageImageKeys } from '@/lib/content-server';
import PageSkeleton from '@/components/PageSkeleton';

export const metadata: Metadata = {
  title: '備前焼作家 高島聡平 公式サイト | インタビュー',
  description:
    '備前焼作家、高島聡平の公式サイトのインタビューページです。ここでは、高島の作品や岡山に対する想いや、師匠との関係などを少しご紹介します。',
  openGraph: {
    title: '備前焼作家 高島聡平 ポートフォリオサイト | インタビュー',
    description:
      '備前焼作家、高島聡平の公式サイトのインタビューページです。ここでは、高島の作品や岡山に対する想いや、師匠との関係などを少しご紹介します。',
    images: ['/img/thumbnail.png'],
  },
};

export default function InterviewPage() {
  const contentPromise = getPageContent('interview');
  const imageKeysPromise = getPageImageKeys('interview');

  return (
    <Suspense fallback={<PageSkeleton title="インタビュー" />}>
      <InterviewPageClient
        contentPromise={contentPromise}
        imageKeysPromise={imageKeysPromise}
      />
    </Suspense>
  );
}
