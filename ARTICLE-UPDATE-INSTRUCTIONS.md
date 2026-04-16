# harton.pages.dev — ブログ記事 修正指示書

> **発行日**: 2026-04-15
> **背景**: HARTON Site Builder アプリ仕様を以下の通り刷新
> - **Claude Opus 4.6 限定 / Sクラス品質保証** (Gemini / ChatGPT サポート終了)
> - **3法規システム** — SPEC v2.3 + GOOGLE-STANDARDS + **GEO-STANDARDS** (arXiv:2311.09735)
> - **モデル分業ルーティング** (`routingMode`: quality / balanced / economy)
> - **Anthropic プロンプトキャッシュ** (最大 85% トークン費用削減)
> - **spec-checker 313項目 + G-1〜G-6 GEO検証**
> - **BYO-Key** (AES-256 ローカル暗号化、アプリ中継なし)

以下の既存 18 記事のうち **8 記事**に修正が必要です。新規記事 1 本の追加を推奨します。

---

## 🔴 優先度 HIGH（仕様と矛盾・必ず修正）

### 1. `guide-ai-setup` — **全面書き換え**

**理由**: Gemini / ChatGPT 3択比較・「Geminiの無料枠で試す」等、新仕様と完全に矛盾。

**修正方針**:
- タイトル: 「AIプロバイダーの設定方法」→「**Claude API の設定方法 — Sクラス保証の唯一条件**」
- ディスクリプション全面書き換え: "Claude・Gemini・ChatGPT" → "Claude Opus 4.6 限定"
- 本文構成（案）:
  1. **Claude Opus 4.6 限定の理由** — SPEC v2.3 + Google 公式 + Cornell 大学 GEO 論文の3法規に完全準拠できる唯一のモデル
  2. **モデル対応表** — Opus 4.6 ✅ Sクラス保証 / Sonnet 4.5 ⚠ Aクラス想定 / Gemini・GPT ❌ 日本語 E-E-A-T 劣後により非対応
  3. **APIキー取得手順** — `https://console.anthropic.com/settings/keys` のみ紹介
  4. **ルーティング戦略の選択** — `quality`（全 Opus 推奨）/ `balanced`（Opus+Sonnet+Haiku 分業）/ `economy`
  5. **プロンプトキャッシュによる費用削減** — 3法規 40KB をキャッシュ、最大 85% 削減
  6. **費用目安** — 従量制 Opus $2〜7/サイト、Claude Max $100/月（月5サイト以上で実質使い放題）、外注 ¥30万〜との比較
  7. **セキュリティ** — AES-256 ローカル暗号化、BYO-Key（アプリ中継なし）

**削除すべき記述**:
- 「Geminiには無料利用枠があり、費用ゼロで始められます」
- 「迷ったらまずGeminiの無料枠で試し」
- 「ChatGPT（OpenAI）汎用性が高く...」
- 「複数のプロバイダーを同時に登録しておき、用途に応じて切り替えることも可能」

---

### 2. `guide-generate` — 中規模修正

**理由**: 「AIプロバイダーのAPIキーが設定・接続テスト済み」という記述が一般化されすぎ。
SPEC 言及が v2.0 のまま。

**修正指示**:

| 既存文言 | 修正後 |
|---|---|
| `<strong>AIプロバイダー</strong>のAPIキーが設定・接続テスト済みであること` | `<strong>Anthropic Claude API キー</strong>（sk-ant-api... 形式）が設定・接続テスト済みであること` |
| `まずAIプロバイダーの接続状況を確認し、APIキーが有効であることを確かめてから再実行してください。` | `まず Claude API キーが有効で、Anthropic アカウントにクレジット残高があることを確認してから再実行してください。` |
| 「自動検証ツールがサイトの品質基準への適合を確認」 | 「**spec-checker (SPEC v2.3 + GEO/LLMO 統合版)** が 313 項目 + G-1〜G-6 の生成エンジン最適化を自動検証」 |

**追加推奨セクション**: 「生成時に何が起こっているか（裏側）」
- 3法規 40KB がシステムプロンプトに埋込
- `routingMode=balanced` ならサイト構造設計は Opus、HTMLコーディングも Opus、検証は Haiku と自動分業
- プロンプトキャッシュで 2回目以降の生成は 85% 費用削減

---

### 3. `guide-chatbot` — 小規模修正

**理由**: 「AIの応答にはAPIプロバイダーの利用料」という汎用表現。

**修正指示**:

| 既存文言 | 修正後 |
|---|---|
| `AIの応答にはAPIプロバイダーの利用料が発生します。` | `AI の応答には Anthropic Claude API の従量課金が発生します（月数百円〜、訪問者数に比例）。` |
| 「一般的な利用量であれば月数百円程度」 | 「Haiku にフォールバックする `routingMode=economy` 設定なら月 100 円程度」 |

**追加推奨**: チャットボット応答も `routingMode` に従う旨を明記。

---

### 4. `guide-update-deploy` — SPEC バージョン更新（SPEC 言及 7 箇所）

**修正指示**:

| 既存文言 | 修正後 |
|---|---|
| `SPEC v2.0` / `SPEC v2.x` / `SPEC` の一般言及 | **`SPEC v2.3`** に統一 |
| 「サイト全体の品質チェックが実行されます」 | 「**SPEC v2.3 全 313 項目 + GEO/LLMO 6項目（G-1〜G-6）** の自動検証が実行されます」 |

**追加推奨セクション**: 「GEO 検証（G-1〜G-6）の読み方」
- G-1 Quotation（blockquote 引用句） / G-2 公的ソース被リンク(.go.jp) / G-3 統計数値3件以上 / G-6 上位30%位置最適化
- 典拠: Aggarwal et al. KDD2024 "Generative Engine Optimization" (arXiv:2311.09735)
- 効果: Quotation 追加で生成エンジン引用率 +27.8%

---

## 🟡 優先度 MEDIUM（仕様に整合的、GEO強化推奨）

### 5. `guide-faq` — SPEC バージョン & GEO 反映

**修正指示**:

| 既存文言 | 修正後 |
|---|---|
| `SPEC v2.0の品質基準では、<strong>FAQ最低5件</strong>` | `SPEC v2.3 の品質基準では、<strong>FAQ最低5件</strong>（※GEO 観点では 8〜10件推奨）` |

**追加推奨セクション**: 「AI 検索時代（Perplexity / Google SGE / BingChat）のFAQ最適化」
- FAQ の回答に **blockquote 形式の第三者コメント** を入れると生成AIに引用されやすい（+27.8%）
- 数値を 3 件以上散りばめる（+25.9%）
- 典拠 `.go.jp` リンクで被リンク信頼度を証明（+24.9%）

---

### 6. `guide-eeat` — GEO 時代の位置づけを追記

**追加推奨セクション**: 「E-E-A-T × GEO — AI 検索時代の新常識」
- 従来: Google 検索結果で信頼性評価を受けるための E-E-A-T
- 現在: Perplexity / SGE / BingChat など**生成エンジンが引用元として採用する確率**も著者プロフィールの完成度に依存
- Person JSON-LD の `sameAs`（LinkedIn/X/GitHub）は AI が著者の実在性を検証する主要シグナル
- Cornell 大学論文 (arXiv:2311.09735) の "Authoritative Tone" 手法と連動

---

### 7. `guide-business-info` — GEO 向け入力Tips追記

**追加推奨セクション**: 「GEO（生成エンジン最適化）に効く事業概要の書き方」
- 事業概要に**数値（創業年・取引社数・実績件数）を 3 件以上**含めると、生成AIの引用率が +25.9%
- スローガンやキャッチコピーに**第三者視点の引用** (例: 「〇〇賞 2024 受賞」) を含めると +27.8%
- 対応エリアを `.go.jp` の統計資料で裏付けると +24.9%（例: 総務省統計局データ）

---

### 8. `guide-seo-analytics` — AI 検索時代の文脈追加

**追加推奨セクション**: 「これからはAI検索時代 — Perplexity / SGE / BingChat も意識」
- GA4 / Search Console に加え、**生成AIからの引用流入**という新たなチャネルが登場
- Site Builder は Cornell 大学 GEO 論文 (arXiv:2311.09735) の 9 手法を実装済み
- GA4 のリファラーに Perplexity / Bing Chat / Google SGE が出現し始めた場合、それは GEO 対策が効いている証拠

---

## 🟢 優先度 LOW（変更不要）

- `guide-site-folder` / `guide-domain-hosting` / `guide-contact-form` / `guide-services` / `guide-git-deploy` / `guide-deploy` / `guide-edit-pages` / `guide-blog` / `guide-connect-existing` / `guide-review-config`

これらは AI プロバイダーに依存しない汎用操作記事のため、**仕様変更の影響なし**。

---

## ➕ 新規記事提案

### 9. `guide-geo-llmo` — **新規作成推奨**（GEO/LLMO 基礎ガイド）

**タイトル案**: 「GEO / LLMO とは？ — Perplexity・SGE・BingChat 時代の新SEO」

**概要（推奨構成）**:
1. GEO / LLMO の定義（生成エンジン最適化）
2. なぜ今 GEO が必要か — ChatGPT Search / Perplexity / Google SGE 普及
3. Cornell 大学 KDD2024 論文 (arXiv:2311.09735) の紹介
4. 論文で実証された 9 手法（Quotation +27.8%、Statistics +25.9%、Cite Sources +24.9% 等）
5. 本サイトの G-1〜G-6 検証項目との対応
6. 実装のコツ — blockquote / 数値3件 / .go.jp 被リンク / 上位30%位置

**想定効果**: GEO キーワードでの検索流入獲得 + 被引用率自己強化（自己言及も +α）。

---

## 実施フロー

1. **Step 1**: `blog/articles.json` を直接編集（記事本文は HTML 文字列で格納）
2. **Step 2**: 各記事の対応 `blog/<slug>/index.html` を再生成（Site Builder 内の「ブログ再生成」または `lib/blog.js` 経由）
3. **Step 3**: `node spec-checker.js` で 313+G1〜G6 検証
4. **Step 4**: `guide-ai-setup` / `guide-generate` / `guide-update-deploy` の 3 本は特に慎重にプレビュー確認
5. **Step 5**: `git commit` → `cloudflare pages deploy`

## 修正時の品質チェックリスト

- [ ] 「Gemini」「ChatGPT」「OpenAI」の単語が記事本文から消えている
- [ ] 「プロバイダー」→「Claude API」または「Anthropic Claude」に統一
- [ ] `SPEC v2.0` / `v2.2` 等が全て **`v2.3`** に統一
- [ ] `guide-ai-setup` で Opus 4.6 / Sクラス / routingMode / プロンプトキャッシュに言及
- [ ] GEO 強化記事に arXiv:2311.09735 の被リンクが含まれる
- [ ] 新規 `guide-geo-llmo` 記事のパンくず・sitemap.xml・articles.json への追加
- [ ] `spec-checker` 結果が FAIL ゼロ（G-6 を満たすため、各記事の上位30%に数値 or 公的リンク or 引用句を配置）

---

## 関連リソース

- `C:/Users/ohuch/Desktop/HARTON/site-builder/GEO-STANDARDS.md` — GEO 9手法の完全版
- `C:/Users/ohuch/Desktop/HARTON/site-builder/CLAUDE.md` — 最新の設計原則
- `C:/Users/ohuch/Desktop/HARTON/harton/GEO-VALIDATION-REPORT.md` — 現状の検証結果
- 論文: https://arxiv.org/abs/2311.09735
- GEO-Bench: https://huggingface.co/datasets/GEO-optim/geo-bench
