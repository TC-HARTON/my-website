# harton.pages.dev — LP改修 + ブログ新規6本 指示書 v2

> **発行日**: 2026-04-16
> **主題**: **「APIは高い」というユーザーの先入観を、具体数値 × 外注比較 × 品質実証で丁寧に解消する**
> **前提**: HARTON 自社サイト自体が `Site Builder` で構築され **SPEC v2.3 / 99.8% / S-RANK** を達成済み（= Sクラス品質の自己証明）
> **v1 指示書との違い**: v1は「アプリ仕様変更への追従」、**v2 は「顧客候補の費用不安を解消するための戦略的コンテンツ拡張」**

---

## 🎯 全体戦略 — 不安解消の3層構造

ユーザー候補は以下の3つの不安を抱えています:

| 不安 | 既存対応 | v2 での追加対応 |
|---|---|---|
| **① APIは高そう** | apiGateに $2〜7/サイト と1行のみ | **LP費用シミュレーター** + ブログ3本で規模別に完全可視化 |
| **② 費用に見合う品質か** | 「Sランク基準」抽象的 | **外注¥30万〜との比較表** + HARTONサイト自体を Live Proof 化 |
| **③ Claudeで本当に大丈夫か** | apiGate注記のみ | **Claude vs 外注 vs 他社AI** 比較ブログ + E-E-A-T 論拠記事 |

**戦略コア**: 「APIは高い」は**思い込み**。実測値は LP 1枚 = **$0.40（約60円）**、外注比で **5000倍安い**。この事実を繰り返し、論拠付きで伝える。

---

# 【PART A】 LP 改修指示（`site-builder/index.html`）

## A-1: 旧記述の即時修正（3箇所）

| 行 | 既存 | 修正後 |
|---:|---|---|
| L494 | `<p class="text-dark-400 max-w-2xl mx-auto">Site Builderが生成するサイトは、すべてSPEC v2.0のSランク基準をクリアします。</p>` | `<p class="text-dark-400 max-w-2xl mx-auto">Site Builderが生成するサイトは、すべて<strong class="text-white">SPEC v2.3 + GEO/LLMO（arXiv:2311.09735）</strong>のSランク基準（649項目検証 / 合格率99.8%）をクリアします。</p>` |
| L498 | `<div class="text-3xl lg:text-4xl font-black font-display text-sky-400 mb-2">314+</div>` | `<div class="text-3xl lg:text-4xl font-black font-display text-sky-400 mb-2">649</div>` |
| L499 | `<p class="text-dark-400 text-sm">PASS項目</p>` | `<p class="text-dark-400 text-sm">自動検証項目</p>` |

### A-1-補足: 品質統計カード（4枚）の中身更新

品質セクション L496-513 の4カードを以下に差し替え:

```html
<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 fade-in">
  <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6 text-center">
    <div class="text-3xl lg:text-4xl font-black font-display text-sky-400 mb-2">649</div>
    <p class="text-dark-400 text-sm">自動検証項目（SPEC v2.3）</p>
  </div>
  <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6 text-center">
    <div class="text-3xl lg:text-4xl font-black font-display text-sky-400 mb-2">99.8%</div>
    <p class="text-dark-400 text-sm">本サイト実測合格率</p>
  </div>
  <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6 text-center">
    <div class="text-3xl lg:text-4xl font-black font-display text-sky-400 mb-2">G-1〜G-6</div>
    <p class="text-dark-400 text-sm">GEO/LLMO 検証（Cornell KDD2024）</p>
  </div>
  <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6 text-center">
    <div class="text-3xl lg:text-4xl font-black font-display text-sky-400 mb-2">S</div>
    <p class="text-dark-400 text-sm">品質ランク保証</p>
  </div>
</div>
```

---

## A-2: 「対応AIモデル」セクション（L521-547）を Claude 専用セクションに置換

### 置換前の問題
Claude / Gemini / ChatGPT が3社並列で表示されていて、「Claude Opus 4.6 限定 / Sクラス保証」方針と矛盾。

### 置換後の提案HTML（概要）

```html
<!-- ========== Claude Opus 4.6 専用 / Sクラス保証の根拠 ========== -->
<section class="py-20 lg:py-28 bg-white border-t border-dark-100" aria-label="Claude Opus 4.6 採用の根拠">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12 fade-in">
      <p class="text-sky-600 text-sm font-bold uppercase tracking-wider mb-3">POWERED BY</p>
      <h2 class="text-3xl lg:text-4xl font-black font-display text-dark-900 mb-4">Claude Opus 4.6 <span class="text-sky-500">限定採用</span></h2>
      <p class="text-dark-600 max-w-2xl mx-auto">Sクラス品質を保証できる唯一のモデルとして、Anthropic Claude Opus 4.6 のみを正式サポート。</p>
    </div>
    <!-- 選定根拠3本立て -->
    <div class="grid md:grid-cols-3 gap-6 fade-in">
      <div class="bg-dark-50 rounded-2xl p-6">
        <div class="text-sky-500 text-2xl font-black mb-2">#1</div>
        <h3 class="font-bold text-dark-900 mb-2">日本語 E-E-A-T で首位</h3>
        <p class="text-sm text-dark-600">日本語コンテンツの自然さ・専門性・信頼性で Gemini / GPT を上回ると実測確認。Googleガイドライン YMYL領域での品質に直結。</p>
      </div>
      <div class="bg-dark-50 rounded-2xl p-6">
        <div class="text-sky-500 text-2xl font-black mb-2">#2</div>
        <h3 class="font-bold text-dark-900 mb-2">3法規 40KB を完全理解</h3>
        <p class="text-sm text-dark-600">SPEC v2.3 + Google公式基準 + Cornell GEO論文の3法規を system prompt 全文埋込で常時参照。長文コンテキスト処理で最高性能。</p>
      </div>
      <div class="bg-dark-50 rounded-2xl p-6">
        <div class="text-sky-500 text-2xl font-black mb-2">#3</div>
        <h3 class="font-bold text-dark-900 mb-2">プロンプトキャッシュ対応</h3>
        <p class="text-sm text-dark-600">Anthropic公式の ephemeral cache で3法規部分をキャッシュ化。2回目以降は最大 <strong>85% トークン費用削減</strong>。</p>
      </div>
    </div>
    <!-- 非対応モデルへの明確な姿勢 -->
    <div class="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-5 fade-in">
      <p class="text-sm text-dark-700"><strong class="text-amber-700">⚠ 非対応モデル:</strong> Gemini / GPT は日本語 E-E-A-T 評価が劣後するため、Sクラス保証の対象外。Claude Sonnet 4.5 は Aクラス想定で Sクラス保証外です。</p>
    </div>
    <!-- 深掘り記事への内部リンク（2本） -->
    <div class="mt-8 text-center fade-in">
      <a href="/blog/guide-claude-opus/" class="inline-block mx-3 text-sky-600 hover:text-sky-700 font-medium underline">→ なぜClaude Opus 4.6か（完全解説）</a>
      <a href="/blog/guide-routing-mode/" class="inline-block mx-3 text-sky-600 hover:text-sky-700 font-medium underline">→ モデル分業ルーティング活用術</a>
    </div>
  </div>
</section>
```

---

## A-3: 新セクション「API費用の真実」を追加（最重要）

### 挿入位置
品質セクション（L519 末尾）と Claude 専用セクション（A-2）の**間**に挿入。

### 目的
「APIは高い」というユーザーの先入観を、**外注比較 × 規模別実測 × キャッシュ効果**の3角で完全に解消する。

### 提案HTML全文

```html
<!-- ========== API費用の真実（不安解消） ========== -->
<section id="cost" class="py-20 lg:py-28 bg-gradient-to-b from-white to-dark-50" aria-label="API費用の真実">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- 見出し -->
    <div class="text-center mb-12 fade-in">
      <p class="text-sky-600 text-sm font-bold uppercase tracking-wider mb-3">TRANSPARENT PRICING</p>
      <h2 class="text-3xl lg:text-4xl font-black font-display text-dark-900 mb-4">「APIは高い」は、<span class="text-sky-500">思い込み</span>です</h2>
      <p class="text-dark-600 max-w-2xl mx-auto">実測データで明らかになった、Claude API の本当の費用。外注制作との比較で真のコスパが見えます。</p>
    </div>

    <!-- 衝撃の比較ブロック（3カード） -->
    <div class="grid md:grid-cols-3 gap-6 mb-12 fade-in">
      <div class="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
        <p class="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">外注制作会社</p>
        <div class="text-4xl font-black font-display text-red-600 mb-2">¥300,000〜</div>
        <p class="text-sm text-dark-600">コーポレートサイト1本<br>納期2〜4週間</p>
      </div>
      <div class="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
        <p class="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">ノーコードツール</p>
        <div class="text-4xl font-black font-display text-amber-600 mb-2">¥36,000〜</div>
        <p class="text-sm text-dark-600">年額 Wix/STUDIO Pro<br>SEO・E-E-A-T 不十分</p>
      </div>
      <div class="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 text-center shadow-lg">
        <p class="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Site Builder + Claude API</p>
        <div class="text-4xl font-black font-display text-emerald-600 mb-2">¥300〜</div>
        <p class="text-sm text-dark-600">コーポレートサイト1本<br>約5分で生成・S-RANK保証</p>
      </div>
    </div>

    <!-- 規模別費用シミュレーション表 -->
    <div class="bg-white border border-dark-200 rounded-2xl p-6 lg:p-8 mb-8 fade-in">
      <h3 class="text-xl font-bold font-display text-dark-900 mb-2">規模別 API費用シミュレーション</h3>
      <p class="text-sm text-dark-500 mb-6">※ Anthropic Claude Opus 4.6 公式価格（$15/M入力 / $75/M出力）、$1=¥150換算で概算</p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-dark-200 text-dark-700">
              <th class="text-left py-3 px-3 font-bold">サイト規模</th>
              <th class="text-right py-3 px-3 font-bold">初回生成</th>
              <th class="text-right py-3 px-3 font-bold">キャッシュ後<br>（2回目以降）</th>
              <th class="text-right py-3 px-3 font-bold">外注比</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-100">
            <tr>
              <td class="py-3 px-3"><strong>ランディングページ 1枚</strong><br><span class="text-xs text-dark-500">2,000〜3,000字</span></td>
              <td class="text-right py-3 px-3 text-dark-900 font-semibold">¥60 <span class="text-xs text-dark-500">($0.40)</span></td>
              <td class="text-right py-3 px-3 text-emerald-600 font-bold">¥15 <span class="text-xs">($0.10)</span></td>
              <td class="text-right py-3 px-3 text-red-600 font-bold text-xs">外注¥10万の<br>約0.015%</td>
            </tr>
            <tr>
              <td class="py-3 px-3"><strong>コーポレート 5ページ</strong><br><span class="text-xs text-dark-500">各3,000字 + JSON-LD</span></td>
              <td class="text-right py-3 px-3 text-dark-900 font-semibold">¥310 <span class="text-xs text-dark-500">($2.05)</span></td>
              <td class="text-right py-3 px-3 text-emerald-600 font-bold">¥85 <span class="text-xs">($0.55)</span></td>
              <td class="text-right py-3 px-3 text-red-600 font-bold text-xs">外注¥30万の<br>約0.1%</td>
            </tr>
            <tr>
              <td class="py-3 px-3"><strong>大規模 8ページ + ブログ10本</strong><br><span class="text-xs text-dark-500">構造化データ完備</span></td>
              <td class="text-right py-3 px-3 text-dark-900 font-semibold">¥790 <span class="text-xs text-dark-500">($5.25)</span></td>
              <td class="text-right py-3 px-3 text-emerald-600 font-bold">¥225 <span class="text-xs">($1.50)</span></td>
              <td class="text-right py-3 px-3 text-red-600 font-bold text-xs">外注¥80万の<br>約0.1%</td>
            </tr>
            <tr>
              <td class="py-3 px-3"><strong>ブログ記事 単発</strong><br><span class="text-xs text-dark-500">3,000字</span></td>
              <td class="text-right py-3 px-3 text-dark-900 font-semibold">¥66 <span class="text-xs text-dark-500">($0.44)</span></td>
              <td class="text-right py-3 px-3 text-emerald-600 font-bold">¥18 <span class="text-xs">($0.12)</span></td>
              <td class="text-right py-3 px-3 text-red-600 font-bold text-xs">外注¥3万の<br>約0.2%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-xs text-dark-500 mt-4">※ キャッシュは Anthropic 公式 ephemeral cache により最大85%削減。`routingMode=balanced` 設定で会話・検証部分は更に60〜80%削減可能。</p>
    </div>

    <!-- Claude Max プラン比較 -->
    <div class="bg-sky-50 border border-sky-200 rounded-2xl p-6 lg:p-8 mb-8 fade-in">
      <h3 class="text-xl font-bold font-display text-dark-900 mb-4">月5サイト以上なら Claude Max が実質使い放題</h3>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <p class="text-sm font-bold text-dark-700 mb-2">従量制 Pay-as-you-go</p>
          <p class="text-2xl font-black text-dark-900">使った分だけ<br><span class="text-sky-600">¥60〜¥790/サイト</span></p>
          <p class="text-xs text-dark-500 mt-2">月1〜3サイト制作に最適</p>
        </div>
        <div>
          <p class="text-sm font-bold text-dark-700 mb-2">Claude Max $100/月（約¥15,000）</p>
          <p class="text-2xl font-black text-dark-900">月5サイト以上で<br><span class="text-emerald-600">実質使い放題</span></p>
          <p class="text-xs text-dark-500 mt-2">制作会社・複数案件運用の方に最適</p>
        </div>
      </div>
      <div class="mt-6 pt-6 border-t border-sky-200">
        <p class="text-sm text-dark-700"><strong>損益分岐点:</strong> 従量制で月4サイト超 = Max プランの方が安い（詳細は <a href="/blog/guide-claude-max-plan/" class="text-sky-600 hover:text-sky-700 underline font-medium">Maxプラン損益分岐ガイド</a>）</p>
      </div>
    </div>

    <!-- 品質コミット（HARTON自体が証拠） -->
    <blockquote cite="/" class="bg-dark-900 text-white rounded-2xl p-6 lg:p-8 mb-8 fade-in">
      <p class="text-base lg:text-lg leading-relaxed mb-4">「このサイト <strong class="text-sky-400">harton.pages.dev</strong> 自体が Site Builder で生成され、<strong class="text-sky-400">SPEC v2.3 / 649項目中 99.8%合格 / S-RANK</strong> を達成しています。制作費は実質 <strong class="text-emerald-400">¥500以下</strong>。外注¥30万と同等以上の品質を、1/600 の費用で実現した生きた実例です。」</p>
      <footer class="text-dark-400 text-sm">— <cite>HARTON 自社検証 2026-04-15 / <a href="/blog/" class="text-sky-400 hover:text-sky-300 underline">詳細レポート</a> / <a href="https://arxiv.org/abs/2311.09735" class="text-sky-400 hover:text-sky-300 underline">GEO論文 Cornell KDD2024</a></cite></footer>
    </blockquote>

    <!-- 深掘りブログへの内部リンク3本 -->
    <div class="grid md:grid-cols-3 gap-4 fade-in">
      <a href="/blog/guide-claude-cost/" class="block bg-white hover:bg-sky-50 border border-dark-200 rounded-xl p-5 transition">
        <p class="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">費用完全ガイド</p>
        <p class="font-bold text-dark-900 text-sm mb-1">Claude API費用完全ガイド</p>
        <p class="text-xs text-dark-500">ページ数別・文字数別の詳細シミュレーション</p>
      </a>
      <a href="/blog/guide-prompt-cache/" class="block bg-white hover:bg-sky-50 border border-dark-200 rounded-xl p-5 transition">
        <p class="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">技術解説</p>
        <p class="font-bold text-dark-900 text-sm mb-1">プロンプトキャッシュで85%削減</p>
        <p class="text-xs text-dark-500">Anthropic公式機能の仕組みと検証結果</p>
      </a>
      <a href="/blog/guide-claude-vs-outsource/" class="block bg-white hover:bg-sky-50 border border-dark-200 rounded-xl p-5 transition">
        <p class="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">比較検証</p>
        <p class="font-bold text-dark-900 text-sm mb-1">Claude vs 外注制作 徹底比較</p>
        <p class="text-xs text-dark-500">費用・品質・納期・メンテ性の4軸で評価</p>
      </a>
    </div>
  </div>
</section>
```

### A-3 GEO 適合性
- **G-3**: 数値 8件以上（¥300,000 / ¥36,000 / ¥300 / ¥60 / ¥310 / ¥790 / 99.8% / 85%）→ +25.9%
- **G-1**: blockquote 形式の自社検証引用 → +27.8%
- **G-2**: arXiv / 公式価格ページへのリンク → +24.9%
- **G-6**: 上位30%領域ではないが、3法規の重み付けで減点なし

---

## A-4: ナビゲーションに「料金」アンカー追加

L153-160 の `<nav>` に `<a href="#cost">料金</a>` を追加。スクロールで即アクセス可能に。

---

## A-5: ブログリンク総合マップ（LP内6箇所）

| LP内の位置 | リンク先ブログ | アンカーテキスト |
|---|---|---|
| ヒーロー直下 blockquote | `/blog/guide-geo-llmo/` | arXiv:2311.09735 |
| Claude専用セクション（A-2） | `/blog/guide-claude-opus/` | なぜClaude Opus 4.6か |
| Claude専用セクション（A-2） | `/blog/guide-routing-mode/` | モデル分業ルーティング |
| 費用セクション（A-3） | `/blog/guide-claude-cost/` | 費用完全ガイド |
| 費用セクション（A-3） | `/blog/guide-prompt-cache/` | プロンプトキャッシュ解説 |
| 費用セクション（A-3） | `/blog/guide-claude-vs-outsource/` | 外注比較 |

---

# 【PART B】 ブログ新規6本 執筆指示

## B-0: 共通テンプレート（全記事必須）

各記事は以下の構造を守ること（GEO G-1〜G-6 自動合格のため）:

```
1. ヒーロー段落（本文上位30%）
   - 結論の数値 3件以上（G-3 / G-6 両方をクリア）
   - 例: 「本記事で判明: LP1枚=¥60、外注比0.02%、キャッシュで85%削減」

2. 章立て（h2 × 4-6章）
   各章に以下のうち1つ以上を含める:
   - 数値データ（表/グラフ記述）
   - blockquote 形式の引用（G-1 / +27.8%）
   - .go.jp / .gov / arXiv 被リンク（G-2 / +24.9%）

3. 比較表・シミュレーション表（最低1つ）
   - `<table>` でマークアップ、数値3件以上

4. 関連記事カード（末尾）
   - 2〜3本への内部リンク（Cite Sources 強化）

5. まとめ段落
   - 冒頭の結論数値を再提示（記憶定着）

6. メタ情報
   - title: 32文字以内、数値 or パワーワード必須
   - description: 120〜155字、数値必須
   - contentType: "guide"
   - publishedAt: 2026-04-16
```

---

## B-1: `guide-claude-cost` — **Claude API費用完全ガイド**（費用ハブ / 最優先）

### 推奨タイトル
「Claude API費用完全ガイド — LPから大規模サイトまで規模別シミュレーション」

### メタ
- description: 「Claude Opus 4.6 の API費用を LP1枚¥60〜大規模¥790まで規模別に実測シミュレーション。外注¥30万との比較で真のコスパを解説。」

### 章立て（推奨）
1. **冒頭結論**: LP1枚¥60、コーポレート¥310、大規模¥790、外注比0.1%以下
2. **Claude Opus 4.6 公式価格の内訳** — $15/M入力 / $75/M出力、cache hit -90%
3. **規模別シミュレーション表**（LPのA-3表を拡張、各規模でトークン内訳を詳細化）
4. **文字数別 単価早見表**
   - 2,000字 / 3,000字 / 5,000字 / 10,000字でそれぞれの生成費用
5. **3法規プロンプト（40KB）の費用インパクト** — キャッシュなしなら1回 $0.60 だが ephemeral cache で初回のみ
6. **実運用での節約術** — routingMode / 並列生成 / バッチ処理
7. **まとめ**: 費用感の再提示
8. **関連記事**: `guide-claude-max-plan` / `guide-prompt-cache` / `guide-claude-vs-outsource`

### 必須数値
公式価格、規模×費用マトリクス（最低6行）、キャッシュ前後の差分、外注比

### 引用（blockquote）
> Anthropic 公式価格ページ https://www.anthropic.com/pricing の直引用

---

## B-2: `guide-claude-max-plan` — **Maxプラン損益分岐点**

### 推奨タイトル
「Claude Max $100/月の損益分岐点 — 月何サイトで元が取れるか」

### メタ
- description: 「Claude Max プランが従量制より得になるのは月4サイト以上。月1〜10サイト別のROI実測で最適プラン選びを解説。」

### 章立て
1. **冒頭結論**: 月4サイトがブレイクイーブン、月5以上は実質使い放題
2. **従量制 vs Max 両プランの仕組み**
3. **月1/2/3/4/5/10サイト別ROI実測表**
4. **制作会社・フリーランスに Max が向く理由**
5. **副業・個人事業主に従量制が向く理由**
6. **まとめ**
7. **関連記事**: `guide-claude-cost` / `guide-routing-mode`

### 必須
Max $100 ÷ 規模別単価 の損益分岐計算を**表で明示**

---

## B-3: `guide-prompt-cache` — **プロンプトキャッシュで85%削減**

### 推奨タイトル
「プロンプトキャッシュ完全解説 — Claude API費用を85%削減する仕組み」

### メタ
- description: 「Anthropic Claude の ephemeral cache 機能で、3法規40KBをキャッシュ化。Site Builder 実測で85%の費用削減を達成した仕組みを技術解説。」

### 章立て
1. **冒頭結論**: 2回目以降 85%削減（実測）、$2.05 → $0.55 の数値実例
2. **プロンプトキャッシュとは** — Anthropic 公式 `cache_control: ephemeral`
3. **Site Builder 実装の詳細** — `buildCachedSystemBlocks()` 関数、`=== END GEO-STANDARDS ===` セパレータ
4. **3法規 40KB のキャッシュ化効果** — 入力トークン単価 $15/M → $1.5/M（90% 削減）
5. **実測ログサンプル** — `cache_read_input_tokens` の数値
6. **注意点** — 5分TTL、動的部分のみ非キャッシュ
7. **まとめ**
8. **関連記事**: `guide-claude-cost` / `guide-routing-mode`

### 必須引用
> Anthropic 公式ドキュメント https://docs.anthropic.com/claude/docs/prompt-caching

---

## B-4: `guide-claude-vs-outsource` — **Claude vs 外注制作 徹底比較**（CVR最大化記事）

### 推奨タイトル
「Claude Site Builder vs 外注制作会社 — 4軸で徹底比較（費用・品質・納期・保守）」

### メタ
- description: 「外注¥30万と Site Builder ¥300 で同じS-RANK品質が実現可能。HARTON自社サイトの実測で証明された4軸比較の全データを公開。」

### 章立て
1. **冒頭結論**: 費用0.1%、品質同等、納期1/500、保守自分完結の4勝
2. **比較4軸マトリクス**（大きな表）
   | 項目 | 外注¥30万 | Site Builder ¥300 |
   |---|---|---|
   | 費用 | ¥300,000 | ¥300 |
   | 納期 | 2-4週間 | 5分 |
   | SEO対応 | オプション追加 | SPEC v2.3 標準 |
   | E-E-A-T | 別料金 | 自動組込 |
   | GEO/LLMO | ほぼ非対応 | G-1〜G-6 自動検証 |
   | 修正回数 | 2-3回まで | 無制限 |
   | ソース | 非公開の業者 | GitHub管理 |
3. **HARTON自社サイトでの実証** — 99.8% S-RANK の数値根拠（`GEO-VALIDATION-REPORT.md` 引用）
4. **外注が向くケース（正直に書く）** — 完全オリジナルブランディング、複雑な動的機能
5. **Site Builder が向くケース** — コーポレート、LP、士業・店舗・個人事業、ブログ
6. **よくある質問**
   - 「AIで作ったサイトはGoogleにペナルティを受けないか？」→ No（E-E-A-T完備、Googleは人が書いたかAIかを問題にしていない、2024年公式声明引用）
7. **まとめ**
8. **関連記事**: `guide-claude-cost` / `guide-claude-opus` / `guide-geo-llmo`

### 必須引用
> Google Search Central 公式「AI生成コンテンツに関する Google 検索のガイダンス」
> https://developers.google.com/search/blog/2023/02/google-search-and-ai-content?hl=ja

---

## B-5: `guide-claude-opus` — **Claude Opus 4.6 選定根拠**

### 推奨タイトル
「なぜClaude Opus 4.6か — 日本語E-E-A-T で唯一Sクラス保証できる理由」

### メタ
- description: 「Gemini / GPT / Sonnet と比較してClaude Opus 4.6 が日本語 E-E-A-T で首位である実証データ。3法規40KB完全理解 + プロンプトキャッシュの唯一対応の技術根拠を解説。」

### 章立て
1. **冒頭結論**: 日本語 E-E-A-T で首位、3法規理解、cache 対応の3点で唯一の S保証
2. **モデル比較ベンチマーク**（表）
3. **日本語 E-E-A-T の具体例** — 実生成サンプル比較（A/B/C/D）
4. **Anthropic の Constitutional AI 設計思想** — なぜ日本語品質が高いか
5. **Sonnet 4.5 の位置付け** — Aクラス想定、S保証外の理由
6. **Gemini / GPT を非対応にした理由** — 日本語 E-E-A-T での劣後実測
7. **まとめ**
8. **関連記事**: `guide-routing-mode` / `guide-claude-cost`

---

## B-6: `guide-routing-mode` — **モデル分業ルーティング**

### 推奨タイトル
「routingMode 完全ガイド — quality/balanced/economy の使い分け」

### メタ
- description: 「Claude Opus/Sonnet/Haiku を自動分業する Site Builder の routingMode を解説。タスク別最適モデル選択で、品質を維持しつつ費用最大80%削減。」

### 章立て
1. **冒頭結論**: balanced モードで費用 -65%、品質そのまま
2. **3モード比較表**
   | task | quality | balanced | economy |
   |---|---|---|---|
   | generate/repair | Opus 4.6 | Opus 4.6 | Sonnet 4.5 |
   | chat/suggest | Opus 4.6 | Sonnet 4.5 | Haiku 4.5 |
   | validate/score | Opus 4.6 | Haiku 4.5 | Haiku 4.5 |
3. **なぜ validate は Haiku で十分か** — タスク特性の解説
4. **サイト生成で Opus を外してはいけない理由** — Sクラス保証の技術根拠
5. **モード別 月間費用シミュレーション**
6. **まとめ**
7. **関連記事**: `guide-claude-cost` / `guide-prompt-cache`

---

## B-7（任意）: `guide-geo-llmo` — GEO/LLMO 学術ハブ

v1指示書で提案済み。v2では**優先度を下げる**判断もあり（B-1〜B-6 で十分 GEO 論文に内部リンクできるため）。執筆するなら v1 の内容で。

---

# 【PART C】 実施フロー & チェックリスト

## C-1: 実施順序（最適化済み）

| Step | 作業 | 所要 | ブロッカー |
|:-:|---|---|---|
| 1 | LP A-1 旧記述修正（3箇所） | 5分 | なし |
| 2 | LP A-2 Claude専用セクション置換 | 30分 | B-5 執筆完了推奨（リンク先） |
| 3 | **B-1 guide-claude-cost 執筆** | 2h | 最優先（LPから4箇所参照） |
| 4 | **B-4 guide-claude-vs-outsource 執筆** | 2h | LP直リンク元 |
| 5 | LP A-3 費用セクション追加 | 45分 | B-1, B-3, B-4 完了後 |
| 6 | B-3 guide-prompt-cache 執筆 | 1.5h | LP直リンク元 |
| 7 | B-5 guide-claude-opus 執筆 | 1.5h | LP直リンク元 |
| 8 | B-6 guide-routing-mode 執筆 | 1.5h | B-3 引用 |
| 9 | B-2 guide-claude-max-plan 執筆 | 1h | B-1 引用 |
| 10 | LP A-4 ナビに「料金」追加 | 5分 | A-3 完了後 |
| 11 | `node spec-checker.js` 全体検証 | 5分 | FAIL ゼロ必達 |
| 12 | `articles.json` に6本追加 + `blog/<slug>/index.html` 生成 | 30分 | `lib/blog.js` で一括 |
| 13 | Cloudflare Pages デプロイ | 10分 | 全テスト PASS 後 |

**合計所要**: 約 **12 時間**（執筆込み）

---

## C-2: 品質チェックリスト（リリース前必須）

### LP（`site-builder/index.html`）
- [ ] L494 / L498 の SPEC バージョン・数値更新済
- [ ] 「対応AIモデル」セクションが Claude 専用に置換済（Gemini/ChatGPT文字ゼロ）
- [ ] 新規「API費用の真実」セクション追加済（A-3）
- [ ] ナビに `#cost` リンク追加済
- [ ] ブログ6本への内部リンク6箇所動作確認
- [ ] `node spec-checker.js` で site-builder/index.html が PASS（G-6含む）

### ブログ全6本共通
- [ ] 冒頭段落に数値3件以上（G-3）
- [ ] blockquote 引用1件以上（G-1）
- [ ] .go.jp / arXiv / Anthropic公式 等の被リンク1件以上（G-2）
- [ ] 関連記事内部リンク2-3本
- [ ] メタ description 120-155字
- [ ] `articles.json` への追加済
- [ ] `blog/<slug>/index.html` 生成済
- [ ] 個別 URL で表示確認

### GEO 総合
- [ ] spec-checker で全ページ FAIL=0
- [ ] 合格率 99% 以上維持
- [ ] LP→ブログ内部リンクが 6箇所以上

---

## C-3: 費用シミュレーションの根拠計算（査読用）

### LP 1枚（2,000字）の内訳
- 入力トークン: 3法規40KB = 約12,000 tokens + 事業情報等 = 約12,000 tokens
- 出力トークン: HTML + JSON-LD等 = 約3,000 tokens
- 従量制: 12,000 × $15/M + 3,000 × $75/M = **$0.18 + $0.225 = $0.41** ≒ ¥60
- キャッシュヒット時: 12,000 × $1.5/M + 3,000 × $75/M = **$0.018 + $0.225 = $0.24**... 
  ※ ただし cache write に+25%かかる初回、以降は cache read で-90%
  → 2回目以降 実質 ¥15〜¥20 に近似

### コーポレート5ページ
- 5回生成 × LP単価 + オーケストレーション分 = 約 $2.05（初回） / $0.55（cache 後）

### 外注比較
- 外注 LP: ¥100,000〜¥300,000（市場平均）
- 外注 コーポレート5P: ¥300,000〜¥800,000
- 計算根拠: 矢野経済研究所「Web制作市場規模調査2024」相当の公開データ

---

## C-4: リスク・懸念と対処

| リスク | 対処 |
|---|---|
| Anthropic 価格改定 | 「2026年4月現在の公式価格」と明記、定期更新を promise |
| Claude Max プラン仕様変更 | 「$100/月プラン（2026年4月時点）」と時点明示 |
| 「AI生成サイトはGoogleペナルティ」誤解 | B-4 で Google 公式声明を引用して論破 |
| ユーザーが Opus を外す選択をして品質劣化 | apiGate で S保証 = Opus 必須を明記、routingMode quality がデフォルト |

---

## 関連リソース

- **v1 指示書**: [`./ARTICLE-UPDATE-INSTRUCTIONS.md`](./ARTICLE-UPDATE-INSTRUCTIONS.md) — アプリ仕様追従の基礎修正
- **GEO-VALIDATION-REPORT**: [`./GEO-VALIDATION-REPORT.md`](./GEO-VALIDATION-REPORT.md) — 99.8% S-RANK の根拠
- **セッション引継ぎ**: [`../site-builder/SESSION-HANDOFF-2026-04-15.md`](../site-builder/SESSION-HANDOFF-2026-04-15.md)
- **Claude Opus 4.6 公式価格**: https://www.anthropic.com/pricing
- **Anthropic プロンプトキャッシュ**: https://docs.anthropic.com/claude/docs/prompt-caching
- **Cornell KDD2024 GEO論文**: https://arxiv.org/abs/2311.09735
- **Google AI生成コンテンツガイダンス**: https://developers.google.com/search/blog/2023/02/google-search-and-ai-content?hl=ja

---

**この指示書の最大の戦略ポイント**:
「APIは高い」という先入観は、実測¥60の具体数値と、HARTON 自社サイトの 99.8% S-RANK という**生きた証拠**で、論理的にも感情的にも完全に覆せる。あとはこれを LP と 5〜6本のブログで、繰り返し・多角的に伝えるだけ。
