'use client';

import Image from 'next/image';
import Link from 'next/link';
import HamburgerMenu from '@/components/HamburgerMenu';
import Footer from '@/components/Footer';
import ScrollAnimations from '@/components/ScrollAnimations';
import { useContentLoader, useAnalyticsLog } from '@/lib/content-loader';

export default function HomePageClient() {
  const { getContent } = useContentLoader('index');
  useAnalyticsLog('index');

  return (
    <>
      <header className="site-header">
        <HamburgerMenu />
      </header>

      <main className="top-page">
        {/* === Hero Section === */}
        <section className="hero">
          <div className="hero__bg">
            <Image
              className="hero__img hero__img--sp"
              src="/img/fv_no_text.png"
              alt="窯を炊いている写真"
              width={750}
              height={1000}
              priority
              unoptimized
            />
            <Image
              className="hero__img hero__img--pc"
              src="/img/pc_fv_no_text.png"
              alt="窯を炊いている写真"
              width={1920}
              height={800}
              priority
              unoptimized
            />
            <Image
              className="hero__img hero__img--tab"
              src="/img/tublet_fv_no_text.png"
              alt="窯を炊いている写真"
              width={1024}
              height={600}
              priority
              unoptimized
            />
          </div>
          <div className="hero__overlay"></div>
          <div className="hero__content">
            <h1 className="hero__title gsap-hero">
              <Image
                className="hero__title-img hero__title-img--sp"
                src="/img/sp_fv_title.png"
                alt="備前焼作家 高島 聡平"
                width={600}
                height={200}
                priority
                unoptimized
              />
              <Image
                className="hero__title-img hero__title-img--pc"
                src="/img/pc_fv_title.png"
                alt="備前焼作家 高島 聡平"
                width={800}
                height={200}
                priority
                unoptimized
              />
            </h1>
          </div>
          <div className="hero__scroll-indicator">
            <span></span>
          </div>
        </section>

        {/* === Philosophy Section === */}
        <section className="philosophy">
          <div className="philosophy__inner">
            <div className="philosophy__image reveal">
              <Image
                src="/img/omoi.png"
                alt="高島が作品を作っている写真"
                width={800}
                height={600}
                data-image-key="index.philosophy_image"
                unoptimized
              />
            </div>
            <div className="philosophy__text reveal reveal-delay-1">
              <h2 className="section-heading" data-content-key="index.heading_philosophy">
                {getContent('index.heading_philosophy', 'ものづくりへの想い')}
              </h2>
              <div className="philosophy__signature">
                <Image src="/img/signature.png" alt="高島聡平の署名" width={200} height={80} unoptimized />
              </div>
              <p className="text-body" data-content-key="index.philosophy">
                {getContent(
                  'index.philosophy',
                  '備前焼の美しさは、原始的であることや、荒々しい表面、素朴な色合いなどが挙げられます。しかし、これらの美的要素に過度に執着すると、使い勝手が損なわれる場合があります。私は、その鑑賞と実用性のバランスを自分の感性を元に整え、焼き物の魅力を最大限に引き出し、使いやすいと思っていただける作品をお客様に提供するために日々努力しています。',
                )}
              </p>
            </div>
          </div>
        </section>

        {/* === Navigation Sections === */}
        <section className="sections-nav">
          {/* 作品紹介 */}
          <div className="section-card reveal">
            <div className="section-card__image">
              <Image
                src="/img/WorkIntroduction.png"
                alt="焼く前の急須たち"
                width={800}
                height={600}
                data-image-key="index.work_image"
                unoptimized
              />
            </div>
            <div className="section-card__body">
              <span className="section-card__number">01</span>
              <h2 className="section-card__title" data-content-key="index.heading_work">
                {getContent('index.heading_work', '作品紹介')}
              </h2>
              <p className="section-card__desc text-body" data-content-key="index.work_intro">
                {getContent(
                  'index.work_intro',
                  '高島の作品写真や、作品の特徴や新しい試み、器を使う上での注意点をご紹介。',
                )}
              </p>
              <Link href="/work" className="section-card__link">
                <span>詳細を見る</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* 制作の様子 */}
          <div className="section-card section-card--reverse reveal">
            <div className="section-card__image">
              <Image
                src="/img/kneadTheClay.png"
                alt="粘土を練っている様子"
                width={800}
                height={600}
                data-image-key="index.production_image"
                unoptimized
              />
            </div>
            <div className="section-card__body">
              <span className="section-card__number">02</span>
              <h2 className="section-card__title" data-content-key="index.heading_production">
                {getContent('index.heading_production', '制作の様子')}
              </h2>
              <p className="section-card__desc text-body" data-content-key="index.production_intro">
                {getContent(
                  'index.production_intro',
                  '高島の作品の作り方の動画や、備前焼ができるまでの流れを画像と共にご紹介。',
                )}
              </p>
              <Link href="/process" className="section-card__link">
                <span>詳細を見る</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* インタビュー */}
          <div className="section-card reveal">
            <div className="section-card__image">
              <Image
                src="/img/interview.png"
                alt="高島の顔写真"
                width={800}
                height={600}
                data-image-key="index.interview_image"
                unoptimized
              />
            </div>
            <div className="section-card__body">
              <span className="section-card__number">03</span>
              <h2 className="section-card__title" data-content-key="index.heading_interview">
                {getContent('index.heading_interview', 'インタビュー')}
              </h2>
              <p className="section-card__desc text-body" data-content-key="index.interview_intro">
                {getContent('index.interview_intro', '高島の作品や岡山に対する想いや、師匠との関係などを少しご紹介。')}
              </p>
              <Link href="/interview" className="section-card__link">
                <span>詳細を見る</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* 作家紹介 */}
          <div className="section-card section-card--reverse reveal">
            <div className="section-card__image">
              <Image
                src="/img/separate.png"
                alt="糸で作品と粘土を切り離している様子の写真"
                width={800}
                height={600}
                data-image-key="index.artist_image"
                unoptimized
              />
            </div>
            <div className="section-card__body">
              <span className="section-card__number">04</span>
              <h2 className="section-card__title" data-content-key="index.heading_artist">
                {getContent('index.heading_artist', '作家紹介')}
              </h2>
              <p className="section-card__desc text-body" data-content-key="index.artist_intro">
                {getContent(
                  'index.artist_intro',
                  '人間国宝の伊勢崎 淳先生に師事し、その後独立した備前焼作家 高島 聡平。そんな彼の実績をご紹介。',
                )}
              </p>
              <Link href="/artist" className="section-card__link">
                <span>詳細を見る</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* === Stores & Exhibitions === */}
        <section className="info-section">
          <div className="info-section__inner">
            <div className="info-block reveal">
              <h2 className="info-block__title" data-content-key="index.heading_stores">
                {getContent('index.heading_stores', '常設販売店')}
              </h2>
              <ul className="info-block__list">
                <li>
                  <a
                    target="_blank"
                    href={getContent(
                      'index.store_0_url',
                      'https://rtrp.jp/spots/bfbacd09-9164-44f1-b30f-be4c8352fc1e/',
                    )}
                  >
                    {getContent('index.store_0_name', '器まえさか')}
                  </a>
                </li>
                <li>
                  <a target="_blank" href={getContent('index.store_1_url', 'https://tourakuen.jp/index.php')}>
                    {getContent('index.store_1_name', '川口陶楽苑')}
                  </a>
                </li>
                <li>
                  <a target="_blank" href={getContent('index.store_2_url', 'https://ryoisseki.com/')}>
                    {getContent('index.store_2_name', 'うつわや涼一石')}
                  </a>
                </li>
              </ul>
            </div>
            <div className="info-block reveal reveal-delay-1">
              <h2 className="info-block__title" data-content-key="index.heading_exhibitions">
                {getContent('index.heading_exhibitions', '過去の展示会')}
              </h2>
              <ul className="info-block__list">
                <li>
                  <a
                    target="_blank"
                    href={getContent('index.exhibition_0_url', 'https://www.kakiden.com/gallery/archives/50770/')}
                  >
                    {getContent('index.exhibition_0_name', '柿傳ギャラリー\n(高島聡平 展)')}
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href={getContent('index.exhibition_1_url', 'https://www.kakiden.com/gallery/archives/64427/')}
                  >
                    {getContent('index.exhibition_1_name', '柿傳ギャラリー\n(BIZENの八人展 Ⅱ)')}
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href={getContent(
                      'index.exhibition_2_url',
                      'https://ryoisseki.com/%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB/%E5%82%99%E5%89%8D%E8%90%8C%E8%8A%BD%E3%80%8C%E9%AB%98%E5%B3%B6%E8%81%A1%E5%B9%B3%E3%80%8D%E5%B1%95/',
                    )}
                  >
                    {getContent('index.exhibition_2_name', 'うつわや涼一石')}
                  </a>
                </li>
                <li>
                  <a target="_blank" href={getContent('index.exhibition_3_url', 'http://sendkushiro.com/?p=2751')}>
                    {getContent('index.exhibition_3_name', 'send')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollAnimations />
    </>
  );
}
