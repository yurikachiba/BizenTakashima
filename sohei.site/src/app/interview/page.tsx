import type { Metadata } from 'next';
import InterviewPageClient from './InterviewPageClient';

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
  return <InterviewPageClient />;
}
