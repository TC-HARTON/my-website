# GEO-STANDARDS.md — 生成エンジン最適化 (GEO / LLMO) 学術基準書

**バージョン:** 2.0（2026-04-16 / SPEC.md v3.0 整合・公的ソース実 URL リスト・llms.txt 対応・検証項目実装状況明記）
**初版:** 2026-04-13
**事実性ルール:** 引用・数値・URL は SPEC.md §0.2（Factuality First）F-1〜F-6 に従う。本書が引用する Aggarwal et al. (KDD 2024, arXiv:2311.09735) の数値は論文 Table 1/2 の値を verbatim で転記している


> **典拠**: Aggarwal P., Murahari V., Rajpurohit T., Kalyan A., Narasimhan K., Deshpande A. (2023/2024)
> **論文**: "GEO: Generative Engine Optimization"
> **arXiv**: https://arxiv.org/abs/2311.09735 (v1: 2023-11-16, v2: 2024-06-28)
> **PDF**: https://arxiv.org/pdf/2311.09735.pdf
> **公式プロジェクト**: https://generative-engines.com/GEO/
> **公式GitHub**: https://github.com/GEO-optim/GEO
> **GEO-Bench データセット**: https://huggingface.co/datasets/GEO-optim/geo-bench
> **Leaderboard**: https://huggingface.co/spaces/GEO-optim/geo-bench
> **著者所属**: Princeton University / IIT Delhi / Independent Researchers
> **採択**: KDD 2024 (ACM SIGKDD)
> **本書の位置付け**: 生成エンジン (Perplexity / SGE / Bard / BingChat / ChatGPT 検索系) 上での
> ソース引用率 (Source Visibility) 向上のための学術的バイブルとして、SPEC.md および
> GOOGLE-STANDARDS.md と並ぶ AI システムプロンプトの**第三の絶対法規**とする。

---

## 1. なぜ GEO が必要か (Why GEO Matters)

従来の SEO は「ユーザーをサイトへ誘導する」ことが目的。GEO は **「生成 AI の回答内に
自社サイトが引用元として登場する確率を最大化する」** ための最適化体系である。

LLM 検索 (Perplexity / Google SGE / Bing Copilot / ChatGPT browse) では：
- ユーザーは AI 生成文 + 引用ソース一覧を読む
- クリックされなくても **「引用された」事実そのもの** が露出 = ブランド到達
- 引用は通常 3〜10 件に絞られる ⇒ **引用枠を奪う競争** が新たな SEO

---

## 2. 評価指標 (Metrics)

### 2.1 Word Count Impression (Imp_wc)
ソース c_i に由来する単語数 / 全引用ソースの単語数

```
Imp_wc(c_i, r) = Σ_{s ∈ S_ci} |s|  /  Σ_{s ∈ S_r} |s|
```

### 2.2 Position-Adjusted Word Count (Imp_pwc) ★主要指標
回答文の前方に出現するほど高評価。位置減衰 e^(-pos/|S|) を乗ずる。

```
Imp_pwc(c_i, r) = Σ_{s ∈ S_ci} |s| · e^(-pos(s)/|S|)  /  Σ_{s ∈ S_r} |s|
```

### 2.3 Subjective Impression (G-Eval, 7次元)
LLM-as-Judge による主観評価。以下 7 次元の平均：
1. **Relevance** (関連性)
2. **Influence** (影響力)
3. **Uniqueness** (独自性)
4. **Clickability** (クリック誘発性)
5. **Diversity** (多様性)
6. **Follow-up Likelihood** (追加質問誘発)
7. **Position Adjusted** (位置考慮)

---

## 3. ★ GEO 9 戦略 (絶対法規)

論文 Table 1/2 より。**ベースライン (最適化なし) は 19.3%**。

| # | 手法 | Pos-Adj WC 改善率 | Subjective 改善率 | 絶対法規 |
|---|------|----:|----:|---|
| 1 | **Quotation Addition** (引用句追加) | **+27.8%** | +24.7% | 関連分野の専門家・公式声明・著名人の発言を **直接引用形式 (「」 / blockquote)** で挿入 |
| 2 | **Statistics Addition** (統計データ追加) | **+25.9%** | +23.7% | 数値・パーセンテージ・調査データを文中に明記。**出典付き** が必須 |
| 3 | **Fluency Optimization** (流暢性最適化) | +25.1% | +21.9% | 自然で読みやすい文章。冗長表現排除・接続詞最適化 |
| 4 | **Cite Sources** (出典明示) | +24.9% | +21.9% | 全主張に **権威あるソースへの被リンク or 出典脚注** を付与 |
| 5 | **Technical Terms** (専門用語使用) | +23.1% | +21.4% | 業界専門用語を適切に使用。ただし読者層に合わせる |
| 6 | **Easy-to-Understand** (平易化) | +22.2% | +20.5% | 専門用語は補足説明。中学生でも理解できる比喩 |
| 7 | **Authoritative** (権威的トーン) | +21.8% | +22.9% | 断定的・専門家風の語り口。曖昧表現禁止 |
| 8 | **Unique Words** (独自語彙) | +20.7% | +20.4% | 他サイトと差別化される独自表現・造語 |
| 9 | **Keyword Stuffing** (KW詰込) | +17.8% | +20.2% | ⚠️ 効果は最低。**SEO的にペナルティリスクあり**。GOOGLE-STANDARDS と矛盾するため **本アプリでは採用禁止** |

### 3.1 採用ポリシー (本アプリ)
- **必須適用**: #1〜#7 (#9 は除外、#8 は任意)
- **最強コンビ**: Quotation + Statistics + Cite Sources を同一段落で組合わせると相乗効果

---

## 4. ドメイン別ベスト手法 (論文 §5.4)

| 業種/トピックドメイン | 推奨第一手法 | 推奨第二手法 |
|---|---|---|
| Debate / 議論系 | Authoritative | Statistics |
| History / 歴史系 | Authoritative | Quotation |
| Business / ビジネス | Fluency | Cite Sources |
| Science / 科学系 | Fluency | Cite Sources |
| Statement / 事実陳述 | Cite Sources | Statistics |
| Facts / 事実説明 | Cite Sources | Statistics |
| Law & Government / 法律・行政 | Cite Sources | Statistics |
| People & Society / 社会系 | Quotation | Authoritative |
| Explanation / 解説系 | Quotation | Easy-to-Understand |
| Opinion / 意見系 | Statistics | Authoritative |

### 4.1 アプリ業種マッピング (HARTON Site Builder 用)
| 本アプリ業種テンプレ | GEO ドメイン分類 | 必須適用手法 |
|---|---|---|
| 飲食店 / 美容 / サロン | Opinion / People & Society | Statistics + Quotation (口コミ) |
| 法律事務所 / 行政書士 / 税理士 | Law & Government | Cite Sources + Statistics |
| 医療・クリニック | Health / Statement | Cite Sources + Authoritative |
| WEB制作 / IT / コンサル | Business / Science | Fluency + Cite Sources |
| 教育 / 塾 | Explanation | Quotation + Easy-to-Understand |
| 製造 / BtoB | Statement / Facts | Cite Sources + Technical Terms |
| 不動産 | Statement / Opinion | Statistics + Cite Sources |
| ECサイト | Opinion / Facts | Statistics + Quotation (レビュー) |

---

## 5. GEO-Bench データセット概要

- **総クエリ数**: 10,000 件
- **分割**: train 8,000 / val 1,000 / test 1,000
- **収集ソース**:
  - MS MARCO
  - ORCAS-1
  - Natural Questions (NQ)
  - AllSouls (Oxford 入試問題)
  - LIMA
  - Davinci-Debate
  - Perplexity Discover
  - ELI-5 (Reddit)
  - GPT-4 生成
- **ドメイン分類**: 25 ドメイン (Arts / Health / Games / Law / Science / etc.)
- **カテゴリタグ**: 7 種 (Fact / Reasoning / Debate / Opinion / Instruction / Comparison / How-to)

---

## 6. ★ HTML/Markdown 実装ルール (生成サイトへの強制)

### 6.1 Quotation Addition の実装
```html
<!-- 良い例: 出典明記の blockquote -->
<blockquote cite="https://example.gov.jp/report-2024">
  <p>「2024年の中小企業のWEB活用率は67.3%に達した」</p>
  <footer>— 経済産業省 中小企業白書 2024</footer>
</blockquote>

<!-- 悪い例: 出典なしの引用風文 -->
<p>「成功する企業はWEBを活用している」と言われています。</p>  ❌
```

### 6.2 Statistics Addition の実装
```html
<!-- 良い例: 数値 + 出典 + 調査年 -->
<p>
  日本国内のスマートフォン普及率は <strong>96.3%</strong>
  (<a href="https://www.soumu.go.jp/...">総務省 通信利用動向調査 2024</a>)
  であり、モバイルファースト設計は必須です。
</p>

<!-- 悪い例: 数値のみ -->
<p>多くの人がスマホを使っています。</p>  ❌
```

### 6.3 Cite Sources の実装
- 全段落に **最低1つ以上の出典リンクまたは脚注**
- 出典は `.go.jp` / `.gov` / `.edu` / `.ac.jp` / 業界標準団体 を最優先
- 出典なしの主張は「弊社の経験では」等の **一次情報明示** で代替

### 6.4 Authoritative の実装
- 「〜と思います」「〜かもしれません」を禁止 → 「〜である」「〜が定石」
- 代表者プロフィールに資格・実績年数を必ず記載 (E-E-A-T と相乗)

### 6.5 構造化マークアップ (相乗効果)
- `Quotation` → `schema.org/Quotation` JSON-LD を併設
- `Statistics` → `schema.org/Dataset` または `schema.org/ClaimReview`（`Claim` は schema.org 公式で pending。**事実確認済みの主張は `ClaimReview` を使用**）
- `Cite Sources` → `<cite>` タグ + JSON-LD `citation` プロパティ

### 6.6 公的ソース推奨リスト（F-4 一次ソース原則の実装）

GEO 手法 #4（Cite Sources）および SPEC §0.2 F-4 を満たすため、**日本向けサイトでは以下の公的ドメインを優先採用**する。URL はすべて 2026-04-16 時点で実在確認済み:

| 分野 | 一次ソース | URL |
|---|---|---|
| 政府統計総合 | e-Stat（政府統計の総合窓口） | https://www.e-stat.go.jp/ |
| 統計 | 総務省統計局 | https://www.stat.go.jp/ |
| 通信・ICT | 総務省 通信利用動向調査 | https://www.soumu.go.jp/johotsusintokei/statistics/statistics05.html |
| 中小企業 | 中小企業庁 中小企業白書 | https://www.chusho.meti.go.jp/pamflet/hakusyo/ |
| IT・情報処理 | 情報処理推進機構（IPA） | https://www.ipa.go.jp/ |
| 個人情報保護 | 個人情報保護委員会（PPC） | https://www.ppc.go.jp/ |
| 消費者 | 消費者庁 | https://www.caa.go.jp/ |
| 厚生労働（医療・労働） | 厚生労働省 | https://www.mhlw.go.jp/ |
| 経済産業 | 経済産業省 | https://www.meti.go.jp/ |
| 学術（国内） | 国立情報学研究所 CiNii | https://cir.nii.ac.jp/ |
| 学術（国際） | arXiv | https://arxiv.org/ |
| 学術識別子 | DOI（Crossref 等） | https://doi.org/ |
| Web 規格 | W3C | https://www.w3.org/ |
| HTML 仕様 | WHATWG HTML Living Standard | https://html.spec.whatwg.org/ |
| アクセシビリティ | WCAG 2.2（W3C） | https://www.w3.org/TR/WCAG22/ |
| Web 性能 | web.dev（Google） | https://web.dev/ |
| 検索ガイド | Google 検索セントラル | https://developers.google.com/search/ |
| 構造化データ | schema.org | https://schema.org/ |

**運用ルール:**
1. 記事・生成サイト本文で数値引用する場合、上表のいずれかのドメイン配下から取得した URL を `<a href>` で併記する。
2. URL は**完全な deep-link**（ドメイントップではなく該当ページ）を用いる。
3. 情報が古くならないよう、取得日を記事にも記す（例: 「2026-04-16 取得」）。
4. 上表にない一次ソースを使う場合、`.go.jp` / `.gov` / `.edu` / `.ac.jp` / 公式規格団体 / DOI 付き学術 であれば可。二次情報（キュレーションメディア等）は Cite Sources の評価対象外。

---

## 7. AI 生成プロンプト戦略 (本アプリ内部用)

すべての本文生成 (hero / about / service description / FAQ 回答 / blog) に
以下のメタ指示を **埋め込み必須**:

```
[GEO 必須遵守]
1. 段落ごとに以下のいずれかを最低1つ含めること:
   - 公式統計データ (出典URL付き)
   - 専門家/公的機関の引用句 (blockquote 形式)
   - 公的ソースへの被リンク (.go.jp/.gov/.edu優先)
2. 断定調を維持。「〜だと思う」「〜かもしれない」は禁止
3. 業種ドメインに応じた優先手法 (本書 §4.1) を選択
4. Keyword Stuffing は禁止 (SEO ペナルティ回避)
5. 文章先頭 (上位 30%) に最重要キーワード+主張+出典 を配置
   (Position-Adjusted Word Count 最大化)
```

---

## 8. spec-checker 検証項目（実装状況付き）

本アプリ `spec-checker.js` における GEO 検証項目。**実装状況は 2026-04-16 時点の `harton/spec-checker.js` 実測に基づく**（推測ではない）:

| ID | チェック | 重要度 | 実装状況 |
|---|---|---|---|
| G-1 | `<blockquote>` または `<q cite>` / `<figure>` Lead Evidence が 1 ページ最低 1 件以上 | WARN | ✅ 実装済 |
| G-2 | `<a href>` のうち `.go.jp` / `.gov` / `.edu` / `.ac.jp` / 学術 DOI / 公式規格団体 への被リンクが 1 件以上 | WARN | ✅ 実装済 |
| G-3 | 数値（パーセンテージ / 円 / 件数 / 倍率）が本文中に 3 件以上 | WARN | ✅ 実装済 |
| G-4 | `schema.org/Quotation` または `ClaimReview` JSON-LD の存在 | INFO | ☐ 未実装（v3.x で段階導入予定） |
| G-5 | 「思います」「かもしれません」「〜らしい」の出現数 ≦ 2 | WARN | ✅ 実装済 |
| G-6 | `<main>` 内で最初の `<h2>` より前に Lead Evidence（blockquote / 公的リンク / 具体数値のいずれか）が配置されていること（位置最適化） | FAIL | ✅ 実装済（SPEC §4.13.4） |

**FAIL の意味:** G-6 のみ納品前必須チェック（FAIL=0 が S-RANK 条件）。G-1 / G-2 / G-3 / G-5 は WARN として記録され、記事の引用率最大化の改善余地として運用する。

---

## 8A. llms.txt / Answer Engine ディレクトリ（v2.0 新設）

### 8A.1 llms.txt の位置付け

`llms.txt` は 2024 年に Jeremy Howard (Answer.AI) が提案した、**LLM / AI エージェントがサイトの要点を効率的に取得するための Markdown ファイル規約**。W3C / IETF の正式標準ではないが、AI 検索エンジン間で事実上の標準として採用が広がっている（提案仕様: <https://llmstxt.org/>）。

本仕様では **推奨（必須ではない）** とし、本サイトおよび site-builder が生成するサイトに**導入可能**とする。

### 8A.2 配置

```
https://{domain}/llms.txt         # サイトの目次・要点（短）
https://{domain}/llms-full.txt    # 主要コンテンツの結合 Markdown（長）
```

### 8A.3 推奨フォーマット（llms.txt 最小例）

```markdown
# {サイト名}

> サイトの 1〜2 行説明

## Core pages
- [会社概要](/about/): 事業概要と代表者プロファイル
- [サービス](/services/): 提供サービス一覧
- [料金](/pricing/): 価格・プラン

## Articles
- [記事タイトル](/blog/slug/): 1 行要約

## Optional
- [プライバシー](/privacy/): プライバシーポリシー
```

### 8A.4 運用指針

1. **llms.txt は人手 or ビルド自動生成。** サイト生成時に `sitemap.xml` / `articles.json` 等を元に自動生成する API を site-builder に組み込むと保守容易。
2. **内容は一次情報の要約**で、リンク先本文は公開されている必要がある。
3. **捏造禁止:** SPEC.md §0.2 F-1 / F-4 に従い、llms.txt 内の要約も実コンテンツと整合する。
4. **クロール許可:** `robots.txt` で `llms.txt` / `llms-full.txt` を明示 Allow する（`Disallow: /llms*` にしない）。

### 8A.5 併設推奨ファイル

| ファイル | 用途 | 既存標準 |
|---|---|---|
| `sitemap.xml` | 機械可読な URL 一覧 | W3C sitemap protocol（必須） |
| `robots.txt` | クロール制御 | robotstxt.org（必須） |
| `.well-known/ai-plugin.json` | OpenAI Plugin 互換ディレクトリ | OpenAI 仕様（任意） |
| `llms.txt` / `llms-full.txt` | LLM 向け要点 | llmstxt.org（推奨） |
| `humans.txt` | 制作スタッフ情報 | humanstxt.org（任意） |

---

## 9. 引用情報 (BibTeX)

```bibtex
@inproceedings{aggarwal2024geo,
  title={GEO: Generative Engine Optimization},
  author={Aggarwal, Pranjal and Murahari, Vishvak and Rajpurohit, Tanmay and Kalyan, Ashwin and Narasimhan, Karthik and Deshpande, Ameet},
  booktitle={Proceedings of the 30th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD '24)},
  year={2024},
  eprint={2311.09735},
  archivePrefix={arXiv},
  primaryClass={cs.CL},
  url={https://arxiv.org/abs/2311.09735}
}
```

---

## 10. 関連リソース (本書の補強リンク)

- **論文 HTML 版**: https://arxiv.org/html/2311.09735v2
- **arXiv abs**: https://arxiv.org/abs/2311.09735
- **PDF**: https://arxiv.org/pdf/2311.09735.pdf
- **プロジェクトサイト**: https://generative-engines.com/GEO/
- **公式 GitHub**: https://github.com/GEO-optim/GEO
- **Hugging Face データセット**: https://huggingface.co/datasets/GEO-optim/geo-bench
- **Hugging Face Leaderboard**: https://huggingface.co/spaces/GEO-optim/geo-bench
- **第一著者**: Pranjal Aggarwal (IIT Delhi → 現 Princeton)
- **第二著者ウェブサイト**: https://vishvakmurahari.com

---

> **AI への絶対指示** (本書を埋め込んだプロンプトに自動付与):
> 上記 9 手法のうち #1〜#7 を業種に応じて適用し、Keyword Stuffing は禁止。
> 全主張に出典 (公的ソース優先) を付与。位置最適化のため最重要事実は文頭に配置。
> Quotation / Statistics / Cite Sources の 3 種を組み合わせると効果最大化。
