'use client';

import Image from 'next/image';
import HamburgerMenu from '@/components/HamburgerMenu';
import Footer from '@/components/Footer';
import ScrollAnimations from '@/components/ScrollAnimations';
import { useContentLoader, useAnalyticsLog } from '@/lib/content-loader';

export default function ArtistPageClient() {
  const { getContent } = useContentLoader('artist');
  useAnalyticsLog('artist');

  return (
    <>
      <header className="site-header">
        <HamburgerMenu />
      </header>

      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero__image">
          <Image
            src="/img/artistIntroduction_top.png"
            alt="高島聡平の写真"
            width={1200}
            height={600}
            priority
            data-image-key="artist.top_image"
            unoptimized
          />
        </div>
        <div className="page-hero__overlay"></div>
        <h1 className="page-hero__title" data-content-key="artist.heading_h1">
          {getContent('artist.heading_h1', '作家紹介')}
        </h1>
      </div>

      <div className="page-content">
        <main>
          {/* Profile */}
          <section className="page-section">
            <h2 className="page-section-heading reveal" data-content-key="artist.heading_profile">
              {getContent('artist.heading_profile', 'プロフィール')}
            </h2>
            <div className="reveal">
              <p className="text-body" data-content-key="artist.profile">
                {getContent('artist.profile', '備前焼作家。岡山県備前市在住。人間国宝 伊勢崎 淳先生に師事。')}
              </p>
            </div>
          </section>

          {/* Quote */}
          <section className="page-section">
            <div className="artist-quote reveal">
              <p data-content-key="artist.quote">
                {getContent(
                  'artist.quote',
                  '日本陶磁協会誌「陶説」にて「備前の正統を歩みながら、旧来の概念に囚われない自由で新鮮な感覚は、これからの備前の新しい世界を切り拓いていく大きな力となるでしょう。」と評価される。',
                )}
              </p>
            </div>
          </section>

          {/* Timeline */}
          <section className="page-section">
            <h2 className="page-section-heading reveal" data-content-key="artist.heading_timeline">
              {getContent('artist.heading_timeline', '経歴')}
            </h2>
            <div className="artist-timeline reveal">
              {[
                { key: 'artist.timeline_0', text: '2003年　備前焼作家 人間国宝 伊勢崎 淳先生に師事' },
                { key: 'artist.timeline_1', text: '2006年　田部美術館大賞「茶の湯の造形展」入選' },
                { key: 'artist.timeline_2', text: '2010年　岡山県美術展覧会 入選' },
                { key: 'artist.timeline_3', text: '2011年　独立' },
                { key: 'artist.timeline_4', text: '2012年　穴窯築窯' },
                { key: 'artist.timeline_5', text: '2019年　日本陶磁協会誌「陶説」に掲載' },
                { key: 'artist.timeline_6', text: '2023年　柿傳ギャラリーにて個展' },
              ].map((item, i) => (
                <div key={i} className="artist-timeline__item">
                  <p data-content-key={item.key}>{getContent(item.key, item.text)}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer />
      <ScrollAnimations />
    </>
  );
}
