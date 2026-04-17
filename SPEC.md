# HARTON WEBサイト構築・アプリ開発仕様書 v3.0

> 本仕様書は HARTON 自社サイト（Sクラス判定済み）および site-builder アプリを共通基準とする。
> 【判定根拠】Google 検索セントラル（SEO Starter Guide / Search Essentials）、Core Web Vitals 最新仕様、WCAG 2.2、Cornell KDD 2024 GEO 論文 (arXiv:2311.09735) に準拠。
> ※ E-E-A-T はランキング要因ではなく、品質評価の枠組みである（Google 公式見解）。本仕様では E-E-A-T の考え方に沿った高品質コンテンツ制作を推奨する。
> 今後の全クライアントサイト構築およびアプリ開発において本仕様に準拠すること。
> 2026-04-10 v1.0 初版策定 / 2026-04-11 v2.0 Google 基準統合改訂 / 2026-04-12 v2.2 Google Search Central 完全準拠 / 2026-04-13 v2.3 GOOGLE-STANDARDS.md 統合 / 2026-04-16 v2.4 Containing Block 汚染回避原則（10.5.1.1）新設 + Body Theme Variants（10.6）+ Lead Evidence Block セマンティック配置（4.13）+ table caption/scope 必須化（11.4-tbl）+ ブログページ検証対象化 + spec-checker 2554 項目完全準拠（100% S-RANK 達成） / **2026-04-16 v3.0 メジャー改訂 — Claude 最新モデル追従原則（§0.1）新設・事実性ルール（§0.2）新設・美しいコーディング原則（§0.3）新設・アプリ開発基準（§12）をサイト基準と共有する絶対法規として統合・Lead Evidence Block テンプレの旧価格と捏造引用を排除・3 法規合計サイズを実測値（約 73KB）へ整合・Opus 特定バージョン依存記述を削除**
>
> **【絶対原則】事実性 (Factuality First):** 本仕様書および本仕様下で生成される全コード・全記事は、**検証可能な事実のみを記述する**。推測・未検証の「引用風」文字列・旧バージョンの残留数値は一切許容しない（詳細 §0.2）。
>
> **補助基準書（3 法規体制）:**
> - **GOOGLE-STANDARDS.md** — Google 公式ドキュメントから抽出した完全基準（E-E-A-T、Core Web Vitals、スパムポリシー、構造化データ、AI Overviews 最適化、最新セキュリティヘッダー）
> - **GEO-STANDARDS.md** — Generative Engine Optimization 学術基準（Aggarwal et al., KDD 2024, arXiv:2311.09735, Princeton/IIT Delhi）。Perplexity / Google AI Overviews / Bing Copilot / ChatGPT Search / Claude Search など生成エンジンでの引用率最大化 G-1〜G-6 を規定
>
> SPEC 本体 + GOOGLE + GEO の 3 文書（2026-04-16 実測 計 73KB）を全 AI 呼び出しのシステムプロンプトに埋込み、Anthropic プロンプトキャッシュで共有する。サイズは改版で変動するため「約 70KB 帯」として運用し、記事・UI への露出時は実測値で更新すること。

---

## 0. モデル追従原則・事実性ルール・美しいコーディング原則（v3.0 新設・絶対法規）

### 0.1 Claude 最新モデル追従原則

HARTON 本サイトおよび site-builder は、**Anthropic が公式に「現行最上位」として提供する Claude モデル**を常に採用対象とし、以下のポリシーに従う:

1. **モデル固定記述の禁止:** 仕様書・アプリコード・UI・記事で「Opus 4.6 専用」「Opus 4.7 限定」のような**特定バージョンへの排他的固定**は避ける。Site Builder は公式ページ（<https://platform.claude.com/docs/en/about-claude/models/overview>）で当時の「most capable generally available model」と表示されているモデルを quality モードの主力として採用する。
2. **歴史的参照は許容:** 「v1.0 時点では Opus 4.6 で S-RANK を達成」のような**過去事実の記録**は必要に応じて明記する（Opus 4.6 → 4.7 のような移行を追跡するため）。
3. **価格は同世代一律:** Anthropic 公式 Pricing 表で Opus 4.x（4.5 以降）は同一価格（入力 $5/MTok、出力 $25/MTok）。記事・UI の価格根拠は Pricing ページの実テキストから引用し、特定モデル名に結び付けた独自加工をしない。
4. **`model` パラメータの取り扱い:** コード例ではエイリアス（`claude-opus-4-7` / `claude-sonnet-4-6` / `claude-haiku-4-5`）または日付付き ID（例: `claude-haiku-4-5-20251001`）のうち、公式 Models 表で**実在が確認できるもの**のみを用いる。推測エイリアスの使用禁止。
5. **モデル世代跨ぎの移行手順:** 新しい Opus / Sonnet / Haiku がリリースされた場合、`site-builder/app/lib/spec-checker-template.js` の既定モデル ID、アプリ UI、blog 記事本文、SPEC §0 / 履歴を同時に更新し、`verify-all.js` で回帰確認してからリリースする。

### 0.2 事実性ルール（Factuality First）

引用・コード例・数値・URL は次の基準を満たさない限り一切記載しない。違反は FAIL と同等に扱う:

| ルール | 具体要件 |
|---|---|
| **F-1 引用の verbatim 原則** | `<blockquote>` / `<q cite>` 内の文字列は、`cite` 属性の URL に **literally 存在する文字列のみ** 使用可。翻訳・要約・改変した文を「」で囲って公式引用に見せる行為は禁止（「捏造引用」の排除） |
| **F-2 パラフレーズの明示** | 公式文書の要約・翻訳は `<blockquote>` に入れず、通常段落内で「～によれば…」等と明示する。この場合 `cite` は不要、代わりに出典リンク `<a href>` で示す |
| **F-3 プレースホルダ URL 禁止** | `cite="https://docs.anthropic.com/.../pricing"` のようなドットドットやテンプレ的 URL は禁止。必ず実在する完全 URL を記述 |
| **F-4 価格・仕様の一次ソース原則** | 価格・モデル ID・トークン数などは Anthropic 公式 Pricing / Models / Rate Limits ページ等の一次ソース URL を直接参照し、二次情報からの引き写しを避ける |
| **F-5 数値の出典明記** | パーセンテージ・円・倍率などの数値は、本文中に出典リンクまたは「自社実測 YYYY-MM-DD」と明示する |
| **F-6 旧バージョン数値の追跡** | Opus 4.1 以前の $15/$75 などの旧価格を現行文脈に残さない。歴史的言及は「旧 Opus 4.1／4.0 は $15/$75 だったが現行は $5/$25」のように**明確に過去形**で書く |

### 0.3 美しいコーディング原則（Beautiful Code）

本仕様下で生成される全コード（HTML / CSS / JavaScript / TypeScript / Node.js スクリプト）は以下を満たす:

1. **単一責任の原則:** 1 関数 1 目的、1 ファイル 1 機能群。
2. **命名:** 英小文字ハイフン区切り（ファイル）、camelCase（JS 変数）、PascalCase（クラス / コンポーネント）、SCREAMING_SNAKE_CASE（定数）を一貫使用。
3. **インデント:** 2 スペース固定（HTML / CSS / JS / JSON）。タブ・4 スペース混在禁止。
4. **セミコロン・クォート:** JS は semicolon あり、文字列はシングルクォート（JSX は JS 側で shingle、JSON のみダブル）。
5. **関数長:** 原則 40 行以内。40 行を超える場合は分割リファクタリングを検討（例外は正規表現処理・AST 処理等の構造的必要性があるもの）。
6. **ネスト深度:** 最大 3〜4 段まで。早期 return で flat に保つ。
7. **コメント:** なぜ（why）を書く。何（what）は命名で伝える。
8. **外部依存:** 最小化。Tailwind CSS など構築済みツールは許可、ランタイム CDN は禁止（§2.5）。
9. **エラーハンドリング:** 握りつぶし禁止。例外は catch して **ログ + 再 throw** または明確なフォールバック。
10. **テスト:** `verify-all.js` を通過すること。新機能には spec-checker 項目または app test を追加する（§12.4）。

---

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

### 4.13 Lead Evidence Block（GEO/LLMO 必須 / S-RANK 基準）

**根拠**: Aggarwal et al. "Generative Engine Optimization" (arXiv:2311.09735, KDD 2024, Cornell/Princeton) の G-6「Position-Adjusted」施策。**記事の導入部（最初の `<h2>` より前）に数値・公的ソース・引用句を配置することで Perplexity/SGE/BingChat での引用率が +15.9% 向上**する実測値を根拠とする。

#### 4.13.1 必須要件（セマンティック配置）

ブログ記事・ドキュメントコンテンツの**導入部（`<main>` 内で最初の `<h2>` より前）**に、以下のいずれか**最低1つ**を必ず配置する:

1. **`<blockquote cite="URL">`** — 公的ソース（論文/公式ドキュメント/規格書）からの引用句
2. **`<figure>` + 統計数値** — 具体的な数値（割合/金額/倍率/実測値）を伴う根拠ブロック
3. **公的リンク** — `.go.jp` / `.gov` / `.edu` / 学術 DOI / 公式ドキュメント / schema.org / w3.org への `<a>`

**セマンティック根拠**: HTML Living Standard §4.3.10 で `<h2>` はセクションの開始を示す。`<h2>` 以降に出現する `<blockquote>` は「セクション内引用」でありLead Evidenceではない。`<h2>` 以前に出現するコンテンツのみが記事導入部として扱われる。

#### 4.13.2 推奨構造（冒頭テンプレート）

```html
<article>
  <header>
    <h1>記事タイトル</h1>
    <p>導入段落（記事が何を扱うか・読者メリット）</p>
  </header>

  <div class="prose">
    <!-- ★ Lead Evidence Block（4.13 必須 / 最初の <h2> より前に配置） -->
    <!--
      ※ 下記は構造例。blockquote 内の文字列は cite URL に literally 存在するテキストに限る（§0.2 F-1）。
         プレースホルダ URL（ドットドット）禁止。サイト構築時は必ず実在する一次ソースへ差し替えること。
    -->
    <figure class="evidence-block bg-sky-500/10 border-l-4 border-sky-400 pl-4 pr-4 py-4 my-6 rounded-r-lg">
      <blockquote cite="https://platform.claude.com/docs/en/about-claude/pricing">
        <p class="text-dark-200">「A cache hit costs 10% of the standard input price, which means caching pays off after just one cache read for the 5-minute duration (1.25x write), or after two cache reads for the 1-hour duration (2x write).」</p>
      </blockquote>
      <figcaption class="mt-2 text-sm text-dark-400">— <cite><a href="https://platform.claude.com/docs/en/about-claude/pricing" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Anthropic 公式 Pricing「Prompt caching」（取得日を明記）</a></cite>（キャッシュヒットは標準入力価格の 10%、5 分キャッシュなら 1 回、1 時間キャッシュなら 2 回の読取で元が取れる）</figcaption>
    </figure>

    <!-- 本論（最初の <h2> 以降） -->
    <h2>なぜ...</h2>
    ...
  </div>
</article>
```

#### 4.13.3 品質基準

| 項目 | 基準 |
|------|------|
| 配置位置 | `<main>` 内で**最初の `<h2>` より前**（セマンティック導入部） |
| 引用長さ | `<blockquote>` は**15〜80語**以内（長過ぎは displacive summary 化の懸念） |
| 出典明記 | `cite=` 属性 + 可視テキストでの `<a>` 両方で出典URL明記 |
| リンク属性 | `target="_blank" rel="noopener noreferrer"`（外部参照・セキュリティ） |
| 数値具体性 | 「多い」「高い」等の曖昧語ではなく、具体数値（例: 90%, +15.9%, $15/M） |

#### 4.13.4 spec-checker 検証（セマンティック判定）

`G-6 位置最適化 (Lead Evidence — 最初のh2以前)` チェックが検証。

**判定ロジック**:
1. `<main>` 要素内の文字列を取得（`<main>` なしの場合は `<body>` にフォールバック）
2. 最初の `<h2>` のインデックスを検索
3. 先頭から「最初の `<h2>`」までの領域を `leadRegion` とする
4. `<h2>` 無しページは `<main>` 先頭 40%（`<main>` なしは body 先頭 30%）を `leadRegion` とする
5. `leadRegion` 内に以下のいずれかが検出されれば PASS:
   - `<blockquote>` タグ / `<q cite="...">` タグ
   - 公的ドメインへのリンク: `.go.jp` / `.gov` / `.edu` / `.ac.jp` / `arxiv.org` / `doi.org` / `anthropic.com` / `developers.google.com` / `schema.org` / `w3.org` / `wcag` / `cloudflare.com` / `github.com` / `web.dev` / `meti.go.jp` / `ppc.go.jp`
   - 具体的な数値表現（%, ¥, $, 倍, KB/MB/GB 等）

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
| **DOM 配置（必須）** | **`position: fixed` オーバーレイは `<header>` 等 `backdrop-filter` / `filter` / `transform` / `perspective` / `will-change` を持つ要素の子孫に配置してはならない。containing block が祖先に書き換わり、viewport 基準の全画面展開が失敗する（W3C CSS Containing Block Module Level 3 準拠）。`<body>` 直下または同等のトップレベルに兄弟要素として配置すること** |
| テキスト可読性 | メニュー内リンクのコントラスト比 4.5:1 以上を背景色との組み合わせで保証 |
| スクロールロック | メニュー展開時に `document.body.style.overflow = 'hidden'` でページスクロールを抑止 |
| 閉じる操作 | ハンバーガーボタンのトグルで閉じること。`aria-expanded` を正確に連動 |
| リンククリック時 | メニュー内リンクをクリックした際、メニューが自動的に閉じること |
| Z-index | `z-50` 以上でヘッダー以外の全コンテンツより前面に表示 |
| トランジション | `transform` ベースのアニメーション（`translateX(100%)` → `translateX(0)` 等）。CLS発生禁止 |

#### 10.5.1.1 Containing Block 汚染回避原則（S-RANK 必須）

**CSS仕様（W3C CSS Positioned Layout Module Level 3 / §2.1）により、以下のプロパティを持つ要素は、その子孫の `position: fixed` に対して新しい containing block を生成する:**

- `transform` が `none` 以外
- `perspective` が `none` 以外
- `filter` が `none` 以外
- `backdrop-filter` が `none` 以外
- `will-change` に `transform` / `perspective` / `filter` / `backdrop-filter` が指定されている
- `contain` に `paint` / `layout` / `strict` / `content` が含まれる

**誤った実装（アンチパターン）:**
```html
<header class="fixed nav-blur">  <!-- nav-blur = backdrop-filter -->
  <nav>...</nav>
  <div id="mobile-menu" class="fixed inset-0">...</div>  <!-- ❌ viewport ではなく header を containing block として扱う -->
</header>
```

**正しい実装（S-RANK 必須構造）:**
```html
<header class="fixed nav-blur">
  <nav>...</nav>
</header>
<!-- containing block = viewport として正しく展開される -->
<div id="mobile-menu" class="fixed inset-0">...</div>  <!-- ✅ header の外、body 直下 -->
```

対象: `id="mobile-menu"` / `id="mobileMenu"` / `role="dialog"` を持つ `position: fixed` オーバーレイ全般。モーダル・ドロワー・トーストを含む。

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

## 10.6 Body Theme Variants（Design System 必須）

本仕様は複数のページ用途に対応するため、`<body>` 要素の既定クラスを**2つの公式 Theme Variant** として定義する。ページの用途に応じて必ずいずれか一つを採用し、任意混在や独自改変は禁止。

### 10.6.1 Variant 定義

| Variant | 用途 | 必須 body class | `color-scheme` |
|---------|------|----------------|----------------|
| **marketing** | トップ / LP / サービス紹介 / プロダクト LP（訴求・コンバージョン用途。明色・光の演出） | `bg-white text-dark-700 font-sans antialiased` | `light` |
| **reading** | ブログ記事 / ドキュメント / 長文ユーティリティ / プロファイル（可読性・集中度重視。ダーク OLED フレンドリー） | `bg-dark-900 text-dark-300 font-sans antialiased` | `dark` |

### 10.6.2 ページ種別と Variant 対応

| ページ種別 | Variant | 理由 |
|-----------|---------|------|
| `index.html`（トップ） | marketing | コンバージョン最適化 |
| `services/**/index.html` | marketing | サービス訴求 |
| `site-builder/index.html` など商品 LP | marketing | プロダクト訴求 |
| `blog/**/*.html`（ブログ記事・一覧） | reading | 長文可読性 |
| `privacy/index.html` | reading | 法務長文・集中閲覧 |
| `profile/index.html` | reading | プロフィール長文・集中閲覧 |
| `thanks.html` | reading | 送信後の落ち着いた確認画面 |
| `404.html` | reading | エラー情報の集中提示 |

### 10.6.3 運用ルール

1. **`<meta name="color-scheme">` と body class は必ず対応する Variant と一致**させること（不一致は FAIL）
2. **Variant を変更する場合は SPEC 改版が必須**（v2.4 では上記 2 種のみ許可）
3. **`text-dark-300` / `text-dark-700` 以外のテキスト色を body に直接指定するのは禁止**（コンポーネントレベルでは自由）
4. コントラスト比: WCAG AA 4.5:1 以上を body class と主要テキスト色の組み合わせで担保済み（2 Variant 全て検証済み）
5. reading Variant を採用するページに `bg-white` / `text-dark-700` を body に残置してはならない（旧 default の残骸は FAIL）

### 10.6.4 拡張時の手順

新しいページ種別（例: 管理画面、ポータル）を追加する場合:
1. SPEC 10.6.1 に Variant 定義追加（v2.x 改版）
2. spec-checker の `THEME_VARIANTS` 定義に追加
3. 該当ページに適用

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
- [ ] **モバイルメニューが `backdrop-filter` / `filter` / `transform` / `perspective` / `will-change` を持つ祖先の子孫ではない（containing block 汚染回避 / Section 10.5.1.1）**
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

## 12. アプリ開発基準（site-builder / 付随ツール共通・絶対法規）

本章はサイト構築と**同格の絶対法規**として、HARTON が開発・運用する全アプリ（site-builder、spec-checker、sync-spec、verify-all、将来の関連ツール）に適用される。§0（モデル追従・事実性・美しいコーディング）と不可分。

### 12.1 プロジェクト構成基準

```
<repo-root>/
├── app/                          # アプリ本体（Node.js / TypeScript）
│   ├── main.js|ts                # エントリポイント
│   ├── lib/                      # ドメインロジック（純関数優先）
│   ├── ui/                       # UI レイヤ（DOM 操作・イベント）
│   ├── integrations/             # 外部 API クライアント（Anthropic 等）
│   ├── test/                     # 自動テスト（run.js / *.test.js）
│   └── fixtures/                 # テスト入力データ
├── SPEC.md, GOOGLE-STANDARDS.md, GEO-STANDARDS.md   # 3 法規（sync で配布・編集禁止）
├── package.json
├── README.md                     # 概要・起動手順・ライセンス
└── .git/hooks/pre-push           # verify-all.js 呼び出し（S-RANK ゲート）
```

### 12.2 言語・ランタイム

| 項目 | 基準 |
|---|---|
| 言語 | Node.js（LTS 系最新）標準。型付が必要なら TypeScript を導入 |
| モジュール方式 | ES Modules（`type: "module"`）を原則とする。CommonJS は既存互換のためのみ許容 |
| 最小外部依存 | 標準ライブラリ優先。追加する npm パッケージは目的・代替検討・ライセンスを PR 説明に記す |
| ロックファイル | `package-lock.json` or `pnpm-lock.yaml` を必ずコミット |
| Node バージョン | `engines.node` で明示。CI と開発環境で一致させる |

### 12.3 コード品質（§0.3 の具体適用）

1. **単一責任:** 関数は 1 つの動詞で説明できる粒度。
2. **純関数優先:** 副作用（I/O・DOM・グローバル）は thin wrapper に閉じ込める。ドメインロジックは純関数に寄せ、テスト容易性を確保。
3. **エラー処理:** 例外は**ログ付きで再 throw** または **Result 型的なタグ付きリターン**（`{ ok: true, value } / { ok: false, error }`）で表現。握りつぶし禁止。
4. **ログ:** 構造化可能な形式（JSON or key=value）。本番ビルドでは `console.log` の垂れ流し禁止、レベル（debug/info/warn/error）を区別。
5. **コメント:** **why を書き、what は命名で表す。** 正規表現など直感に反するものには「何にマッチする意図か」を一行添える。
6. **Magic number 禁止:** 定数は命名して頂部にまとめる。
7. **不変性優先:** オブジェクトを mutate せず、新しい値を返す。配列は `.map/.filter/.reduce` を活用。
8. **早期 return:** ネストを減らすため。
9. **ファイルサイズ:** 原則 400 行以内。超える場合は分割。

### 12.4 テスト

| 種別 | 要件 |
|---|---|
| 単体テスト | `app/test/*.test.js`（またはランナが拾う配置）。新規ロジック追加時は原則セットで追加 |
| 統合テスト | `app/test/run.js` で E2E に近いシナリオ（設定読込〜生成〜spec-checker 通過）を少なくとも 1 本 |
| 回帰ベースライン | `verify-all.js` が参照する失敗数 baseline を Git で追跡。超過で push ブロック |
| 決定論 | テストは時刻・乱数・ネットワークに依存しない（fixtures を用意しスタブする） |
| フレーム外検証 | Node 標準の `node:assert` / `node:test` を第一選択。追加ランナは必要性を明記のうえ採用 |

### 12.5 外部 API（Anthropic Claude）利用規律

1. **モデル ID 管理:** 既定モデルはアプリ中央の定数（例: `lib/models.js` の `DEFAULT_MODELS` オブジェクト）で一元管理し、§0.1 に従い Anthropic 公式 Models 表で実在が確認できる ID のみを登録する。
2. **BYO-Key:** ユーザー提供の API キーはローカル暗号化（AES-256 相当）で保管し、アプリ運営側サーバーを経由させない。
3. **月額上限案内:** 初回セットアップ UI で Anthropic Console の Spend Limit ($5 など) 設定手順を必ず提示する。
4. **プロンプトキャッシュ:** 3 法規（SPEC + GOOGLE + GEO）は ephemeral cache でシステムプロンプトに埋込み。キャッシュブロックと動的入力ブロックを明確に分離する。
5. **エラー再現性:** API エラー（429 / 500 等）は retry-after を尊重し、リトライ戦略（指数バックオフ等）をコードで明示。
6. **captive 文字列禁止:** Anthropic 公式からの引用をアプリ UI や生成プロンプトに埋める場合、§0.2 F-1（verbatim 原則）を満たすもののみ使用。要約はパラフレーズと明示。

### 12.6 セキュリティ

| 項目 | 基準 |
|---|---|
| シークレット | `.env` / OS のセキュアストレージ。コミット絶対禁止。`.gitignore` で予防 |
| 依存脆弱性 | `npm audit` を CI または pre-push で実行し、critical / high はリリース前に解消 |
| 入力検証 | 外部入力（ファイル・API レスポンス・ユーザー設定）は schema 検証してから使用 |
| 出力エスケープ | HTML 生成時は **必ずエスケープ**（既存テンプレで担保）。ユーザー入力をテンプレに直埋めしない |
| CSP / ヘッダー | アプリが生成するサイトに対して GOOGLE-STANDARDS §11 に準拠した CSP / COOP / COEP / CORP / Trusted Types を付与できる API を備える |

### 12.7 パフォーマンス予算

| 項目 | 予算 |
|---|---|
| spec-checker 実行時間 | 2,500 項目検査で 1 秒未満（S-RANK 運用想定） |
| サイト生成 API 呼び出し | 並列化可能な部分は `Promise.all` で並列。直列で合計 60 秒未満を目安 |
| CLI 起動時間 | 冷間起動で 300 ms 未満 |
| メモリ | 一般的な Node.js ランタイムで 512 MB 未満 |

### 12.8 Git / 開発フロー

1. **ブランチ:** 既定ブランチ `main` 保護。機能追加は feature ブランチから PR。
2. **コミットメッセージ:** Conventional Commits 風（`feat:` / `fix:` / `docs:` / `refactor:` / `chore:` / `test:`）。本文は「何を」ではなく「なぜ」。
3. **PR ルール:**
   - CI（`verify-all.js --fast` 相当）が全 PASS、S-RANK 維持
   - 3 法規（SPEC / GOOGLE / GEO）の差分がある PR は `sync-spec.js --check` がクリアであること
   - レビュアーは Opus 最新モデルに限らず、人間 or AI のレビューコメントを必ず 1 件以上取り込む
4. **タグ:** リリースは `vMAJOR.MINOR.PATCH` で打ち、CHANGELOG に変更点を記載。
5. **pre-push hook:** `harton/.git/hooks/pre-push` と `site-builder/.git/hooks/pre-push` は `../verify-all.js` を呼び、`FAIL > 0` または app test baseline 超過で push を拒否（絶対不変）。

### 12.9 ドキュメンテーション

- **README.md:** 概要・起動手順・環境変数・ライセンスの必須 4 節。
- **CLAUDE.md（ルート）:** 本仕様書・3 法規・運用フローの参照ガイド（HARTON/CLAUDE.md を参照）。
- **JSDoc / TSDoc:** 公開 API 関数にはパラメータ・戻り値・throw 条件を記述。
- **ADR:** 重要な設計判断（モデル固定からモデル追従への移行など）は `docs/adr/` に ADR-YYYYMMDD.md として残す。

### 12.10 アクセシビリティ（アプリ UI）

サイト基準（§7, WCAG 2.2）と同水準を適用:
- キーボードのみで全操作可能
- フォーカスリング不透明、コントラスト 4.5:1 以上
- aria-label / aria-live を適切に付与
- 動的更新は `aria-live="polite"` などでスクリーンリーダに通知
- 設定画面など重要フローは reduced-motion 対応

### 12.11 リリース基準

リリース（npm publish / 本番デプロイ / GitHub Release）前のチェック:

- [ ] `node verify-all.js` フル PASS（3 法規同期 OK / spec-checker FAIL=0 / app test baseline 以内）
- [ ] 3 法規の version とアプリ UI / 記事の version が一致
- [ ] CHANGELOG.md 追記
- [ ] package.json の version 更新
- [ ] `npm audit` 重大脆弱性なし
- [ ] pre-push hook 健全性確認

---

## 13. 改版履歴

| 版 | 日付 | 内容 |
|----|------|------|
| 1.0 | 2026-04-10 | 初版。HARTON自社サイトSクラス判定を基に策定 |
| 2.0 | 2026-04-11 | Google検索セントラル/E-E-A-T/Core Web Vitals最新基準を統合。JSON-LD 5種化、Person追加、404.html/profile/index.html必須化、INP基準採用、fetchpriority対応、内部リンク網・一次情報要件追加 |
| 2.1 | 2026-04-12 | モバイル品質基準（Section 10.5）追加。モバイルメニュー・レイアウト・ナビゲーション・パフォーマンスの必須要件を明文化。チェックリスト11.7にモバイル検証項目追加 |
| 2.2 | 2026-04-12 | Google Search Central完全準拠。E-E-A-Tは品質評価枠組みであり非ランキング要因と明記。meta keywords不使用を明記。URL設計・リンクテキスト基準追加（Section 3.4, 3.5）。alt text重要性強化。canonical用途明確化。コンテンツ鮮度管理（4.5）、Search Console推奨（4.10）、UGCリンク対策（4.11）、JSレンダリング要件（4.12）追加。構造化データ→リッチリザルトの関係を明記 |
| 2.3 | 2026-04-13 | GOOGLE-STANDARDS.md / GEO-STANDARDS.md を正式な補助基準書として統合（3法規体制）。GEO（Generative Engine Optimization, arXiv:2311.09735）の G-1〜G-6 を全AI呼び出しのシステムプロンプトと納品前検証（spec-checker 649項目）に組込み。Claude Opus 4.6 限定 / Sクラス品質保証をアプリ仕様として確定 |
| 2.4 | 2026-04-16 | **Containing Block 汚染回避原則（Section 10.5.1.1）を新設**。`position: fixed` オーバーレイ（モバイルメニュー / モーダル / ドロワー）は `backdrop-filter` / `filter` / `transform` / `perspective` / `will-change` を持つ祖先の子孫に配置不可とする W3C CSS Positioned Layout Level 3 準拠規定を明文化。チェックリスト11.7に祖先 containing block 検証を追加。ブログページ（blog/**/*.html）を spec-checker 検証対象に追加し、静的ページと同一の S-RANK 基準で検証する |
| **3.0** | **2026-04-16** | **メジャー改訂。§0（モデル追従原則・事実性ルール F-1〜F-6・美しいコーディング原則）を絶対法規として新設。§12（アプリ開発基準）を絶対法規としてサイト基準と共有化。§4.13 Lead Evidence Block テンプレ内に残存していた旧 Opus 4.1 価格（$15/$75）および捏造 `cite` URL（ドットドット プレースホルダ）を実 URL・verbatim 引用へ置換。3 法規合計サイズの記述を「計約 40KB」から実測値「約 73KB」へ整合。Opus 4.6 固定の記述（「Claude Opus 4.6 限定」等）を削除し、Anthropic 公式 Models overview で「most capable generally available model」と表示される現行モデルを主力とする追従方針に切替。<br>**移行時の互換性:** 既存 v2.x の納品済みサイトは再生成不要。次回更新時に §0 / §12 基準を適用。<br>**監査トレース:** 2026-04-16 の記事群修正で下流のブログ記事を Opus 4.7 / 検証済み引用へ更新済み。v3.0 は上流法規側の整合を取ったもの。 |
