'use client';

import Image from 'next/image';
import HamburgerMenu from '@/components/HamburgerMenu';
import Footer from '@/components/Footer';
import ScrollAnimations from '@/components/ScrollAnimations';
import { useContentLoader, useAnalyticsLog } from '@/lib/content-loader';

const QA_ITEMS = [
  {
    qKey: 'interview.q_0',
    aKey: 'interview.a_0',
    q: '陶芸家として大切にしていることはどのようなことですか？',
    a: '自分自身が焼き物の好きな所を明確に捉えるために、日々考えながら生きていくことです。そういう積み重ねがなければ、作品を使ったり見たり、言葉にして語ったとしても人にはなかなか伝わらないと思っています。',
  },
  {
    qKey: 'interview.q_1',
    aKey: 'interview.a_1',
    q: '自身の考える高島さんの作品の強みについて教えてください。',
    a: '固定概念に縛られすぎないようにしていることですかね。歴史が長い焼き物であるため、偉大な先輩方が築きあげた技術や価値観に縛られすぎずに、今を生きている自分自身の感覚をベースに物事を捉えるようにしていることが、大切なんじゃないかなと思っています。ただ、すでにあることをあったようにするのではなく、今の自分が噛み砕いて表現してみる。みたいな感じですかね。昔にはなかったかもしれないけど、こういった側面の焼き物も面白いんじゃない？を思って作っていっています。',
  },
  {
    qKey: 'interview.q_2',
    aKey: 'interview.a_2',
    q: '陶芸の面白さついて教えてください',
    a: '少し思うようにいかない所ですかね。焼けも形もある程度は予想通りにはなりますが、最後の良し悪しのもう一歩は窯に任せることしか出来ないので、そういう「いきもの」と対面しているかのような感覚が楽しいのだと思います。',
  },
  {
    qKey: 'interview.q_3',
    aKey: 'interview.a_3',
    q: '岡山県の良さについて少し教えてください',
    a: '備前焼をやるにはこれ以上いい場所はないと思います。なにより、備前の土は備前周辺でしか採れないので・・・また、焼き物をする上で必要な道具や割り木などを近場で揃えられる環境、交通の便の良さや気候など、総合的に考えてもかなりいい場所だと思ってます。',
  },
  {
    qKey: 'interview.q_4',
    aKey: 'interview.a_4',
    q: '作品を制作している時に気にしていることなどありますか',
    a: '食器でしたら手に持った時の軽さと、ある程度の強度を持たせるための厚みのバランスはかなり考えています。その上で、現代の食卓に並んでも輝けるような造形にしたいと常に模索しています。茶盌、花生などの茶陶は、茶の湯のルールに従った上で出来る限りの焼き締めの良いところを存分に表現したいと思いながら制作しております。',
  },
  {
    qKey: 'interview.q_5',
    aKey: 'interview.a_5',
    q: '修行中はどのような指導がありましたか？',
    a: '先生からは自分の作品作りに関しての具体的な指示はなく、作品の印象、焼き色との相性などのアドバイスを頂くことはありました。今考えれば、人の意見を十分に聞き、反芻し、その言葉に向き合い、その結果で自分から出てくるものからしか作品は生まれないと気付くきっかけになったと思います。',
  },
];

export default function InterviewPageClient() {
  const { getContent } = useContentLoader('interview');
  useAnalyticsLog('interview');

  return (
    <>
      <header className="site-header">
        <HamburgerMenu />
      </header>

      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero__image">
          <Image
            src="/img/interview_top.png"
            alt="高島の顔写真"
            width={1200}
            height={600}
            priority
            data-image-key="interview.top_image"
            unoptimized
          />
        </div>
        <div className="page-hero__overlay"></div>
        <h1 className="page-hero__title" data-content-key="interview.heading_h1">
          {getContent('interview.heading_h1', 'インタビュー')}
        </h1>
      </div>

      <div className="page-content">
        <main>
          <section className="page-section">
            <div className="interview-qa">
              {QA_ITEMS.map((item, i) => (
                <div key={i} className="interview-qa__block reveal">
                  <div className="interview-qa__question">
                    <span className="interview-qa__label interview-qa__label--q">Q</span>
                    <p data-content-key={item.qKey}>{getContent(item.qKey, item.q)}</p>
                  </div>
                  <div className="interview-qa__answer">
                    <span className="interview-qa__label interview-qa__label--a">A</span>
                    <p data-content-key={item.aKey}>{getContent(item.aKey, item.a)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
      <ScrollAnimations />
    </>
  );
}
