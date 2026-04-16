#!/usr/bin/env node
/**
 * SPEC.md v2.4 完全自動検証エージェント
 * ─────────────────────────────────────
 * SPEC.md v2.4 納品前チェックリスト全項目
 * + Google Search Central準拠チェック
 * + 本文仕様の全項目を機械的にチェック
 *
 * 使い方:
 *   node spec-checker.js              # 全対象ファイルを検証
 *   node spec-checker.js index.html   # 個別ファイル検証
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════ 設定 ═══════════════════
const ROOT = __dirname;
const DOMAIN = 'https://harton.pages.dev';

// 静的ページ（手書き/テンプレート管理）
const STATIC_TARGETS = [
  'index.html',
  'services/web/index.html',
  'services/automation/index.html',
  'services/ai-prediction/index.html',
  'privacy/index.html',
  'thanks.html',
  '404.html',
  'profile/index.html',
  'site-builder/index.html',
];

// ブログ記事（generate-blog.js で動的生成）を自動検出して追加
// SPEC v2.4 以降、ブログも静的ページと同一の S-RANK 基準で検証する
function detectBlogTargets() {
  const blogDir = path.join(ROOT, 'blog');
  if (!fs.existsSync(blogDir)) return [];
  const targets = [];
  if (fs.existsSync(path.join(blogDir, 'index.html'))) targets.push('blog/index.html');
  for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const p = `blog/${entry.name}/index.html`;
      if (fs.existsSync(path.join(ROOT, p))) targets.push(p);
    }
  }
  return targets.sort();
}

const BLOG_TARGETS = detectBlogTargets();
const TARGET_FILES = [...STATIC_TARGETS, ...BLOG_TARGETS];

const PAGE_TYPE = {
  'index.html': 'full',
  'services/web/index.html': 'service',
  'services/automation/index.html': 'service',
  'services/ai-prediction/index.html': 'service',
  'privacy/index.html': 'minimal',
  'thanks.html': 'minimal',
  '404.html': 'minimal',
  'profile/index.html': 'profile',
  'site-builder/index.html': 'subpage',
};
// ブログ記事は 'subpage' 相当（BreadcrumbList + OGP + canonical + モバイル品質 全て必須）
// blog/index.html は一覧ページなので同じく 'subpage'
for (const bp of BLOG_TARGETS) PAGE_TYPE[bp] = 'subpage';

// ─── SPEC 10.6 Body Theme Variants（v2.4 必須） ───
// 各ページがどの Variant を採用すべきかを定義（SPEC 10.6.2 準拠）
const THEME_VARIANTS = {
  marketing: {
    required: ['bg-white', 'text-dark-700', 'font-sans', 'antialiased'],
    forbidden: ['bg-dark-900', 'text-dark-300'],
    colorScheme: 'light',
  },
  reading: {
    required: ['bg-dark-900', 'text-dark-300', 'font-sans', 'antialiased'],
    forbidden: ['bg-white', 'text-dark-700'],
    colorScheme: 'dark',
  },
};

function getVariant(relPath) {
  // marketing Variant (light theme): LP / サービス / プロダクト LP
  const MARKETING = [
    'index.html',
    'services/web/index.html',
    'services/automation/index.html',
    'services/ai-prediction/index.html',
    'site-builder/index.html',
  ];
  if (MARKETING.includes(relPath)) return 'marketing';
  // reading Variant (dark theme): blog / 法務 / profile / 管理 / エラー
  return 'reading';
}

// カスタムCSSクラス（output.css照合から除外）
const CUSTOM_CLASSES = new Set([
  'fade-in','visible','hero-grid','glow','card-hover','nav-blur',
  'mobile-menu','open','float','pulse-line','gradient-text',
  'cat-tab','active','sr-only','fade-in-delay-1','fade-in-delay-2',
  'fade-in-delay-3','check-circle','check-ring',
]);

// ═══════════════════ 結果クラス ═══════════════════
class R {
  constructor(id, sec, name, status, detail = '') {
    this.id = id; this.sec = sec; this.name = name;
    this.status = status; this.detail = detail;
  }
}
const PASS = (id, s, n, d) => new R(id, s, n, 'PASS', d || '');
const FAIL = (id, s, n, d) => new R(id, s, n, 'FAIL', d || '');
const WARN = (id, s, n, d) => new R(id, s, n, 'WARN', d || '');
const SKIP = (id, s, n, d) => new R(id, s, n, 'SKIP', d || '');

// ═══════════════════ パーサ ═══════════════════
const head = h => (h.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [])[1] || '';
const body = h => (h.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [])[1] || '';
const bodyClass = h => (h.match(/<body\s+class=["']([^"']*)["']/i) || [])[1] || '';
const title = h => (h.match(/<title>([^<]*)<\/title>/i) || [])[1] || null;
const len = s => [...s].length;

function meta(html, name) {
  let m = html.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, 'i'));
  if (m) return m[1];
  m = html.match(new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+name=["']${name}["']`, 'i'));
  return m ? m[1] : null;
}
function ogp(html, prop) {
  let m = html.match(new RegExp(`<meta\\s+property=["']${prop}["']\\s+content=["']([^"']*)["']`, 'i'));
  if (m) return m[1];
  m = html.match(new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+property=["']${prop}["']`, 'i'));
  return m ? m[1] : null;
}
function jsonld(html) {
  const r = []; let m;
  const rx = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  while ((m = rx.exec(html)) !== null) {
    try { r.push(JSON.parse(m[1])); } catch { r.push({ _err: true }); }
  }
  return r;
}
function jsonldTypes(schemas) {
  const t = new Set();
  for (const s of schemas) {
    if (s['@type']) t.add(s['@type']);
    if (s['@graph']) s['@graph'].forEach(i => i['@type'] && t.add(i['@type']));
  }
  return t;
}
function headings(html) {
  const h = []; let m;
  const rx = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  while ((m = rx.exec(html)) !== null)
    h.push({ lv: +m[1][1], txt: m[2].replace(/<[^>]+>/g, '').trim() });
  return h;
}
function csp(html) {
  const m = html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content='([^']*)'/i);
  return m ? m[1] : null;
}
function loadCSS() {
  const p = path.join(ROOT, 'dist', 'output.css');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
}
function hexLum(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const rgb = [0,2,4].map(i => parseInt(hex.substring(i, i+2), 16) / 255);
  const lin = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function contrast(a, b) {
  const la = hexLum(a), lb = hexLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// ═══════════════════ 11.1 パフォーマンス・CWV (6) ═══════════════════

function c11_1(html, pt) {
  const S = '11.1パフォ', r = [], hd = head(html), bd = body(html);

  // 1. CLS/LCP/INP 静的リスクチェック
  let clsRisk = 0;
  const imgs = bd.match(/<img\s[^>]*>/gi) || [];
  imgs.forEach(i => { if (!/width=/i.test(i) || !/height=/i.test(i)) clsRisk++; });
  if (/cdn\.tailwindcss\.com/i.test(html)) clsRisk += 10;
  (html.match(/fonts\.googleapis\.com\/css2[^"']*/gi) || []).forEach(u => {
    if (!u.includes('display=swap')) clsRisk++;
  });
  r.push(clsRisk === 0
    ? PASS('11.1-cwv', S, 'CWV静的リスク')
    : FAIL('11.1-cwv', S, 'CWV静的リスク', `${clsRisk}件のリスク要因`));

  // 2. Tailwind CDN禁止
  r.push(/cdn\.tailwindcss\.com/i.test(html)
    ? FAIL('11.1-cdn', S, 'Tailwind CDN禁止', 'cdn.tailwindcss.com使用')
    : PASS('11.1-cdn', S, 'Tailwind CDN不使用'));

  // 3. ビルドCSS照合
  const css = loadCSS();
  if (!css) {
    r.push(FAIL('11.1-css', S, 'CSSクラス照合', 'dist/output.css不存在'));
  } else {
    const clsRx = /class=["']([^"']*)["']/gi; let m; const all = new Set();
    while ((m = clsRx.exec(html)) !== null) m[1].split(/\s+/).forEach(c => c && all.add(c));
    const miss = [];
    for (const c of all) {
      if (CUSTOM_CLASSES.has(c) || /^[{$]/.test(c)) continue;
      // Tailwindクラス判定
      if (!/^(bg-|text-|font-|p-|px-|py-|pt-|pb-|m-|mx-|my-|mt-|mb-|w-|h-|min-|max-|flex|grid|block|inline|hidden|absolute|relative|fixed|sticky|top-|bottom-|left-|right-|z-|border|rounded|shadow|opacity-|transition|transform|scale-|gap-|space-|items-|justify-|self-|order-|col-|row-|overflow|truncate|whitespace|tracking-|leading-|decoration-|underline|list-|table|divide|ring|outline|cursor|pointer|select-|fill-|stroke-|object-|aspect-|sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|group|dark:|disabled:)/.test(c))
        continue;
      // Tailwind CSSではセレクタ内の特殊文字をバックスラッシュでエスケープする
      // 例: focus:z-[9999] → .focus\:z-\[9999\]:focus
      //     bg-white/80 → .bg-white\/80
      const escCSS = s => s.replace(/([[\]()/:.,!#%])/g, '\\$1');
      const base = c.replace(/^(sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|group-hover:|dark:|disabled:)+/, '');
      const baseEsc = escCSS(base);
      const fullEsc = escCSS(c);
      if (!css.includes(base) && !css.includes(baseEsc) && !css.includes(fullEsc)) miss.push(c);
    }
    r.push(miss.length === 0
      ? PASS('11.1-css', S, 'CSSクラス照合', `${all.size}クラス検証済`)
      : FAIL('11.1-css', S, 'CSSクラス照合', `${miss.length}欠落: ${miss.slice(0, 5).join(', ')}`));
  }

  // 4. コンソールエラー(静的)
  const schemas = jsonld(html);
  if (schemas.some(s => s._err)) {
    r.push(FAIL('11.1-err', S, 'JSON-LDパースエラー'));
  } else {
    const scripts = bd.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    let jsErr = false;
    scripts.forEach(s => {
      const c = s.replace(/<\/?script[^>]*>/gi, '');
      if ((c.match(/\{/g) || []).length !== (c.match(/\}/g) || []).length) jsErr = true;
    });
    r.push(jsErr ? FAIL('11.1-err', S, 'JS構文エラー', '括弧不一致') : PASS('11.1-err', S, '静的エラーチェック'));
  }

  // 5. 画像(WebP/picture/wh/lazy/fetchpriority)
  if (imgs.length === 0) {
    r.push(SKIP('11.1-img', S, '画像チェック', '画像なし'));
  } else {
    let noAlt = 0, noWH = 0;
    const raster = imgs.filter(i => !/\.svg/i.test(i) && !/data:image\/svg/i.test(i));
    imgs.forEach(i => { if (!/alt=/i.test(i)) noAlt++; });
    raster.forEach(i => { if (!/width=/i.test(i) || !/height=/i.test(i)) noWH++; });
    r.push(noAlt > 0
      ? FAIL('11.1-alt', S, '画像alt', `${noAlt}個にalt不足`)
      : PASS('11.1-alt', S, '画像alt', `${imgs.length}個OK`));
    r.push(noWH > 0
      ? FAIL('11.1-wh', S, '画像width/height', `${noWH}個に不足`)
      : PASS('11.1-wh', S, '画像width/height'));
    // fetchpriority on hero(fullのみ)
    if (pt === 'full') {
      const hasFP = /fetchpriority=["']high["']/i.test(bd);
      r.push(hasFP ? PASS('11.1-fp', S, 'fetchpriority="high"') : WARN('11.1-fp', S, 'fetchpriority="high"', 'ヒーロー画像に未設定'));
    }
    // alt日本語
    const alts = [];
    imgs.forEach(i => { const a = (i.match(/alt=["']([^"']*)["']/i) || [])[1]; if (a) alts.push(a); });
    const nonJa = alts.filter(a => a && !/[\u3000-\u9fff\uff00-\uffef]/.test(a));
    r.push(nonJa.length > 0 ? WARN('11.1-altja', S, '画像alt日本語', `非日本語: "${nonJa.slice(0,2).join('","')}"`) : PASS('11.1-altja', S, '画像alt日本語'));
  }

  // 6. サードパーティスクリプト遅延
  const extScripts = (hd.match(/<script\s[^>]*src=["'][^"']*["'][^>]*>/gi) || [])
    .filter(s => /https?:\/\//i.test(s));
  const syncExt = extScripts.filter(s => !/async|defer/i.test(s));
  r.push(syncExt.length > 0
    ? FAIL('11.1-defer', S, 'サードパーティ遅延', `${syncExt.length}件同期読込`)
    : PASS('11.1-defer', S, 'サードパーティ遅延'));

  // CSSサイズ
  const cssPath = path.join(ROOT, 'dist', 'output.css');
  if (fs.existsSync(cssPath)) {
    const kb = fs.statSync(cssPath).size / 1024;
    r.push(kb <= 40
      ? PASS('11.1-csssz', S, `CSSサイズ ${kb.toFixed(1)}KB`)
      : WARN('11.1-csssz', S, 'CSSサイズ', `${kb.toFixed(1)}KB (目標40KB以下)`));
  }

  return r;
}

// ═══════════════════ 11.2 SEO・E-E-A-T (12) ═══════════════════

function c11_2(html, pt) {
  const S = '11.2SEO', r = [];

  // 1. title
  const t = title(html);
  if (!t) { r.push(FAIL('11.2-title', S, 'title', '未設定')); }
  else {
    const l = len(t);
    if (pt === 'minimal') r.push(l > 0 ? PASS('11.2-title', S, `title(${l}文字)`, `"${t}"`) : FAIL('11.2-title', S, 'title', '空'));
    else if (pt === 'subpage' || pt === 'profile') r.push(l >= 15 && l <= 60 ? PASS('11.2-title', S, `title ${l}文字(15-60)`) : FAIL('11.2-title', S, `title ${l}文字`, '15-60文字必須'));
    else r.push(l >= 30 && l <= 60 ? PASS('11.2-title', S, `title ${l}文字(30-60)`) : FAIL('11.2-title', S, `title ${l}文字`, '30-60文字必須'));
  }

  // 2. description
  const d = meta(html, 'description');
  if (pt === 'minimal') { r.push(d ? PASS('11.2-desc', S, 'description') : WARN('11.2-desc', S, 'description', 'なし')); }
  else {
    if (!d) r.push(FAIL('11.2-desc', S, 'description', '未設定'));
    else { const l = len(d); r.push(l >= 70 && l <= 160 ? PASS('11.2-desc', S, `description ${l}文字`) : FAIL('11.2-desc', S, `description ${l}文字`, '70-160必須')); }
  }

  // 3. meta author
  const auth = meta(html, 'author');
  if (pt === 'minimal') r.push(auth ? PASS('11.2-author', S, 'meta author') : SKIP('11.2-author', S, 'meta author'));
  else r.push(auth ? PASS('11.2-author', S, 'meta author', auth) : FAIL('11.2-author', S, 'meta author', '未設定'));

  // 4. canonical
  const canon = (html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i) || [])[1];
  if (!canon) r.push(pt === 'minimal' ? WARN('11.2-canon', S, 'canonical', '未設定') : FAIL('11.2-canon', S, 'canonical', '未設定'));
  else r.push(canon.startsWith(DOMAIN) ? PASS('11.2-canon', S, 'canonical') : FAIL('11.2-canon', S, 'canonical', `ドメイン不一致: ${canon}`));

  // 5. robots max-snippet:-1
  const rob = meta(html, 'robots');
  if (pt === 'minimal') {
    r.push(rob && (rob.includes('noindex') || rob.includes('nofollow')) ? PASS('11.2-robots', S, 'robots(noindex)') : (rob ? PASS('11.2-robots', S, 'robots') : WARN('11.2-robots', S, 'robots')));
  } else {
    if (!rob) r.push(FAIL('11.2-robots', S, 'robots', '未設定'));
    else {
      const need = ['index', 'follow', 'max-image-preview:large', 'max-snippet:-1'];
      const miss = need.filter(n => !rob.includes(n));
      r.push(miss.length === 0 ? PASS('11.2-robots', S, 'robots') : FAIL('11.2-robots', S, 'robots', `不足: ${miss.join(',')}`));
    }
  }

  // 6. OGP 7項目
  if (pt === 'minimal') { r.push(SKIP('11.2-ogp', S, 'OGP')); }
  else {
    const need = ['og:title','og:description','og:type','og:url','og:image','og:site_name','og:locale'];
    const miss = need.filter(p => !ogp(html, p));
    r.push(miss.length === 0 ? PASS('11.2-ogp', S, 'OGP全7項目') : FAIL('11.2-ogp', S, 'OGP', `不足: ${miss.join(',')}`));
    const img = ogp(html, 'og:image');
    if (img && !img.startsWith(DOMAIN)) r.push(FAIL('11.2-ogimg', S, 'OGP画像URL', img));
  }

  // 7. Twitter Card
  if (pt === 'minimal') { r.push(SKIP('11.2-tw', S, 'Twitter Card')); }
  else {
    const miss = [];
    if (meta(html, 'twitter:card') !== 'summary_large_image') miss.push('card');
    if (!meta(html, 'twitter:title')) miss.push('title');
    if (!meta(html, 'twitter:description')) miss.push('desc');
    if (!meta(html, 'twitter:image')) miss.push('image');
    r.push(miss.length === 0 ? PASS('11.2-tw', S, 'Twitter Card') : FAIL('11.2-tw', S, 'Twitter Card', `不足: ${miss.join(',')}`));
  }

  // 8. JSON-LD 5種
  if (pt === 'minimal') { r.push(SKIP('11.2-jld', S, 'JSON-LD')); }
  else {
    const types = jsonldTypes(jsonld(html));
    const need = pt === 'full'
      ? ['ProfessionalService', 'WebSite', 'FAQPage', 'BreadcrumbList', 'Person']
      : (pt === 'subpage' || pt === 'profile') ? ['BreadcrumbList']
      : ['ProfessionalService', 'WebSite', 'BreadcrumbList'];
    need.forEach(t => r.push(types.has(t)
      ? PASS(`11.2-${t}`, S, `JSON-LD: ${t}`)
      : FAIL(`11.2-${t}`, S, `JSON-LD: ${t}`, '未定義')));
    // ProfessionalService プロパティ
    if (types.has('ProfessionalService')) {
      const schemas = jsonld(html);
      const ps = schemas.find(s => s['@type'] === 'ProfessionalService') ||
                 schemas.flatMap(s => s['@graph'] || []).find(i => i['@type'] === 'ProfessionalService');
      if (ps) {
        const need2 = ['name','description','url','telephone','address','geo','knowsAbout','areaServed'];
        const miss = need2.filter(p => !ps[p]);
        r.push(miss.length === 0 ? PASS('11.2-ps', S, 'PS必須プロパティ') : FAIL('11.2-ps', S, 'PS必須プロパティ', `不足: ${miss.join(',')}`));
      }
    }
  }

  // 9. (リッチリザルトテストは外部APIのため静的チェック不可→パース成功で代替)
  if (pt !== 'minimal') {
    const schemas = jsonld(html);
    r.push(schemas.some(s => s._err)
      ? FAIL('11.2-rich', S, 'JSON-LD構文', 'パースエラー→リッチリザルトテスト不合格の可能性')
      : PASS('11.2-rich', S, 'JSON-LD構文(パース成功)'));
  }

  // 10,11. sitemap.xml / robots.txt → グローバルチェックで実施

  // 12. <time> タグ(datePublished/dateModified)
  if (pt === 'minimal') { r.push(SKIP('11.2-time', S, '<time>タグ')); }
  else {
    const bd2 = body(html);
    const hasPub = /itemprop=["']datePublished["']/i.test(bd2) || /<time[^>]*datetime=/i.test(bd2);
    r.push(hasPub ? PASS('11.2-time', S, '<time>タグ') : WARN('11.2-time', S, '<time>タグ', '公開日/更新日の<time>未検出'));
  }

  return r;
}

// ═══════════════════ 11.3 E-E-A-Tコンテンツ (3) ═══════════════════

function c11_3_eeat() {
  const S = '11.3E-E-AT', r = [];

  // 1. profile/index.html 存在
  const pp = path.join(ROOT, 'profile', 'index.html');
  r.push(fs.existsSync(pp)
    ? PASS('11.3-profile', S, 'プロフィールページ')
    : FAIL('11.3-profile', S, 'プロフィールページ', 'profile/index.html不存在'));

  // 2. 一次情報（自動検出は困難→プロフィールページに内容があるかで簡易チェック）
  if (fs.existsSync(pp)) {
    const c = fs.readFileSync(pp, 'utf-8');
    const bodyLen = (body(c) || c).replace(/<[^>]+>/g, '').trim().length;
    r.push(bodyLen > 200
      ? PASS('11.3-1st', S, '一次情報(プロフィール内容)', `${bodyLen}文字`)
      : WARN('11.3-1st', S, '一次情報', `プロフィール内容が少ない(${bodyLen}文字)`));
  } else {
    r.push(FAIL('11.3-1st', S, '一次情報', 'プロフィールページ不存在'));
  }

  // 3. 孤立ページなし（全対象HTMLにパンくずまたはフッターナビからのリンクがあるか）
  const mainHtml = fs.existsSync(path.join(ROOT, 'index.html'))
    ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8') : '';
  const pages = ['services/web/', 'services/automation/', 'services/ai-prediction/', 'privacy/', 'profile/'];
  const orphans = pages.filter(p => !mainHtml.includes(p));
  r.push(orphans.length === 0
    ? PASS('11.3-orphan', S, '孤立ページなし')
    : WARN('11.3-orphan', S, '孤立ページ', `index.htmlからリンクなし: ${orphans.join(', ')}`));

  return r;
}

// ═══════════════════ 11.4 LLMO (7) ═══════════════════

function c11_4(html, pt) {
  const S = '11.4LLMO', r = [], bd = body(html);

  // 1. 全sectionにaria-label
  if (pt === 'minimal') { r.push(SKIP('11.4-sec', S, 'section aria-label')); }
  else {
    const secs = bd.match(/<section[^>]*>/gi) || [];
    const noL = secs.filter(s => !/aria-label(ledby)?=/i.test(s));
    r.push(noL.length === 0 && secs.length > 0
      ? PASS('11.4-sec', S, `section aria-label(${secs.length}個)`)
      : (secs.length === 0 ? SKIP('11.4-sec', S, 'section') : FAIL('11.4-sec', S, 'section aria-label', `${noL.length}個に不足`)));
  }

  // 2. 全navにaria-label（メイン,モバイル,パンくず,フッター = 最低4）
  if (pt === 'minimal') { r.push(SKIP('11.4-nav', S, 'nav aria-label')); }
  else {
    const navs = bd.match(/<nav[^>]*>/gi) || [];
    const noL = navs.filter(n => !/aria-label(ledby)?=/i.test(n));
    r.push(noL.length === 0 && navs.length > 0
      ? PASS('11.4-nav', S, `nav aria-label(${navs.length}個)`)
      : FAIL('11.4-nav', S, 'nav aria-label', noL.length > 0 ? `${noL.length}個に不足` : 'navなし'));
    // 最低4チェック(full/serviceで期待)
    if (pt === 'full' && navs.length < 4) {
      r.push(WARN('11.4-nav4', S, 'nav数(4以上推奨)', `現在${navs.length}個`));
    }
  }

  // 3. H1→H2→H3スキップなし
  const hs = headings(html);
  const h1s = hs.filter(h => h.lv === 1);
  if (h1s.length === 0) r.push(FAIL('11.4-h1', S, 'H1', 'H1なし'));
  else if (h1s.length > 1) r.push(FAIL('11.4-h1', S, 'H1', `${h1s.length}個(1個必須)`));
  else r.push(PASS('11.4-h1', S, 'H1', h1s[0].txt.substring(0, 40)));
  let prev = 0, skip = false;
  for (const h of hs) {
    if (prev > 0 && h.lv > prev + 1) {
      r.push(FAIL('11.4-hskip', S, '見出し階層', `H${prev}→H${h.lv}`));
      skip = true; break;
    }
    prev = h.lv;
  }
  if (!skip && hs.length > 0) r.push(PASS('11.4-hskip', S, '見出し階層スキップなし'));

  // 4. table caption + th scope
  const tables = bd.match(/<table[\s\S]*?<\/table>/gi) || [];
  if (tables.length === 0) r.push(SKIP('11.4-tbl', S, 'table'));
  else {
    let issue = 0;
    tables.forEach(t => { if (!/<caption/i.test(t) || !/<th[^>]*scope=/i.test(t)) issue++; });
    r.push(issue === 0 ? PASS('11.4-tbl', S, 'table caption+th scope') : FAIL('11.4-tbl', S, 'table', `${issue}件問題`));
  }

  // 5. JSON-LD機械可読
  if (pt === 'minimal') r.push(SKIP('11.4-jld', S, 'JSON-LD機械可読'));
  else {
    const s = jsonld(html);
    r.push(s.length > 0 && !s.some(x => x._err) ? PASS('11.4-jld', S, 'JSON-LD機械可読', `${s.length}ブロック`) : FAIL('11.4-jld', S, 'JSON-LD機械可読'));
  }

  // 6. JSなしで全情報取得可能
  r.push(/innerHTML\s*=|document\.write|\.insertAdjacentHTML/i.test(bd)
    ? WARN('11.4-nojs', S, 'JSなし情報取得', 'JS動的コンテンツ生成あり')
    : PASS('11.4-nojs', S, 'JSなし情報取得'));

  // 7. lang="ja"
  const lang = (html.match(/<html[^>]*\slang=["']([^"']*)["']/i) || [])[1];
  r.push(lang === 'ja' ? PASS('11.4-lang', S, 'lang="ja"') : FAIL('11.4-lang', S, 'lang="ja"', lang ? `lang="${lang}"` : 'なし'));

  return r;
}

// ═══════════════════ 11.5 アクセシビリティ (7) ═══════════════════

function c11_5(html) {
  const S = '11.5a11y', r = [], bd = body(html);

  // 1. タッチターゲット44px
  const btns = bd.match(/<button[^>]*class=["'][^"']*["'][^>]*>/gi) || [];
  const links = bd.match(/<a[^>]*class=["'][^"']*["'][^>]*>/gi) || [];
  let viol = 0;
  [...btns, ...links].forEach(el => {
    const cls = (el.match(/class=["']([^"']*)["']/i) || [])[1] || '';
    if (cls.includes('sr-only') || cls.includes('hidden')) return;
    const py = (cls.match(/\bpy-(\d+)\b/) || [])[1];
    const h = (cls.match(/\bh-(\d+)\b/) || [])[1];
    const p = (cls.match(/\bp-(\d+)\b/) || [])[1];
    if ((py && +py >= 3) || (h && +h >= 10) || (p && +p >= 3)) return;
    if (cls.includes('py-[') || cls.includes('min-h-')) return;
    // インラインリンク除外
    if (!py && !h && !p && !cls.includes('rounded') && !cls.includes('bg-') && !cls.includes('block') && !cls.includes('flex') && !cls.includes('inline-flex')) return;
    viol++;
  });
  r.push(viol === 0 ? PASS('11.5-touch', S, 'タッチターゲット44px') : WARN('11.5-touch', S, 'タッチターゲット', `${viol}件がpy-3未満`));

  // 2. フォーカスリング不透明
  const semi = bd.match(/focus:ring-[^"'\s]*\/\d+/g);
  let focusFail = semi && semi.length > 0;
  if (!focusFail) {
    (bd.match(/class=["'][^"']*focus:outline-none[^"']*["']/gi) || []).forEach(el => {
      if (!/focus:ring/i.test(el)) focusFail = true;
    });
  }
  r.push(focusFail ? FAIL('11.5-focus', S, 'フォーカスリング不透明') : PASS('11.5-focus', S, 'フォーカスリング不透明'));

  // 3. prefers-reduced-motion
  const motionBlock = html.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\}\s*\}/i);
  if (!motionBlock) r.push(FAIL('11.5-motion', S, 'prefers-reduced-motion'));
  else {
    const c = motionBlock[1];
    r.push(/animation-duration/i.test(c) && /transition-duration/i.test(c) && /scroll-behavior/i.test(c)
      ? PASS('11.5-motion', S, 'prefers-reduced-motion')
      : FAIL('11.5-motion', S, 'prefers-reduced-motion', '必須プロパティ不足'));
  }

  // 4. noscript
  r.push(/<noscript>[\s\S]*?\.fade-in[\s\S]*?<\/noscript>/i.test(html)
    ? PASS('11.5-nosc', S, 'noscript')
    : FAIL('11.5-nosc', S, 'noscript'));

  // 5. スキップリンク
  r.push(/href=["']#main["'][^>]*>.*スキップ/is.test(bd) || /sr-only[^>]*href=["']#main["']/is.test(bd) || /href=["']#main["'][^>]*class=["'][^"']*sr-only/is.test(bd)
    ? PASS('11.5-skip', S, 'スキップリンク')
    : FAIL('11.5-skip', S, 'スキップリンク'));

  // 6. 画像alt日本語 → 11.1で実施済み(重複回避SKIP)
  // 7. フォームlabel
  const inputs = (bd.match(/<input\s[^>]*>/gi) || []).concat(bd.match(/<textarea[^>]*>/gi) || [], bd.match(/<select[^>]*>/gi) || []);
  const fields = inputs.filter(e => !/type=["'](hidden|submit|button|checkbox)["']/i.test(e) && !/display:\s*none/i.test(e) && !/class=["'][^"']*hidden/i.test(e));
  if (fields.length === 0) { r.push(SKIP('11.5-label', S, 'フォームlabel')); }
  else {
    const labelFors = (bd.match(/<label[^>]*>/gi) || []).map(l => (l.match(/for=["']([^"']*)["']/i) || [])[1]).filter(Boolean);
    const ids = fields.map(e => (e.match(/id=["']([^"']*)["']/i) || [])[1]).filter(Boolean);
    const unl = ids.filter(id => !labelFors.includes(id));
    r.push(unl.length === 0 ? PASS('11.5-label', S, 'フォームlabel', `${fields.length}フィールド`) : FAIL('11.5-label', S, 'フォームlabel', `不足: ${unl.join(',')}`));
  }

  return r;
}

// ═══════════════════ 11.6 セキュリティ (4) ═══════════════════

function c11_6(html, pt) {
  const S = '11.6セキュリティ', r = [], c2 = csp(html), bd = body(html);

  // 1. CSP
  if (!c2) r.push(pt === 'minimal' ? WARN('11.6-csp', S, 'CSP', '未設定') : FAIL('11.6-csp', S, 'CSP', '未設定'));
  else {
    const need = ['default-src','script-src','style-src','font-src','img-src','frame-src','object-src','base-uri','form-action'];
    const miss = need.filter(d => !c2.includes(d));
    r.push(miss.length === 0 ? PASS('11.6-csp', S, 'CSP全ディレクティブ') : FAIL('11.6-csp', S, 'CSP', `不足: ${miss.join(',')}`));
  }

  // 2. target="_blank" rel
  const blanks = bd.match(/<a\s[^>]*target=["']_blank["'][^>]*>/gi) || [];
  let bv = 0;
  blanks.forEach(l => { if (!/noopener/i.test(l) || !/noreferrer/i.test(l)) bv++; });
  r.push(bv === 0 ? PASS('11.6-blank', S, 'target="_blank" rel', `${blanks.length}件OK`) : FAIL('11.6-blank', S, 'target="_blank"', `${bv}件にrel不足`));

  // 3. frame-src 'none'
  if (!c2) r.push(pt === 'minimal' ? SKIP('11.6-frame', S, "frame-src") : FAIL('11.6-frame', S, "frame-src 'none'", 'CSPなし'));
  else r.push(c2.includes("frame-src 'none'") ? PASS('11.6-frame', S, "frame-src 'none'") : FAIL('11.6-frame', S, "frame-src 'none'"));

  // 4. object-src 'none'
  if (!c2) r.push(pt === 'minimal' ? SKIP('11.6-obj', S, "object-src") : FAIL('11.6-obj', S, "object-src 'none'", 'CSPなし'));
  else r.push(c2.includes("object-src 'none'") ? PASS('11.6-obj', S, "object-src 'none'") : FAIL('11.6-obj', S, "object-src 'none'"));

  return r;
}

// ═══════════════════ 11.7 モバイル品質 (10) ═══════════════════

function c11_7_mobile(html, pt) {
  const S = '11.7モバイル', r = [], bd = body(html);
  if (pt === 'minimal' || pt === 'profile') return [SKIP('11.7-mob', S, 'モバイル品質', `${pt}ページ`)];

  // 1. モバイルメニューがフルスクリーンオーバーレイ
  // mobile-menu / mobileMenu / モバイルナビゲーション のいずれかで検出
  const menuPatterns = [
    /<(?:nav|div)[^>]*id=["']mobile-menu["'][^>]*>/i,
    /<(?:nav|div)[^>]*id=["']mobileMenu["'][^>]*>/i,
    /<(?:nav|div)[^>]*aria-label=["']モバイルナビゲーション["'][^>]*>/i,
  ];
  let mobileMenu = null;
  for (const p of menuPatterns) { mobileMenu = bd.match(p); if (mobileMenu) break; }
  // Also check parent div wrapping nav for mobileMenu pattern
  if (!mobileMenu) {
    const divMenu = bd.match(/<div[^>]*id=["']mobileMenu["'][^>]*class=["']([^"']*)["'][^>]*>/i) ||
                    bd.match(/<div[^>]*class=["']([^"']*)["'][^>]*id=["']mobileMenu["'][^>]*>/i);
    if (divMenu) mobileMenu = divMenu;
  }
  if (mobileMenu) {
    const cls = (mobileMenu[0].match(/class=["']([^"']*)["']/i) || [])[1] || '';
    const isFixed = cls.includes('fixed');
    const hasBg = /bg-(white|dark-\d+|black|gray-\d+|slate-\d+)/i.test(cls);
    const hasZ = /z-\d+/i.test(cls);
    r.push(isFixed && hasBg ? PASS('11.7-overlay', S, 'フルスクリーンオーバーレイ') : FAIL('11.7-overlay', S, 'モバイルメニュー', `fixed:${isFixed} bg:${hasBg}`));
    if (isFixed) r.push(hasZ ? PASS('11.7-z', S, 'z-index設定') : WARN('11.7-z', S, 'z-index', '未設定'));

    // 【SPEC 10.5.1.1 準拠】Containing Block 汚染検証
    // position:fixed オーバーレイの祖先に backdrop-filter / filter / transform / perspective / will-change
    // を持つ要素があると、CSS仕様上 containing block が viewport から祖先に書き換わり、
    // `inset-0` などの viewport 基準配置が壊れる（W3C CSS Positioned Layout L3 §2.1）
    const menuPos = bd.indexOf(mobileMenu[0]);
    if (isFixed && menuPos >= 0) {
      const before = bd.slice(0, menuPos);
      const voidTags = new Set(['meta','link','br','hr','img','input','source','area','base','col','embed','param','track','wbr']);
      const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(\/?)>/g;
      const stack = [];
      let m;
      while ((m = tagRegex.exec(before)) !== null) {
        const isClose = m[1] === '/';
        const tagName = m[2].toLowerCase();
        const attrs = m[3] || '';
        const selfClose = m[4] === '/' || voidTags.has(tagName);
        if (selfClose) continue;
        if (isClose) {
          for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i].tag === tagName) { stack.splice(i, 1); break; }
          }
        } else {
          stack.push({ tag: tagName, attrs });
        }
      }
      // 禁止パターン: containing block を生成するプロパティ
      const FORBIDDEN_CLASS = /\bnav-blur\b|\bbackdrop-blur(-[a-z0-9]+)?\b|\bbackdrop-filter\b/i;
      const FORBIDDEN_STYLE = /backdrop-filter\s*:(?!\s*none)|(?<!-)filter\s*:(?!\s*none)|(?<![-])transform\s*:(?!\s*none)|perspective\s*:(?!\s*none)|will-change\s*:\s*(transform|perspective|filter|backdrop-filter)/i;
      const offenders = [];
      for (const a of stack) {
        const classMatch = a.attrs.match(/class=["']([^"']*)["']/i);
        const styleMatch = a.attrs.match(/style=["']([^"']*)["']/i);
        const classes = classMatch ? classMatch[1] : '';
        const style = styleMatch ? styleMatch[1] : '';
        if (FORBIDDEN_CLASS.test(classes) || FORBIDDEN_STYLE.test(style)) {
          const excerpt = classes ? classes.slice(0, 50) : style.slice(0, 50);
          offenders.push(`<${a.tag} class="${excerpt}">`);
        }
      }
      r.push(offenders.length === 0
        ? PASS('11.7-ancestor', S, 'containing block汚染なし')
        : FAIL('11.7-ancestor', S, 'モバイルメニューの祖先にbackdrop-filter/filter/transform等あり（SPEC 10.5.1.1 違反）', offenders.join(' / ')));
    }
  } else {
    r.push(WARN('11.7-overlay', S, 'モバイルメニュー', 'mobile-menu未検出'));
  }

  // 2. スクロールロック
  const hasScrollLock = /overflow\s*=\s*['"]hidden['"]|overflow\s*=\s*'hidden'/i.test(bd) ||
                        /body\.style\.overflow/i.test(bd);
  r.push(hasScrollLock ? PASS('11.7-scroll', S, 'スクロールロック') : WARN('11.7-scroll', S, 'スクロールロック', 'JS未検出'));

  // 3. aria-expanded連動
  const hasAriaExp = /aria-expanded/i.test(bd);
  r.push(hasAriaExp ? PASS('11.7-aria', S, 'aria-expanded') : FAIL('11.7-aria', S, 'aria-expanded', '未設定'));

  // 4. ハンバーガーボタンARIA (aria-label, aria-expanded, aria-controls)
  const menuBtn = bd.match(/<button[^>]*aria-controls=["']mobile-menu["'][^>]*>/i) ||
                  bd.match(/<button[^>]*aria-controls=["']mobileMenu["'][^>]*>/i) ||
                  bd.match(/<button[^>]*id=["']menuToggle["'][^>]*>/i) ||
                  bd.match(/<button[^>]*id=["']mobileMenuBtn["'][^>]*>/i) ||
                  bd.match(/<button[^>]*class=["'][^"']*lg:hidden[^"']*["'][^>]*>/i) ||
                  bd.match(/<button[^>]*class=["'][^"']*md:hidden[^"']*["'][^>]*>/i);
  if (menuBtn) {
    const b = menuBtn[0], issues = [];
    if (!/aria-label=/i.test(b)) issues.push('aria-label');
    if (!/aria-expanded=/i.test(b)) issues.push('aria-expanded');
    if (!/aria-controls=/i.test(b)) issues.push('aria-controls');
    r.push(issues.length === 0 ? PASS('11.7-hmb', S, 'ハンバーガーARIA') : FAIL('11.7-hmb', S, 'ハンバーガーARIA', `不足: ${issues.join(',')}`));
  } else {
    r.push(WARN('11.7-hmb', S, 'ハンバーガーボタン', '未検出'));
  }

  // 5. lang="ja" (再確認)
  // Already checked in 11.4 — skip here

  return r;
}

// ═══════════════════ 11.8 Google Search Central準拠 ═══════════════════

function c11_8_google(html, pt) {
  const S = '11.8Google', r = [], bd = body(html), hd = head(html);

  // 1. meta keywordsが使われていないこと
  const mkw = meta(html, 'keywords');
  r.push(mkw ? WARN('11.8-mkw', S, 'meta keywords', 'Googleは無視するため不要') : PASS('11.8-mkw', S, 'meta keywords不使用'));

  // 2. リンクテキストチェック（曖昧な「こちら」「クリック」等を検出）
  if (pt !== 'minimal') {
    const vague = bd.match(/<a[^>]*>\s*(こちら|ここ|クリック|click here|here|詳細|more|read more)\s*<\/a>/gi) || [];
    r.push(vague.length === 0
      ? PASS('11.8-link', S, '説明的リンクテキスト')
      : WARN('11.8-link', S, 'リンクテキスト', `曖昧なリンク${vague.length}件: ${vague.slice(0,3).map(v => v.replace(/<[^>]+>/g,'')).join(',')}`));
  }

  // 3. canonical設定
  const canon = (hd.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i) || [])[1];
  if (pt !== 'minimal') {
    r.push(canon ? PASS('11.8-canon', S, 'canonical設定') : WARN('11.8-canon', S, 'canonical', '未設定（クロール統合に推奨）'));
  }

  // 4. JSレンダリング — クリティカル情報がHTML直書きか
  const hasInnerHTML = /innerHTML\s*=\s*[`'"]/i.test(bd);
  const hasDocWrite = /document\.write/i.test(bd);
  r.push(!hasInnerHTML && !hasDocWrite
    ? PASS('11.8-jsrender', S, 'HTML直接記述')
    : WARN('11.8-jsrender', S, 'JS動的生成', 'innerHTML/document.write使用 → Googlebot確認推奨'));

  return r;
}

// ═══════════════════ GEO/LLMO 検証 (Aggarwal et al. KDD2024 arXiv:2311.09735) ═══════════════════
// G-1〜G-6: 生成エンジン (Perplexity/SGE/BingChat) 引用率最大化のための検証
// 典拠: GEO-STANDARDS.md §8

function cGeo(html, pt) {
  const S = 'GEO/LLMO', r = [], bd = body(html);
  if (pt === 'minimal') return [SKIP('G-skip', S, 'GEO検証', 'minimalページ対象外')];

  // G-1: blockquote または <q cite> が 1 ページ最低 1 件以上 (Quotation Addition: +27.8%)
  const blockquotes = (bd.match(/<blockquote[\s>][\s\S]*?<\/blockquote>/gi) || []).length;
  const qCites = (bd.match(/<q\s+[^>]*cite=/gi) || []).length;
  const quoteCount = blockquotes + qCites;
  r.push(quoteCount >= 1
    ? PASS('G-1', S, 'Quotation Addition (引用句)', `${quoteCount}件 (blockquote:${blockquotes}, q[cite]:${qCites})`)
    : WARN('G-1', S, 'Quotation Addition', '<blockquote>/<q cite>未検出 — 引用句を追加すべき (論文+27.8%)'));

  // G-2: 公的ソース (.go.jp/.gov/.edu/.ac.jp) への被リンクが 1 件以上 (Cite Sources: +24.9%)
  const allLinks = bd.match(/<a\s+[^>]*href=["']([^"']+)["']/gi) || [];
  const authoritativeLinks = allLinks.filter(l =>
    /href=["'][^"']*\.(go\.jp|gov|edu|ac\.jp|or\.jp\/[a-z]+)/i.test(l)
  );
  r.push(authoritativeLinks.length >= 1
    ? PASS('G-2', S, '公的ソース被リンク (Cite Sources)', `${authoritativeLinks.length}件 (.go.jp/.gov/.edu/.ac.jp)`)
    : WARN('G-2', S, '公的ソース被リンク', '.go.jp/.gov/.edu等への被リンクなし (論文+24.9%)'));

  // G-3: 数値 (パーセンテージ/円/件数/年) が本文中に 3 件以上 (Statistics Addition: +25.9%)
  const text = bd.replace(/<script[\s\S]*?<\/script>/gi, '')
                 .replace(/<style[\s\S]*?<\/style>/gi, '')
                 .replace(/<[^>]+>/g, ' ');
  const stats = (text.match(/\d+(?:\.\d+)?\s*(?:%|％|円|万円|件|名|年|位|倍|分|秒|時間|kg|cm|m²|平方メートル|社|店|人)/g) || []);
  r.push(stats.length >= 3
    ? PASS('G-3', S, 'Statistics Addition (数値)', `${stats.length}件の数値`)
    : WARN('G-3', S, 'Statistics Addition', `数値${stats.length}件 (3件以上推奨, 論文+25.9%)`));

  // G-4: schema.org Quotation または Claim の JSON-LD 存在
  const schemas = jsonld(html);
  let hasQuoteSchema = false;
  for (const s of schemas) {
    const types = [];
    if (s['@type']) types.push(s['@type']);
    if (s['@graph']) s['@graph'].forEach(i => i['@type'] && types.push(i['@type']));
    if (types.some(t => t === 'Quotation' || t === 'Claim' || t === 'ClaimReview')) {
      hasQuoteSchema = true; break;
    }
  }
  r.push(hasQuoteSchema
    ? PASS('G-4', S, 'JSON-LD Quotation/Claim')
    : SKIP('G-4', S, 'JSON-LD Quotation/Claim', '構造化マークアップ補強 (任意・推奨)'));

  // G-5: 曖昧表現「思います/かもしれません/らしい」の出現 ≦ 2 (Authoritative: +21.8%)
  const vague = (text.match(/(思います|思われる|かもしれません|かもしれない|らしいです|多分|たぶん|おそらく)/g) || []);
  r.push(vague.length <= 2
    ? PASS('G-5', S, 'Authoritative tone (曖昧表現)', `曖昧表現 ${vague.length}件 (≦2)`)
    : WARN('G-5', S, 'Authoritative tone', `曖昧表現${vague.length}件: ${[...new Set(vague)].slice(0,3).join('/')} (断定調へ修正推奨, 論文+21.8%)`));

  // G-6: 記事冒頭 Lead Evidence 配置 (Position-Adjusted / SPEC 4.13 準拠)
  // 意味論的判定: <main> 内部で、最初の <h2> 以前（＝導入部）にエビデンスが出現すること。
  // <h2> が無いページは <main> 先頭 40% を導入部と見なす。<main> が無いページは body 先頭 30% にフォールバック。
  const mainMatch = bd.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const scope = mainMatch ? mainMatch[1] : bd;
  const firstH2Idx = scope.search(/<h2[\s>]/i);
  const leadRegion = firstH2Idx > 0
    ? scope.slice(0, firstH2Idx)
    : scope.slice(0, Math.floor(scope.length * (mainMatch ? 0.40 : 0.30)));
  const leadText = leadRegion.replace(/<[^>]+>/g, ' ');
  const leadHasStat = /\d+(?:\.\d+)?\s*(?:%|％|円|万円|ドル|\$|件|名|年|位|倍|KB|MB|GB)/.test(leadText);
  const leadHasAuthLink = /href=["'][^"']*(?:\.go\.jp|\.gov|\.edu|\.ac\.jp|arxiv\.org|doi\.org|anthropic\.com|google\.com\/search-central|developers\.google\.com|schema\.org|w3\.org|wcag|cloudflare\.com|github\.com|web\.dev|meti\.go\.jp|ppc\.go\.jp)/i.test(leadRegion);
  const leadHasQuote = /<blockquote|<q\s+[^>]*cite=/i.test(leadRegion);
  const leadSignals = [leadHasStat && '数値', leadHasAuthLink && '公的リンク', leadHasQuote && '引用句'].filter(Boolean);
  r.push(leadSignals.length >= 1
    ? PASS('G-6', S, '位置最適化 (Lead Evidence — 最初のh2以前)', leadSignals.join('+'))
    : FAIL('G-6', S, '位置最適化 (Position-Adjusted / SPEC 4.13 Lead Evidence Block)', '記事冒頭（最初の<h2>以前）に数値/公的リンク/引用句なし — Lead Evidence Block必須'));

  return r;
}

// ═══════════════════ 11.9 追加要件 (2) ═══════════════════

function c11_7() {
  const S = '11.7追加', r = [];

  // 1. カスタム404
  const p404 = path.join(ROOT, '404.html');
  if (!fs.existsSync(p404)) {
    r.push(FAIL('11.7-404', S, 'カスタム404', '404.html不存在'));
  } else {
    const c = fs.readFileSync(p404, 'utf-8');
    const hasNav = /href=["'](\/|index\.html|https?:\/\/)/i.test(c);
    r.push(hasNav ? PASS('11.7-404', S, 'カスタム404') : WARN('11.7-404', S, '404.html', 'トップへのリンクなし'));
  }

  // 2. 301リダイレクト準備
  const redir = fs.existsSync(path.join(ROOT, '_redirects'));
  r.push(redir ? PASS('11.7-301', S, '301リダイレクト準備') : WARN('11.7-301', S, '301リダイレクト', '_redirectsファイル未作成'));

  return r;
}

// ═══════════════════ SPEC本文 追加チェック ═══════════════════

function cSpec(html, pt, variant) {
  const S = 'SPEC本文', r = [], hd = head(html), bd = body(html);
  variant = variant || 'marketing';
  const vspec = THEME_VARIANTS[variant] || THEME_VARIANTS.marketing;

  // charset
  r.push(/<meta\s+charset=["']UTF-8["']/i.test(html) ? PASS('sp-char', S, 'charset') : FAIL('sp-char', S, 'charset'));

  // viewport
  const vp = meta(html, 'viewport');
  r.push(vp && vp.includes('width=device-width') && vp.includes('initial-scale=1')
    ? PASS('sp-vp', S, 'viewport') : FAIL('sp-vp', S, 'viewport'));

  // theme-color
  r.push(meta(html, 'theme-color') ? PASS('sp-theme', S, 'theme-color') : FAIL('sp-theme', S, 'theme-color', '未設定'));

  // color-scheme (SPEC 10.6.3 準拠: Variant と一致必須)
  const cs = meta(html, 'color-scheme');
  if (!cs) {
    r.push(FAIL('sp-cs', S, 'color-scheme', '未設定'));
  } else {
    r.push(cs.trim() === vspec.colorScheme
      ? PASS('sp-cs', S, `color-scheme=${cs} (Variant: ${variant})`)
      : FAIL('sp-cs', S, 'color-scheme Variant不一致', `期待: ${vspec.colorScheme} / 実際: ${cs}`));
  }

  // favicon 3種
  r.push(/<link[^>]*type=["']image\/svg\+xml["'][^>]*>/i.test(hd) ? PASS('sp-fsv', S, 'favicon SVG') : FAIL('sp-fsv', S, 'favicon SVG'));
  r.push(/<link[^>]*sizes=["']32x32["'][^>]*>/i.test(hd) ? PASS('sp-f32', S, 'favicon 32px') : FAIL('sp-f32', S, 'favicon 32px'));
  r.push(/<link[^>]*apple-touch-icon/i.test(hd) ? PASS('sp-fat', S, 'apple-touch-icon') : FAIL('sp-fat', S, 'apple-touch-icon'));

  // body class (SPEC 10.6.1 Body Theme Variants 準拠)
  const bc = bodyClass(html);
  const miss = vspec.required.filter(c => !bc.includes(c));
  const forbidHits = vspec.forbidden.filter(c => bc.includes(c));
  if (miss.length === 0 && forbidHits.length === 0) {
    r.push(PASS('sp-body', S, `body class (Variant: ${variant})`));
  } else {
    const msg = [];
    if (miss.length) msg.push(`不足: ${miss.join(',')}`);
    if (forbidHits.length) msg.push(`Variant違反: ${forbidHits.join(',')}`);
    r.push(FAIL('sp-body', S, `body class (Variant: ${variant} 違反)`, `${msg.join(' / ')} 現在: "${bc}"`));
  }

  // semantic landmarks
  r.push(/<header[\s>]/i.test(bd) ? PASS('sp-hdr', S, '<header>') : FAIL('sp-hdr', S, '<header>'));
  r.push(/<main[\s>]/i.test(bd) ? PASS('sp-main', S, '<main>') : FAIL('sp-main', S, '<main>'));
  r.push(/<footer[\s>]/i.test(bd) ? PASS('sp-ftr', S, '<footer>') : FAIL('sp-ftr', S, '<footer>'));
  if (/<main[\s>]/i.test(bd))
    r.push(/<main[^>]*id=["']main["']/i.test(bd) ? PASS('sp-mid', S, 'main#main') : FAIL('sp-mid', S, 'main#main'));

  // フッターnavにaria-label
  const ftr = (bd.match(/<footer[\s\S]*?<\/footer>/i) || [])[0] || '';
  if (pt !== 'minimal' && ftr) {
    const fNavs = ftr.match(/<nav[^>]*>/gi) || [];
    const fNoL = fNavs.filter(n => !/aria-label/i.test(n));
    if (fNavs.length === 0) r.push(WARN('sp-fnav', S, 'フッターnav', 'footer内にnavなし'));
    else r.push(fNoL.length === 0 ? PASS('sp-fnav', S, 'フッターnav aria-label') : FAIL('sp-fnav', S, 'フッターnav', 'aria-labelなし'));
  }

  // fade-in
  const fi = html.match(/\.fade-in\s*\{[^}]*opacity:\s*0[^}]*\}/);
  if (!fi) r.push(SKIP('sp-fi', S, 'fade-in'));
  else {
    r.push(fi[0].includes('translateY(30px)') ? PASS('sp-fi-y', S, 'fade-in 30px') : FAIL('sp-fi-y', S, 'fade-in', '30px必須'));
    r.push(fi[0].includes('0.8s') ? PASS('sp-fi-d', S, 'fade-in 0.8s') : FAIL('sp-fi-d', S, 'fade-in', '0.8s必須'));
  }

  // fonts
  r.push(/preconnect[^>]*fonts\.googleapis/i.test(hd) && /preconnect[^>]*fonts\.gstatic/i.test(hd)
    ? PASS('sp-pcon', S, 'フォントpreconnect') : FAIL('sp-pcon', S, 'preconnect'));
  const preload = /preload[^>]*fonts\.googleapis/i.test(hd) || /fonts\.googleapis[^>]*preload/i.test(hd);
  r.push(preload ? PASS('sp-pload', S, 'フォントpreload') : WARN('sp-pload', S, 'preload未設定'));
  // font-display:swap
  const fUrls = hd.match(/fonts\.googleapis\.com\/css2[^"']*/gi) || [];
  const noSwap = fUrls.filter(u => !u.includes('display=swap'));
  if (fUrls.length > 0) r.push(noSwap.length === 0 ? PASS('sp-swap', S, 'display=swap') : FAIL('sp-swap', S, 'display=swap'));

  // GA async
  const ga = html.match(/<script[^>]*googletagmanager[^>]*>/i);
  if (ga) r.push(/async/i.test(ga[0]) ? PASS('sp-ga', S, 'GA async') : FAIL('sp-ga', S, 'GA async'));

  // head order
  const cp = hd.indexOf('charset='), vpp = hd.indexOf('name="viewport"'), tp = hd.indexOf('<title>');
  if (cp > -1 && vpp > -1 && cp > vpp) r.push(FAIL('sp-ord', S, 'head順序', 'viewport < charset'));
  else if (cp > -1 && tp > -1 && cp > tp) r.push(FAIL('sp-ord', S, 'head順序', 'title < charset'));
  else r.push(PASS('sp-ord', S, 'head要素順序'));

  // footer copyright
  if (ftr) {
    if (/HARTON\s*Inc\./i.test(ftr)) r.push(FAIL('sp-cr', S, 'フッターCR', '"HARTON Inc."は不正'));
    else if (/2026\s*HARTON/i.test(ftr)) r.push(PASS('sp-cr', S, 'フッターCR'));
    else r.push(WARN('sp-cr', S, 'フッターCR', '形式不明'));
  }

  // URL整合性
  r.push(html.includes('harton.netlify.app')
    ? FAIL('sp-url', S, '旧ドメイン', `${(html.match(/harton\.netlify\.app/g) || []).length}箇所`)
    : PASS('sp-url', S, '旧ドメイン残存なし'));

  // sitemap link
  r.push(/rel=["']sitemap["']/i.test(hd) ? PASS('sp-sm', S, 'sitemap link') : WARN('sp-sm', S, 'sitemap link'));

  // ハンバーガーaria
  if (pt !== 'minimal') {
    const mBtn = bd.match(/<button[^>]*aria-controls=["']mobile-menu["'][^>]*>/i) ||
                 bd.match(/<button[^>]*id=["']menuToggle["'][^>]*>/i);
    if (mBtn) {
      const b = mBtn[0], issue = [];
      if (!/aria-label=/i.test(b)) issue.push('aria-label');
      if (!/aria-expanded=/i.test(b)) issue.push('aria-expanded');
      if (!/aria-controls=/i.test(b)) issue.push('aria-controls');
      r.push(issue.length === 0 ? PASS('sp-hmb', S, 'ハンバーガーARIA') : FAIL('sp-hmb', S, 'ハンバーガーARIA', `不足: ${issue.join(',')}`));
    }
  }

  // article + time (E-E-A-T)
  if (pt !== 'minimal') {
    r.push(/<article/i.test(bd) ? PASS('sp-article', S, '<article>タグ') : WARN('sp-article', S, '<article>タグ', '未使用'));
  }

  return r;
}

// ═══════════════════ グローバルチェック ═══════════════════

function cGlobal() {
  const S = 'グローバル', r = [];

  // sitemap.xml
  const smP = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(smP)) r.push(FAIL('gl-sm', S, 'sitemap.xml', 'なし'));
  else {
    const c = fs.readFileSync(smP, 'utf-8');
    if (!c.includes('<urlset')) r.push(FAIL('gl-sm', S, 'sitemap.xml', 'urlsetなし'));
    else if (!c.includes(DOMAIN)) r.push(FAIL('gl-sm', S, 'sitemap.xml', 'ドメイン不一致'));
    else if (c.includes('harton.netlify.app')) r.push(FAIL('gl-sm', S, 'sitemap.xml', '旧ドメイン残存'));
    else r.push(PASS('gl-sm', S, 'sitemap.xml'));
    if (!c.includes('<lastmod>')) r.push(WARN('gl-sm-lm', S, 'sitemap lastmod'));
  }

  // robots.txt
  const rbP = path.join(ROOT, 'robots.txt');
  if (!fs.existsSync(rbP)) r.push(FAIL('gl-rb', S, 'robots.txt', 'なし'));
  else {
    const c = fs.readFileSync(rbP, 'utf-8');
    const issues = [];
    if (!c.includes('User-agent:')) issues.push('User-agentなし');
    if (!c.includes('Sitemap:')) issues.push('Sitemapなし');
    else if (!c.includes(DOMAIN)) issues.push('ドメイン不一致');
    if (!c.includes('Disallow: /ogp.html')) issues.push('ogp.html未除外');
    r.push(issues.length === 0 ? PASS('gl-rb', S, 'robots.txt') : FAIL('gl-rb', S, 'robots.txt', issues.join(',')));
  }

  // コントラスト比
  const combos = [
    { bg: '#0f172a', fg: '#cbd5e1', lbl: 'dark-900+dark-300(本文)', min: 4.5 },
    { bg: '#0f172a', fg: '#ffffff', lbl: 'dark-900+white(見出し)', min: 4.5 },
    { bg: '#0f172a', fg: '#94a3b8', lbl: 'dark-900+dark-400(補足)', min: 3.0 },
    { bg: '#ffffff', fg: '#334155', lbl: 'white+dark-700(ライト本文)', min: 4.5 },
    { bg: '#ffffff', fg: '#1e293b', lbl: 'white+dark-800(ライト見出し)', min: 4.5 },
    { bg: '#0d9ed8', fg: '#ffffff', lbl: 'sky-500+white(ボタン大文字)', min: 3.0 },
  ];
  combos.forEach(c => {
    const cr = contrast(c.bg, c.fg);
    r.push(cr >= c.min
      ? PASS('gl-ct', S, `コントラスト ${c.lbl}`, `${cr.toFixed(1)}:1`)
      : FAIL('gl-ct', S, `コントラスト ${c.lbl}`, `${cr.toFixed(1)}:1 (必要${c.min}:1)`));
  });

  return r;
}

// ═══════════════════ ファイル検証 ═══════════════════

function verify(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const pt = PAGE_TYPE[rel] || 'minimal';
  const variant = getVariant(rel);
  const html = fs.readFileSync(filePath, 'utf-8');
  return {
    file: rel, pt, variant,
    results: [
      ...c11_1(html, pt),
      ...c11_2(html, pt),
      ...c11_4(html, pt),
      ...c11_5(html),
      ...c11_6(html, pt),
      ...c11_7_mobile(html, pt),
      ...c11_8_google(html, pt),
      ...cGeo(html, pt),
      ...cSpec(html, pt, variant),
    ],
  };
}

// ═══════════════════ レポート出力 ═══════════════════

function report(all) {
  let tP = 0, tF = 0, tW = 0, tS = 0;
  all.forEach(f => f.results.forEach(r => {
    if (r.status === 'PASS') tP++; else if (r.status === 'FAIL') tF++;
    else if (r.status === 'WARN') tW++; else tS++;
  }));

  console.log('\n' + '='.repeat(72));
  console.log('  SPEC.md v2.4 完全自動検証レポート');
  console.log('  検証日時: ' + new Date().toISOString());
  console.log('  チェックリスト: 11.1(6)+11.2(12)+11.3(3)+11.4(7)+11.5(7)+11.6(4)+11.7モバイル+11.8Google+11.9(2)');
  console.log('                 + GEO/LLMO(G-1〜G-6) + SPEC本文 + グローバル + コントラスト比');
  console.log('                 GEO典拠: Aggarwal et al. KDD2024 arXiv:2311.09735');
  console.log('='.repeat(72));

  for (const f of all) {
    const fails = f.results.filter(r => r.status === 'FAIL');
    const warns = f.results.filter(r => r.status === 'WARN');
    const p = f.results.filter(r => r.status === 'PASS').length;
    const s = f.results.filter(r => r.status === 'SKIP').length;
    console.log(`\n${fails.length === 0 ? '✅' : '❌'} ${f.file} [${f.pt}]`);
    console.log(`   PASS:${p}  FAIL:${fails.length}  WARN:${warns.length}  SKIP:${s}`);
    if (fails.length) { console.log('   --- FAIL ---'); fails.forEach(r => console.log(`   ❌ [${r.id}] ${r.name}${r.detail ? ' → ' + r.detail : ''}`)); }
    if (warns.length) { console.log('   --- WARN ---'); warns.forEach(r => console.log(`   ⚠️  [${r.id}] ${r.name}${r.detail ? ' → ' + r.detail : ''}`)); }
  }

  // セクション別
  console.log('\n' + '-'.repeat(72));
  const secs = {};
  all.forEach(f => f.results.forEach(r => {
    if (!secs[r.sec]) secs[r.sec] = { p: 0, f: 0, w: 0, s: 0 };
    secs[r.sec][r.status === 'PASS' ? 'p' : r.status === 'FAIL' ? 'f' : r.status === 'WARN' ? 'w' : 's']++;
  }));
  for (const [s, c] of Object.entries(secs))
    console.log(`  ${c.f === 0 ? '✅' : '❌'} ${s}: P=${c.p} F=${c.f} W=${c.w} S=${c.s}`);

  console.log('\n' + '='.repeat(72));
  console.log(`  検証項目: ${tP + tF + tW + tS}`);
  console.log(`  ✅ PASS: ${tP}  ❌ FAIL: ${tF}  ⚠️ WARN: ${tW}  ⏭️ SKIP: ${tS}`);
  console.log(`  合格率: ${((tP / (tP + tF)) * 100).toFixed(1)}%`);
  console.log(tF === 0 ? '\n  🏆 S-RANK 合格！全FAIL項目ゼロ' : `\n  ❌ 不合格: ${tF}件のFAILを修正してください`);
  console.log('='.repeat(72) + '\n');
  return tF;
}

// ═══════════════════ main ═══════════════════

function main() {
  const args = process.argv.slice(2);
  const files = args.length > 0
    ? args.map(f => path.resolve(f))
    : TARGET_FILES.map(f => path.join(ROOT, f));

  const miss = files.filter(f => !fs.existsSync(f));
  if (miss.length) { miss.forEach(f => console.error('  NOT FOUND: ' + f)); process.exit(1); }

  const all = files.map(f => verify(f));

  // 11.3 E-E-A-Tコンテンツ（グローバル）
  all.push({ file: '[11.3 E-E-A-Tコンテンツ]', pt: 'global', results: c11_3_eeat() });

  // 11.9 追加要件（グローバル）
  all.push({ file: '[11.9 追加要件]', pt: 'global', results: c11_7() });

  // グローバル(sitemap/robots/コントラスト)
  all.push({ file: '[グローバル] sitemap+robots+コントラスト', pt: 'global', results: cGlobal() });

  process.exit(report(all) > 0 ? 1 : 0);
}

main();
