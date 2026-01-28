import type { Metadata } from 'next';
import WorkPageClient from './WorkPageClient';

export const metadata: Metadata = {
  title: '備前焼作家 高島聡平 公式サイト | 作品紹介',
  description:
    '備前焼作家、高島聡平の公式サイトの作品紹介ページです。ここでは、高島の作品写真や、作品の特徴や新しい試み、器を使う上での注意点をご紹介しています。',
  openGraph: {
    title: '備前焼作家 高島聡平 ポートフォリオサイト | 作品紹介',
    description:
      '備前焼作家、高島聡平の公式サイトの作品紹介ページです。ここでは、高島の作品写真や、作品の特徴や新しい試み、器を使う上での注意点をご紹介しています。',
    images: ['/img/thumbnail.png'],
  },
  robots: { index: false },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
