'use client';

import Image from 'next/image';
import HamburgerMenu from '@/components/HamburgerMenu';
import Footer from '@/components/Footer';
import ScrollAnimations from '@/components/ScrollAnimations';
import { useContentLoader, useAnalyticsLog } from '@/lib/content-loader';

const WORKS = [
  {
    src: '/img/bizen_sakeVessels_threeItems.png',
    alt: '備前 酒器 三点',
    caption: '備前 酒器 三点',
    imageKey: 'work.image_0',
    captionKey: 'work.caption_0',
  },
  {
    src: '/img/bizen_oldColor_teaBowl.png',
    alt: '灰釉 茶盌',
    caption: '備前 古色 茶盌',
    imageKey: 'work.image_1',
    captionKey: 'work.caption_1',
  },
  {
    src: '/img/bizen_chachugi.png',
    alt: '備前 茶注',
    caption: '備前 茶注',
    imageKey: 'work.image_2',
    captionKey: 'work.caption_2',
  },
  {
    src: '/img/bizen_pot.png',
    alt: '備前 鉢',
    caption: '備前 鉢',
    imageKey: 'work.image_3',
    captionKey: 'work.caption_3',
  },
  {
    src: '/img/bizen_jar.png',
    alt: '備前 壺',
    caption: '備前 壺',
    imageKey: 'work.image_4',
    captionKey: 'work.caption_4',
  },
  {
    src: '/img/bizen_hidasuki_tokkuri.png',
    alt: '備前 火襷 徳利',
    caption: '備前 火襷 徳利',
    imageKey: 'work.image_5',
    captionKey: 'work.caption_5',
  },
  {
    src: '/img/ashGlaze_teaBowl.png',
    alt: '灰釉 茶盌',
    caption: '灰釉 茶盌',
    imageKey: 'work.image_6',
    captionKey: 'work.caption_6',
  },
  {
    src: '/img/bizen_oldColor_hyotokkuri.png',
    alt: '備前 瓢徳利',
    caption: '備前 古色 瓢徳利',
    imageKey: 'work.image_7',
    captionKey: 'work.caption_7',
  },
  {
    src: '/img/bizen_pitcher.png',
    alt: '備前 ピッチャー',
    caption: '備前 ピッチャー',
    imageKey: 'work.image_8',
    captionKey: 'work.caption_8',
  },
];

const FAQ_ITEMS = [
  {
    qKey: 'work.faq_q_0',
    aKey: 'work.faq_0',
    q: '使い始め',
    a: '使い始めのザラザラした表面には油分や汚れ、水分が入り込みやすいため、使い始めの数か月は使用前に30分ほど水につけておくと入り込んだ汚れや水分が洗いやすくなります。',
  },
  {
    qKey: 'work.faq_q_1',
    aKey: 'work.faq_1',
    q: '使用後の洗い方は？',
    a: '使用後は、他の食器と同じように中性洗剤を使用して洗いましょう。なるべく早めに洗うことをおすすめします。また、濡れたままにしておくとカビや臭いの原因になるためしっかりと乾かすことが大切です。',
  },
  {
    qKey: 'work.faq_q_2',
    aKey: 'work.faq_2',
    q: '食洗機は使ってもいい？',
    a: '食洗機の使用は、ほかの食器にぶつかるなどして割れたり欠けたりするリスクがあるためあまりおすすめしませんが、私自身の経験側としては食器は使ってもらっても大丈夫だと思っています。最終的な判断は自己責任でお願いいたします。',
  },
  {
    qKey: 'work.faq_q_3',
    aKey: 'work.faq_3',
    q: '備前焼の汚れのお手入れ方法',
    a: 'クリーニングをする際には、常温の水に備前焼を入れてゆっくり沸騰するまで温度を上げていき殺菌するだけで大丈夫です。もし茶渋やコーヒーが染みついてしまった場合は、ハイターなどの漂白剤をごく薄めにしてお手入れすればきれいにすることができます。',
  },
  {
    qKey: 'work.faq_q_4',
    aKey: 'work.faq_4',
    q: 'ガスコンロ・IH・直火での使用は禁止',
    a: '備前の土には耐火素材を使用していないので、ひび割れや破損を起こします 電子レンジの使用は出来ますが、注意が必要です。温度差によって割れてしまう場合もあるので、器ごと冷やしていた場合などはすぐに温めることはしないでください。',
  },
  {
    qKey: 'work.faq_q_5',
    aKey: 'work.faq_5',
    q: '梅雨の時期はカビなどに注意して保管する',
    a: '長期間湿気に触れることでカビが生えたり欠けたりする原因になるので、理想は梅雨時期などは食器棚にしまわずにつねに表に出しておくか、しっかりと乾かして乾燥材とともに箱にしまっておくことをおすすめします。',
  },
];

export default function WorkPageClient() {
  const { getContent } = useContentLoader('work');
  useAnalyticsLog('work');

  return (
    <>
      <header className="site-header">
        <HamburgerMenu />
      </header>

      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero__image">
          <Image
            src="/img/WorkIntroduction.png"
            alt="高島が作った備前焼の壺"
            width={1200}
            height={600}
            priority
            unoptimized
          />
        </div>
        <div className="page-hero__overlay"></div>
        <h1 className="page-hero__title" data-content-key="work.heading_h1">
          {getContent('work.heading_h1', '作品紹介')}
        </h1>
      </div>

      <div className="page-content">
        <main>
          {/* Gallery */}
          <section className="page-section">
            <h2 className="page-section-heading reveal" data-content-key="work.heading_list">
              {getContent('work.heading_list', '作品一覧')}
            </h2>
            <div className="work-gallery">
              {WORKS.map((work, i) => (
                <div key={i} className="work-gallery__item reveal">
                  <div className="work-gallery__image">
                    <Image
                      src={work.src}
                      alt={work.alt}
                      width={400}
                      height={400}
                      data-image-key={work.imageKey}
                      unoptimized
                    />
                  </div>
                  <p className="work-gallery__caption" data-content-key={work.captionKey}>
                    {getContent(work.captionKey, work.caption)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="page-section">
            <h2 className="page-section-heading reveal" data-content-key="work.heading_features">
              {getContent('work.heading_features', '作品の特徴')}
            </h2>
            <div className="reveal">
              <p className="text-body" data-content-key="work.features">
                {getContent(
                  'work.features',
                  '最近はお抹茶の茶碗や急須など、茶器を制作することに力を注いでいます。急須を作るには色々な細かい技術が必要になるので、急須作りで培ったバランス感覚を他の作品に反映させています。軽くて使いやすくなるように設計し、日常的に使えるものを制作しています。使えない、使いたくないと思われるものは作らないように努力しています。薄さ、重さを用途に合わせて最適な形に設計しています。どこに厚みを持たせるかを考え抜いて作っています。',
                )}
              </p>
            </div>
          </section>

          {/* New Attempts */}
          <section className="page-section">
            <h2 className="page-section-heading reveal" data-content-key="work.heading_new_attempts">
              {getContent('work.heading_new_attempts', '新しい試み')}
            </h2>
            <div className="reveal">
              <p className="text-body" data-content-key="work.new_attempts">
                {getContent(
                  'work.new_attempts',
                  '新しい試みとして、「薪を使用しない備前焼」というものも制作しています。備前焼の魅力は薪窯でこそ表現出来るものだと思いますが、薪を使用せずに、灯油窯や電気窯で焼成しても、重厚な雰囲気の持った備前焼を作ることができる方法を発見し、実験を続けています。',
                )}
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="page-section">
            <h2 className="page-section-heading reveal" data-content-key="work.heading_faq">
              {getContent('work.heading_faq', '器を使う上でのお願い')}
            </h2>
            <div className="faq reveal">
              {FAQ_ITEMS.map((item, i) => (
                <details key={i} className="faq__item">
                  <summary data-content-key={item.qKey}>{getContent(item.qKey, item.q)}</summary>
                  <p data-content-key={item.aKey}>{getContent(item.aKey, item.a)}</p>
                </details>
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
