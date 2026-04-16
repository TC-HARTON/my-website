#!/usr/bin/env node
/**
 * SPEC 11.4-tbl table caption + th scope 準拠スクリプト
 * WCAG 2.2 SC 1.3.1 (Info and Relationships) / HTML Living Standard §4.9.11
 * ─────────────────────────────────────────────────────
 * 全 <table> に <caption> と th scope="col" を付与する。
 */
const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '..', 'blog', 'articles.json');

// 記事スラッグ → 各テーブルの caption テキスト
const CAPTIONS = {
  'guide-claude-cost': [
    'サイト規模別 Claude Opus 4.6 利用費用（外注比較込み）',
  ],
  'guide-claude-vs-outsource': [
    '外注制作会社 vs Site Builder + Claude 総合比較',
  ],
  'guide-prompt-cache': [
    'プロンプトキャッシュ有無による処理時間・コスト削減効果',
  ],
  'guide-claude-opus': [
    '主要 AI モデル別 S クラスサイト適合性比較',
  ],
  'guide-routing-mode': [
    'ルーティングモード別・タスク適用モデル',
    'ルーティングモード別・月間運用コスト比較',
  ],
  'guide-claude-max-plan': [
    'Claude MAX プラン vs Anthropic API 機能比較',
    '作業内容別 API 費用と $5 予算での実行可能回数',
    'ルーティングモード別 5ページサイト制作コスト',
    '利用者像別 月間運用コスト目安（balanced モード）',
  ],
};

function addCaptionAndScope(tableHtml, captionText) {
  // 1) caption を <table> 直後に挿入（既存ならスキップ）
  let out = tableHtml;
  if (!/<caption/i.test(out)) {
    out = out.replace(
      /^<table([^>]*)>/i,
      `<table$1><caption class="sr-only">${captionText}</caption>`
    );
  }
  // 2) <thead> 内の <th> に scope="col" を付与（既存 scope ならスキップ）
  out = out.replace(/<thead[\s\S]*?<\/thead>/i, thead => {
    return thead.replace(/<th(?![^>]*\sscope=)([^>]*)>/gi, '<th scope="col"$1>');
  });
  // 3) <tbody> 内の先頭 <th>（行ヘッダ）に scope="row" を付与
  out = out.replace(/<tbody[\s\S]*?<\/tbody>/i, tbody => {
    return tbody.replace(/<tr([^>]*)>\s*<th(?![^>]*\sscope=)([^>]*)>/gi,
      '<tr$1><th scope="row"$2>');
  });
  return out;
}

function main() {
  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));
  let fixed = 0;

  for (const art of articles) {
    const caps = CAPTIONS[art.slug];
    if (!caps) continue;
    const tables = art.content.match(/<table[\s\S]*?<\/table>/gi) || [];
    if (tables.length === 0) continue;
    if (tables.length !== caps.length) {
      console.warn(`  [WARN] ${art.slug}: ${tables.length} tables found, ${caps.length} captions defined`);
    }
    let newContent = art.content;
    tables.forEach((t, i) => {
      const cap = caps[i] || caps[0] || 'データ比較表';
      const replaced = addCaptionAndScope(t, cap);
      if (replaced !== t) {
        newContent = newContent.replace(t, replaced);
        fixed++;
        console.log(`  [FIX] ${art.slug} table ${i + 1} — "${cap}"`);
      }
    });
    art.content = newContent;
  }

  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2) + '\n', 'utf-8');
  console.log(`\nDone. Fixed ${fixed} tables.`);
}

main();
