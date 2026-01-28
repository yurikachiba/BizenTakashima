import type { Metadata } from 'next';
import ArtistPageClient from './ArtistPageClient';

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
  robots: { index: false },
};

export default function ArtistPage() {
  return <ArtistPageClient />;
}
