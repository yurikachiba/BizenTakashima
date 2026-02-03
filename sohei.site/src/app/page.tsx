import { Suspense } from 'react';
import HomePageClient from './HomePageClient';
import { getPageContent, getPageImageKeys } from '@/lib/content-server';
import HomePageSkeleton from './HomePageSkeleton';

export default function HomePage() {
  // Server Componentでデータ取得を開始（Promiseを生成）
  const contentPromise = getPageContent('index');
  const imageKeysPromise = getPageImageKeys('index');

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient contentPromise={contentPromise} imageKeysPromise={imageKeysPromise} />
    </Suspense>
  );
}
