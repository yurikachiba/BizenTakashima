# 【2日で完成】バニラHTMLサイトをNext.js 15 + React 19で完全リニューアル！ノーコードCMS＆自作アナリティクス機能も実装した話

## はじめに

クライアントから「既存のHTMLサイトをリニューアルしたい」という依頼を受けました。

要件は以下の通り：
- **コンテンツを自分で編集できるようにしたい**（ノーコード）
- **アクセス解析をしたい**（Google Analyticsは使いたくない）
- **モダンな技術スタックで**
- **できるだけ早く**

結果、**2日間**で以下を実装しました：

| 機能 | 詳細 |
|------|------|
| フレームワーク | Next.js 15 + React 19 |
| 言語 | TypeScript 5.9 |
| ノーコードCMS | 管理画面から全ページのコンテンツを編集可能 |
| 自作アナリティクス | PV、デバイス別、ブラウザ別、時間帯別など |
| アニメーション | GSAP + ScrollTrigger |
| セキュリティ | JWT認証、XSS対策 |

この記事では、その実装過程を共有します。

## Before / After

### Before（バニラHTML）
```
index.html
workIntroduction.html
productionProcess.html
interview.html
artistIntroduction.html
style.css
```

- 静的なHTMLファイル
- コンテンツ変更のたびにHTML編集が必要
- アクセス解析なし
- SEO対策なし

### After（Next.js 15）
```
sohei.site/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── work/
│   │   ├── process/
│   │   ├── interview/
│   │   ├── artist/
│   │   ├── sohei-kiln-room-m7x9/   # 管理画面
│   │   └── api/
│   │       ├── auth/               # 認証
│   │       ├── content/            # コンテンツ管理
│   │       ├── images/             # 画像管理
│   │       └── analytics/          # アナリティクス
│   ├── components/
│   └── lib/
server/
├── src/
│   ├── routes/
│   └── middleware/
└── prisma/
```

- モダンなApp Router構成
- 管理画面からノーコードでコンテンツ編集
- 自作アナリティクス機能
- SEO対策（JSON-LD構造化データ）
- 画像最適化（AVIF/WebP自動変換）

## 技術スタック

### フロントエンド
| 技術 | バージョン | 選定理由 |
|------|----------|----------|
| **Next.js** | 15.1.0 | 最新のApp Router、RSC対応 |
| **React** | 19.0.0 | 最新版、Server Components |
| **TypeScript** | 5.9.3 | 型安全性の確保 |
| **GSAP** | 3.12.5 | 高品質なスクロールアニメーション |
| **Prisma** | 5.22.0 | 型安全なDB操作 |
| **SASS** | 1.80.0 | 既存CSSの移行しやすさ |

### バックエンド
| 技術 | バージョン | 選定理由 |
|------|----------|----------|
| **Express.js** | 4.21.1 | シンプルで高速 |
| **PostgreSQL** | - | 無料枠あり（Render.com） |
| **JWT** | 9.0.2 | ステートレス認証 |
| **bcryptjs** | 2.4.3 | パスワードハッシング |

### インフラ
| サービス | 用途 | コスト |
|---------|------|--------|
| **Vercel** | フロントエンドホスティング | 無料 |
| **Render.com** | バックエンド + DB | 無料 |

**月額コスト：0円** です。

## 実装詳細

### 1. ノーコードCMS機能

クライアントがHTMLやコードを触らずにコンテンツを編集できる管理画面を実装しました。

#### データベース設計

```prisma
model Content {
  id        String   @id @default(cuid())
  page      String   // ページ名 (index, work, production など)
  key       String   // コンテンツキー
  value     String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([page, key])  // ページ+キーで一意
  @@index([page])
}

model Image {
  id        String   @id @default(cuid())
  page      String
  key       String
  data      String   @db.Text  // Base64画像データ
  mimeType  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([page, key])
  @@index([page])
}
```

#### 管理画面の実装

```typescript
// 管理画面からコンテンツを更新
const handleSave = async () => {
  const response = await fetch('/api/content/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      page: 'index',
      contents: {
        'philosophy_title': '私の哲学',
        'philosophy_text': '土と向き合い、火と対話する...',
        // ... 他のコンテンツ
      }
    })
  });
};
```

#### 編集可能なコンテンツ

| ページ | 編集可能項目 |
|--------|-------------|
| トップページ | 哲学、作品紹介、制作の様子、インタビュー、作家紹介、販売店舗、展示会情報、お問い合わせ、Instagram、著作権 |
| 作品紹介 | 見出し、説明文、図解、特徴、新しい試み、FAQ |
| 制作の様子 | セクションごとのテキスト・画像 |
| インタビュー | 質問・回答ペア |
| 作家紹介 | プロフィール、経歴 |

#### XSS対策

ユーザー入力を受け付けるため、サーバーサイドでサニタイズ処理を実装：

```typescript
// lib/sanitize.ts
export function sanitizeHtml(input: string): string {
  let sanitized = input;

  // 危険なタグを削除
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
    sanitized = sanitized.replace(regex, '');
  });

  // イベントハンドラを削除
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // javascript: URLを削除
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
}
```

### 2. 自作アナリティクス機能

Google Analyticsを使わずに、自前でアナリティクス機能を実装しました。

#### データベース設計

```prisma
model VisitorLog {
  id         String   @id @default(cuid())
  page       String         // ページ名
  userAgent  String?        // User Agent
  ipAddress  String?        // IP アドレス
  referrer   String?        // リファラー
  screenSize String?        // 画面サイズ
  language   String?        // ブラウザ言語
  createdAt  DateTime @default(now())

  @@index([page])
  @@index([createdAt])
}
```

#### クライアント側のログ送信

```typescript
// コンテンツローダー内でページビューを記録
export async function logPageView(page: string) {
  try {
    await fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        referrer: document.referrer
      })
    });
  } catch {
    // エラーは無視（ユーザー体験を損なわない）
  }
}
```

#### 統計情報の取得

統計APIでは、複数のクエリを**並列実行**してパフォーマンスを最適化：

```typescript
// /api/analytics/stats
export async function GET() {
  const [
    totalVisits,
    uniqueVisitors,
    pageStats,
    hourlyDistribution,
    deviceStats,
    browserStats,
    // ...
  ] = await Promise.all([
    prisma.visitorLog.count(),
    prisma.visitorLog.groupBy({ by: ['ipAddress'] }),
    prisma.visitorLog.groupBy({ by: ['page'], _count: true }),
    getHourlyDistribution(),
    getDeviceStats(),
    getBrowserStats(),
    // ...
  ]);

  return Response.json({
    totalVisits,
    uniqueVisitors: uniqueVisitors.length,
    pageStats,
    hourlyDistribution,
    deviceStats,
    browserStats,
    // ...
  });
}
```

#### 取得できる統計情報

| 指標 | 説明 |
|------|------|
| 総訪問数 | 全ページビュー数 |
| ユニーク訪問者数 | IPベースでカウント |
| ページ別アクセス数 | どのページが人気か |
| 時間帯別分布 | 24時間のアクセス傾向 |
| デバイス別 | モバイル/タブレット/デスクトップ |
| ブラウザ別 | Chrome、Safari、Firefoxなど |
| 画面サイズ別 | レスポンシブデザインの参考に |
| 言語別 | 訪問者の言語設定 |
| リファラー別 | どこから来たか |
| 日別グラフ | トレンド分析 |
| 前期間比較 | トレンドの上昇/下降 |

### 3. 認証システム

管理画面へのアクセスはJWT認証で保護：

```typescript
// 認証ミドルウェア
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return !!decoded;
  } catch {
    return false;
  }
}

// ログイン処理
export async function POST(request: Request) {
  const { password } = await request.json();

  const admin = await prisma.admin.findFirst();
  const isValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isValid) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  });

  return Response.json({ token });
}
```

#### セキュリティ対策

- **bcrypt 12ラウンド**でパスワードをハッシング
- **JWT有効期限7日**で自動ログアウト
- **DB障害時のフォールバック**認証

### 4. GSAP スクロールアニメーション

バニラサイトの静的な見た目を、リッチなアニメーションで演出：

```typescript
// components/ScrollAnimations.tsx
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  // パララックス効果
  gsap.utils.toArray('.parallax-bg').forEach((element) => {
    gsap.to(element, {
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  // Reveal アニメーション
  gsap.utils.toArray('.reveal').forEach((element) => {
    gsap.from(element, {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}
```

### 5. サーバーレス最適化（Render.com無料枠対策）

Render.comの無料枠はスリープするため、Cold Start対策を実装：

```typescript
// lib/prisma.ts
export async function ensureConnection(retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      // 指数バックオフ: 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, i)));
    }
  }
}

// タイムアウト機構
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}
```

### 6. SEO対策

JSON-LD構造化データを実装：

```typescript
// app/layout.tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '高島聡平 - 備前焼作家',
  url: 'https://sohei.site',
  author: {
    '@type': 'Person',
    name: '高島聡平',
    jobTitle: '備前焼作家'
  }
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### 7. 画像最適化

Next.js 15の画像最適化を活用：

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
};
```

これにより：
- AVIF/WebP形式で自動配信
- デバイスに応じたサイズの画像を配信
- Lazy loadingで初期表示を高速化

## CI/CD

GitHub Actionsで自動チェック：

```yaml
# .github/workflows/ci.yml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint      # ESLint
      - run: npm run typecheck # TypeScript
      - run: npm run format:check # Prettier
      - run: npx prisma validate  # Prisma
      - run: npm audit --audit-level=moderate # セキュリティ

  build:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
```

## リダイレクト設定（旧URL対応）

SEOを維持するため、旧URLからの301リダイレクトを設定：

```typescript
// next.config.ts
async redirects() {
  return [
    { source: '/index.html', destination: '/', permanent: true },
    { source: '/workIntroduction.html', destination: '/work', permanent: true },
    { source: '/productionProcess.html', destination: '/process', permanent: true },
    { source: '/interview.html', destination: '/interview', permanent: true },
    { source: '/artistIntroduction.html', destination: '/artist', permanent: true },
  ];
}
```

## 苦労した点

### 1. Render.com Cold Start
無料枠のDBがスリープするため、最初のリクエストでタイムアウトが発生。
→ リトライ機構と指数バックオフで解決

### 2. 既存CSSの移行
13,000行以上のCSSをSASSに移行。
→ 変数化とmixin化で保守性を向上

### 3. 管理画面のUI/UX
2,000行以上のReactコンポーネントになった管理画面。
→ セクションごとにコンポーネントを分割して管理

## まとめ

2日間で以下を実現しました：

| 機能 | Before | After |
|------|--------|-------|
| コンテンツ編集 | HTML直接編集 | 管理画面からノーコード |
| アクセス解析 | なし | 自作アナリティクス |
| 技術スタック | バニラHTML/CSS | Next.js 15 + React 19 + TypeScript |
| SEO | なし | JSON-LD構造化データ |
| 画像最適化 | なし | AVIF/WebP自動変換 |
| セキュリティ | なし | JWT認証、XSS対策 |
| 月額コスト | - | **0円** |

最新のフレームワーク（Next.js 15、React 19）を使うことで、開発体験が大幅に向上しました。特にApp RouterとServer Componentsの組み合わせは、従来のPages Routerよりもシンプルにコードを書けます。

また、ノーコードCMSと自作アナリティクスを実装することで、クライアントが自立してサイト運営できる環境を整えられました。

## リポジトリ

ソースコードは以下で公開しています：
https://github.com/yurikachiba/BizenTakashima

質問やフィードバックがあれば、お気軽にどうぞ！

---

**タグ**: `Next.js` `React` `TypeScript` `ノーコード` `アナリティクス` `GSAP` `Prisma` `PostgreSQL` `Vercel` `Render.com`
