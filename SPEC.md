# HARTON WEBサイト構築仕様書 v2.2

> 本仕様書はHARTON自社サイト（Sクラス判定済み）を基準とする。
> 【判定根拠】Google検索セントラル（SEO Starter Guide / Search Essentials）、Core Web Vitals最新仕様に完全準拠。
> ※ E-E-A-Tはランキング要因ではなく、品質評価の枠組みである（Google公式見解）。本仕様ではE-E-A-Tの考え方に沿った高品質コンテンツ制作を推奨する。
> 今後の全クライアントサイト構築において本仕様に準拠すること。
> 2026-04-10 初版策定 / 2026-04-11 v2.0 Google基準統合改訂 / 2026-04-12 v2.2 Google Search Central完全準拠 / 2026-04-13 v2.3 GOOGLE-STANDARDS.md統合
> **補助基準書:** GOOGLE-STANDARDS.md — Google公式11ドキュメントから抽出した完全基準（E-E-A-T, Core Web Vitals, スパムポリシー, 構造化データ等）

---

## 1. プロジェクト構成

```
project-root/
├── index.html              # メインHTML（単一SPA）
├── 404.html                # カスタム404（サイト内回遊導線必須）
├── package.json            # ビルドスクリプト
├── tailwind.config.js      # Tailwind設定
├── src/
│   └── input.css           # Tailwindソース
├── dist/
│   └── output.css          # ビルド済みCSS（minified）
├── fonts/                  # （ローカルフォント使用時のみ）
├── privacy/
│   └── index.html          # プライバシーポリシー
├── profile/
│   └── index.html          # 運営者・著者プロフィール（E-E-A-T担保用）
├── sitemap.xml             # サイトマップ
├── robots.txt              # クローラー制御
├── favicon.svg             # SVGファビコン
├── favicon-32.png          # PNG 32x32
├── apple-touch-icon.png    # Apple Touch Icon
├── ogp.png                 # OGP画像 1200x630
└── .gitignore
```

---

## 2. ビルド環境

### 2.1 必須パッケージ

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4"
  },
  "scripts": {
    "build:css": "npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify",
    "watch:css": "npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch"
  }
}
```

### 2.2 Tailwind設定テンプレート

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './**/*.html'],
  theme: {
    extend: {
      colors: {
        // プライマリカラー（案件ごとに変更）
        sky: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
          400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
          800: '#075985', 900: '#0c4a6e',
        },
        // ニュートラル（原則固定）
        dark: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
        display: ['"Inter"', '"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 2.3 input.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.4 ビルド検証（必須）

**CSSビルド後、納品前に必ず実行:**

1. 全HTMLから全Tailwindクラスを抽出
2. dist/output.cssに全クラスが含まれているか照合
3. **欠落ゼロで合格。1件でも欠落があれば納品不可**

特にopacity modifier classes（`bg-sky-500/10`、`text-white/80`等）の照合を重点確認すること。

### 2.5 禁止事項

- **Tailwind CDN（scriptタグ版）の使用禁止。** ランタイムCSS生成はCLS悪化およびINP低下の原因
- ビルド検証なしのCSS差し替え禁止
- `node_modules/` のコミット禁止

---

## 3. HTML構造仕様

### 3.1 head必須要素

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{サイト名} | {主要キーワード}を含む30-60文字のタイトル</title>
  <meta name="description" content="70-160文字。地名+サービス名+差別化+CTA">

  <!-- 著者情報（E-E-A-T） -->
  <meta name="author" content="{運営者または著者名}">

  <!-- OGP（全7項目必須） -->
  <meta property="og:title" content="{titleと同一}">
  <meta property="og:description" content="{descriptionと同一}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical URL}">
  <meta property="og:image" content="{絶対URL}/ogp.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:site_name" content="{サイト名}">
  <meta property="og:locale" content="ja_JP">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{titleと同一}">
  <meta name="twitter:description" content="{descriptionと同一}">
  <meta name="twitter:image" content="{絶対URL}/ogp.png">

  <!-- ブラウザ表示 -->
  <meta name="theme-color" content="{プライマリカラー}">
  <meta name="color-scheme" content="light">

  <!-- クローラー制御 -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">

  <!-- CSP（案件ごとに外部リソースを調整） -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' {許可スクリプトオリジン}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: {許可画像オリジン}; connect-src 'self' {許可接続先}; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'">

  <link rel="canonical" href="{正規URL}">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">

  <!-- ファビコン（3種必須） -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <!-- JSON-LD構造化データ（5種: 後述） -->
  <script type="application/ld+json">
    // ProfessionalService, WebSite, FAQPage, BreadcrumbList, Person
  </script>

  <!-- CSS: ビルド済みCSSのみ -->
  <link rel="stylesheet" href="/dist/output.css">

  <!-- Google Fonts（preconnect + preload + stylesheet） -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="{Google Fonts URL}" as="style">
  <link href="{Google Fonts URL}" rel="stylesheet">

  <!-- カスタムCSS -->
  <style>
    /* 後述のカスタムCSS仕様（Section 9）に準拠 */
  </style>

  <!-- noscriptフォールバック -->
  <noscript>
    <style>.fade-in { opacity: 1 !important; transform: none !important; }</style>
  </noscript>
</head>
```

### 3.2 bodyセマンティック構造

```html
<body class="font-sans text-dark-700 antialiased">
  <!-- スキップリンク（必須） -->
  <a href="#main" class="sr-only focus:not-sr-only ...">メインコンテンツへスキップ</a>

  <header>
    <nav aria-label="メインナビゲーション">
      <!-- デスクトップナビ -->
    </nav>
    <nav aria-label="モバイルナビゲーション" id="mobile-menu">
      <!-- モバイルメニュー -->
    </nav>
  </header>

  <main id="main">
    <nav aria-label="パンくずリスト">
      <!-- BreadcrumbList対応 -->
    </nav>

    <article>
      <!-- 公開日・更新日（E-E-A-T: 鮮度シグナル） -->
      <time itemprop="datePublished" datetime="2026-04-10">2026年4月10日</time>
      <time itemprop="dateModified" datetime="2026-04-12">（更新: 2026年4月12日）</time>

      <section id="{セクションID}" aria-label="{日本語セクション名}">
        <!-- 各セクション: 必ずaria-label付与 -->
      </section>
      <!-- ... -->
    </article>
  </main>

  <footer>
    <nav aria-label="フッターナビゲーション">
      <!-- フッターナビ: サイト内孤立ページを防ぐ回遊導線 -->
    </nav>
    <!-- コピーライト -->
  </footer>
</body>
```

### 3.3 見出し階層と内部リンク（必須ルール）

- **H1**: ページに1つだけ。主要キーワードを含む
- **H2**: セクション見出し。スキップ禁止（H1→H3は不可）
- **H3**: サブセクション見出し
- **H4**: カード内タイトル等
- ※ 見出し順序はランキング要因ではないが、アクセシビリティとLLMO対応のため厳守
- スキャンだけでサイト全体像が把握できること（LLMO対応）
- **内部リンク網**: 孤立したページ（オーファンページ）を作らない。関連トピック同士は文脈に沿ったアンカーテキストで相互リンクする

### 3.4 URL設計（Google推奨）

- **説明的なURL**: コンテンツ内容を反映した短い英語パス（例: `/services/web/`, `/privacy/`）
- ランダムなID・数字列のURLを避ける
- ハイフン区切り推奨（アンダースコアよりハイフン）
- URLは簡潔に保ち、不要なパラメータを含めない

### 3.5 リンクテキスト（Google推奨）

- **説明的なアンカーテキスト**: 「こちら」「クリック」「詳細」等の曖昧な文言を避ける
- リンク先の内容がアンカーテキストから推測できること
- 過剰なリンクでページを埋め尽くさない
- CSSでリンクと通常テキストを視覚的に区別すること

---

## 4. SEO & E-E-A-T 仕様

### 4.1 メタタグ基準

| 項目 | 基準 |
|------|------|
| title | 30-60文字。サイト名 + 主要キーワード。各ページでユニークに |
| description | 70-160文字。地名 + サービス名 + 差別化 + CTA。各ページでユニークに |
| author | 運営者または著者名（品質シグナル） |
| canonical | 必須。正規URL（重複コンテンツのクロール統合に使用） |
| robots | `index, follow, max-image-preview:large, max-snippet:-1` |
| meta keywords | **使用しない**（Googleは無視する。設置不要） |
| OGP | 全7項目必須（title, desc, type, url, image, site_name, locale） |
| Twitter Card | summary_large_image + title + desc + image |

### 4.2 構造化データ（JSON-LD）必須5種

> **Google Search Central**: 構造化データはリッチリザルト（FAQ、パンくず、ビジネス情報等）の表示に必要。
> Google Rich Results Testでエラーゼロを確認すること。
> `data-nosnippet` 属性でスニペットから除外したいテキストを制御可能。

#### 1. ProfessionalService / LocalBusiness（必須プロパティ）
```
name, alternateName, description, url, telephone, email,
address (PostalAddress), geo (GeoCoordinates),
logo, image, founder (Person),
foundingDate, slogan, knowsAbout[], areaServed[],
hasOfferCatalog (OfferCatalog + Offer[]),
serviceType[], priceRange, sameAs[],
openingHoursSpecification
```

#### 2. WebSite（SearchAction含む）
```
name, alternateName, url, inLanguage,
potentialAction (SearchAction)
```

#### 3. FAQPage
```
mainEntity[] (Question + acceptedAnswer)
最低5問。ユーザーの検索意図（インテント）に直接答える実用的なQ&A
```

#### 4. BreadcrumbList
```
itemListElement[] (ListItem + position + name + item)
サイト内の階層構造を正確にクローラーへ伝える
```

#### 5. Person / Organization（E-E-A-T強化用）
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "代表者名",
  "jobTitle": "役職",
  "worksFor": {
    "@type": "Organization",
    "name": "HARTON"
  },
  "url": "https://{ドメイン}/profile/"
}
```
※ `profile/index.html` にて、代表者・監修者の実績や専門性を言語化して記述すること。一次情報（実体験に基づく一次データ）を必ず含める。

### 4.3 E-E-A-T コンテンツ要件（品質評価枠組み）

> **注意**: E-E-A-Tはランキング要因ではない。Googleの品質評価ガイドラインにおける評価枠組みであり、高品質コンテンツを制作するための指針として活用する。

| 要素 | 要件 |
|------|------|
| Experience（経験） | 実体験に基づく一次情報（自社独自の事例・データ）を含める |
| Expertise（専門性） | profile/index.htmlに代表者の専門分野・資格・実績を明記 |
| Authoritativeness（権威性） | 構造化データ（Person JSON-LD）で著者情報を機械可読に |
| Trustworthiness（信頼性） | プライバシーポリシー、連絡先、所在地を明示 |

### 4.4 公開日・更新日（鮮度シグナル）

```html
<time itemprop="datePublished" datetime="2026-04-10">2026年4月10日</time>
<time itemprop="dateModified" datetime="2026-04-12">（更新: 2026年4月12日）</time>
```
- `<article>` 内に `<time>` タグで公開日と最終更新日を機械可読に明示
- Google検索結果の日付表示にも影響

### 4.5 コンテンツ鮮度管理（Google推奨）

- 古くなったコンテンツは更新または削除する
- `<time>` タグの `dateModified` を更新時に反映
- 404化した旧ページは適切にリダイレクトまたは削除

### 4.6 sitemap.xml

- 全ページ収録
- `<lastmod>` を最新日付に維持
- `robots.txt` からSitemap参照

### 4.7 robots.txt

```
User-agent: *
Allow: /
Disallow: /ogp.html

Sitemap: https://{ドメイン}/sitemap.xml
```

### 4.8 カスタム404ページ

- `404.html` を必ず作成
- トップページへの導線（ナビゲーション）を含める
- サイト内回遊を促す関連リンクを配置
- 同一デザインテーマを維持

### 4.9 301リダイレクト準備

- 独自ドメイン移行を見据えた301リダイレクト設定の準備を完了させること
- Cloudflare Pages: `_redirects` ファイルまたはPages Functions で対応

### 4.10 Google Search Console（推奨）

- サイト公開後、Google Search Consoleに登録し所有権を確認する
- インデックス状況、クロールエラー、Core Web Vitalsを定期的に監視
- サイトマップをSearch Consoleから送信する

### 4.11 UGC（ユーザー生成コンテンツ）リンク対策

- コメント欄やフォーラム等、ユーザーが投稿するリンクには `rel="nofollow ugc"` を付与
- スパムリンクによるSEO悪影響を防止する

### 4.12 JavaScript レンダリング要件（Google推奨）

- JavaScriptで動的に生成されるコンテンツは、Googlebot（レンダリング後）でもユーザーと同一の内容が表示されること
- クリティカルな情報（タイトル、本文、ナビゲーション）はHTMLに直接記述し、JS依存にしない
- `noscript` でフォールバックを提供

---

## 5. LLMO（LLM最適化）仕様

### 5.1 セマンティックHTML要件

| 要素 | 要件 |
|------|------|
| `<section>` | 全セクションに `aria-label` 付与。LLMがブロック意味を理解可能にする |
| `<nav>` | 全ナビゲーションに `aria-label`。最低4つ（メイン、モバイル、パンくず、フッター） |
| `<article>` | 独立コンテンツ単位に使用。`<time>` で日付情報を付与 |
| `<table>` | `<caption>` + `<th scope="row">` でLLMがテーブル構造を正確に読み取れるようにする |
| `<strong>` | 意味的に重要なテキストに使用 |
| `<header>`, `<main>`, `<footer>` | ランドマーク必須 |

### 5.2 LLMクローラー対応

- `max-snippet:-1`: スニペット長制限なし（LLMに全テキスト提供）
- JSなしで全情報取得可能であること
- JSON-LD構造化データ（5種+）で事業情報を機械可読に
- `lang="ja"` で言語識別を明確に

### 5.3 AI検索エンジン引用最適化

AI検索エンジン（Perplexity, ChatGPT Search, Gemini等）が回答生成時にサイトを情報源として引用しやすくする。

| 項目 | 要件 |
|------|------|
| トピック文 | 各ページのメインコンテンツ最初の`<p>`は、ページの主題を端的に述べる完結文とする |
| FAQ回答 | 各回答は自己完結文とする。「上記参照」「詳しくはこちら」等の相対参照を禁止 |
| サービス説明 | 「〇〇は△△を提供する□□サービスです」のような定義文から開始する |
| メタディスクリプション | 検索意図に対する直接回答となる完結文（70-160文字） |

### 5.4 Speakable構造化データ

音声アシスタント・AI検索エンジンが最重要テキストを特定するための `speakable` プロパティを `WebSite` JSON-LDに追加する。

```json
{
  "@type": "WebSite",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".hero-content", ".business-description", ".faq-section"]
  }
}
```

### 5.5 AIクローラー明示許可（robots.txt）

```
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Amazonbot
Allow: /
```

- `<meta name="robots" content="max-image-preview:large">` をトップページに追加
- AI向けに全コンテンツをクロール許可し、情報源としての引用機会を最大化する

### 5.6 コンテンツ構造のAI解析最適化

| パターン | 用途 | 要件 |
|---------|------|------|
| `<dl>/<dt>/<dd>` | サービス特徴・料金等のキーバリュー情報 | AIが構造的に情報を抽出可能にする |
| `data-nosnippet` | ナビゲーション・フッターの定型テキスト | AIクローラーが本文コンテンツに集中するための除外指定 |
| `<time datetime>` | 日付・営業時間 | 機械可読な日時情報を提供 |

### 5.7 HowToスキーマ（オプション）

サービスページにプロセス・フロー情報がある場合、`HowTo` JSON-LDを追加する。AI検索の「〇〇のやり方」クエリに直接回答される可能性を高める。

```json
{
  "@type": "HowTo",
  "name": "〇〇の流れ",
  "step": [
    { "@type": "HowToStep", "name": "ステップ1", "text": "..." }
  ]
}
```

---

## 6. パフォーマンス仕様（Core Web Vitals）

### 6.1 Core Web Vitals基準

| 指標 | 基準 | 不合格ライン | 対策 |
|------|------|-------------|------|
| LCP | < 2.5s | > 4.0s | ヒーロー画像への `fetchpriority="high"` 付与。画像のWebP化 |
| CLS | < 0.1 | > 0.25 | 全 `<img>` に `width` と `height` を明記しレイアウトシフトを防ぐ |
| INP | < 200ms | > 500ms | JSのメインスレッド占有を防ぐ。サードパーティスクリプトは遅延実行 |

### 6.2 CSS配信

- **ビルド済みCSSのみ使用**（Tailwind CDN禁止）
- minified出力
- 目標サイズ: 40KB以下

### 6.3 画像

| 項目 | 基準 |
|------|------|
| フォーマット | WebP優先。`<picture>` + `<source type="image/webp">` + `<img>` PNGフォールバック |
| 属性 | `width`, `height` 必須。ファーストビュー以外は `loading="lazy"`, `decoding="async"` |
| LCP対策 | ヒーロー画像には `fetchpriority="high"` を付与（lazy禁止） |
| alt | **「かなり重要」（Google公式）** 日本語で具体的・簡潔な説明。画像の内容と文脈での役割を記述。キーワード詰め込み禁止。装飾画像は空（`alt=""`） |

### 6.4 フォント

- `<link rel="preconnect">` 必須
- `<link rel="preload" as="style">` でフォントCSSをプリロード
- preload URLとstylesheet URLは完全一致させること（ミスマッチ禁止）
- `font-display: swap` で表示ブロック防止

### 6.5 外部リソースとJS実行（INP対策）

- Google Analytics等のサードパーティスクリプトは `defer`/`async` または `requestIdleCallback` 等を用いて**遅延読み込みを義務化**
- 全外部リクエストを把握し、CSPに反映
- 不要な外部リソース読み込み禁止
- JSのメインスレッド占有時間を最小化

---

## 7. アクセシビリティ仕様

### 7.1 WCAG 2.2準拠項目

| 項目 | 基準 |
|------|------|
| タッチターゲット | 全インタラクティブ要素 44px以上（WCAG Level AAA）。インラインリンクは例外 |
| フォーカスリング | `focus:ring-2 focus:ring-{color}` 不透明。`focus:ring-*/30` など半透明禁止 |
| コントラスト | 本文 4.5:1以上、大文字 3:1以上、UI要素 3:1以上 |
| スキップリンク | `<a href="#main" class="sr-only focus:not-sr-only">` 必須 |
| ARIAラベル | 全section、全nav、ハンバーガーボタン（aria-label, aria-expanded, aria-controls） |

### 7.2 フォーム

- 全inputに対応する`<label>`
- `focus:ring` 不透明（`/30`等の半透明禁止）
- `focus:outline-none` は `focus:ring` と併用時のみ許可

### 7.3 モーション

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .fade-in {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

### 7.4 noscriptフォールバック

```html
<noscript>
  <style>.fade-in { opacity: 1 !important; transform: none !important; }</style>
</noscript>
```

---

## 8. セキュリティ仕様

### 8.1 CSP（Content Security Policy）

必須ディレクティブ:
```
default-src 'self';
script-src 'self' 'unsafe-inline' {許可オリジン};
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: {許可オリジン};
connect-src 'self' {許可オリジン};
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
```

### 8.2 リンク

- `target="_blank"` には必ず `rel="noopener noreferrer"`
- 外部リンクは最小限に

---

## 9. カスタムCSS仕様

以下のカスタムCSSをinline `<style>` に含める:

```css
/* スムーススクロール */
html { scroll-behavior: smooth; }

/* フェードインアニメーション */
.fade-in {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ヒーロー背景グリッド */
.hero-grid {
  background-image: radial-gradient(circle at 1px 1px, rgba(14,165,233,0.15) 1px, transparent 0);
  background-size: 40px 40px;
}

/* グロー効果 */
.glow { box-shadow: 0 0 60px rgba(14,165,233,0.15); }

/* カードホバー */
.card-hover { transition: transform 0.3s, box-shadow 0.3s; }
.card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

/* ナビゲーションブラー */
.nav-blur { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

/* モバイルメニュー */
.mobile-menu { transform: translateX(100%); transition: transform 0.3s ease; }
.mobile-menu.open { transform: translateX(0); }

/* フローティングアニメーション */
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.float { animation: float 3s ease-in-out infinite; }

/* パルスラインアニメーション */
@keyframes pulse-line { 0%{opacity:0.4} 50%{opacity:1} 100%{opacity:0.4} }
.pulse-line { animation: pulse-line 2s infinite; }

/* グラデーションテキスト */
.gradient-text {
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0ea5e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* カテゴリタブ */
.cat-tab { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid transparent; }
.cat-tab:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
.cat-tab.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }

/* sr-only */
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
}

/* prefers-reduced-motion（必須） */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .fade-in { opacity: 1 !important; transform: none !important; }
}
```

---

## 10. デザイン基準

### 10.1 タイポグラフィ

| 用途 | フォント | ウェイト |
|------|--------|---------|
| 本文 | Noto Sans JP | 300, 400, 500, 700, 900 |
| 見出し・アクセント | Inter | 400, 500, 600, 700, 800, 900 |
| フォント数 | **最大2ファミリー** | |

### 10.2 カラーシステム

- プライマリ: skyパレット（案件ごとに変更可能）
- ニュートラル: darkパレット（原則固定）
- セマンティック: red=エラー, emerald=成功, amber=警告
- opacity modifierで奥行き表現（`bg-sky-500/10`等）
- **コントラスト比**: sky-500 + white は大文字基準3:1以上を確保すること

### 10.3 スペーシング

- 8pxベースのスケール
- セクション間: `py-24`（192px）
- カード内: `p-6` or `p-8`
- 関連要素は近く、異なるセクションは遠く

### 10.4 タッチターゲット

- 全ボタン・リンク: 最低44px高
- ナビリンク: `py-3` 以上
- フォーム要素: `py-3` 以上
- チェックボックス/ラジオ: 親labelでラップし44px確保

---

## 10.5 モバイル品質基準（必須）

モバイル端末（< 1024px）での品質を保証するため、以下を必須要件とする。

### 10.5.1 モバイルメニュー

| 項目 | 基準 |
|------|------|
| オーバーレイ方式 | `fixed inset-0 top-{header高さ}` のフルスクリーン不透明オーバーレイ。背景コンテンツの透過禁止 |
| 背景色 | 不透明な背景色必須（`bg-white` / `bg-dark-900` 等）。半透明・backdrop-filterのみの背景は禁止 |
| テキスト可読性 | メニュー内リンクのコントラスト比 4.5:1 以上を背景色との組み合わせで保証 |
| スクロールロック | メニュー展開時に `document.body.style.overflow = 'hidden'` でページスクロールを抑止 |
| 閉じる操作 | ハンバーガーボタンのトグルで閉じること。`aria-expanded` を正確に連動 |
| リンククリック時 | メニュー内リンクをクリックした際、メニューが自動的に閉じること |
| Z-index | `z-50` 以上でヘッダー以外の全コンテンツより前面に表示 |
| トランジション | `transform` ベースのアニメーション（`translateX(100%)` → `translateX(0)` 等）。CLS発生禁止 |

### 10.5.2 モバイルレイアウト

| 項目 | 基準 |
|------|------|
| 横スクロール | 全ページで水平スクロールバーが発生しないこと。`overflow-x: hidden` を安易に使わず、根本原因を修正 |
| テキスト折り返し | 長いURLやコードブロックは `break-words` / `overflow-wrap: break-word` で折り返し |
| フォントサイズ | 本文最小 `text-sm`（14px）以上。`text-xs`（12px）はラベル・キャプションのみ許可 |
| 画像 | `max-w-full` で親コンテナからはみ出さないこと |
| テーブル | モバイルではスタック表示またはスクロールラッパー（`overflow-x-auto`）を使用 |
| 入力フォーム | `text-base`（16px）以上でiOSの自動ズームを防止 |

### 10.5.3 モバイルナビゲーション

| 項目 | 基準 |
|------|------|
| デスクトップナビ非表示 | `lg:hidden` / `hidden lg:flex` でモバイル・デスクトップのナビを排他表示 |
| リンク一致 | モバイルメニューとデスクトップナビの導線（リンク先）は完全一致させること |
| ハンバーガーボタン | `aria-label`（開閉に応じて変更）、`aria-expanded`、`aria-controls` 必須 |
| メニューロール | `role="dialog"` または `role="navigation"` + `aria-label` 必須 |

### 10.5.4 モバイルパフォーマンス

| 項目 | 基準 |
|------|------|
| ヒーロー画像 | モバイルでは適切なサイズの画像を配信（`<picture>` + `<source media="(max-width: 640px)">`） |
| フォント数 | 2ファミリー以内（モバイル回線を考慮） |
| 外部リソース | 遅延読み込みを厳守。First Contentful Paintをブロックしない |

---

## 11. 納品前チェックリスト

### 11.1 パフォーマンス・Core Web Vitals

- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms をクリア
- [ ] Tailwind CDN不使用（ビルドCSS使用）
- [ ] ビルドCSSに全クラス含有（照合検証済み）
- [ ] コンソールエラーゼロ
- [ ] 画像WebP + picture tag + width/height + lazy(非FV) + fetchpriority="high"(FV)
- [ ] サードパーティスクリプト遅延実行（defer/async）

### 11.2 SEO・E-E-A-T

- [ ] title 30-60文字
- [ ] description 70-160文字
- [ ] `<meta name="author">` 設定
- [ ] canonical設定
- [ ] robots `max-snippet:-1`
- [ ] OGP全7項目
- [ ] Twitter Card設定
- [ ] JSON-LD 5種（ProfessionalService, WebSite, FAQPage, BreadcrumbList, Person）
- [ ] JSON-LD がGoogleリッチリザルトテストでエラーなし
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] `<time>` タグで公開日/更新日が機械可読

### 11.3 E-E-A-Tコンテンツ

- [ ] プロフィールページ（profile/index.html）が存在し、専門性が明記されている
- [ ] 一次情報（自社独自の事例、データ等）が含まれている
- [ ] サイト内に孤立ページが存在しない（パンくず、フッターナビで網羅）

### 11.4 LLMO

- [ ] 全sectionにaria-label
- [ ] 全navにaria-label（メイン、モバイル、パンくず、フッター）
- [ ] H1→H2→H3スキップなし
- [ ] tableにcaption + th scope
- [ ] JSON-LD構造化データで事業情報を機械可読に（5種+Speakable）
- [ ] JSなしで全情報取得可能
- [ ] lang="ja"
- [ ] 各ページ最初の`<p>`がトピック文（完結した定義文）
- [ ] FAQ回答が自己完結（相対参照なし）
- [ ] robots.txtにAIクローラー明示許可（GPTBot, PerplexityBot, ClaudeBot等）
- [ ] ナビ・フッター定型テキストに`data-nosnippet`
- [ ] `<meta name="robots" content="max-image-preview:large">`
- [ ] Speakable JSON-LD（hero, business-description, faq-section）
- [ ] サービス特徴に`<dl>/<dt>/<dd>`パターン使用

### 11.5 アクセシビリティ

- [ ] タッチターゲット44px以上
- [ ] フォーカスリング不透明
- [ ] prefers-reduced-motion対応
- [ ] noscriptフォールバック
- [ ] スキップリンク
- [ ] 画像alt日本語
- [ ] フォームlabel対応

### 11.6 セキュリティ

- [ ] CSPメタタグ設定
- [ ] target="_blank"にrel="noopener noreferrer"
- [ ] frame-src 'none'
- [ ] object-src 'none'

### 11.7 モバイル品質

- [ ] モバイルメニューがフルスクリーン不透明オーバーレイで表示される
- [ ] メニュー内テキストが背景色とのコントラスト比4.5:1以上を満たす
- [ ] メニュー展開時にページスクロールがロックされる
- [ ] メニュー内リンクをクリックするとメニューが自動的に閉じる
- [ ] `aria-expanded` がメニュー開閉と正確に連動する
- [ ] 全ページで横スクロールが発生しない
- [ ] 本文フォントサイズが最小14px以上
- [ ] フォーム入力が16px以上（iOSズーム防止）
- [ ] モバイルとデスクトップのナビリンクが一致している
- [ ] ハンバーガーボタンに `aria-label`, `aria-expanded`, `aria-controls` が設定されている

### 11.8 追加要件

- [ ] カスタム404ページが存在し、トップへのナビゲーションがある
- [ ] 独自ドメイン移行用301リダイレクト設定の準備が完了

---

## 12. 改版履歴

| 版 | 日付 | 内容 |
|----|------|------|
| 1.0 | 2026-04-10 | 初版。HARTON自社サイトSクラス判定を基に策定 |
| 2.0 | 2026-04-11 | Google検索セントラル/E-E-A-T/Core Web Vitals最新基準を統合。JSON-LD 5種化、Person追加、404.html/profile/index.html必須化、INP基準採用、fetchpriority対応、内部リンク網・一次情報要件追加 |
| 2.1 | 2026-04-12 | モバイル品質基準（Section 10.5）追加。モバイルメニュー・レイアウト・ナビゲーション・パフォーマンスの必須要件を明文化。チェックリスト11.7にモバイル検証項目追加 |
| 2.2 | 2026-04-12 | Google Search Central完全準拠。E-E-A-Tは品質評価枠組みであり非ランキング要因と明記。meta keywords不使用を明記。URL設計・リンクテキスト基準追加（Section 3.4, 3.5）。alt text重要性強化。canonical用途明確化。コンテンツ鮮度管理（4.5）、Search Console推奨（4.10）、UGCリンク対策（4.11）、JSレンダリング要件（4.12）追加。構造化データ→リッチリザルトの関係を明記 |
