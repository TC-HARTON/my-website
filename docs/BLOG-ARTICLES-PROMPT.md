# HARTON自社サイト ブログ記事生成プロンプト

> Site Builderのブログ機能（articles.json + blog.js）で記事を登録するための
> AIプロンプト・手順書。ガイド記事の内容をブログ記事に変換する。

---

## 前提

- 記事はSite Builderの「コンテンツ」→「ページ管理」から登録
- `articles.json` に追加 → `blog.js` が `/blog/{slug}/index.html` を自動生成
- SPEC v2.3 + GEO/LLMO Sランク品質準拠（G-1〜G-6対応）
- 著者: 大内 達也（HARTON代表 / 開発エンジニア）

---

## ガイド記事 → ブログ記事 対応表

### 新規ユーザー向けシリーズ（guide-map.json準拠）

| # | ソースファイル | blogSlug | 記事タイトル案 | contentType |
|---|--------------|----------|-------------|-------------|
| 1 | `01-site-folder.md` | guide-site-folder | サイトフォルダの選び方ガイド | guide |
| 2 | `02-ai-provider.md` | guide-ai-setup | AIプロバイダーの設定方法 — 初心者でも5分で完了 | guide |
| 3 | `03-business-info.md` | guide-business-info | 事業情報の入力ガイド — SEOに効く書き方 | guide |
| 4 | `03-domain-hosting.md` | guide-domain-hosting | ドメインとホスティング — 無料で始める方法 | guide |
| 5 | `03-contact-form.md` | guide-contact-form | お問い合わせフォーム設置ガイド — Web3Forms | guide |
| 6 | `03-seo-analytics.md` | guide-seo-analytics | SEO・アクセス解析の設定 — GA & Search Console | guide |
| 7 | `03-git-deploy.md` | guide-git-deploy | Git・デプロイ設定 — サイト公開の手順 | guide |
| 8 | `03-chatbot.md` | guide-chatbot | AIチャットボット設置ガイド — 24時間自動対応 | guide |
| 9 | `04-services.md` | guide-services | サービス登録のコツ — 訴求力を高める書き方 | guide |
| 10 | `04-faq.md` | guide-faq | FAQ登録ガイド — SEOにも効く質問設計 | guide |
| 11 | `04-eeat.md` | guide-eeat | E-E-A-T著者情報の設定 — Google信頼性の鍵 | guide |
| 12 | `05-generate.md` | guide-generate | サイト生成の手順 — ワンクリックで構築 | guide |
| 13 | `06-deploy.md` | guide-deploy | サイト公開・デプロイ — 無料で世界に公開 | guide |

### 既存ユーザー向けシリーズ（guide-map.json準拠）

| # | ソースファイル | blogSlug | 記事タイトル案 | contentType |
|---|--------------|----------|-------------|-------------|
| 14 | `01-connect.md` | guide-connect-existing | 既存サイトの接続方法 — Site Builderで管理を始める | guide |
| 15 | `02-review-config.md` | guide-review-config | 抽出結果の確認と修正 — 自動認識データの精度を高める | guide |
| 16 | `03-edit-pages.md` | guide-edit-pages | ページ編集の使い方 — メタ情報から一括管理 | guide |
| 17 | `04-blog.md` | guide-blog | ブログ記事の管理 — 執筆から公開まで | guide |
| 18 | `05-update-deploy.md` | guide-update-deploy | サイト更新と再デプロイ — 変更を安全に公開 | guide |

---

## AIプロンプト（各記事生成用）

以下のプロンプトをSite BuilderのAIチャットまたはAPI経由で使用する。
`{変数}` 部分をソースファイルの内容で置換して実行。

```
あなたはHARTON公式サイト（harton.pages.dev）のブログ記事ライターです。
以下の条件でブログ記事のHTMLコンテンツを生成してください。

【記事情報】
- タイトル: {記事タイトル}
- slug: {blogSlug}
- contentType: guide
- category: Site Builder ガイド
- tags: ["Site Builder", "初心者向け", "{該当トピック}"]
- description: {70-160文字のメタディスクリプション}

【ソース資料】
以下のガイドドキュメントの内容をブログ記事に変換してください:

---
{ソースmdファイルの内容をここに貼り付け}
---

【記事の方針】
1. ソース資料の情報を網羅しつつ、ブログ記事として読みやすく再構成する
2. 読者は「WEBサイトを初めて作る人」を想定
3. 専門用語は必ず平易に補足説明する
4. 外部サービスへのリンクはソース資料のURLをそのまま使用する
5. 各セクションにはh2/h3の見出しを適切に設定する
6. 手順がある場合はステップバイステップで番号付きリストを使用する
7. FAQセクションは必ず含める
8. 記事末尾に「まとめ」セクションを追加する
9. CTAとして「Site Builderで今すぐ始める」旨のメッセージを含める

【HTML形式】
- h2, h3, p, ul, ol, li, strong, a, code, blockquote タグのみ使用
- テーブルは使用しない（Tailwindのproseクラスで崩れる可能性）
- 画像タグは使用しない（OGP画像のみ）
- aタグの外部リンクには target="_blank" rel="noopener noreferrer" を付与
- 文字数: 1500-3000文字程度

【出力形式】
HTMLコンテンツ部分のみ出力してください（bodyやhead等は不要）。
```

---

## articles.json への登録形式

```json
{
  "slug": "{blogSlug}",
  "title": "{記事タイトル}",
  "description": "{70-160文字}",
  "content": "{生成されたHTMLコンテンツ}",
  "contentType": "guide",
  "publishedAt": "2026-04-12",
  "category": "Site Builder ガイド",
  "tags": ["Site Builder", "初心者向け", "{トピック}"]
}
```

---

## 記事公開の手順

### Site Builderから登録する場合
1. サイドバー「ページ管理」→ ブログセクション
2. タイトル・スラッグ・本文を入力
3. 「ページを保存」→ 自動的にHTML生成 + articles.json更新

### 手動で登録する場合
1. `harton/blog/articles.json` に上記形式でエントリ追加
2. Site Builderの「検証・デプロイ」→「設定反映 (Inject)」実行
3. または `node blog.js` で直接HTML生成

---

## 公開優先順位

以下の順序で公開を推奨（ユーザーの導入フローと一致）:

1. **guide-ai-setup** — 最初に必要、入口記事
2. **guide-domain-hosting** — 初心者最大の壁
3. **guide-contact-form** — 実用性が高い
4. **guide-seo-analytics** — 検索流入に直結
5. **guide-chatbot** — 差別化ポイント
6. 残りの記事を順次公開

---

## アプリ側との整合性

- `guide-map.json` の `blogSlug` とブログ記事の `slug` は**必ず一致**させること
- アプリ内ヘルプ（?アイコン）→ ガイドモーダル → 「ブログ記事で読む」リンク の導線が成立
- ソースmdファイルを更新 → ブログ記事も再生成が必要
- アプリのガイドドキュメント（docs/）とブログ記事は**同一情報源**から生成される双子の関係
