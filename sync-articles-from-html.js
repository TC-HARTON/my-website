#!/usr/bin/env node
// One-shot helper: sync articles.json `content` fields from the <div class="prose max-w-none"> body of each HTML.
// Usage: node sync-articles-from-html.js <slug1> <slug2> ...
'use strict';

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');
const JSON_PATH = path.join(BLOG_DIR, 'articles.json');

function extractProse(html) {
  const start = html.indexOf('<div class="prose max-w-none">');
  if (start < 0) throw new Error('prose block not found');
  const afterOpen = html.indexOf('>', start) + 1;
  // find matching </div> by scanning div depth
  let depth = 1;
  let i = afterOpen;
  const reTag = /<\/?div\b[^>]*>/gi;
  reTag.lastIndex = i;
  let m;
  while ((m = reTag.exec(html))) {
    if (m[0][1] === '/') depth--; else depth++;
    if (depth === 0) {
      const end = m.index;
      return html.slice(afterOpen, end).trim();
    }
  }
  throw new Error('no closing </div> for prose block');
}

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error('Usage: node sync-articles-from-html.js <slug1> <slug2> ...');
  process.exit(1);
}

const articles = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
let changed = 0;
for (const slug of slugs) {
  const htmlPath = path.join(BLOG_DIR, slug, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.error(`[skip] ${slug}: ${htmlPath} not found`);
    continue;
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const prose = extractProse(html);
  const idx = articles.findIndex(a => a.slug === slug);
  if (idx < 0) {
    console.error(`[skip] ${slug}: not found in articles.json`);
    continue;
  }
  if (articles[idx].content === prose) {
    console.log(`[same] ${slug}: no change`);
    continue;
  }
  articles[idx].content = prose;
  changed++;
  console.log(`[sync] ${slug}: content field updated (${prose.length} chars)`);
}

if (changed > 0) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(articles, null, 2) + '\n');
  console.log(`\nWrote ${JSON_PATH} (${changed} article(s) updated)`);
} else {
  console.log('\nNo changes.');
}
