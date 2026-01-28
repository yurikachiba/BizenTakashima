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
      <header className="workIntroduction_header">
        <HamburgerMenu />
      </header>
      <div className="workIntroduction_main_div background">
        <main>
          <h1 className="otherPage-h1" data-content-key="artist.heading_h1">
            {getContent('artist.heading_h1', '作家紹介')}
          </h1>
          <div className="pc_site_img">
            <Image
              className="otherPageTopImage"
              src="/img/artistIntroduction_top.png"
              alt="高島聡平の写真"
              width={800}
              height={600}
              data-image-key="artist.top_image"
              unoptimized
            />
          </div>

          <section>
            <h2 className="otherPage-h2" data-content-key="artist.heading_profile">
              {getContent('artist.heading_profile', 'プロフィール')}
            </h2>
            <div className="textA">
              <p className="text-2 text marginB50px" data-content-key="artist.profile">
                {getContent('artist.profile', '備前焼作家。岡山県備前市在住。人間国宝 伊勢崎 淳先生に師事。')}
              </p>
            </div>
          </section>

          <section>
            <div className="blockquote" style={{ padding: '20px', margin: '0 auto 50px', width: '80%', borderRadius: '8px' }}>
              <p className="text-2 text" data-content-key="artist.quote" style={{ fontStyle: 'italic' }}>
                {getContent('artist.quote', '日本陶磁協会誌「陶説」にて「備前の正統を歩みながら、旧来の概念に囚われない自由で新鮮な感覚は、これからの備前の新しい世界を切り拓いていく大きな力となるでしょう。」と評価される。')}
              </p>
            </div>
          </section>

          <section>
            <h2 className="otherPage-h2" data-content-key="artist.heading_timeline">
              {getContent('artist.heading_timeline', '経歴')}
            </h2>
            <div className="textA" style={{ width: '80%', margin: '0 auto' }}>
              <div className="text marginB120px" style={{ textAlign: 'left' }}>
                <p className="marginB10px" data-content-key="artist.timeline_0">
                  {getContent('artist.timeline_0', '2003年　備前焼作家 人間国宝 伊勢崎 淳先生に師事')}
                </p>
                <p className="marginB10px" data-content-key="artist.timeline_1">
                  {getContent('artist.timeline_1', '2006年　田部美術館大賞「茶の湯の造形展」入選')}
                </p>
                <p className="marginB10px" data-content-key="artist.timeline_2">
                  {getContent('artist.timeline_2', '2010年　岡山県美術展覧会 入選')}
                </p>
                <p className="marginB10px" data-content-key="artist.timeline_3">
                  {getContent('artist.timeline_3', '2011年　独立')}
                </p>
                <p className="marginB10px" data-content-key="artist.timeline_4">
                  {getContent('artist.timeline_4', '2012年　穴窯築窯')}
                </p>
                <p className="marginB10px" data-content-key="artist.timeline_5">
                  {getContent('artist.timeline_5', '2019年　日本陶磁協会誌「陶説」に掲載')}
                </p>
                <p className="marginB10px" data-content-key="artist.timeline_6">
                  {getContent('artist.timeline_6', '2023年　柿傳ギャラリーにて個展')}
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
      <ScrollAnimations />
    </>
  );
}
