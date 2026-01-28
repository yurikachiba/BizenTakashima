'use client';

import Image from 'next/image';
import Link from 'next/link';
import HamburgerMenu from '@/components/HamburgerMenu';
import Footer from '@/components/Footer';
import ScrollAnimations from '@/components/ScrollAnimations';
import { useContentLoader, useAnalyticsLog } from '@/lib/content-loader';

export default function HomePage() {
  const { getContent } = useContentLoader('index');
  useAnalyticsLog('index');

  return (
    <>
      <div className="background2"></div>
      <header className="top_header">
        <HamburgerMenu />
      </header>
      <div className="top_main_div background">
        <main>
          <section className="fv positionR">
            <h1 className="gsap">
              <Image
                className="title_sp"
                src="/img/sp_fv_title.png"
                alt="備前焼作家 高島 聡平"
                width={600}
                height={200}
                priority
                unoptimized
              />
              <Image
                className="title_pc"
                src="/img/pc_fv_title.png"
                alt="備前焼作家 高島 聡平"
                width={800}
                height={200}
                priority
                unoptimized
              />
            </h1>
            <div>
              <Image
                className="fv_sp"
                src="/img/fv_no_text.png"
                alt="窯を炊いている写真"
                width={750}
                height={1000}
                priority
                unoptimized
              />
              <Image
                className="fv_pc"
                src="/img/pc_fv_no_text.png"
                alt="窯を炊いている写真"
                width={1920}
                height={800}
                priority
                unoptimized
              />
              <Image
                className="fv_tublet"
                src="/img/tublet_fv_no_text.png"
                alt="窯を炊いている写真"
                width={1024}
                height={600}
                priority
                unoptimized
              />
            </div>
          </section>

          <section className="top_main_div_omoi">
            <div className="scroll marginT40px pc_site_img sp_site_img">
              <Image
                src="/img/omoi.png"
                alt="高島が作品を作っている写真"
                width={800}
                height={600}
                data-image-key="index.philosophy_image"
                unoptimized
              />
            </div>
            <h2 className="top_main_div_omoi_h2" data-content-key="index.heading_philosophy">
              {getContent('index.heading_philosophy', 'ものづくりへの想い')}
            </h2>
            <div className="marginT20px marginB30px">
              <Image
                className="margin-display signature"
                src="/img/signature.png"
                alt="高島聡平の署名"
                width={200}
                height={80}
                unoptimized
              />
            </div>
            <div className="textA top-page-guidance-div-2 marginB120px">
              <p className="text-2 text" data-content-key="index.philosophy">
                {getContent(
                  'index.philosophy',
                  '備前焼の美しさは、原始的であることや、荒々しい表面、素朴な色合いなどが挙げられます。しかし、これらの美的要素に過度に執着すると、使い勝手が損なわれる場合があります。私は、その鑑賞と実用性のバランスを自分の感性を元に整え、焼き物の魅力を最大限に引き出し、使いやすいと思っていただける作品をお客様に提供するために日々努力しています。'
                )}
              </p>
            </div>
          </section>

          <section className="top_main_div_pageIntroduction">
            {/* 作品紹介 */}
            <div className="flex-box">
              <div className="scroll2 pc_site_img sp_site_img flex-item">
                <Image
                  src="/img/WorkIntroduction.png"
                  alt="焼く前の急須たち"
                  width={800}
                  height={600}
                  data-image-key="index.work_image"
                  unoptimized
                />
              </div>
              <div className="flex-item">
                <h2 data-content-key="index.heading_work">
                  {getContent('index.heading_work', '作品紹介')}
                </h2>
                <div className="top-page-guidance-div-2">
                  <p className="text-flex" data-content-key="index.work_intro">
                    {getContent('index.work_intro', '高島の作品写真や、作品の特徴や新しい試み、器を使う上での注意点をご紹介。')}
                  </p>
                </div>
                <div className="textA btnDiv">
                  <Link href="/work" className="btn btn--orange">詳細を見る</Link>
                </div>
              </div>
            </div>

            {/* 制作の様子 */}
            <div className="flex-box">
              <div className="scroll3 pc_site_img sp_site_img flex-item">
                <Image
                  src="/img/kneadTheClay.png"
                  alt="粘土を練っている様子"
                  width={800}
                  height={600}
                  data-image-key="index.production_image"
                  unoptimized
                />
              </div>
              <div className="flex-item">
                <h2 data-content-key="index.heading_production">
                  {getContent('index.heading_production', '制作の様子')}
                </h2>
                <div className="top-page-guidance-div-2">
                  <p className="text-flex" data-content-key="index.production_intro">
                    {getContent('index.production_intro', '高島の作品の作り方の動画や、備前焼ができるまでの流れを画像と共にご紹介。')}
                  </p>
                </div>
                <div className="textA btnDiv">
                  <Link href="/process" className="btn btn--orange">詳細を見る</Link>
                </div>
              </div>
            </div>

            {/* インタビュー */}
            <div className="flex-box">
              <div className="scroll4 pc_site_img sp_site_img flex-item">
                <Image
                  src="/img/interview.png"
                  alt="高島の顔写真"
                  width={800}
                  height={600}
                  data-image-key="index.interview_image"
                  unoptimized
                />
              </div>
              <div className="flex-item">
                <h2 data-content-key="index.heading_interview">
                  {getContent('index.heading_interview', 'インタビュー')}
                </h2>
                <div className="top-page-guidance-div-2">
                  <p className="text-flex" data-content-key="index.interview_intro">
                    {getContent('index.interview_intro', '高島の作品や岡山に対する想いや、師匠との関係などを少しご紹介。')}
                  </p>
                </div>
                <div className="textA btnDiv">
                  <Link href="/interview" className="btn btn--orange">詳細を見る</Link>
                </div>
              </div>
            </div>

            {/* 作家紹介 */}
            <div className="flex-box">
              <div className="scroll5 pc_site_img sp_site_img flex-item">
                <Image
                  src="/img/separate.png"
                  alt="糸で作品と粘土を切り離している様子の写真"
                  width={800}
                  height={600}
                  data-image-key="index.artist_image"
                  unoptimized
                />
              </div>
              <div className="flex-item">
                <h2 data-content-key="index.heading_artist">
                  {getContent('index.heading_artist', '作家紹介')}
                </h2>
                <div className="top-page-guidance-div-2">
                  <p className="text-flex" data-content-key="index.artist_intro">
                    {getContent('index.artist_intro', '人間国宝の伊勢崎 淳先生に師事し、その後独立した備前焼作家 高島 聡平。そんな彼の実績をご紹介。')}
                  </p>
                </div>
                <div className="textA btnDiv2">
                  <Link href="/artist" className="btn btn--orange">詳細を見る</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="top_main_div_salesStore">
            <div className="top_main_div_salesStore_div">
              <div className="top_main_div_salesStore_div_div flex-box-2">
                <div className="flex-item-2">
                  <h2 className="external_h3" data-content-key="index.heading_stores">
                    {getContent('index.heading_stores', '常設販売店')}
                  </h2>
                  <ul className="top_storesAndEvents">
                    <li className="external-li" style={{ marginTop: '40px' }}>
                      <a target="_blank" className="extenal-link" href="https://rtrp.jp/spots/bfbacd09-9164-44f1-b30f-be4c8352fc1e/">
                        {getContent('index.store_0_name', '器まえさか')}
                      </a>
                    </li>
                    <li className="external-li">
                      <a target="_blank" className="extenal-link" href="https://tourakuen.jp/products/search.php">
                        {getContent('index.store_1_name', '川口陶楽苑')}
                      </a>
                    </li>
                    <li className="external-li">
                      <a className="extenal-link" href="https://ryoisseki.com/">
                        {getContent('index.store_2_name', 'うつわや涼一石')}
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="flex-item-2">
                  <h2 className="external_h3" data-content-key="index.heading_exhibitions">
                    {getContent('index.heading_exhibitions', '過去の展示会')}
                  </h2>
                  <ul className="top_storesAndEvents">
                    <li className="external-li" style={{ marginTop: '40px' }}>
                      <a target="_blank" className="extenal-link" href="https://www.kakiden.com/gallery/archives/50770/">
                        {getContent('index.exhibition_0_name', '柿傳ギャラリー\n(高島聡平 展)')}
                      </a>
                    </li>
                    <li className="external-li">
                      <a target="_blank" className="extenal-link" href="https://www.kakiden.com/gallery/archives/64427/">
                        {getContent('index.exhibition_1_name', '柿傳ギャラリー\n(BIZENの八人展 Ⅱ)')}
                      </a>
                    </li>
                    <li className="external-li">
                      <a target="_blank" className="extenal-link" href="https://ryoisseki.com/%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB/%E5%82%99%E5%89%8D%E8%90%8C%E8%8A%BD%E3%80%8C%E9%AB%98%E5%B3%B6%E8%81%A1%E5%B9%B3%E3%80%8D%E5%B1%95/">
                        {getContent('index.exhibition_2_name', 'うつわや涼一石')}
                      </a>
                    </li>
                    <li className="external-li">
                      <a target="_blank" className="extenal-link" href="http://sendkushiro.com/?p=2751">
                        {getContent('index.exhibition_3_name', 'send')}
                      </a>
                    </li>
                  </ul>
                </div>
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
