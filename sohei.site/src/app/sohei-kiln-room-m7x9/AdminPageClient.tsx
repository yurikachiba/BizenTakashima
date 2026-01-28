'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import '@/styles/admin/admin.css';

const API_BASE = '';

interface AnalyticsStats {
  totalVisits: number;
  prevTotalVisits: number;
  uniqueVisitors: number;
  prevUniqueVisitors: number;
  todayVisits: number;
  yesterdayVisits: number;
  avgVisitsPerDay: number;
  byPage: { page: string; count: number }[];
  daily: Record<string, Record<string, number>>;
  hourly: number[];
  referrers: { referrer: string; count: number }[];
  devices: { mobile: number; tablet: number; desktop: number };
  browsers: { browser: string; count: number }[];
  screens: { size: string; count: number }[];
  languages: { language: string; count: number }[];
  contentStats: { totalEntries: number; lastUpdated: string | null };
}

type PageTab = 'dashboard' | 'index' | 'work' | 'production' | 'interview' | 'artist' | 'settings';

const PAGE_NAMES: Record<string, string> = {
  index: 'トップページ',
  work: '作品紹介',
  production: '制作の様子',
  interview: 'インタビュー',
  artist: '作家紹介',
};

const PAGE_CONTENT_KEYS: Record<string, string[]> = {
  index: [
    'index.heading_philosophy',
    'index.philosophy',
    'index.heading_work',
    'index.work_intro',
    'index.heading_production',
    'index.production_intro',
    'index.heading_interview',
    'index.interview_intro',
    'index.heading_artist',
    'index.artist_intro',
    'index.heading_stores',
    'index.store_0_name',
    'index.store_0_url',
    'index.store_1_name',
    'index.store_1_url',
    'index.store_2_name',
    'index.store_2_url',
    'index.heading_exhibitions',
    'index.exhibition_0_name',
    'index.exhibition_0_url',
    'index.exhibition_1_name',
    'index.exhibition_1_url',
    'index.exhibition_2_name',
    'index.exhibition_2_url',
    'index.exhibition_3_name',
    'index.exhibition_3_url',
    'index.heading_contact',
    'index.contact_text',
    'index.instagram_url',
    'index.copyright',
  ],
  work: [
    'work.heading_h1',
    'work.heading_list',
    'work.caption_0',
    'work.caption_1',
    'work.caption_2',
    'work.caption_3',
    'work.caption_4',
    'work.caption_5',
    'work.caption_6',
    'work.caption_7',
    'work.caption_8',
    'work.heading_features',
    'work.features',
    'work.heading_new_attempts',
    'work.new_attempts',
    'work.heading_faq',
    'work.faq_q_0',
    'work.faq_0',
    'work.faq_q_1',
    'work.faq_1',
    'work.faq_q_2',
    'work.faq_2',
    'work.faq_q_3',
    'work.faq_3',
    'work.faq_q_4',
    'work.faq_4',
    'work.faq_q_5',
    'work.faq_5',
  ],
  production: [
    'production.heading_h1',
    'production.heading_h2',
    'production.byline',
    'production.intro',
    'production.youtube_0',
    'production.youtube_1',
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
  ],
  interview: [
    'interview.heading_h1',
    'interview.q_0',
    'interview.a_0',
    'interview.q_1',
    'interview.a_1',
    'interview.q_2',
    'interview.a_2',
    'interview.q_3',
    'interview.a_3',
    'interview.q_4',
    'interview.a_4',
    'interview.q_5',
    'interview.a_5',
  ],
  artist: [
    'artist.heading_h1',
    'artist.heading_profile',
    'artist.profile',
    'artist.quote',
    'artist.heading_timeline',
    'artist.timeline_0',
    'artist.timeline_1',
    'artist.timeline_2',
    'artist.timeline_3',
    'artist.timeline_4',
    'artist.timeline_5',
    'artist.timeline_6',
  ],
};

const PAGE_IMAGE_KEYS: Record<string, string[]> = {
  index: [
    'index.philosophy_image',
    'index.work_image',
    'index.production_image',
    'index.interview_image',
    'index.artist_image',
  ],
  work: [
    'work.top_image',
    'work.image_0',
    'work.image_1',
    'work.image_2',
    'work.image_3',
    'work.image_4',
    'work.image_5',
    'work.image_6',
    'work.image_7',
    'work.image_8',
  ],
  production: Array.from({ length: 18 }, (_, i) => `production.image_${i}`),
  interview: ['interview.top_image'],
  artist: ['artist.top_image'],
};

// ============================================
// Default content values from each page
// ============================================
const DEFAULT_CONTENT: Record<string, string> = {
  // -- Index --
  'index.heading_philosophy': 'ものづくりへの想い',
  'index.philosophy':
    '備前焼の美しさは、原始的であることや、荒々しい表面、素朴な色合いなどが挙げられます。しかし、これらの美的要素に過度に執着すると、使い勝手が損なわれる場合があります。私は、その鑑賞と実用性のバランスを自分の感性を元に整え、焼き物の魅力を最大限に引き出し、使いやすいと思っていただける作品をお客様に提供するために日々努力しています。',
  'index.heading_work': '作品紹介',
  'index.work_intro': '高島の作品写真や、作品の特徴や新しい試み、器を使う上での注意点をご紹介。',
  'index.heading_production': '制作の様子',
  'index.production_intro': '高島の作品の作り方の動画や、備前焼ができるまでの流れを画像と共にご紹介。',
  'index.heading_interview': 'インタビュー',
  'index.interview_intro': '高島の作品や岡山に対する想いや、師匠との関係などを少しご紹介。',
  'index.heading_artist': '作家紹介',
  'index.artist_intro': '人間国宝の伊勢崎 淳先生に師事し、その後独立した備前焼作家 高島 聡平。そんな彼の実績をご紹介。',
  'index.heading_stores': '常設販売店',
  'index.store_0_name': '器まえさか',
  'index.store_0_url': 'https://rtrp.jp/spots/bfbacd09-9164-44f1-b30f-be4c8352fc1e/',
  'index.store_1_name': '川口陶楽苑',
  'index.store_1_url': 'https://tourakuen.jp/products/search.php',
  'index.store_2_name': 'うつわや涼一石',
  'index.store_2_url': 'https://ryoisseki.com/',
  'index.heading_exhibitions': '過去の展示会',
  'index.exhibition_0_name': '柿傳ギャラリー\n(高島聡平 展)',
  'index.exhibition_0_url': 'https://www.kakiden.com/gallery/archives/50770/',
  'index.exhibition_1_name': '柿傳ギャラリー\n(BIZENの八人展 II)',
  'index.exhibition_1_url': 'https://www.kakiden.com/gallery/archives/64427/',
  'index.exhibition_2_name': 'うつわや涼一石',
  'index.exhibition_2_url':
    'https://ryoisseki.com/%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB/%E5%82%99%E5%89%8D%E8%90%8C%E8%8A%BD%E3%80%8C%E9%AB%98%E5%B3%B6%E8%81%A1%E5%B9%B3%E3%80%8D%E5%B1%95/',
  'index.exhibition_3_name': 'send',
  'index.exhibition_3_url': 'http://sendkushiro.com/?p=2751',
  'index.heading_contact': 'お問い合わせ',
  'index.contact_text': '',
  'index.instagram_url': 'https://www.instagram.com/p/CzjLvCaPF2S/',
  'index.copyright': '',

  // -- Work --
  'work.heading_h1': '作品紹介',
  'work.heading_list': '作品一覧',
  'work.caption_0': '備前 酒器 三点',
  'work.caption_1': '備前 古色 茶盌',
  'work.caption_2': '備前 茶注',
  'work.caption_3': '備前 鉢',
  'work.caption_4': '備前 壺',
  'work.caption_5': '備前 火襷 徳利',
  'work.caption_6': '灰釉 茶盌',
  'work.caption_7': '備前 古色 瓢徳利',
  'work.caption_8': '備前 ピッチャー',
  'work.heading_features': '作品の特徴',
  'work.features':
    '最近はお抹茶の茶碗や急須など、茶器を制作することに力を注いでいます。急須を作るには色々な細かい技術が必要になるので、急須作りで培ったバランス感覚を他の作品に反映させています。軽くて使いやすくなるように設計し、日常的に使えるものを制作しています。使えない、使いたくないと思われるものは作らないように努力しています。薄さ、重さを用途に合わせて最適な形に設計しています。どこに厚みを持たせるかを考え抜いて作っています。',
  'work.heading_new_attempts': '新しい試み',
  'work.new_attempts':
    '新しい試みとして、「薪を使用しない備前焼」というものも制作しています。備前焼の魅力は薪窯でこそ表現出来るものだと思いますが、薪を使用せずに、灯油窯や電気窯で焼成しても、重厚な雰囲気の持った備前焼を作ることができる方法を発見し、実験を続けています。',
  'work.heading_faq': '器を使う上でのお願い',
  'work.faq_q_0': '使い始め',
  'work.faq_0':
    '使い始めのザラザラした表面には油分や汚れ、水分が入り込みやすいため、使い始めの数か月は使用前に30分ほど水につけておくと入り込んだ汚れや水分が洗いやすくなります。',
  'work.faq_q_1': '使用後の洗い方は？',
  'work.faq_1':
    '使用後は、他の食器と同じように中性洗剤を使用して洗いましょう。なるべく早めに洗うことをおすすめします。また、濡れたままにしておくとカビや臭いの原因になるためしっかりと乾かすことが大切です。',
  'work.faq_q_2': '食洗機は使ってもいい？',
  'work.faq_2':
    '食洗機の使用は、ほかの食器にぶつかるなどして割れたり欠けたりするリスクがあるためあまりおすすめしませんが、私自身の経験側としては食器は使ってもらっても大丈夫だと思っています。最終的な判断は自己責任でお願いいたします。',
  'work.faq_q_3': '備前焼の汚れのお手入れ方法',
  'work.faq_3':
    'クリーニングをする際には、常温の水に備前焼を入れてゆっくり沸騰するまで温度を上げていき殺菌するだけで大丈夫です。もし茶渋やコーヒーが染みついてしまった場合は、ハイターなどの漂白剤をごく薄めにしてお手入れすればきれいにすることができます。',
  'work.faq_q_4': 'ガスコンロ・IH・直火での使用は禁止',
  'work.faq_4':
    '備前の土には耐火素材を使用していないので、ひび割れや破損を起こします 電子レンジの使用は出来ますが、注意が必要です。温度差によって割れてしまう場合もあるので、器ごと冷やしていた場合などはすぐに温めることはしないでください。',
  'work.faq_q_5': '梅雨の時期はカビなどに注意して保管する',
  'work.faq_5':
    '長期間湿気に触れることでカビが生えたり欠けたりする原因になるので、理想は梅雨時期などは食器棚にしまわずにつねに表に出しておくか、しっかりと乾かして乾燥材とともに箱にしまっておくことをおすすめします。',

  // -- Production --
  'production.heading_h1': '制作の様子',
  'production.heading_h2': '',
  'production.byline': '解説：高島 聡平',
  'production.youtube_0': 'https://www.youtube.com/embed/UINddZBlXKA?si=ONc5cd0J6_H_zpGw',
  'production.youtube_1': 'https://www.youtube.com/embed/i8zNkNUtsZI?si=Fkihce3k8HsTUReE',
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

  // -- Interview --
  'interview.heading_h1': 'インタビュー',
  'interview.q_0': '陶芸家として大切にしていることはどのようなことですか？',
  'interview.a_0':
    '自分自身が焼き物の好きな所を明確に捉えるために、日々考えながら生きていくことです。そういう積み重ねがなければ、作品を使ったり見たり、言葉にして語ったとしても人にはなかなか伝わらないと思っています。',
  'interview.q_1': '自身の考える高島さんの作品の強みについて教えてください。',
  'interview.a_1':
    '固定概念に縛られすぎないようにしていることですかね。歴史が長い焼き物であるため、偉大な先輩方が築きあげた技術や価値観に縛られすぎずに、今を生きている自分自身の感覚をベースに物事を捉えるようにしていることが、大切なんじゃないかなと思っています。ただ、すでにあることをあったようにするのではなく、今の自分が噛み砕いて表現してみる。みたいな感じですかね。昔にはなかったかもしれないけど、こういった側面の焼き物も面白いんじゃない？を思って作っていっています。',
  'interview.q_2': '陶芸の面白さついて教えてください',
  'interview.a_2':
    '少し思うようにいかない所ですかね。焼けも形もある程度は予想通りにはなりますが、最後の良し悪しのもう一歩は窯に任せることしか出来ないので、そういう「いきもの」と対面しているかのような感覚が楽しいのだと思います。',
  'interview.q_3': '岡山県の良さについて少し教えてください',
  'interview.a_3':
    '備前焼をやるにはこれ以上いい場所はないと思います。なにより、備前の土は備前周辺でしか採れないので・・・また、焼き物をする上で必要な道具や割り木などを近場で揃えられる環境、交通の便の良さや気候など、総合的に考えてもかなりいい場所だと思ってます。',
  'interview.q_4': '作品を制作している時に気にしていることなどありますか',
  'interview.a_4':
    '食器でしたら手に持った時の軽さと、ある程度の強度を持たせるための厚みのバランスはかなり考えています。その上で、現代の食卓に並んでも輝けるような造形にしたいと常に模索しています。茶盌、花生などの茶陶は、茶の湯のルールに従った上で出来る限りの焼き締めの良いところを存分に表現したいと思いながら制作しております。',
  'interview.q_5': '修行中はどのような指導がありましたか？',
  'interview.a_5':
    '先生からは自分の作品作りに関しての具体的な指示はなく、作品の印象、焼き色との相性などのアドバイスを頂くことはありました。今考えれば、人の意見を十分に聞き、反芻し、その言葉に向き合い、その結果で自分から出てくるものからしか作品は生まれないと気付くきっかけになったと思います。',

  // -- Artist --
  'artist.heading_h1': '作家紹介',
  'artist.heading_profile': 'プロフィール',
  'artist.profile': '備前焼作家。岡山県備前市在住。人間国宝 伊勢崎 淳先生に師事。',
  'artist.quote':
    '日本陶磁協会誌「陶説」にて「備前の正統を歩みながら、旧来の概念に囚われない自由で新鮮な感覚は、これからの備前の新しい世界を切り拓いていく大きな力となるでしょう。」と評価される。',
  'artist.heading_timeline': '経歴',
  'artist.timeline_0': '2003年　備前焼作家 人間国宝 伊勢崎 淳先生に師事',
  'artist.timeline_1': '2006年　田部美術館大賞「茶の湯の造形展」入選',
  'artist.timeline_2': '2010年　岡山県美術展覧会 入選',
  'artist.timeline_3': '2011年　独立',
  'artist.timeline_4': '2012年　穴窯築窯',
  'artist.timeline_5': '2019年　日本陶磁協会誌「陶説」に掲載',
  'artist.timeline_6': '2023年　柿傳ギャラリーにて個展',
};

// ============================================
// Default image paths (static files in /public/img/)
// ============================================
const DEFAULT_IMAGES: Record<string, string> = {
  'index.philosophy_image': '/img/omoi.png',
  'index.work_image': '/img/WorkIntroduction.png',
  'index.production_image': '/img/kneadTheClay.png',
  'index.interview_image': '/img/interview.png',
  'index.artist_image': '/img/separate.png',
  'work.top_image': '/img/WorkIntroduction.png',
  'work.image_0': '/img/bizen_sakeVessels_threeItems.png',
  'work.image_1': '/img/bizen_oldColor_teaBowl.png',
  'work.image_2': '/img/bizen_chachugi.png',
  'work.image_3': '/img/bizen_pot.png',
  'work.image_4': '/img/bizen_jar.png',
  'work.image_5': '/img/bizen_hidasuki_tokkuri.png',
  'work.image_6': '/img/ashGlaze_teaBowl.png',
  'work.image_7': '/img/bizen_oldColor_hyotokkuri.png',
  'work.image_8': '/img/bizen_pitcher.png',
  'production.image_0': '/img/complete.png',
  'production.image_1': '/img/originalSoil.png',
  'production.image_2': '/img/clayProduction.png',
  'production.image_3': '/img/clayPot.png',
  'production.image_4': '/img/clay.png',
  'production.image_5': '/img/spiralWedging.png',
  'production.image_6': '/img/molding.png',
  'production.image_7': '/img/teapotBox.png',
  'production.image_8': '/img/kilnFilling.png',
  'production.image_9': '/img/straw.png',
  'production.image_10': '/img/splitWood.png',
  'production.image_11': '/img/splitWoodOutside.png',
  'production.image_12': '/img/kilnFiring.png',
  'production.image_13': '/img/UpperMouth.png',
  'production.image_14': '/img/firePit.png',
  'production.image_15': '/img/fire-breathingFirePit.png',
  'production.image_16': '/img/OutOfTheKiln.png',
  'production.image_17': '/img/WaterLeakCheck.png',
  'interview.top_image': '/img/interview_top.png',
  'artist.top_image': '/img/artistIntroduction_top.png',
};

// ============================================
// Human-readable labels for each content key
// ============================================
const CONTENT_LABELS: Record<string, string> = {
  'index.heading_philosophy': '「想い」見出し',
  'index.philosophy': '想いの本文',
  'index.heading_work': '「作品紹介」見出し',
  'index.work_intro': '作品紹介の説明',
  'index.heading_production': '「制作の様子」見出し',
  'index.production_intro': '制作の様子の説明',
  'index.heading_interview': '「インタビュー」見出し',
  'index.interview_intro': 'インタビューの説明',
  'index.heading_artist': '「作家紹介」見出し',
  'index.artist_intro': '作家紹介の説明',
  'index.heading_stores': '「常設販売店」見出し',
  'index.store_0_name': '販売店 1 名前',
  'index.store_0_url': '販売店 1 URL',
  'index.store_1_name': '販売店 2 名前',
  'index.store_1_url': '販売店 2 URL',
  'index.store_2_name': '販売店 3 名前',
  'index.store_2_url': '販売店 3 URL',
  'index.heading_exhibitions': '「過去の展示会」見出し',
  'index.exhibition_0_name': '展示会 1 名前',
  'index.exhibition_0_url': '展示会 1 URL',
  'index.exhibition_1_name': '展示会 2 名前',
  'index.exhibition_1_url': '展示会 2 URL',
  'index.exhibition_2_name': '展示会 3 名前',
  'index.exhibition_2_url': '展示会 3 URL',
  'index.exhibition_3_name': '展示会 4 名前',
  'index.exhibition_3_url': '展示会 4 URL',
  'index.heading_contact': '「お問い合わせ」見出し',
  'index.contact_text': 'お問い合わせ本文',
  'index.instagram_url': 'Instagram 投稿URL',
  'index.copyright': 'コピーライト',
  'work.heading_h1': 'ページタイトル',
  'work.heading_list': '作品一覧の見出し',
  'work.caption_0': '作品 1 キャプション',
  'work.caption_1': '作品 2 キャプション',
  'work.caption_2': '作品 3 キャプション',
  'work.caption_3': '作品 4 キャプション',
  'work.caption_4': '作品 5 キャプション',
  'work.caption_5': '作品 6 キャプション',
  'work.caption_6': '作品 7 キャプション',
  'work.caption_7': '作品 8 キャプション',
  'work.caption_8': '作品 9 キャプション',
  'work.heading_features': '「特徴」見出し',
  'work.features': '特徴の本文',
  'work.heading_new_attempts': '「新しい試み」見出し',
  'work.new_attempts': '新しい試みの本文',
  'work.heading_faq': '「FAQ」見出し',
  'work.faq_q_0': 'FAQ 1 質問',
  'work.faq_0': 'FAQ 1 回答',
  'work.faq_q_1': 'FAQ 2 質問',
  'work.faq_1': 'FAQ 2 回答',
  'work.faq_q_2': 'FAQ 3 質問',
  'work.faq_2': 'FAQ 3 回答',
  'work.faq_q_3': 'FAQ 4 質問',
  'work.faq_3': 'FAQ 4 回答',
  'work.faq_q_4': 'FAQ 5 質問',
  'work.faq_4': 'FAQ 5 回答',
  'work.faq_q_5': 'FAQ 6 質問',
  'work.faq_5': 'FAQ 6 回答',
  'production.heading_h1': 'ページタイトル',
  'production.heading_h2': 'サブタイトル',
  'production.byline': '解説者名',
  'production.intro': 'イントロ文',
  'production.youtube_0': 'YouTube動画 1（菊練り）',
  'production.youtube_1': 'YouTube動画 2（成形）',
  'production.step_0': '工程 01 説明',
  'production.step_1': '工程 02 説明',
  'production.step_2': '工程 03 説明',
  'production.step_3': '工程 04 説明',
  'production.step_4': '工程 05 説明',
  'production.step_5': '工程 06 説明',
  'production.step_6': '工程 07 説明',
  'production.step_7': '工程 08 説明',
  'production.step_8': '工程 09 説明',
  'production.step_9': '工程 10 説明',
  'production.step_10': '工程 11 説明',
  'production.step_11': '工程 12 説明',
  'production.step_12': '工程 13 説明',
  'production.step_13': '工程 14 説明',
  'production.step_14': '工程 15 説明',
  'production.step_15': '工程 16 説明',
  'production.step_16': '工程 17 説明',
  'interview.heading_h1': 'ページタイトル',
  'interview.q_0': '質問 1',
  'interview.a_0': '回答 1',
  'interview.q_1': '質問 2',
  'interview.a_1': '回答 2',
  'interview.q_2': '質問 3',
  'interview.a_2': '回答 3',
  'interview.q_3': '質問 4',
  'interview.a_3': '回答 4',
  'interview.q_4': '質問 5',
  'interview.a_4': '回答 5',
  'interview.q_5': '質問 6',
  'interview.a_5': '回答 6',
  'artist.heading_h1': 'ページタイトル',
  'artist.heading_profile': '「プロフィール」見出し',
  'artist.profile': 'プロフィール本文',
  'artist.quote': '引用文',
  'artist.heading_timeline': '「経歴」見出し',
  'artist.timeline_0': '経歴 1',
  'artist.timeline_1': '経歴 2',
  'artist.timeline_2': '経歴 3',
  'artist.timeline_3': '経歴 4',
  'artist.timeline_4': '経歴 5',
  'artist.timeline_5': '経歴 6',
  'artist.timeline_6': '経歴 7',
};

const IMAGE_LABELS: Record<string, string> = {
  'index.philosophy_image': '想いセクション画像',
  'index.work_image': '作品紹介カード画像',
  'index.production_image': '制作の様子カード画像',
  'index.interview_image': 'インタビューカード画像',
  'index.artist_image': '作家紹介カード画像',
  'work.top_image': 'ヒーロー画像',
  'work.image_0': '作品 1: 酒器三点',
  'work.image_1': '作品 2: 古色 茶盌',
  'work.image_2': '作品 3: 茶注',
  'work.image_3': '作品 4: 鉢',
  'work.image_4': '作品 5: 壺',
  'work.image_5': '作品 6: 火襷 徳利',
  'work.image_6': '作品 7: 灰釉 茶盌',
  'work.image_7': '作品 8: 古色 瓢徳利',
  'work.image_8': '作品 9: ピッチャー',
  'interview.top_image': 'ヒーロー画像',
  'artist.top_image': 'ヒーロー画像',
};

// ============================================
// SVG Icon components
// ============================================
const IconDashboard = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconPage = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IconSettings = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const IconLogout = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconTrendUp = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconTrendDown = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const IconSave = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const IconReset = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
  </svg>
);

const IconUpload = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
  </svg>
);

const IconHeading = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 12l3-2v8" />
  </svg>
);

const IconLink = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const IconLinkSmall = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const IconExternalLink = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const IconInstagram = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconYoutube = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const IconImage = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconText = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

function showToast(message: string, type: 'success' | 'error' = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function getTrendPercent(current: number, prev: number): { value: number; direction: 'up' | 'down' | 'flat' } {
  if (prev === 0) return { value: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'flat' };
  const change = ((current - prev) / prev) * 100;
  return {
    value: Math.abs(Math.round(change)),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
  };
}

export default function AdminPageClient() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<PageTab>('dashboard');
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [editedContent, setEditedContent] = useState<Record<string, Record<string, string>>>({});
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState(7);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'traffic' | 'audience'>('overview');
  const tokenRef = useRef<string>('');

  const forceLogout = useCallback((message: string) => {
    tokenRef.current = '';
    sessionStorage.removeItem('admin_token');
    setAuthenticated(false);
    showToast(message, 'error');
  }, []);

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });
      if (res.status === 401 || res.status === 403) {
        forceLogout('セッションが切れました。再度ログインしてください');
      }
      return res;
    },
    [forceLogout],
  );

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/content`);
      if (res.ok) {
        const data = await res.json();
        // Merge with defaults: for each page, fill in missing keys with DEFAULT_CONTENT
        const mergedData: Record<string, Record<string, string>> = {};
        for (const page of Object.keys(PAGE_CONTENT_KEYS)) {
          mergedData[page] = {};
          for (const key of PAGE_CONTENT_KEYS[page]) {
            mergedData[page][key] = data[page]?.[key] || DEFAULT_CONTENT[key] || '';
          }
        }
        setContent(mergedData);
        setEditedContent(JSON.parse(JSON.stringify(mergedData)));
      }
    } catch {
      // On failure, use defaults
      const defaultData: Record<string, Record<string, string>> = {};
      for (const page of Object.keys(PAGE_CONTENT_KEYS)) {
        defaultData[page] = {};
        for (const key of PAGE_CONTENT_KEYS[page]) {
          defaultData[page][key] = DEFAULT_CONTENT[key] || '';
        }
      }
      setContent(defaultData);
      setEditedContent(JSON.parse(JSON.stringify(defaultData)));
    }
  }, []);

  const loadAnalytics = useCallback(
    async (days: number) => {
      try {
        const res = await fetchWithAuth(`/api/analytics/stats?days=${days}`);
        if (res.ok) {
          const data = await res.json();
          setAnalyticsStats(data);
        }
      } catch {
        /* silent */
      }
    },
    [fetchWithAuth],
  );

  const loadImages = useCallback(async () => {
    const allKeys = Object.values(PAGE_IMAGE_KEYS).flat();
    const loaded: Record<string, string> = {};
    for (const key of allKeys) {
      const page = key.split('.')[0];
      try {
        const res = await fetch(`${API_BASE}/api/images/${page}/${key}`);
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 0) {
            loaded[key] = URL.createObjectURL(blob);
          }
        }
      } catch {
        /* silent */
      }
    }
    setUploadedImages(loaded);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token');
    if (saved) {
      tokenRef.current = saved;
      fetch(`${API_BASE}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.token) {
              tokenRef.current = data.token;
              sessionStorage.setItem('admin_token', data.token);
            }
            setAuthenticated(true);
            loadContent();
            loadImages();
          } else {
            tokenRef.current = '';
            sessionStorage.removeItem('admin_token');
          }
        })
        .catch(() => {
          tokenRef.current = '';
          sessionStorage.removeItem('admin_token');
        });
    }
  }, [loadContent, loadImages]);

  useEffect(() => {
    if (authenticated) loadAnalytics(analyticsPeriod);
  }, [authenticated, analyticsPeriod, loadAnalytics]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        tokenRef.current = data.token;
        sessionStorage.setItem('admin_token', data.token);
        setAuthenticated(true);
        loadContent();
        loadImages();
      } else {
        showToast(data.error || 'ログイン失敗', 'error');
      }
    } catch {
      showToast('サーバーに接続できません', 'error');
    }
  };

  const handleLogout = () => {
    tokenRef.current = '';
    sessionStorage.removeItem('admin_token');
    setAuthenticated(false);
  };

  const handleContentChange = (page: string, key: string, value: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [page]: { ...prev[page], [key]: value },
    }));
  };

  const handleSave = async (page: string) => {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetchWithAuth(`/api/content/${page}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedContent[page] || {}),
        });
        if (res.ok) {
          showToast(`${PAGE_NAMES[page]}を保存しました`);
          loadContent();
          return;
        }
        if (res.status === 401 || res.status === 403) return;
        // Retry on server errors
        if (res.status >= 500 && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        const data = await res.json().catch(() => null);
        showToast(data?.error || '保存に失敗しました', 'error');
        return;
      } catch {
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        showToast('サーバーに接続できません', 'error');
        return;
      }
    }
  };

  const handleReset = (page: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [page]: { ...(content[page] || {}) },
    }));
    showToast('変更をリセットしました');
  };

  const handleImageUpload = async (page: string, key: string, file: File) => {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetchWithAuth(`/api/images/${page}/${key}`, {
          method: 'PUT',
          body: formData,
        });
        if (res.ok) {
          showToast('画像を保存しました');
          const reader = new FileReader();
          reader.onload = () => {
            setUploadedImages((prev) => ({ ...prev, [key]: reader.result as string }));
          };
          reader.readAsDataURL(file);
          return;
        }
        if (res.status === 401 || res.status === 403) return;
        if (res.status >= 500 && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        const data = await res.json().catch(() => null);
        showToast(data?.error || '画像の保存に失敗しました', 'error');
        return;
      } catch {
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        showToast('サーバーに接続できません', 'error');
        return;
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
    try {
      const res = await fetchWithAuth('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('パスワードを変更しました');
        form.reset();
      } else {
        showToast(data.error || '変更に失敗しました', 'error');
      }
    } catch {
      showToast('サーバーエラー', 'error');
    }
  };

  // ============================================
  // Login Screen
  // ============================================
  if (!authenticated) {
    return (
      <div id="auth-overlay">
        <div className="auth-box">
          <div className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#9e4020" />
              <path d="M14 34V14h6l4 12 4-12h6v20h-5V22l-3.5 12h-3L19 22v12h-5z" fill="white" />
            </svg>
          </div>
          <div className="auth-title">管理パネル</div>
          <div className="auth-subtitle">備前焼作家 高島聡平 公式サイト</div>
          <form id="auth-form" onSubmit={handleLogin}>
            <div className="auth-input-wrapper">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="auth-input-icon"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input type="password" name="password" className="auth-input" placeholder="パスワードを入力" required />
            </div>
            <button type="submit" className="auth-btn">
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================
  // Dashboard
  // ============================================
  const renderDashboard = () => {
    const stats = analyticsStats;
    const visitTrend = stats ? getTrendPercent(stats.totalVisits, stats.prevTotalVisits) : null;
    const userTrend = stats ? getTrendPercent(stats.uniqueVisitors, stats.prevUniqueVisitors) : null;
    const todayTrend = stats ? getTrendPercent(stats.todayVisits, stats.yesterdayVisits) : null;

    return (
      <div className="tab-content">
        <div className="page-header">
          <div className="page-title">ダッシュボード</div>
          <div className="page-subtitle">サイト全体の状況を確認できます</div>
        </div>

        {/* Period Selector */}
        <div className="analytics-period-selector">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              className={`period-btn ${analyticsPeriod === d ? 'active' : ''}`}
              onClick={() => setAnalyticsPeriod(d)}
            >
              {d}日間
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        {stats && (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-card__header">
                  <span className="summary-card__label">合計アクセス</span>
                  {visitTrend && visitTrend.direction !== 'flat' && (
                    <span className={`trend-badge trend-badge--${visitTrend.direction}`}>
                      {visitTrend.direction === 'up' ? <IconTrendUp /> : <IconTrendDown />}
                      {visitTrend.value}%
                    </span>
                  )}
                </div>
                <div className="summary-card__value">{stats.totalVisits.toLocaleString()}</div>
                <div className="summary-card__sub">前期間: {stats.prevTotalVisits.toLocaleString()}</div>
              </div>

              <div className="summary-card">
                <div className="summary-card__header">
                  <span className="summary-card__label">ユニーク訪問者</span>
                  {userTrend && userTrend.direction !== 'flat' && (
                    <span className={`trend-badge trend-badge--${userTrend.direction}`}>
                      {userTrend.direction === 'up' ? <IconTrendUp /> : <IconTrendDown />}
                      {userTrend.value}%
                    </span>
                  )}
                </div>
                <div className="summary-card__value">{stats.uniqueVisitors.toLocaleString()}</div>
                <div className="summary-card__sub">前期間: {stats.prevUniqueVisitors.toLocaleString()}</div>
              </div>

              <div className="summary-card">
                <div className="summary-card__header">
                  <span className="summary-card__label">本日のアクセス</span>
                  {todayTrend && todayTrend.direction !== 'flat' && (
                    <span className={`trend-badge trend-badge--${todayTrend.direction}`}>
                      {todayTrend.direction === 'up' ? <IconTrendUp /> : <IconTrendDown />}
                      {todayTrend.value}%
                    </span>
                  )}
                </div>
                <div className="summary-card__value">{stats.todayVisits.toLocaleString()}</div>
                <div className="summary-card__sub">昨日: {stats.yesterdayVisits.toLocaleString()}</div>
              </div>

              <div className="summary-card">
                <div className="summary-card__header">
                  <span className="summary-card__label">1日あたり平均</span>
                </div>
                <div className="summary-card__value">{stats.avgVisitsPerDay.toLocaleString()}</div>
                <div className="summary-card__sub">過去{analyticsPeriod}日間</div>
              </div>
            </div>

            {/* Analytics Sub-tabs */}
            <div className="analytics-tabs">
              <button
                className={`analytics-tab ${analyticsTab === 'overview' ? 'active' : ''}`}
                onClick={() => setAnalyticsTab('overview')}
              >
                概要
              </button>
              <button
                className={`analytics-tab ${analyticsTab === 'traffic' ? 'active' : ''}`}
                onClick={() => setAnalyticsTab('traffic')}
              >
                トラフィック
              </button>
              <button
                className={`analytics-tab ${analyticsTab === 'audience' ? 'active' : ''}`}
                onClick={() => setAnalyticsTab('audience')}
              >
                オーディエンス
              </button>
            </div>

            {analyticsTab === 'overview' && (
              <div className="analytics-grid">
                {/* Daily Chart */}
                <div className="analytics-panel analytics-panel--wide">
                  <div className="analytics-panel__title">日別アクセス推移</div>
                  <div className="daily-chart">
                    {Object.entries(stats.daily)
                      .sort()
                      .slice(-analyticsPeriod)
                      .map(([date, data]) => {
                        const maxVal = Math.max(...Object.values(stats.daily).map((d) => d.total || 0), 1);
                        return (
                          <div key={date} className="chart-bar-row">
                            <span className="chart-date">{date.slice(5)}</span>
                            <div className="chart-bar-track">
                              <div className="chart-bar-fill" style={{ width: `${(data.total / maxVal) * 100}%` }} />
                            </div>
                            <span className="chart-count">{data.total}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Hourly Distribution */}
                <div className="analytics-panel analytics-panel--wide">
                  <div className="analytics-panel__title">時間帯別アクセス</div>
                  <div className="hourly-chart">
                    {stats.hourly.map((count, hour) => {
                      const maxH = Math.max(...stats.hourly, 1);
                      return (
                        <div key={hour} className="hourly-bar-wrapper" title={`${hour}時: ${count}件`}>
                          <div className="hourly-bar-track">
                            <div className="hourly-bar-fill" style={{ height: `${(count / maxH) * 100}%` }} />
                          </div>
                          <span className="hourly-label">{hour}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Page breakdown */}
                <div className="analytics-panel">
                  <div className="analytics-panel__title">ページ別アクセス</div>
                  <div className="page-stats-list">
                    {stats.byPage.map((p) => {
                      const pct = stats.totalVisits > 0 ? Math.round((p.count / stats.totalVisits) * 100) : 0;
                      const pageLabel = p.page === '/' ? 'トップ' : PAGE_NAMES[p.page] || p.page;
                      return (
                        <div key={p.page} className="page-stat-row">
                          <span className="page-stat-name">{pageLabel}</span>
                          <div className="page-stat-bar-track">
                            <div className="page-stat-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="page-stat-count">{p.count}</span>
                          <span className="page-stat-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Content Stats */}
                <div className="analytics-panel">
                  <div className="analytics-panel__title">コンテンツ情報</div>
                  <div className="content-stats-grid">
                    <div className="content-stat-item">
                      <div className="content-stat-value">{stats.contentStats.totalEntries}</div>
                      <div className="content-stat-label">登録コンテンツ数</div>
                    </div>
                    <div className="content-stat-item">
                      <div className="content-stat-value">
                        {stats.contentStats.lastUpdated
                          ? new Date(stats.contentStats.lastUpdated).toLocaleDateString('ja-JP')
                          : '-'}
                      </div>
                      <div className="content-stat-label">最終更新日</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analyticsTab === 'traffic' && (
              <div className="analytics-grid">
                {/* Referrer Analysis */}
                <div className="analytics-panel analytics-panel--wide">
                  <div className="analytics-panel__title">流入元</div>
                  {stats.referrers.length > 0 ? (
                    <div className="referrer-list">
                      {stats.referrers.map((r) => {
                        const pct = stats.totalVisits > 0 ? Math.round((r.count / stats.totalVisits) * 100) : 0;
                        return (
                          <div key={r.referrer} className="referrer-row">
                            <span className="referrer-name" title={r.referrer}>
                              {r.referrer === '(direct)' ? 'ダイレクト' : r.referrer}
                            </span>
                            <div className="referrer-bar-track">
                              <div className="referrer-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="referrer-count">{r.count}</span>
                            <span className="referrer-pct">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-data">データがありません</div>
                  )}
                </div>

                {/* Daily breakdown by page */}
                <div className="analytics-panel analytics-panel--wide">
                  <div className="analytics-panel__title">日別ページアクセス詳細</div>
                  <div className="table-wrapper">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>日付</th>
                          <th>合計</th>
                          {stats.byPage.slice(0, 5).map((p) => (
                            <th key={p.page}>{PAGE_NAMES[p.page] || p.page}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.daily)
                          .sort()
                          .slice(-14)
                          .map(([date, data]) => (
                            <tr key={date}>
                              <td>{date.slice(5)}</td>
                              <td className="num">{data.total}</td>
                              {stats.byPage.slice(0, 5).map((p) => (
                                <td key={p.page} className="num">
                                  {data[p.page] || 0}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {analyticsTab === 'audience' && (
              <div className="analytics-grid">
                {/* Device */}
                <div className="analytics-panel">
                  <div className="analytics-panel__title">デバイス</div>
                  <div className="device-chart">
                    {(() => {
                      const total = stats.devices.mobile + stats.devices.tablet + stats.devices.desktop;
                      const items = [
                        { label: 'モバイル', count: stats.devices.mobile, color: '#4caf50' },
                        { label: 'タブレット', count: stats.devices.tablet, color: '#ff9800' },
                        { label: 'デスクトップ', count: stats.devices.desktop, color: '#2196f3' },
                      ];
                      return items.map((item) => {
                        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                        return (
                          <div key={item.label} className="device-item">
                            <div className="device-item__header">
                              <span className="device-item__dot" style={{ background: item.color }} />
                              <span className="device-item__label">{item.label}</span>
                              <span className="device-item__pct">{pct}%</span>
                            </div>
                            <div className="device-item__bar-track">
                              <div
                                className="device-item__bar-fill"
                                style={{ width: `${pct}%`, background: item.color }}
                              />
                            </div>
                            <div className="device-item__count">{item.count.toLocaleString()} 件</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Browser */}
                <div className="analytics-panel">
                  <div className="analytics-panel__title">ブラウザ</div>
                  <div className="browser-list">
                    {stats.browsers.map((b) => {
                      const totalB = stats.browsers.reduce((s, x) => s + x.count, 0);
                      const pct = totalB > 0 ? Math.round((b.count / totalB) * 100) : 0;
                      return (
                        <div key={b.browser} className="browser-row">
                          <span className="browser-name">{b.browser}</span>
                          <div className="browser-bar-track">
                            <div className="browser-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="browser-count">{b.count}</span>
                          <span className="browser-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Screen Sizes */}
                <div className="analytics-panel">
                  <div className="analytics-panel__title">画面サイズ</div>
                  {stats.screens.length > 0 ? (
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>解像度</th>
                          <th>件数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.screens.map((s) => (
                          <tr key={s.size}>
                            <td>{s.size}</td>
                            <td className="num">{s.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-data">データがありません</div>
                  )}
                </div>

                {/* Languages */}
                <div className="analytics-panel">
                  <div className="analytics-panel__title">言語</div>
                  {stats.languages.length > 0 ? (
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>言語</th>
                          <th>件数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.languages.map((l) => (
                          <tr key={l.language}>
                            <td>{l.language}</td>
                            <td className="num">{l.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-data">データがありません</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {!stats && <div className="loading-state">読み込み中...</div>}
      </div>
    );
  };

  // ============================================
  // Content Editor
  // ============================================

  const isHeadingKey = (key: string) => key.includes('heading_');
  const isUrlKey = (key: string) => key.endsWith('_url') && !key.includes('instagram') && !key.includes('youtube');
  const isInstagramKey = (key: string) => key.includes('instagram_url');
  const isYoutubeKey = (key: string) => key.includes('youtube_');
  const isLongText = (key: string) =>
    key.includes('philosophy') ||
    key.includes('features') ||
    key.includes('new_attempts') ||
    key.includes('step_') ||
    key.includes('intro') ||
    key.includes('.a_') ||
    (key.includes('faq_') && !key.includes('faq_q_')) ||
    key.includes('quote') ||
    key.includes('profile');

  const renderFieldInput = (page: string, key: string) => {
    const pageContent = editedContent[page] || {};
    const value = pageContent[key] || '';
    const originalValue = content[page]?.[key] || '';
    const isModified = value !== originalValue;
    const label = CONTENT_LABELS[key] || key;

    return (
      <div key={key} className={`editor-field ${isModified ? 'editor-field--modified' : ''}`}>
        <div className="editor-field__header">
          <label className="editor-field__label">{label}</label>
          {isModified && <span className="editor-field__modified-dot" />}
        </div>
        {isLongText(key) ? (
          <textarea
            className="editor-field__textarea"
            rows={4}
            value={value}
            onChange={(e) => handleContentChange(page, key, e.target.value)}
            placeholder={DEFAULT_CONTENT[key] || ''}
          />
        ) : (
          <input
            type="text"
            className="editor-field__input"
            value={value}
            onChange={(e) => handleContentChange(page, key, e.target.value)}
            placeholder={DEFAULT_CONTENT[key] || ''}
          />
        )}
      </div>
    );
  };

  const renderEditor = (page: string) => {
    const keys = PAGE_CONTENT_KEYS[page] || [];
    const imageKeys = PAGE_IMAGE_KEYS[page] || [];
    const pageContent = editedContent[page] || {};
    const hasChanges = keys.some((key) => (pageContent[key] || '') !== (content[page]?.[key] || ''));

    // Categorize keys
    const headingKeys = keys.filter(isHeadingKey);
    const linkPairs: { nameKey: string; urlKey: string }[] = [];
    const instagramKeys = keys.filter(isInstagramKey);
    const youtubeKeys = keys.filter(isYoutubeKey);
    const textKeys: string[] = [];

    // Build link pairs (name + url) and collect remaining text keys
    const usedKeys = new Set<string>();
    headingKeys.forEach((k) => usedKeys.add(k));
    instagramKeys.forEach((k) => usedKeys.add(k));
    youtubeKeys.forEach((k) => usedKeys.add(k));

    for (const key of keys) {
      if (usedKeys.has(key)) continue;
      if (isUrlKey(key)) {
        usedKeys.add(key);
        // Find matching name key
        const nameKey = key.replace(/_url$/, '_name');
        if (keys.includes(nameKey)) {
          usedKeys.add(nameKey);
          linkPairs.push({ nameKey, urlKey: key });
        }
      }
    }

    for (const key of keys) {
      if (!usedKeys.has(key)) {
        textKeys.push(key);
      }
    }

    return (
      <div className="tab-content">
        <div className="page-header">
          <div className="page-title">{PAGE_NAMES[page]} 編集</div>
          <div className="page-subtitle">テキスト・画像・リンク・埋め込みを編集できます</div>
        </div>

        <div className="editor-toolbar">
          <div className="editor-toolbar__left">
            {hasChanges && <span className="unsaved-badge">未保存の変更があります</span>}
          </div>
          <div className="editor-toolbar__actions">
            <button className="toolbar-btn toolbar-btn--primary" onClick={() => handleSave(page)}>
              <IconSave />
              保存
            </button>
            <button className="toolbar-btn toolbar-btn--secondary" onClick={() => handleReset(page)}>
              <IconReset />
              リセット
            </button>
          </div>
        </div>

        {/* Image Section */}
        {imageKeys.length > 0 && (
          <div className="editor-group">
            <div className="editor-group__title">
              <IconImage />
              画像
            </div>
            <div className="image-grid">
              {imageKeys.map((key) => {
                const imgSrc = uploadedImages[key] || DEFAULT_IMAGES[key];
                const label = IMAGE_LABELS[key] || key;
                return (
                  <div key={key} className="image-card">
                    <div className="image-card__preview">
                      {imgSrc ? (
                        <img src={imgSrc} alt={label} className="image-card__img" />
                      ) : (
                        <div className="image-card__placeholder">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            opacity="0.3"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                      {uploadedImages[key] && <span className="image-card__badge">カスタム</span>}
                    </div>
                    <div className="image-card__info">
                      <div className="image-card__label">{label}</div>
                      <label className="image-card__upload-btn">
                        <IconUpload />
                        変更
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(key.split('.')[0], key, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Heading Section */}
        {headingKeys.length > 0 && (
          <div className="editor-group">
            <div className="editor-group__title">
              <IconHeading />
              見出し
            </div>
            <div className="editor-fields">
              {headingKeys.map((key) => {
                const value = pageContent[key] || '';
                const originalValue = content[page]?.[key] || '';
                const isModified = value !== originalValue;
                const label = CONTENT_LABELS[key] || key;
                return (
                  <div
                    key={key}
                    className={`editor-field editor-field--heading ${isModified ? 'editor-field--modified' : ''}`}
                  >
                    <div className="editor-field__header">
                      <label className="editor-field__label">
                        <span className="editor-field__type-badge editor-field__type-badge--heading">H</span>
                        {label}
                      </label>
                      {isModified && <span className="editor-field__modified-dot" />}
                    </div>
                    <input
                      type="text"
                      className="editor-field__input editor-field__input--heading"
                      value={value}
                      onChange={(e) => handleContentChange(page, key, e.target.value)}
                      placeholder={DEFAULT_CONTENT[key] || ''}
                    />
                    <div className="editor-field__preview-heading">{value || DEFAULT_CONTENT[key] || ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Link Section */}
        {linkPairs.length > 0 && (
          <div className="editor-group">
            <div className="editor-group__title">
              <IconLink />
              リンク
            </div>
            <div className="editor-fields">
              {linkPairs.map(({ nameKey, urlKey }) => {
                const nameValue = pageContent[nameKey] || '';
                const urlValue = pageContent[urlKey] || '';
                const nameOriginal = content[page]?.[nameKey] || '';
                const urlOriginal = content[page]?.[urlKey] || '';
                const isModified = nameValue !== nameOriginal || urlValue !== urlOriginal;
                const nameLabel = CONTENT_LABELS[nameKey] || nameKey;
                return (
                  <div
                    key={urlKey}
                    className={`editor-field editor-field--link ${isModified ? 'editor-field--modified' : ''}`}
                  >
                    <div className="editor-field__header">
                      <label className="editor-field__label">
                        <span className="editor-field__type-badge editor-field__type-badge--link">
                          <IconLinkSmall />
                        </span>
                        {nameLabel.replace(/ (名前|URL)$/, '')}
                      </label>
                      {isModified && <span className="editor-field__modified-dot" />}
                    </div>
                    <div className="link-field-group">
                      <div className="link-field-row">
                        <span className="link-field-label">表示名</span>
                        <input
                          type="text"
                          className="editor-field__input"
                          value={nameValue}
                          onChange={(e) => handleContentChange(page, nameKey, e.target.value)}
                          placeholder={DEFAULT_CONTENT[nameKey] || '名前を入力'}
                        />
                      </div>
                      <div className="link-field-row">
                        <span className="link-field-label">URL</span>
                        <div className="link-url-input-wrapper">
                          <input
                            type="url"
                            className="editor-field__input editor-field__input--url"
                            value={urlValue}
                            onChange={(e) => handleContentChange(page, urlKey, e.target.value)}
                            placeholder={DEFAULT_CONTENT[urlKey] || 'https://'}
                          />
                          {urlValue && (
                            <a
                              href={urlValue}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-open-btn"
                              title="リンクを開く"
                            >
                              <IconExternalLink />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instagram Section */}
        {instagramKeys.length > 0 && (
          <div className="editor-group">
            <div className="editor-group__title">
              <IconInstagram />
              Instagram 埋め込み
            </div>
            <div className="editor-fields">
              {instagramKeys.map((key) => {
                const value = pageContent[key] || '';
                const originalValue = content[page]?.[key] || '';
                const isModified = value !== originalValue;
                const displayUrl = value || DEFAULT_CONTENT[key] || '';
                return (
                  <div
                    key={key}
                    className={`editor-field editor-field--instagram ${isModified ? 'editor-field--modified' : ''}`}
                  >
                    <div className="editor-field__header">
                      <label className="editor-field__label">
                        <span className="editor-field__type-badge editor-field__type-badge--instagram">
                          <IconInstagram />
                        </span>
                        Instagram 投稿URL
                      </label>
                      {isModified && <span className="editor-field__modified-dot" />}
                    </div>
                    <div className="instagram-field-group">
                      <div className="link-url-input-wrapper">
                        <input
                          type="url"
                          className="editor-field__input editor-field__input--url"
                          value={value}
                          onChange={(e) => handleContentChange(page, key, e.target.value)}
                          placeholder="https://www.instagram.com/p/XXXXXXXXXX/"
                        />
                        {displayUrl && (
                          <a
                            href={displayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-open-btn"
                            title="Instagramで開く"
                          >
                            <IconExternalLink />
                          </a>
                        )}
                      </div>
                      <div className="instagram-preview">
                        <div className="instagram-preview__header">
                          <div className="instagram-preview__avatar" />
                          <div className="instagram-preview__meta">
                            <div className="instagram-preview__username">@takashima_sohei</div>
                            <div className="instagram-preview__location">Instagram</div>
                          </div>
                        </div>
                        <div className="instagram-preview__image">
                          <IconInstagram />
                        </div>
                        <div className="instagram-preview__url">{displayUrl}</div>
                      </div>
                      <div className="instagram-help">
                        投稿ページのURLを入力してください（例: https://www.instagram.com/p/XXXXXXXXXX/）
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* YouTube Section */}
        {youtubeKeys.length > 0 && (
          <div className="editor-group">
            <div className="editor-group__title">
              <IconYoutube />
              YouTube 埋め込み
            </div>
            <div className="editor-fields">
              {youtubeKeys.map((key) => {
                const value = pageContent[key] || '';
                const originalValue = content[page]?.[key] || '';
                const isModified = value !== originalValue;
                const label = CONTENT_LABELS[key] || key;
                const displayUrl = value || DEFAULT_CONTENT[key] || '';
                return (
                  <div
                    key={key}
                    className={`editor-field editor-field--youtube ${isModified ? 'editor-field--modified' : ''}`}
                  >
                    <div className="editor-field__header">
                      <label className="editor-field__label">
                        <span className="editor-field__type-badge editor-field__type-badge--youtube">
                          <IconYoutube />
                        </span>
                        {label}
                      </label>
                      {isModified && <span className="editor-field__modified-dot" />}
                    </div>
                    <div className="youtube-field-group">
                      <input
                        type="url"
                        className="editor-field__input editor-field__input--url"
                        value={value}
                        onChange={(e) => handleContentChange(page, key, e.target.value)}
                        placeholder="https://www.youtube.com/embed/XXXXXXXXXX"
                      />
                      {displayUrl && (
                        <div className="youtube-preview">
                          <iframe
                            src={displayUrl}
                            title={label}
                            className="youtube-preview__iframe"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                      <div className="youtube-help">
                        YouTube埋め込み用URLを入力してください（例: https://www.youtube.com/embed/XXXXXXXXXX）
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Text Content Fields */}
        {textKeys.length > 0 && (
          <div className="editor-group">
            <div className="editor-group__title">
              <IconText />
              テキスト
            </div>
            <div className="editor-fields">{textKeys.map((key) => renderFieldInput(page, key))}</div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // Settings
  // ============================================
  const renderSettings = () => (
    <div className="tab-content">
      <div className="page-header">
        <div className="page-title">設定</div>
        <div className="page-subtitle">管理者アカウントの設定</div>
      </div>
      <div className="settings-card">
        <div className="settings-card__title">パスワード変更</div>
        <div className="settings-card__desc">管理画面のログインパスワードを変更します</div>
        <form onSubmit={handleChangePassword} className="settings-form">
          <div className="settings-field">
            <label className="settings-field__label">現在のパスワード</label>
            <input type="password" name="currentPassword" className="settings-field__input" required />
          </div>
          <div className="settings-field">
            <label className="settings-field__label">新しいパスワード</label>
            <input type="password" name="newPassword" className="settings-field__input" required />
          </div>
          <div className="settings-form__actions">
            <button type="submit" className="toolbar-btn toolbar-btn--primary">
              変更する
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ============================================
  // Navigation
  // ============================================
  const navItems: { tab: PageTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'ダッシュボード', icon: <IconDashboard /> },
    { tab: 'index', label: 'トップページ', icon: <IconPage /> },
    { tab: 'work', label: '作品紹介', icon: <IconPage /> },
    { tab: 'production', label: '制作の様子', icon: <IconPage /> },
    { tab: 'interview', label: 'インタビュー', icon: <IconPage /> },
    { tab: 'artist', label: '作家紹介', icon: <IconPage /> },
    { tab: 'settings', label: '設定', icon: <IconSettings /> },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="mobile-title">管理パネル</span>
      </div>
      <div className="admin-app">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="10" fill="#9e4020" />
                <path d="M14 34V14h6l4 12 4-12h6v20h-5V22l-3.5 12h-3L19 22v12h-5z" fill="white" />
              </svg>
            </div>
            <div>
              <div className="sidebar-title">管理パネル</div>
              <div className="sidebar-site">sohei-portfolio.com</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-label">メニュー</div>
            {navItems.slice(0, 1).map((item) => (
              <button
                key={item.tab}
                className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.tab);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="nav-divider" />
            <div className="nav-label">ページ編集</div>
            {navItems.slice(1, 6).map((item) => (
              <button
                key={item.tab}
                className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.tab);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="nav-divider" />
            {navItems.slice(6).map((item) => (
              <button
                key={item.tab}
                className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.tab);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <IconLogout />
              ログアウト
            </button>
          </div>
        </aside>
        <div className="main-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab !== 'dashboard' && activeTab !== 'settings' && renderEditor(activeTab)}
        </div>
      </div>
    </>
  );
}
