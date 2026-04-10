# HARTON WEBサイト構築仕様書 v1.0

> 本仕様書はHARTON自社サイト（Sクラス判定済み）を基準とする。
> 今後の全クライアントサイト構築において本仕様に準拠すること。
> 2026-04-10 策定

---

## 1. プロジェクト構成

```
project-root/
├── index.html              # メインHTML（単一SPA）
├── package.json            # ビルドスクリプト
├── tailwind.config.js      # Tailwind設定
├── src/
│   └── input.css           # Tailwindソース
├── dist/
│   └── output.css          # ビルド済みCSS（minified）
├── fonts/                  # （ローカルフォント使用時のみ）
├── privacy/
│   └── index.html          # プライバシーポリシー
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
  content: ['./index.html'],
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

1. index.htmlから全Tailwindクラスを抽出
2. dist/output.cssに全クラスが含まれているか照合
3. **欠落ゼロで合格。1件でも欠落があれば納品不可**

特にopacity modifier classes（`bg-sky-500/10`、`text-white/80`等）の照合を重点確認すること。

### 2.5 禁止事項

- **Tailwind CDN（scriptタグ版）の使用禁止。** ランタイムCSS生成はCLS悪化の原因
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

  <!-- JSON-LD構造化データ（後述） -->

  <!-- CSS: ビルド済みCSSのみ -->
  <link rel="stylesheet" href="/dist/output.css">

  <!-- Google Fonts（preconnect + preload + stylesheet） -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="{Google Fonts URL}" as="style">
  <link href="{Google Fonts URL}" rel="stylesheet">

  <!-- カスタムCSS -->
  <style>
    /* 後述のカスタムCSS仕様に準拠 */
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

    <section id="{セクションID}" aria-label="{日本語セクション名}">
      <!-- 各セクション: 必ずaria-label付与 -->
    </section>
    <!-- ... -->
  </main>

  <footer>
    <!-- フッターナビ + コピーライト -->
  </footer>
</body>
```

### 3.3 見出し階層（必須ルール）

- **H1**: ページに1つだけ。主要キーワードを含む
- **H2**: セクション見出し。スキップ禁止（H1→H3は不可）
- **H3**: サブセクション見出し
- **H4**: カード内タイトル等
- スキャンだけでサイト全体像が把握できること（LLMO対応）

---

## 4. SEO仕様

### 4.1 メタタグ基準

| 項目 | 基準 |
|------|------|
| title | 30-60文字。サイト名 + 主要キーワード |
| description | 70-160文字。地名 + サービス名 + 差別化 + CTA |
| canonical | 必須。正規URL |
| robots | `index, follow, max-image-preview:large, max-snippet:-1` |
| OGP | 全7項目必須（title, desc, type, url, image, site_name, locale） |
| Twitter Card | summary_large_image + title + desc + image |

### 4.2 構造化データ（JSON-LD）必須4種

#### ProfessionalService（必須プロパティ）
```
name, alternateName, description, url, telephone, email,
address (PostalAddress), geo (GeoCoordinates),
logo, image, founder (Person),
foundingDate, slogan, knowsAbout[], areaServed[],
hasOfferCatalog (OfferCatalog + Offer[]),
serviceType[], priceRange, sameAs[],
openingHoursSpecification
```

#### WebSite
```
name, alternateName, url, inLanguage
```

#### FAQPage
```
mainEntity[] (Question + acceptedAnswer)
最低5問。事業に関する実用的なQ&A
```

#### BreadcrumbList
```
itemListElement[] (ListItem + position + name + item)
```

### 4.3 sitemap.xml

- 全ページ収録
- `<lastmod>` を最新日付に維持
- `robots.txt` からSitemap参照

### 4.4 robots.txt

```
User-agent: *
Allow: /
Disallow: /ogp.html

Sitemap: https://{ドメイン}/sitemap.xml
```

---

## 5. LLMO（LLM最適化）仕様

### 5.1 セマンティックHTML要件

| 要素 | 要件 |
|------|------|
| `<section>` | 全セクションに `aria-label` 付与。LLMがブロック意味を理解可能にする |
| `<nav>` | 全ナビゲーションに `aria-label`。最低3つ（メイン、モバイル、パンくず） |
| `<article>` | 独立コンテンツ単位に使用 |
| `<table>` | `<caption>` + `<th scope="row">` でLLMがテーブル構造を正確に読み取れるようにする |
| `<strong>` | 意味的に重要なテキストに使用 |
| `<header>`, `<main>`, `<footer>` | ランドマーク必須 |

### 5.2 LLMクローラー対応

- `max-snippet:-1`: スニペット長制限なし（LLMに全テキスト提供）
- JSなしで全情報取得可能であること
- JSON-LD構造化データで事業情報を機械可読に
- `lang="ja"` で言語識別を明確に

---

## 6. パフォーマンス仕様

### 6.1 Core Web Vitals基準

| 指標 | 基準 | 不合格ライン |
|------|------|-------------|
| CLS | < 0.1 | > 0.25 |
| LCP | < 2.5s | > 4.0s |
| FID/INP | < 100ms | > 300ms |

### 6.2 CSS配信

- **ビルド済みCSSのみ使用**（Tailwind CDN禁止）
- minified出力
- 目標サイズ: 40KB以下

### 6.3 画像

| 項目 | 基準 |
|------|------|
| フォーマット | WebP優先。`<picture>` + `<source type="image/webp">` + `<img>` PNGフォールバック |
| 属性 | `width`, `height`, `loading="lazy"`, `decoding="async"` 必須 |
| alt | 日本語で具体的な説明。空altは装飾画像のみ |

### 6.4 フォント

- `<link rel="preconnect">` 必須
- `<link rel="preload" as="style">` でフォントCSSをプリロード
- preload URLとstylesheet URLは完全一致させること（ミスマッチ禁止）
- `font-display: swap` で表示ブロック防止

### 6.5 外部リソース

- Google Analytics: `async` 属性必須
- 全外部リクエストを把握し、CSPに反映
- 不要な外部リソース読み込み禁止

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

## 11. 納品前チェックリスト

### 11.1 パフォーマンス

- [ ] CLS < 0.1
- [ ] LCP < 2.5s
- [ ] Tailwind CDN不使用（ビルドCSS使用）
- [ ] ビルドCSSに全クラス含有（照合検証済み）
- [ ] コンソールエラーゼロ
- [ ] 画像WebP + picture tag + lazy + width/height

### 11.2 SEO

- [ ] title 30-60文字
- [ ] description 70-160文字
- [ ] canonical設定
- [ ] robots `max-snippet:-1`
- [ ] OGP全7項目
- [ ] Twitter Card設定
- [ ] JSON-LD 4種（ProfessionalService, WebSite, FAQPage, BreadcrumbList）
- [ ] sitemap.xml
- [ ] robots.txt

### 11.3 LLMO

- [ ] 全sectionにaria-label
- [ ] 全navにaria-label
- [ ] H1→H2→H3スキップなし
- [ ] tableにcaption + th scope
- [ ] JSON-LD構造化データで事業情報を機械可読に
- [ ] JSなしで全情報取得可能
- [ ] lang="ja"

### 11.4 アクセシビリティ

- [ ] タッチターゲット44px以上
- [ ] フォーカスリング不透明
- [ ] prefers-reduced-motion対応
- [ ] noscriptフォールバック
- [ ] スキップリンク
- [ ] 画像alt日本語
- [ ] フォームlabel対応

### 11.5 セキュリティ

- [ ] CSPメタタグ設定
- [ ] target="_blank"にrel="noopener noreferrer"
- [ ] frame-src 'none'
- [ ] object-src 'none'

---

## 12. 改版履歴

| 版 | 日付 | 内容 |
|----|------|------|
| 1.0 | 2026-04-10 | 初版。HARTON自社サイトSクラス判定を基に策定 |
