import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProcessPageClient from './ProcessPageClient';
import { getPageContent, getPageImageKeys } from '@/lib/content-server';
import PageSkeleton from '@/components/PageSkeleton';

export const metadata: Metadata = {
  title: '備前焼作家 高島聡平 公式サイト | 制作の様子',
  description:
    '備前焼作家、高島聡平の公式サイトの制作の様子ページです。ここでは、高島の作品の作り方の動画や、備前焼ができるまでの流れを画像と共にご紹介します。',
  openGraph: {
    title: '備前焼作家 高島聡平 ポートフォリオサイト | 制作の様子',
    description:
      '備前焼作家、高島聡平の公式サイトの制作の様子ページです。ここでは、高島の作品の作り方の動画や、備前焼ができるまでの流れを画像と共にご紹介します。',
    images: ['/img/thumbnail.png'],
  },
};

export default function ProcessPage() {
  const contentPromise = getPageContent('production');
  const imageKeysPromise = getPageImageKeys('production');

  return (
    <Suspense fallback={<PageSkeleton title="制作の様子" />}>
      <ProcessPageClient
        contentPromise={contentPromise}
        imageKeysPromise={imageKeysPromise}
      />
    </Suspense>
  );
}
