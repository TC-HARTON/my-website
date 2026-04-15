# GEO-STANDARDS.md — 生成エンジン最適化 (GEO/LLMO) 学術基準書

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
- `Statistics` → `schema.org/Dataset` または `Claim` JSON-LD
- `Cite Sources` → `<cite>` タグ + JSON-LD `citation` プロパティ

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

## 8. spec-checker への追加検証項目

本アプリ `spec-checker.js` に追加すべき GEO 検証 (実装は段階導入):

| ID | チェック | 重要度 |
|---|---|---|
| G-1 | `<blockquote>` または `<q cite>` が 1 ページ最低 1 件以上 | WARN |
| G-2 | `<a href>` のうち `.go.jp` / `.gov` / `.edu` / `.ac.jp` ドメインへの被リンクが 1 件以上 | WARN |
| G-3 | 数値 (パーセンテージ / 円 / 件数) が本文中に 3 件以上 | INFO |
| G-4 | `schema.org/Quotation` または `Claim` JSON-LD の存在 | INFO |
| G-5 | 「思います」「かもしれません」「〜らしい」の出現数 ≦ 2 | WARN |
| G-6 | hero h1 + 第一段落に主張 + 出典が含まれる (位置最適化) | FAIL |

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
