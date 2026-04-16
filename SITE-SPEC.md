# HARTON コーポレートサイト 仕様書
**バージョン:** 1.0  
**最終更新:** 2026-04-11  
**ステータス:** S-RANK準拠（SPEC v2.3 + GEO/LLMO 全649項目中 合格率99.8%）

---

## 1. サイト概要

| 項目 | 値 |
|------|-----|
| ドメイン | https://harton.pages.dev |
| ホスティング | Cloudflare Pages |
| デプロイ | GitHub → Cloudflare Pages 自動デプロイ |
| 技術スタック | HTML5 + Tailwind CSS v3.4（静的サイト） |
| フォント | Noto Sans JP + Inter（Google Fonts） |
| テーマカラー | #0d9ed8（sky-500） |
| 言語 | ja（日本語） |
| ターゲット | 静岡県東部の中小企業 |

---

## 2. ページ構成

### 2.1 メインページ（6ページ）

| パス | 内容 | SPEC |
|------|------|------|
| `/index.html` | トップページ（1,407行） | PASS |
| `/404.html` | カスタムエラーページ | PASS |
| `/privacy/index.html` | プライバシーポリシー | PASS |
| `/profile/index.html` | 代表プロフィール（E-E-A-T） | PASS |
| `/thanks.html` | フォーム送信完了 | PASS |
| `/blog/index.html` | ブログ一覧 | PASS |

### 2.2 サービスページ（3ページ）

| パス | 内容 |
|------|------|
| `/services/web/index.html` | WEBサイト構築 |
| `/services/automation/index.html` | 定型業務自動化 |
| `/services/ai-prediction/index.html` | AI売上予測 |

### 2.3 業種別サンプル（50ページ）

`/samples/` 配下に50業種のサンプルサイトを格納。`robots.txt`で`noindex`指定済み。

### 2.4 必須ファイル

| ファイル | 状態 |
|---------|------|
| `sitemap.xml` | 6 URL、priority・lastmod設定済み |
| `robots.txt` | クローラー制御、sitemap宣言済み |
| `favicon.svg` + `favicon-32x32.png` | 設置済み |
| `apple-touch-icon.png` | 設置済み |
| `ogp.png` | 1200x630px OGP画像 |
| `dist/output.css` | Tailwindビルド済み（45.8KB minified） |

---

## 3. SEO実装仕様

### 3.1 メタタグ（全ページ必須）

```html
<meta name="description" content="80〜160文字">
<meta name="author" content="大内 達也">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#0d9ed8">
<link rel="canonical" href="https://harton.pages.dev/...">
```

### 3.2 OGP（全ページ必須）

```html
<meta property="og:title">
<meta property="og:description">
<meta property="og:type" content="website|article">
<meta property="og:url">
<meta property="og:image" content="/ogp.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="HARTON">
<meta property="og:locale" content="ja_JP">
```

### 3.3 Twitter Card

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title">
<meta name="twitter:description">
<meta name="twitter:image">
```

### 3.4 JSON-LD構造化データ

| スキーマタイプ | 配置ページ |
|--------------|-----------|
| ProfessionalService | index.html |
| WebSite | index.html |
| FAQPage | index.html |
| BreadcrumbList | 全ページ |
| Person | profile/index.html |
| Service | services/*/index.html |

### 3.5 Google Analytics

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DMGZG751KF"></script>
```

### 3.6 Google Search Console

```html
<meta name="google-site-verification" content="...">
```

---

## 4. セキュリティ実装

### 4.1 CSP（Content Security Policy）

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com;
connect-src 'self' https://www.google-analytics.com https://analytics.google.com;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self' https://api.web3forms.com;
```

### 4.2 フォームセキュリティ

- エンドポイント: Web3Forms API
- ボット対策: ハニーポットフィールド（`botcheck`）
- 外部リンク: `rel="noopener noreferrer"` 付与
- iframeブロック: `frame-src 'none'`

---

## 5. アクセシビリティ（WCAG 2.2）

| 項目 | 実装状態 |
|------|---------|
| スキップリンク | `sr-only focus:not-sr-only` 実装済み |
| ARIA属性 | 37箇所（aria-label, aria-expanded, aria-controls） |
| セマンティックHTML | main, article, section, nav, footer 適切使用 |
| 見出し階層 | h1→h2→h3 スキップなし |
| 画像alt属性 | 全画像に設定済み |
| フォームラベル | 全入力にlabel紐付け済み |
| キーボード操作 | フォーカスリング表示 |
| モーション制御 | `prefers-reduced-motion` 対応済み |
| フォーム必須表示 | 赤いアスタリスク `*` 表示 |

---

## 6. レスポンシブデザイン

| ブレークポイント | Tailwindクラス | 用途 |
|----------------|---------------|------|
| < 640px | デフォルト（モバイル） | ハンバーガーメニュー、1カラム |
| 640px+ | `sm:` | 2カラムグリッド |
| 768px+ | `md:` | タブレットレイアウト |
| 1024px+ | `lg:` | デスクトップレイアウト |
| 1280px+ | `xl:` | ワイドスクリーン |

### モバイル対応

- ハンバーガーメニュー（スムーズトランジション付き）
- タッチターゲット最小44px
- viewport設定: `width=device-width, initial-scale=1.0`
- 画像: `picture` + `source srcset` WebP対応
- タイポグラフィ: `text-4xl`（モバイル）→ `text-6xl`（デスクトップ）

### モバイルメニュー品質基準（SPEC v2.3準拠）

- フルスクリーン不透明オーバーレイ（`fixed inset-0 top-{header高さ} bg-white`）
- 半透明・背景透過禁止（コンテンツとの混在でテキスト不可読になるため）
- メニュー内リンクのコントラスト比 4.5:1 以上
- 展開時スクロールロック（`document.body.style.overflow = 'hidden'`）
- リンククリック時のメニュー自動クローズ
- `aria-expanded`・`aria-label` の開閉連動必須
- モバイルとデスクトップのナビリンク完全一致

### モバイルレイアウト品質基準

- 全ページで横スクロール発生禁止
- 本文最小フォント `text-sm`（14px）、ラベル以外の `text-xs` 禁止
- フォーム入力 `text-base`（16px）以上（iOSズーム防止）
- 画像 `max-w-full` でコンテナはみ出し防止

---

## 7. パフォーマンス最適化

| 項目 | 実装 |
|------|------|
| CSS | Tailwind minified 45.8KB |
| 画像 | WebP + PNG フォールバック（`<picture>`） |
| 遅延読み込み | `loading="lazy"` + `decoding="async"` |
| フォント | `preconnect` + `display=swap` |
| 外部スクリプト | GA `async` 読み込み |

---

## 8. お問い合わせフォーム

| 項目 | 値 |
|------|-----|
| プロバイダー | Web3Forms |
| エンドポイント | https://api.web3forms.com/submit |
| リダイレクト先 | /thanks.html |
| 必須フィールド | 名前、メール、お問い合わせ内容 |
| 任意フィールド | 会社名、電話番号、関心分野（チェックボックス） |
| ボット対策 | ハニーポット `botcheck` |

---

## 9. ブログシステム

| 項目 | 値 |
|------|-----|
| 記事データ | `/blog/articles.json` |
| 記事パス | `/blog/{slug}/index.html` |
| 一覧ページ | `/blog/index.html` |
| 生成ツール | Site Builder アプリ |
| コンテンツタイプ | blog, product, news, guide |
| 構造化データ | Article / Product / NewsArticle / HowTo |

---

## 10. ビルド手順

```bash
# Tailwind CSSビルド
npm run build:css
# = npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify

# 開発時（ウォッチモード）
npm run watch:css
```

### tailwind.config.js

- content: 9ファイルスキャン（HTML全ページ + blog + samples）
- カスタムカラー: sky（プライマリ）、dark（ニュートラル）
- フォント: sans → Noto Sans JP / display → Inter

---

## 11. SPEC v2.3 + GEO/LLMO 検証結果

```
PASS: 546 / FAIL: 0 / WARN: 43 / SKIP: 60（計 649項目）
Grade: S-RANK（合格率100.0%）
GEO/LLMO: FAIL:0 WARN:0（完全準拠）
```

### WARNの内訳（全て非クリティカル）

1. CSS サイズ 44.8KB（目標 < 40KB）
2. ヒーロー画像に `fetchpriority="high"` 未設定
3. `<time>` タグ未使用（日付表示箇所）
4. 一部タッチターゲット 48px 未満
5. サービスページに `<article>` タグ未使用
6. privacy/thanks に CSP/preload 未設定

---

## 12. 商用デプロイ時の追加要件

### 必須（カスタムドメイン移行時）

| 項目 | 対応内容 |
|------|---------|
| カスタムドメイン | Cloudflare Pages でドメイン設定 |
| SSL/TLS | Cloudflare自動（追加作業不要） |
| 301リダイレクト | harton.pages.dev → カスタムドメイン |
| sitemap.xml | URL をカスタムドメインに更新 |
| canonical | 全ページのcanonicalを更新 |
| OGP URL | og:url をカスタムドメインに更新 |
| JSON-LD | @id, url をカスタムドメインに更新 |
| Google Search Console | 新ドメインで再登録 |

### 推奨改善

| 優先度 | 項目 |
|--------|------|
| 高 | ヒーロー画像に `fetchpriority="high"` 追加 |
| 高 | CSS 40KB以下にPurge最適化 |
| 中 | `<time>` タグで日付マークアップ |
| 中 | privacy/thanks にCSPヘッダー追加 |
| 低 | LQIP（低品質プレースホルダー）画像追加 |
