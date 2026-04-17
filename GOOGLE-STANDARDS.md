# Google公式基準書 — HARTON Site Builder / アプリ準拠リファレンス
**バージョン:** 2.0（2026-04-16 / SPEC.md v3.0 整合・AI Overviews 章・最新セキュリティヘッダー追加）
**作成日:** 2026-04-13（v1.0） → 改訂 2026-04-16（v2.0）
**目的:** AI サイト生成・アプリ開発時に SPEC.md + GEO-STANDARDS.md と合わせてプロンプトに埋め込み、Google 公式基準完全準拠を保証する
**事実性ルール:** 本書の引用は SPEC.md §0.2（Factuality First）に従う。本書中で「公式」と示す URL は全て実在する Google 一次ソースへ接続する

---

## 公式ソース一覧

| # | ドキュメント | URL |
|---|-------------|-----|
| 1 | Google検索セントラル（総合ポータル）| https://developers.google.com/search/?hl=JA |
| 2 | Google検索の基本事項 | https://developers.google.com/search/docs/essentials?hl=ja |
| 3 | SEOスターターガイド | https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=ja |
| 4 | 有用なコンテンツ作成ガイドライン | https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=ja |
| 5 | Core Web Vitals | https://developers.google.com/search/docs/appearance/core-web-vitals?hl=ja |
| 6 | 検索品質評価ガイドライン（PDF） | https://static.googleusercontent.com/media/guidelines.raterhub.com/ja//searchqualityevaluatorguidelines.pdf |
| 7 | ページエクスペリエンス | https://developers.google.com/search/docs/appearance/page-experience?hl=ja |
| 8 | Search Console | https://search.google.com/search-console/about?hl=ja |
| 9 | PageSpeed Insights | https://pagespeed.web.dev/?hl=ja |
| 10 | Google検索ブログ | https://developers.google.com/search/blog?hl=ja |
| 11 | Google検索アップデート | https://developers.google.com/search/updates?hl=ja |

---

## 1. Google検索の基本事項（旧ウェブマスターガイドライン）

### 1.1 技術要件（最低限）
- Googlebotがページにアクセスできること
- ページがHTTPステータス200を返すこと
- インデックス可能なコンテンツを含むこと

### 1.2 コンテンツ要件
- 有用で信頼性の高い、ユーザー第一のコンテンツを作成する
- ユーザーが実際に検索するキーワードをタイトル・見出しに配置
- リンクをクロール可能にする（JavaScript依存のリンクを避ける）
- 画像・動画・構造化データの固有ベストプラクティスを適用

### 1.3 スパムポリシー準拠
- 全16種のスパム行為を回避すること（§7で詳述）

---

## 2. SEOスターターガイド — 全推奨事項

### 2.1 タイトル要素（`<title>`）
- 各ページに固有で簡潔なタイトルを設定
- 会社名・重要情報を含める
- ブラウザタブ・ブックマークにも表示される重要要素
- **NG:** 全ページ同一タイトル、曖昧なタイトル、キーワード詰込み

### 2.2 メタディスクリプション（`<meta name="description">`）
- 各ページに固有の、1〜2文の的確な要約
- ページ内容を正確に反映
- **NG:** 全ページ同一、キーワード羅列、本文コピペ

### 2.3 見出し構造
- 長文は段落・セクションに分割
- 見出しタグ（h1〜h6）で論理構造を表現
- 全体を見通せる構成

### 2.4 URL構造
- 人間が読める意味のある単語をURLに含める
- ディレクトリで類似トピックをグルーピング
- **良い例:** `/services/web-development/`
- **NG:** ランダムID、極端に長いURL、パラメータ乱用

### 2.5 クロールとインデックス登録
- XMLサイトマップを送信（推奨）
- CSS・JavaScriptにGooglebotがアクセス可能にする
- `site:` 検索でインデックス状況を確認
- URLインスペクションツールでGoogle視点の表示確認

### 2.6 重複コンテンツ対策
- `rel="canonical"` で正規URLを指定
- リダイレクトで統一（www有無、HTTP→HTTPS等）
- 重複はペナルティではないがUX低下

### 2.7 画像最適化
- 高品質画像を関連テキストの近くに配置
- `alt` 属性で内容を簡潔に説明（必須）
- 適切なファイル名（`img001.jpg` → `seo-guide.jpg`）

### 2.8 動画最適化
- 高品質動画を独立ページに埋め込み
- タイトル・説明に分かりやすいテキスト

### 2.9 リンク戦略
- **内部リンク:** 関連ページへ適切にリンク
- **アンカーテキスト:** リンク先の内容が分かる具体的なテキスト
- **外部リンク:** 信用できるサイトのみ
- **nofollow:** 広告リンク・ユーザー生成コンテンツに付与
- **target="_blank":** 外部リンクには `rel="noopener noreferrer"`

### 2.10 モバイル対応
- モバイルファーストインデックスに完全対応
- レスポンシブデザイン推奨
- タップターゲットの適切なサイズ

### 2.11 Google検索で重要でないもの（公式明言）
- **メタキーワード:** Googleは無視
- **キーワード密度:** 最適値は存在しない
- **ドメイン名のキーワード:** パンくずリスト以上の効果なし
- **TLD（.com等）:** 国別ターゲティング以外は無関係
- **コンテンツ文字数:** 最小・最大は存在しない
- **サブドメイン vs サブディレクトリ:** SEO上の優劣なし
- **PageRank:** 多数のシグナルの一つにすぎない

---

## 3. E-E-A-T（経験・専門性・権威性・信頼性）

### 3.1 信頼性（Trust）— 最重要
- 全E-E-A-T要素の中心
- サイト全体の信頼性が最も重要

### 3.2 経験（Experience）
- 実体験・深い知識を示す（実際に商品使用、場所訪問等）
- 一次情報の提供

### 3.3 専門性（Expertise）
- トピックの専門知識を有する著者
- 明確な情報源と根拠の提示

### 3.4 権威性（Authoritativeness）
- 対象分野で広く認知される専門家・組織
- 他の権威あるサイトからの言及

### 3.5 E-E-A-T実装要件
- **著者情報の明示:** 著者名、バイライン、プロフィールページへのリンク
- **組織情報:** 会社概要、所在地、連絡先
- **専門分野の証拠:** 資格、実績、経験年数
- **プロフィールページ:** `/profile/` に著者の詳細経歴・知識分野
- **sameAs:** 外部プロフィール（LinkedIn、SNS等）へのリンク

### 3.6 YMYL（Your Money or Your Life）
- 健康・安全・経済・社会福利に関するトピックはE-E-A-Tがより厳格に評価
- HARTON対象業種で該当する場合は要注意

---

## 4. 有用なコンテンツ作成ガイドライン

### 4.1 コンテンツ品質チェックリスト
- [ ] 独自の情報・報告・研究・分析を提示しているか
- [ ] 実質的で詳細・包括的な説明があるか
- [ ] 自明でない洞察と興味深い情報を含むか
- [ ] 他ソース参考時に付加価値とオリジナリティがあるか
- [ ] 見出し・タイトルが内容を正確に説明しているか
- [ ] 見出しが誇張・不快でないか
- [ ] ブックマークしたいと思えるページか
- [ ] 雑誌・百科事典・書籍に掲載される価値があるか
- [ ] 検索結果の他ページと比較して実質的価値があるか
- [ ] 誤字・スタイルの問題がないか
- [ ] 雑に見えない丁寧な制作か
- [ ] 大量生産・大規模ネットワーク拡散でないか

### 4.2 ユーザー第一の指標
- 特定ユーザー層が直接訪問時に有用と感じるか
- 実体験・深い知識を明確に示しているか
- サイトに主要目的・テーマがあるか
- 読了後にユーザーが目的達成に十分な情報を得たか
- 有益な時間を過ごしたと感じるか

### 4.3 避けるべき検索エンジン第一の行為
- [ ] 検索エンジンのアクセス増が主目的でないか
- [ ] 上位表示目的の多量コンテンツ生産でないか
- [ ] 価値を付加しない他者の要約でないか
- [ ] 話題だからという理由の記事でないか
- [ ] 特定文字数に合わせた執筆でないか
- [ ] 経験なしのニッチトピックでないか
- [ ] 日付だけ更新して新鮮に見せていないか

### 4.4 AI・自動化に関する開示
- AI生成/AI支援の使用を明確に開示
- 自動化の使用方法と有用性を説明
- **ランキング操作目的のAI生成はスパムポリシー違反**

### 4.5 「誰が・どのように・なぜ」の評価
- **誰が:** コンテンツ作成者の明確な特定と背景情報
- **どのように:** テスト数・方法・証拠の詳細説明、プロセスの透明性
- **なぜ:** 主目的がユーザーの役に立つことであること

---

## 5. Core Web Vitals

### 5.1 LCP（Largest Contentful Paint）— 読み込み速度
- **基準値:** 2.5秒以内（Good）
- **測定対象:** ビューポート内の最大コンテンツ要素の描画時間
- **改善策:**
  - サーバー応答時間の短縮
  - レンダリングブロックリソースの排除
  - 画像の最適化（WebP、適切サイズ、lazy loading）
  - クリティカルCSSのインライン化

### 5.2 INP（Interaction to Next Paint）— 応答性
- **基準値:** 200ms未満（Good）
- **測定対象:** ユーザー操作から次の描画更新までの時間
- **改善策:**
  - JavaScript実行時間の最小化
  - メインスレッドのブロッキング回避
  - 長時間タスクの分割

### 5.3 CLS（Cumulative Layout Shift）— 視覚的安定性
- **基準値:** 0.1未満（Good）
- **測定対象:** 予期しないレイアウト変動の累積スコア
- **改善策:**
  - 画像・動画にサイズ属性を明示（width/height）
  - 広告・埋込コンテンツの事前領域確保
  - Webフォントの表示戦略（font-display: swap）
  - 動的コンテンツ挿入の回避

---

## 6. ページエクスペリエンス

### 6.1 必須要件
| 項目 | 要件 | ランキング影響 |
|------|------|---------------|
| Core Web Vitals | LCP ≤ 2.5s, INP < 200ms, CLS < 0.1 | 直接 |
| HTTPS | TLS暗号化による安全な配信 | 直接 |
| モバイル対応 | レスポンシブデザイン、適切な表示 | 直接 |
| インタースティシャル | 煩わしいポップアップ・広告の回避 | 直接 |
| コンテンツ区別 | メインコンテンツと他コンテンツの明確な区別 | 間接 |

### 6.2 HTTPS要件
- 全ページをHTTPSで配信
- 混在コンテンツ（Mixed Content）の排除
- HTTP→HTTPSのリダイレクト設定
- HSTSヘッダーの設定推奨

### 6.3 モバイルフレンドリー要件
- ビューポートメタタグの設定
- レスポンシブデザイン（メディアクエリ）
- テキストの読みやすさ（ズーム不要）
- タップターゲット間の適切な間隔
- 横スクロール不要のレイアウト

---

## 7. スパムポリシー — 全16種の禁止行為

### 自動対策（アルゴリズム検出）
| # | スパム種別 | 概要 |
|---|-----------|------|
| 1 | クローキング | ユーザーと検索エンジンに異なるコンテンツ表示 |
| 2 | 誘導ページ | 特定キーワード狙いの低品質中間ページ |
| 3 | 期限切れドメイン悪用 | 購入ドメインに無関係な低品質コンテンツ |
| 4 | ハッキングコンテンツ | 脆弱性経由の不正コンテンツ配置 |
| 5 | 隠しテキスト・リンク | ユーザーに見えない操作用テキスト |
| 6 | キーワードスタッフィング | キーワード・数字の不自然な詰込み |
| 7 | リンクスパム | リンク売買、過剰相互リンク、自動生成リンク |
| 8 | 機械生成トラフィック | 自動クエリ送信・スクレイピング |
| 9 | マルウェア | 有害なコード・ファイルのホスティング |
| 10 | 誤解を招く機能 | フェイクツール・サービス詐称 |
| 11 | 大量生成コンテンツ悪用 | AI/スクレイピングによる低品質大量生成 |
| 12 | スクレイピング | 他サイトの無許可コンテンツ流用 |
| 13 | サイト評判悪用 | 既存サイトの信頼性を利用した第三者コンテンツ |
| 14 | 不正リダイレクト | 想定外コンテンツへの悪意あるリダイレクト |
| 15 | 薄いアフィリエイト | 独自価値なしのアフィリエイトリンク集 |
| 16 | ユーザー生成スパム | コメント・フォーラムのスパム投稿 |

---

## 8. 構造化データ（JSON-LD）

### 8.1 推奨形式
- **JSON-LD**（Google推奨・最優先）
- `<script type="application/ld+json">` タグで `<head>` または `<body>` に埋込
- ボキャブラリ: schema.org（ただしGoogle独自の実装ドキュメントを優先）

### 8.2 HARTON Site Builder で実装すべきスキーマ
| スキーマ | 用途 | 優先度 |
|---------|------|--------|
| **LocalBusiness** | 事業者情報（住所・電話・営業時間） | 必須 |
| **Organization** | 組織情報（ロゴ・連絡先） | 必須 |
| **BreadcrumbList** | パンくずリスト | 必須 |
| **FAQPage** | よくある質問 | 必須 |
| **Article** | ブログ記事 | 必須 |
| **ProfilePage** | 代表者プロフィール | 必須 |
| **WebSite** | サイト検索ボックス対応 | 推奨 |
| **Product** | 商品・サービス（該当業種） | 条件付き |
| **Event** | イベント情報（該当業種） | 条件付き |
| **ReviewSnippet** | クチコミ（該当業種） | 条件付き |

### 8.3 実装ルール
- 全必須プロパティを欠落なく記述
- 少数でも完全・正確なプロパティ > 不完全な多数のプロパティ
- 構造化データはそのコンテンツが存在するページに配置
- リッチリザルトテストで検証
- data-vocabulary.org は使用禁止（非サポート）

---

## 9. サイトマップ

### 9.1 XML仕様
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page/</loc>
    <lastmod>2026-04-13</lastmod>
  </url>
</urlset>
```

### 9.2 制限値
| 項目 | 制限 |
|------|------|
| ファイルサイズ | 圧縮前50MB |
| URL件数 | 50,000件/ファイル |
| エンコーディング | UTF-8必須 |
| URL形式 | 完全修飾絶対URL必須 |

### 9.3 送信方法
1. Search Console サイトマップレポート
2. Search Console API
3. robots.txt に `Sitemap:` ディレクティブ
4. WebSub（RSS/Atomフィード）

### 9.4 注意事項
- `<priority>` と `<changefreq>` はGoogleが無視する
- `<lastmod>` は正確な最終更新日を記載（虚偽の日付はNG）

---

## 10. robots.txt

### 10.1 配置
- サイトルートに `robots.txt` を配置
- 例: `https://example.com/robots.txt`

### 10.2 基本構文
```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

### 10.3 注意事項
- robots.txtはクロール制御であり、インデックス除外ではない
- インデックス除外には `noindex` メタタグを使用
- 全クローラーがルールに従うとは限らない

---

## 11. セキュリティヘッダー

### 11.1 必須（Google推奨 + セキュリティベストプラクティス）
| ヘッダー | 値（例） | 目的 |
|---------|-----|------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | HTTPS 強制（HSTS） |
| `X-Content-Type-Options` | `nosniff` | MIME スニッフィング防止 |
| `X-Frame-Options` | `DENY` または `SAMEORIGIN` | クリックジャッキング防止（`frame-ancestors` CSP と併記で後方互換） |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | リファラ制御 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | ブラウザ機能の権限制御（Privacy Sandbox 対応） |
| `Content-Security-Policy` | SPEC.md §3.1 / §8.1 に準拠。サイトに応じて調整 | XSS・インジェクション防止 |

### 11.2 2025 強化ヘッダー（推奨）

Cross-Origin Isolation（`crossOriginIsolated: true` を得ると `SharedArrayBuffer` / `performance.now()` 高精度モード等が解禁され、将来の WebAssembly / WebGPU ヘビー処理にも備えられる）:

| ヘッダー | 値（例） | 目的 |
|---|---|---|
| `Cross-Origin-Opener-Policy` | `same-origin` | 別オリジンからのウィンドウ参照を遮断（Spectre 等のサイドチャネル対策） |
| `Cross-Origin-Embedder-Policy` | `require-corp` | 埋込リソースに CORP を要求 |
| `Cross-Origin-Resource-Policy` | `same-origin` | 自サイトリソースへの別オリジン埋込みを制限 |

### 11.3 CSP 拡張ディレクティブ（XSS の体系的排除）

`Content-Security-Policy` に以下を追加して強化する:

```
require-trusted-types-for 'script';
trusted-types default;
frame-ancestors 'self';
upgrade-insecure-requests;
```

- `require-trusted-types-for 'script'` — DOM XSS の根絶に有効（W3C Trusted Types）
- `frame-ancestors` — `X-Frame-Options` 後継。CSP 側で統一管理可能
- `upgrade-insecure-requests` — 残存する HTTP リクエストを HTTPS に昇格

### 11.4 CSP Reporting（本番運用向け推奨）

```
Content-Security-Policy-Report-Only: default-src 'self'; report-to csp-endpoint
Report-To: { "group": "csp-endpoint", "max_age": 10886400, "endpoints": [ { "url": "https://{domain}/csp-report" } ] }
```

段階的に Enforce 化する際は Report-Only → Enforce の順で導入し、誤検知を減らす。

---

## 11A. AI Overviews / Generative Search 対応（v2.0 新設）

Google の生成 AI 検索機能（AI Overviews、旧称 SGE）に対応した最適化規準。既存 SEO との重複部分は再掲しない。

### 11A.1 コンテンツの Span-level 抽出前提

- **段落の自己完結性:** AI Overviews は段落単位ではなく文単位で抜粋する場合があるため、各文が前後の文脈なしに意味が通ること（相対参照「上記」「前述」を避ける）
- **Direct Answer 型導入:** 記事本文の最初の段落で「このページで分かること・結論」を**完結文**で提示する（SPEC.md §4.13 Lead Evidence Block と連動）
- **最終的な一次回答:** タイトルで問うた疑問に対する答えを、記事冒頭 20% 以内に明示

### 11A.2 構造化データの厚み

AI Overviews は構造化データを優先採用する傾向があるため:

- `Article` / `BlogPosting` に `datePublished` / `dateModified` / `author` / `mainEntityOfPage` を完備
- `FAQPage` の質問は**ユーザーが実際に尋ねる自然文**（検索クエリ想定）
- `HowTo` はステップごとに `name` + `text` + 可能なら `image` を付与
- `Person` / `Organization` の `sameAs` で外部オーソリティ（LinkedIn、GitHub、学会、公的機関）にリンク

### 11A.3 明示的なソースシグナル

- すべての数値・統計には一次ソースへの `<a>` を併記
- 公式 HTTP 応答ヘッダーに `Last-Modified` を正しく設定し、`dateModified` と整合

### 11A.4 AI Overviews で不利になるパターン

- 曖昧な断定（「一般的には」「多くの場合」）のみで構成されるセクション
- 同一情報の繰り返し（AI Overviews は冗長度を減点）
- 広告と本文の境界が不明瞭なレイアウト（UX Signals 劣化）

---

## 11B. AI クローラと `robots.txt`（v2.0 新設）

SPEC.md §5.5 と同内容を `robots.txt` 側からもセキュアに明示:

```
User-agent: Googlebot
Allow: /

# Google 拡張クローラ（Bard / AI Overviews 学習許可）
User-agent: Google-Extended
Allow: /

# 主要 AI 検索エンジン
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Amazonbot
Allow: /

Sitemap: https://{domain}/sitemap.xml
```

**注意:** `robots.txt` はクロール制御であり、インデックス除外ではない（§10.3）。AI 学習への利用可否は、サイト運営ポリシーに照らして個別判断すること。

---

## 12. HARTON Site Builder への適用マッピング

### 12.1 generator.js が自動保証すべき項目
- [ ] 各ページに固有の `<title>` と `<meta description>`
- [ ] 見出し階層（h1→h2→h3）の論理構造
- [ ] 全画像に `alt` 属性
- [ ] 全外部リンクに `target="_blank" rel="noopener noreferrer"`
- [ ] 構造化データ（LocalBusiness, Organization, BreadcrumbList, FAQPage, Article, ProfilePage）
- [ ] XMLサイトマップ生成（絶対URL、lastmod付き）
- [ ] robots.txt生成（Sitemap参照付き）
- [ ] `_headers` ファイル生成（セキュリティヘッダー一式）
- [ ] レスポンシブデザイン（モバイルファースト）
- [ ] Core Web Vitals最適化（画像サイズ属性、font-display、CLS防止）
- [ ] HTTPS前提のURL生成
- [ ] canonical URL設定
- [ ] OGPメタタグ（og:title, og:description, og:image, og:url, og:type）

### 12.2 spec-checker が検証すべき項目
- [ ] 全ページ固有title/description
- [ ] JSON-LD構文正当性
- [ ] 必須構造化データの存在
- [ ] sitemap.xmlの整合性（全ページ含有）
- [ ] robots.txtの存在と構文
- [ ] セキュリティヘッダーの存在
- [ ] 画像alt属性の完全性
- [ ] 外部リンクのrel属性
- [ ] モバイルビューポートメタタグ
- [ ] canonical URLの設定

### 12.3 quality-scorer.js の採点基準対応
| カテゴリ | Google基準との対応 |
|---------|-------------------|
| SEO (22pt) | §2全項 + §9 + §10 |
| Structured (18pt) | §8全項 |
| E-E-A-T (18pt) | §3全項 |
| Performance (15pt) | §5 Core Web Vitals |
| Content (18pt) | §4全項 |
| Security (9pt) | §6.2 + §11 |
