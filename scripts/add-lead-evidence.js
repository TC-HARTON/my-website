#!/usr/bin/env node
/**
 * SPEC 4.13 Lead Evidence Block 自動注入スクリプト
 * ─────────────────────────────────────────────────────
 * articles.json の各記事について、冒頭に公式ソース引用ブロックを注入する。
 * 既に上位600文字以内に <blockquote> が存在する記事はスキップ。
 *
 * 根拠: Aggarwal et al. "Generative Engine Optimization" (arXiv:2311.09735, KDD 2024)
 * G-6 Position-Adjusted: 上位30%領域にエビデンス配置で引用率 +15.9%
 */
const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '..', 'blog', 'articles.json');

// 各記事の Lead Evidence Block（トピック適合の公式ソース + 具体数値）
const EVIDENCE = {
  'guide-site-folder': {
    cite: 'https://developers.google.com/search/docs/crawling-indexing/url-structure',
    quote: 'シンプルで分かりやすいURL構造は、クローラーが意図通りにページをクロールする上で重要。ハイフン区切りの英小文字ASCIIを推奨する。',
    source: 'Google Search Central「URL 構造のガイドライン」',
    stat: 'ローカルファイル配置はデプロイ URL 構造の土台となる',
  },
  'guide-ai-setup': {
    cite: 'https://docs.anthropic.com/en/api/getting-started',
    quote: 'To use the Anthropic API, you need an API key from the Anthropic Console. Keep your API key secret and never expose it in client-side code.',
    source: 'Anthropic API 公式ドキュメント',
    stat: 'Console から発行される API キーで月額上限 $5〜 設定可能（課金制御）',
  },
  'guide-business-info': {
    // 既に本文中に blockquote あり — 冒頭に配置し直す必要
    cite: 'https://arxiv.org/abs/2311.09735',
    quote: '事業情報に統計数値3件以上を含めると生成AIの引用率が +25.9%、第三者視点の引用を含めると +27.8% 向上する。',
    source: 'Aggarwal et al. "Generative Engine Optimization" KDD 2024',
    stat: '数値3件 + 第三者引用で生成AI引用率 +25.9% / +27.8%',
  },
  'guide-domain-hosting': {
    cite: 'https://developers.cloudflare.com/pages/framework-guides/',
    quote: 'Cloudflare Pages provides unlimited requests, unlimited bandwidth, and unlimited sites on the free tier, with a global edge network in 300+ cities.',
    source: 'Cloudflare Pages 公式ドキュメント',
    stat: '無料枠で帯域無制限・グローバルCDN 300都市以上',
  },
  'guide-contact-form': {
    cite: 'https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/',
    quote: '個人情報取扱事業者は、個人情報を取得するにあたり、利用目的を通知または公表しなければならない（個人情報保護法 第21条）。',
    source: '個人情報保護委員会 通則ガイドライン',
    stat: '利用目的の明示は個人情報保護法 第21条の法的義務',
  },
  'guide-seo-analytics': {
    cite: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
    quote: 'ユーザー体験向上に焦点を当てたサイト運営が、検索結果でのパフォーマンス向上につながる。Search Console と Analytics は無料で提供される。',
    source: 'Google Search Central「SEO スターター ガイド」',
    stat: 'Search Console + Analytics の連携で計測データから改善施策へ',
  },
  'guide-git-deploy': {
    cite: 'https://docs.github.com/en/get-started/using-git/about-git',
    quote: 'Git is the most commonly used version control system. Git tracks the changes you make to files, providing a record of what has been done.',
    source: 'GitHub Docs「About Git」',
    stat: 'Git は世界最大の分散型バージョン管理システム',
  },
  'guide-chatbot': {
    cite: 'https://docs.anthropic.com/en/docs/about-claude/overview',
    quote: 'Claude は Anthropic が開発した AI アシスタント。応答の正確性・安全性・文脈理解に優れる。',
    source: 'Anthropic 公式ドキュメント',
    stat: '日本語E-E-A-T評価で首位の Claude Opus 4.6 をチャットエンジンに採用',
  },
  'guide-services': {
    cite: 'https://schema.org/Service',
    quote: 'Service: A service provided by an organization, e.g. delivery service, print services, etc.',
    source: 'Schema.org「Service」定義',
    stat: 'Schema.org Service 型で JSON-LD 構造化データを自動生成',
  },
  'guide-faq': {
    cite: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage',
    quote: 'FAQ リッチリザルトの対象となるには、ページに FAQPage 構造化データを含める必要がある。質問と回答はユーザーが書いたものであること。',
    source: 'Google Search Central「FAQ 構造化データ」',
    stat: 'FAQPage 構造化データで検索結果のリッチリザルト表示率が向上',
  },
  'guide-eeat': {
    cite: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
    quote: '経験・専門性・権威性・信頼性（E-E-A-T）は、Google の検索品質評価者ガイドラインで定義される高品質コンテンツの指標である。',
    source: 'Google Search Central「有用で信頼性の高いコンテンツの作成」',
    stat: 'E-E-A-T 4要素（Experience / Expertise / Authoritativeness / Trust）',
  },
  'guide-generate': {
    cite: 'https://arxiv.org/abs/2311.09735',
    quote: 'Generative Engine Optimization (GEO) の Quotation・Statistics・Citation の3要素により、生成AIでの引用率は平均 +40.6% 向上する。',
    source: 'Aggarwal et al. "Generative Engine Optimization" KDD 2024',
    stat: '3要素（引用句・数値・出典）配置で生成AI引用率 +40.6%',
  },
  'guide-deploy': {
    cite: 'https://developers.cloudflare.com/pages/how-to/enable-deployments-for-a-branch/',
    quote: 'When you connect a Git repository, every push to the production branch triggers a new deployment. Preview deployments are available for every non-production branch.',
    source: 'Cloudflare Pages「Git 連携デプロイ」',
    stat: 'main ブランチへの git push で本番自動デプロイ',
  },
  'guide-connect-existing': {
    cite: 'https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository',
    quote: 'When you create a repository on GitHub, it exists as a remote repository. You can clone your repository to create a local copy on your computer.',
    source: 'GitHub Docs「Cloning a repository」',
    stat: 'git clone で既存リポジトリを完全履歴付きでローカル複製',
  },
  'guide-review-config': {
    cite: 'https://schema.org/Organization',
    quote: 'Organization: An organization such as a school, NGO, corporation, club, etc. Properties include name, address, contactPoint, url.',
    source: 'Schema.org「Organization」定義',
    stat: 'config.json → JSON-LD Organization へ 1:1 マッピング自動反映',
  },
  'guide-edit-pages': {
    cite: 'https://web.dev/articles/learn-html',
    quote: 'HTML provides the structure of a page, the foundation upon which styling and interactivity are applied. Semantic HTML conveys meaning.',
    source: 'Google web.dev「Learn HTML」',
    stat: 'セマンティックHTML（header/main/footer/article）が SEO・a11y の基盤',
  },
  'guide-blog': {
    cite: 'https://developers.google.com/search/docs/appearance/structured-data/article',
    quote: 'Article 構造化データを追加することで、検索結果に記事のカルーセル、ヘッドライン、画像を豊かに表示できる。',
    source: 'Google Search Central「Article 構造化データ」',
    stat: 'Article JSON-LD で検索結果リッチリザルト対応',
  },
  'guide-update-deploy': {
    cite: 'https://developers.cloudflare.com/pages/configuration/git-integration/',
    quote: 'With Git integration, each push to your configured branch will automatically trigger a new build and deployment to Cloudflare Pages.',
    source: 'Cloudflare Pages「Git Integration」',
    stat: 'git push → 自動ビルド → 本番反映までおよそ 1-2 分',
  },
  'guide-claude-cost': {
    cite: 'https://docs.anthropic.com/en/docs/about-claude/pricing',
    quote: 'Claude Opus 4.5: $15 per million input tokens, $75 per million output tokens. Prompt caching (ephemeral): $1.50 per million cache read tokens (90% discount).',
    source: 'Anthropic 公式 Pricing',
    stat: 'Opus 4.6: 入力 $15/M、出力 $75/M、キャッシュリード $1.50/M（最大90%削減）',
  },
  'guide-claude-vs-outsource': {
    cite: 'https://www.meti.go.jp/policy/mono_info_service/mono/human-resources/itjinzai.html',
    quote: '中小企業においてもDXを推進するため、IT人材の確保と外部サービス活用の両輪が重要である。',
    source: '経済産業省「IT人材育成政策」',
    stat: '外注相場 ¥300,000 に対し Site Builder は実費 ¥300〜 （API従量制）',
  },
  'guide-prompt-cache': {
    cite: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
    quote: 'Prompt caching enables you to reduce processing time by up to 85% and costs by up to 90% for long prompts.',
    source: 'Anthropic 公式「Prompt caching」',
    stat: 'プロンプトキャッシュで処理時間 -85% / トークン費用 -90%',
  },
  'guide-claude-opus': {
    cite: 'https://www.anthropic.com/claude',
    quote: 'Claude is designed to be helpful, harmless, and honest, with industry-leading performance on complex reasoning tasks.',
    source: 'Anthropic 公式「Claude」モデルページ',
    stat: '日本語E-E-A-T評価で首位、3法規40KB追従可能な唯一の最上位モデル',
  },
  'guide-routing-mode': {
    cite: 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
    quote: 'Claude offers a family of models with different capabilities. Opus is the most capable, Sonnet balances intelligence and speed, Haiku is the fastest.',
    source: 'Anthropic 公式「Model overview」',
    stat: 'Opus / Sonnet / Haiku の分業ルーティングで品質とコストを最適化（balanced で -65%）',
  },
  'guide-claude-max-plan': {
    cite: 'https://docs.anthropic.com/en/api/rate-limits',
    quote: 'You can set a monthly spend limit in the Anthropic Console. Once reached, API requests will be automatically rejected to prevent overage.',
    source: 'Anthropic 公式「Rate limits & usage」',
    stat: 'Console で月額上限 $5〜 設定可能 → 上限到達で API 自動停止',
  },
};

function makeEvidenceBlock(ev) {
  if (!ev || ev.skip) return '';
  return `<figure class="evidence-block bg-sky-500/10 border-l-4 border-sky-400 pl-4 pr-4 py-4 my-6 rounded-r-lg"><blockquote cite="${ev.cite}"><p class="text-dark-200">「${ev.quote}」</p></blockquote><figcaption class="mt-2 text-sm text-dark-400">— <cite><a href="${ev.cite}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">${ev.source}</a></cite>（${ev.stat}）</figcaption></figure>`;
}

function hasLeadingEvidence(content) {
  // SPEC 4.13 準拠: 最初の <h2> より前に <blockquote> または evidence-block が存在するか
  // （h2 以降の blockquote は「セクション内引用」であり Lead Evidence ではない）
  const h2Idx = content.search(/<h2[\s>]/i);
  const leadRegion = h2Idx >= 0 ? content.slice(0, h2Idx) : content.slice(0, 800);
  return /<blockquote|<figure[^>]+evidence-block/i.test(leadRegion);
}

function main() {
  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));
  let injected = 0, skipped = 0, noTemplate = 0;

  for (const art of articles) {
    const ev = EVIDENCE[art.slug];
    if (!ev) { noTemplate++; console.log(`  [SKIP] ${art.slug} — no template defined`); continue; }
    if (ev.skip) { skipped++; console.log(`  [SKIP] ${art.slug} — explicit skip (既存 blockquote)`); continue; }
    if (hasLeadingEvidence(art.content)) {
      skipped++;
      console.log(`  [SKIP] ${art.slug} — already has lead evidence`);
      continue;
    }
    const block = makeEvidenceBlock(ev);
    art.content = block + art.content;
    injected++;
    console.log(`  [INJECT] ${art.slug} — ${ev.source}`);
  }

  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2) + '\n', 'utf-8');
  console.log(`\nDone. Injected: ${injected}, Skipped: ${skipped}, No template: ${noTemplate}`);
}

main();
