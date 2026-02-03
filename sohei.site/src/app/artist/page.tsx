import type { Metadata } from 'next';
import { Suspense } from 'react';
import ArtistPageClient from './ArtistPageClient';
import { getPageContent, getPageImageKeys } from '@/lib/content-server';
import PageSkeleton from '@/components/PageSkeleton';

export const metadata: Metadata = {
  title: '備前焼作家 高島聡平 公式サイト | 作家紹介',
  description:
    '備前焼作家、高島聡平の公式サイトの作家紹介ページです。ここでは、高島の実績やプロフィールをご紹介します。',
  openGraph: {
    title: '備前焼作家 高島聡平 ポートフォリオサイト | 作家紹介',
    description:
      '備前焼作家、高島聡平の公式サイトの作家紹介ページです。ここでは、高島の実績やプロフィールをご紹介します。',
    images: ['/img/thumbnail.png'],
  },
};

export default function ArtistPage() {
  const contentPromise = getPageContent('artist');
  const imageKeysPromise = getPageImageKeys('artist');

  return (
    <Suspense fallback={<PageSkeleton title="作家紹介" />}>
      <ArtistPageClient contentPromise={contentPromise} imageKeysPromise={imageKeysPromise} />
    </Suspense>
  );
}
