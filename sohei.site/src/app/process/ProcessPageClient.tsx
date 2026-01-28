'use client';

import Image from 'next/image';
import HamburgerMenu from '@/components/HamburgerMenu';
import Footer from '@/components/Footer';
import ScrollAnimations from '@/components/ScrollAnimations';
import { useContentLoader, useAnalyticsLog } from '@/lib/content-loader';

const STEPS = [
  { img: '/img/complete.png', alt: '焼き物の完成した写真', key: 'production.image_0' },
  { img: '/img/originalSoil.png', alt: '原土の写真', key: 'production.image_1' },
  { img: '/img/clayProduction.png', alt: '粘土を精製している写真', key: 'production.image_2' },
  { img: '/img/clayPot.png', alt: '素焼き鉢（植木鉢）の写真', key: 'production.image_3' },
  { img: '/img/clay.png', alt: '粘土の写真', key: 'production.image_4' },
  {
    img: '/img/spiralWedging.png',
    alt: '菊練りの写真',
    key: 'production.image_5',
    youtube: 'https://www.youtube.com/embed/UINddZBlXKA?si=ONc5cd0J6_H_zpGw',
  },
  {
    img: '/img/molding.png',
    alt: 'ろくろで成形した作品',
    key: 'production.image_6',
    youtube: 'https://www.youtube.com/embed/i8zNkNUtsZI?si=Fkihce3k8HsTUReE',
  },
  { img: '/img/teapotBox.png', alt: '乾燥させた急須の入った箱の写真', key: 'production.image_7' },
  { img: '/img/kilnFilling.png', alt: '窯詰めの写真', key: 'production.image_8' },
  { img: '/img/straw.png', alt: '藁の写真', key: 'production.image_9' },
  { img: '/img/splitWood.png', alt: '割木の写真', key: 'production.image_10' },
  { img: '/img/splitWoodOutside.png', alt: '外にある割木の写真', key: 'production.image_11' },
  { img: '/img/kilnFiring.png', alt: '窯焚きの写真', key: 'production.image_12' },
  { img: '/img/UpperMouth.png', alt: '上口の写真', key: 'production.image_13' },
  { img: '/img/firePit.png', alt: '焚き口の写真', key: 'production.image_14' },
  { img: '/img/fire-breathingFirePit.png', alt: '火を吹く焚き口の写真', key: 'production.image_15' },
  { img: '/img/OutOfTheKiln.png', alt: '窯出しの写真', key: 'production.image_16' },
  { img: '/img/WaterLeakCheck.png', alt: '窯出しの写真', key: 'production.image_17' },
];

const STEP_TEXTS: Record<string, string> = {
  'production.intro':
    '備前焼とは釉薬を使わずに焼き締める、岡山県備前市周辺で採れた土で制作されたものを指します。ここでは、使用出来るようになるまでの流れを簡単に紹介しようと思います。',
  'production.step_0':
    '備前市内で採れた原土（げんど）になります。備前土と言われるものの大半は、田んぼの3～5メートル下で採れた土のことを言います。現在では、備前周辺の山から採れたもの、池の裾で採れたもの、工事現場で出てきた土など、焼き物に使える土はあらゆる所から採取する機会があります。そのような土を多数入手し、土の特性を理解し、作品にその特性を生かすようにブレンドしていきます。',
  'production.step_1':
    '原土を乾燥させ、細かく砕いたのちに水に浸し、泥状にします。この後に石や不純物を取り除くためにメッシュ（細かい網目）に通して調整します。画像の土は、一般的な備前土ではありません。目が粗く、ぼさぼさで炎が強く当たる場所で焼くと表面が白くなるという備前ではあまり使用されていない土です。こういった土もブレンドして、色合いや土の表情を理想の姿へと調節していきます。',
  'production.step_2':
    '泥状になった土の水分を調節するために入れておく素焼き鉢になります。専用に作られたものがありますが、自分は植木鉢を代用しています。ちょうどいい硬さになったら練って粘土にします。',
  'production.step_3':
    '上記の過程を経て粘土の塊になったものです。ビニールの袋に入れて水分を保ちながら保存します。この時間が長ければ長いほど、粘りのある使いやすい土になります。',
  'production.step_4':
    '荒練りは、土の柔らかさを均一に整えるために行う作業です。その後にするのが菊練り（写真は菊練り）。空気を抜く作業です。菊のような模様になるから菊練りというらしいです。',
  'production.step_5': 'ろくろで成形後、高台を削り水分が無くなるまでゆっくり乾燥させます。',
  'production.step_6':
    '乾燥によって形が崩れたりしてしまうので、出来るだけゆっくり乾燥します。箱やビニール袋などで乾燥度合いを調節します。',
  'production.step_7': '乾燥させた作品が貯まったら、穴窯に作品を配置していきます。',
  'production.step_8': '配置するときに藁を作品に当てて、火襷の模様がつくようにします。',
  'production.step_9':
    '赤松の大割（割木）を備前焼では使用します。自分の窯は一回の窯焚きで400〜600束使います。この割木が備前焼に色付けするための最も重要な役割を持つ材料です。',
  'production.step_10': '薪が湿っていると温度が上がりづらくなるので、３ヶ月から半年位乾燥させます。',
  'production.step_11':
    '割り木を使用し、少しずつ温度を上げていきます。窯焚きは24時間5日間焚き続けます。最終的には1230度を目指して焚き続けます。',
  'production.step_12':
    '温度が上がるにつれ、窯内部の色が明るくなってきます。上口からも割り木を入れ、温度をより上げていきます。',
  'production.step_13':
    '後ろの方には火が届かないところもあるので、横から小割を入れて焼き上げるための焚き口があります。',
  'production.step_14': '高温になるにつれ、横穴から火を吹くこともあります。',
  'production.step_15':
    '温度が下がったら窯から作品を出していきます。どのように焼けたかチェックしながら、次の窯でどのようにするか考え、記録していきます。',
  'production.step_16':
    '焼き上がり、表面を綺麗にやすり掛けした後、水を入れて漏れがないか確認作業をします。300～400点ほどチェックしたのちに展示会場に並ぶことになります。',
};

export default function ProcessPageClient() {
  const { getContent } = useContentLoader('production');
  useAnalyticsLog('production');

  const stepTextKeys = [
    'production.intro',
    'production.step_0',
    'production.step_1',
    'production.step_2',
    'production.step_3',
    'production.step_4',
    'production.step_5',
    'production.step_6',
    'production.step_7',
    'production.step_8',
    'production.step_9',
    'production.step_10',
    'production.step_11',
    'production.step_12',
    'production.step_13',
    'production.step_14',
    'production.step_15',
    'production.step_16',
  ];

  return (
    <>
      <header className="site-header">
        <HamburgerMenu />
      </header>

      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero__image">
          <Image src="/img/kilnFiring.png" alt="窯焚きの写真" width={1200} height={600} priority unoptimized />
        </div>
        <div className="page-hero__overlay"></div>
        <h1 className="page-hero__title" data-content-key="production.heading_h1">
          {getContent('production.heading_h1', '制作の様子')}
        </h1>
      </div>

      <div className="page-content">
        <main>
          <section className="page-section">
            <p className="process-byline reveal" data-content-key="production.byline">
              {getContent('production.byline', '解説：高島 聡平')}
            </p>

            <div className="process-timeline">
              {STEPS.map((step, i) => {
                const textKey = stepTextKeys[i];
                return (
                  <div key={i} className="process-step reveal">
                    <span className="process-step__number">{String(i + 1).padStart(2, '0')}</span>
                    <div className="process-step__image">
                      <Image
                        src={step.img}
                        alt={step.alt}
                        width={800}
                        height={600}
                        data-image-key={step.key}
                        unoptimized
                      />
                    </div>
                    {(step as { youtube?: string }).youtube && (
                      <iframe
                        className="process-step__video"
                        src={(step as { youtube: string }).youtube}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    )}
                    <p className="text-body" data-content-key={textKey}>
                      {getContent(textKey, STEP_TEXTS[textKey] || '')}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
        <Footer />
      </div>
      <ScrollAnimations />
    </>
  );
}
