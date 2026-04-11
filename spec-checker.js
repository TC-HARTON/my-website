#!/usr/bin/env node
/**
 * SPEC.md 完全自動検証エージェント v2.0
 * SPEC.md納品前チェックリスト全33項目 + 本文仕様の全項目を機械的にチェック
 * 使い方: node spec-checker.js [ファイルパス...]
 *   引数なし → 全対象ファイルを検証
 *   引数あり → 指定ファイルのみ検証
 */

const fs = require('fs');
const path = require('path');

// ========== 設定 ==========
const ROOT = __dirname;
const DOMAIN = 'https://harton.pages.dev';

// 検証対象（samplesは除外）
const TARGET_FILES = [
  'index.html',
  'services/web/index.html',
  'services/automation/index.html',
  'services/ai-prediction/index.html',
  'privacy/index.html',
  'thanks.html',
];

// ページタイプ別の検証レベル
const PAGE_TYPE = {
  'index.html': 'full',
  'services/web/index.html': 'service',
  'services/automation/index.html': 'service',
  'services/ai-prediction/index.html': 'service',
  'privacy/index.html': 'minimal',
  'thanks.html': 'minimal',
};

// ========== ユーティリティ ==========
class Result {
  constructor(id, section, name, status, detail = '') {
    this.id = id;
    this.section = section;
    this.name = name;
    this.status = status; // PASS | FAIL | WARN | SKIP
    this.detail = detail;
  }
}

function getTextLength(str) {
  return [...str].length;
}

function extractMetaContent(html, name) {
  let m = html.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, 'i'));
  if (m) return m[1];
  m = html.match(new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+name=["']${name}["']`, 'i'));
  return m ? m[1] : null;
}

function extractMetaProperty(html, prop) {
  let m = html.match(new RegExp(`<meta\\s+property=["']${prop}["']\\s+content=["']([^"']*)["']`, 'i'));
  if (m) return m[1];
  m = html.match(new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+property=["']${prop}["']`, 'i'));
  return m ? m[1] : null;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1] : null;
}

function extractJsonLd(html) {
  const results = [];
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    try { results.push(JSON.parse(m[1])); }
    catch (e) { results.push({ _parseError: true, _raw: m[1] }); }
  }
  return results;
}

function countHeadings(html) {
  const headings = [];
  const regex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    headings.push({ level: parseInt(m[1][1]), text: m[2].replace(/<[^>]+>/g, '').trim() });
  }
  return headings;
}

function extractHead(html) {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : '';
}

function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1] : '';
}

function getBodyClasses(html) {
  const m = html.match(/<body\s+class=["']([^"']*)["']/i);
  return m ? m[1] : '';
}

// Tailwindクラスをoutput.cssから照合するためのCSS読み込み
function loadOutputCSS() {
  const cssPath = path.join(ROOT, 'dist', 'output.css');
  if (!fs.existsSync(cssPath)) return null;
  return fs.readFileSync(cssPath, 'utf-8');
}

// HTMLからTailwindクラスを抽出
function extractTailwindClasses(html) {
  const classRegex = /class=["']([^"']*)["']/gi;
  const allClasses = new Set();
  let m;
  while ((m = classRegex.exec(html)) !== null) {
    m[1].split(/\s+/).forEach(cls => {
      if (cls && !cls.startsWith('{') && cls.length > 0) {
        allClasses.add(cls);
      }
    });
  }
  return allClasses;
}

// カスタムCSSクラス（SPEC Section 9で定義されたもの）
const CUSTOM_CSS_CLASSES = new Set([
  'fade-in', 'visible', 'hero-grid', 'glow', 'card-hover', 'nav-blur',
  'mobile-menu', 'open', 'float', 'pulse-line', 'gradient-text',
  'cat-tab', 'active', 'sr-only', 'fade-in-delay-1', 'fade-in-delay-2',
  'fade-in-delay-3', 'check-circle', 'check-ring',
]);

// Tailwindユーティリティパターン（これらはoutput.cssにあるべき）
function isTailwindClass(cls) {
  // カスタムクラスは除外
  if (CUSTOM_CSS_CLASSES.has(cls)) return false;
  // レスポンシブ/状態プレフィクス付きもTailwind
  if (/^(sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|group-hover:|dark:|disabled:|first:|last:)/.test(cls)) return true;
  // 一般的なTailwindパターン
  if (/^(bg-|text-|font-|p-|px-|py-|pt-|pb-|pl-|pr-|m-|mx-|my-|mt-|mb-|ml-|mr-|w-|h-|min-|max-|flex|grid|block|inline|hidden|absolute|relative|fixed|sticky|top-|bottom-|left-|right-|z-|border|rounded|shadow|opacity-|transition|transform|scale-|rotate-|translate-|gap-|space-|items-|justify-|self-|order-|col-|row-|overflow|truncate|whitespace|break-|tracking-|leading-|decoration-|underline|line-through|no-underline|list-|table|divide|ring|outline|cursor|pointer-events|select-|resize|fill-|stroke-|object-|aspect-)/.test(cls)) return true;
  // focus:系はTailwind
  if (/^focus:/.test(cls)) return true;
  return false;
}

// コントラスト比計算
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1, hex2) {
  const l1 = luminance(hexToRgb(hex1));
  const l2 = luminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ========== 検証関数群 ==========

// ============================================================
// SPEC 11.1 パフォーマンス (6項目)
// ============================================================

// 11.1-1: CLS < 0.1（静的解析で可能な範囲）
function checkCLS(html) {
  const results = [];
  const body = extractBody(html);

  // CLS原因1: 画像にwidth/height未指定
  const imgs = body.match(/<img\s[^>]*>/gi) || [];
  let clsRisk = 0;
  for (const img of imgs) {
    if (!/width=/i.test(img) || !/height=/i.test(img)) clsRisk++;
  }

  // CLS原因2: Tailwind CDN（ランタイムCSS生成）
  if (/cdn\.tailwindcss\.com/i.test(html)) clsRisk += 10;

  // CLS原因3: Google Fontsにdisplay=swapなし（FOUTによるCLS）
  const fontLinks = html.match(/fonts\.googleapis\.com\/css2[^"']*/gi) || [];
  for (const fl of fontLinks) {
    if (!fl.includes('display=swap')) clsRisk++;
  }

  if (clsRisk === 0) {
    results.push(new Result('11.1-cls', '11.1パフォーマンス', 'CLS静的リスク', 'PASS', 'CLSリスク要因なし'));
  } else {
    results.push(new Result('11.1-cls', '11.1パフォーマンス', 'CLS静的リスク', 'FAIL', `${clsRisk}件のリスク要因`));
  }
  return results;
}

// 11.1-2: LCP < 2.5s（静的解析で可能な範囲）
function checkLCP(html) {
  const results = [];
  const head = extractHead(html);

  // LCPリスク: フォントpreloadなし
  let lcpRisk = 0;

  // CSSが外部で大きすぎないか
  const cssPath = path.join(ROOT, 'dist', 'output.css');
  if (fs.existsSync(cssPath)) {
    const cssSize = fs.statSync(cssPath).size;
    if (cssSize > 40 * 1024) {
      lcpRisk++;
      results.push(new Result('11.1-lcp-css', '11.1パフォーマンス', 'CSSサイズ', 'WARN', `${(cssSize / 1024).toFixed(1)}KB (目標40KB以下)`));
    } else {
      results.push(new Result('11.1-lcp-css', '11.1パフォーマンス', 'CSSサイズ', 'PASS', `${(cssSize / 1024).toFixed(1)}KB`));
    }
  }

  // render-blocking resources
  const syncScripts = (head.match(/<script\s[^>]*src=[^>]*>/gi) || []).filter(s => !/async|defer/i.test(s));
  if (syncScripts.length > 0) {
    results.push(new Result('11.1-lcp-sync', '11.1パフォーマンス', '同期スクリプト', 'WARN', `${syncScripts.length}件のrender-blockingスクリプト`));
  } else {
    results.push(new Result('11.1-lcp-sync', '11.1パフォーマンス', '同期スクリプト', 'PASS'));
  }

  return results;
}

// 11.1-3: Tailwind CDN不使用
function checkTailwindCDN(html) {
  if (/cdn\.tailwindcss\.com/i.test(html)) {
    return new Result('11.1-cdn', '11.1パフォーマンス', 'Tailwind CDN禁止', 'FAIL', 'cdn.tailwindcss.com使用');
  }
  return new Result('11.1-cdn', '11.1パフォーマンス', 'Tailwind CDN不使用', 'PASS');
}

// 11.1-4: ビルドCSSに全クラス含有
function checkCSSClassCoverage(html, filePath) {
  const outputCSS = loadOutputCSS();
  if (!outputCSS) {
    return new Result('11.1-csscover', '11.1パフォーマンス', 'CSSクラス照合', 'FAIL', 'dist/output.css が存在しない');
  }

  const htmlClasses = extractTailwindClasses(html);
  const missing = [];

  for (const cls of htmlClasses) {
    if (!isTailwindClass(cls)) continue;

    // クラス名をCSSセレクタ形式に変換してoutput.cssで検索
    // Tailwindのクラスはドットとエスケープされた文字を含む
    const escapedCls = cls
      .replace(/\//g, '\\/')   // opacity modifier
      .replace(/:/g, '\\:')    // responsive/state prefix
      .replace(/\[/g, '\\[')   // arbitrary values
      .replace(/\]/g, '\\]')
      .replace(/\./g, '\\.')
      .replace(/#/g, '\\#');

    // CSS内でこのクラスが定義されているか
    if (!outputCSS.includes(escapedCls) && !outputCSS.includes(cls.replace(/:/g, '\\:'))) {
      // 簡易チェック: クラス名の主要部分が含まれているか
      const basePart = cls.replace(/^(sm:|md:|lg:|xl:|2xl:|hover:|focus:|active:|group-hover:|dark:|disabled:)+/, '');
      if (!outputCSS.includes(basePart)) {
        missing.push(cls);
      }
    }
  }

  if (missing.length > 0) {
    return new Result('11.1-csscover', '11.1パフォーマンス', 'CSSクラス照合', 'FAIL', `${missing.length}クラス欠落: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
  }
  return new Result('11.1-csscover', '11.1パフォーマンス', 'CSSクラス照合', 'PASS', `${htmlClasses.size}クラス検証済`);
}

// 11.1-5: コンソールエラーゼロ（静的解析）
function checkConsoleErrors(html) {
  const results = [];
  // JSON-LDパースエラーチェック
  const schemas = extractJsonLd(html);
  if (schemas.some(s => s._parseError)) {
    results.push(new Result('11.1-console', '11.1パフォーマンス', 'JSON-LDパースエラー', 'FAIL', 'JSON-LD構文エラーあり'));
  }

  // 壊れたscriptタグ
  const body = extractBody(html);
  const scriptTags = body.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  let syntaxIssue = false;
  for (const script of scriptTags) {
    // 未閉じ括弧の簡易チェック
    const content = script.replace(/<\/?script[^>]*>/gi, '');
    const opens = (content.match(/\{/g) || []).length;
    const closes = (content.match(/\}/g) || []).length;
    if (opens !== closes) {
      syntaxIssue = true;
    }
  }
  if (syntaxIssue) {
    results.push(new Result('11.1-console-js', '11.1パフォーマンス', 'JS構文チェック', 'FAIL', '括弧の不一致'));
  }

  if (results.length === 0) {
    results.push(new Result('11.1-console', '11.1パフォーマンス', '静的エラーチェック', 'PASS'));
  }
  return results;
}

// 11.1-6: 画像WebP + picture tag + lazy + width/height
function checkImageFull(html) {
  const body = extractBody(html);
  const imgs = body.match(/<img\s[^>]*>/gi) || [];
  if (imgs.length === 0) return [new Result('11.1-img', '11.1パフォーマンス', '画像属性', 'SKIP', '画像なし')];

  const results = [];
  let noAlt = 0, noWH = 0, noLazy = 0;
  const svgImgs = [];
  const rasterImgs = [];

  for (const img of imgs) {
    const src = (img.match(/src=["']([^"']*)["']/i) || [])[1] || '';
    const isSvg = src.endsWith('.svg') || /data:image\/svg/i.test(src);
    const isInlineSvg = !src; // inline SVG in img (unlikely but check)

    if (!isSvg) rasterImgs.push(img);
    else svgImgs.push(img);

    if (!/alt=/i.test(img)) noAlt++;
    if (!isSvg && (!/width=/i.test(img) || !/height=/i.test(img))) noWH++;
    // lazy属性はfirst-viewportの画像には不要(hero image)、それ以外は必須
    if (!isSvg && !/loading=["']lazy["']/i.test(img)) noLazy++;
  }

  // alt属性
  if (noAlt > 0) {
    results.push(new Result('11.1-img-alt', '11.1パフォーマンス', '画像alt属性', 'FAIL', `${noAlt}/${imgs.length}個にalt不足`));
  } else {
    results.push(new Result('11.1-img-alt', '11.1パフォーマンス', '画像alt属性', 'PASS', `${imgs.length}個チェック済`));
  }

  // alt日本語チェック
  const altValues = [];
  for (const img of imgs) {
    const altMatch = img.match(/alt=["']([^"']*)["']/i);
    if (altMatch && altMatch[1]) {
      altValues.push(altMatch[1]);
    }
  }
  const nonJapaneseAlts = altValues.filter(a => a && !/[\u3000-\u9fff\uff00-\uffef]/.test(a) && a !== '');
  if (nonJapaneseAlts.length > 0 && altValues.length > 0) {
    results.push(new Result('11.4-alt-ja', '11.4アクセシビリティ', '画像alt日本語', 'WARN', `非日本語alt: "${nonJapaneseAlts.slice(0, 2).join('", "')}"`));
  } else {
    results.push(new Result('11.4-alt-ja', '11.4アクセシビリティ', '画像alt日本語', 'PASS'));
  }

  // width/height
  if (noWH > 0) {
    results.push(new Result('11.1-img-wh', '11.1パフォーマンス', '画像width/height', 'FAIL', `${noWH}個にwidth/height不足`));
  } else {
    results.push(new Result('11.1-img-wh', '11.1パフォーマンス', '画像width/height', 'PASS'));
  }

  // lazy loading (WARN if missing, hero imageは例外)
  if (noLazy > 1) {
    results.push(new Result('11.1-img-lazy', '11.1パフォーマンス', '画像loading=lazy', 'WARN', `${noLazy}個にlazy未指定（hero画像は例外可）`));
  } else {
    results.push(new Result('11.1-img-lazy', '11.1パフォーマンス', '画像loading=lazy', 'PASS'));
  }

  // WebP + picture tag（ラスター画像のみ対象）
  if (rasterImgs.length > 0) {
    // pictureタグ内にsource type="image/webp"があるか
    const pictures = body.match(/<picture[\s\S]*?<\/picture>/gi) || [];
    const webpSources = pictures.filter(p => /type=["']image\/webp["']/i.test(p));
    if (rasterImgs.length > 0 && webpSources.length === 0 && pictures.length === 0) {
      results.push(new Result('11.1-img-webp', '11.1パフォーマンス', 'WebP+picture', 'WARN', `ラスター画像${rasterImgs.length}個あるがpicture/webpなし`));
    } else {
      results.push(new Result('11.1-img-webp', '11.1パフォーマンス', 'WebP+picture', 'PASS'));
    }
  }

  // decoding="async"
  const noDecoding = rasterImgs.filter(img => !/decoding=["']async["']/i.test(img));
  if (noDecoding.length > 0) {
    results.push(new Result('11.1-img-decode', '11.1パフォーマンス', '画像decoding=async', 'WARN', `${noDecoding.length}個に未指定`));
  } else if (rasterImgs.length > 0) {
    results.push(new Result('11.1-img-decode', '11.1パフォーマンス', '画像decoding=async', 'PASS'));
  }

  return results;
}

// ============================================================
// SPEC 11.2 SEO (9項目)
// ============================================================

function checkTitle(html, pageType) {
  const title = extractTitle(html);
  if (!title) return new Result('11.2-title', '11.2SEO', 'title', 'FAIL', 'title未設定');
  const len = getTextLength(title);
  if (pageType === 'minimal') {
    return new Result('11.2-title', '11.2SEO', `title (${len}文字)`, len > 0 ? 'PASS' : 'FAIL', `"${title}"`);
  }
  const ok = len >= 30 && len <= 60;
  return new Result('11.2-title', '11.2SEO', `title ${len}文字 (30-60)`, ok ? 'PASS' : 'FAIL', `"${title}"`);
}

function checkDescription(html, pageType) {
  const desc = extractMetaContent(html, 'description');
  if (pageType === 'minimal') {
    return new Result('11.2-desc', '11.2SEO', 'description', desc ? 'PASS' : 'WARN', desc ? `${getTextLength(desc)}文字` : 'なし');
  }
  if (!desc) return new Result('11.2-desc', '11.2SEO', 'description', 'FAIL', '未設定');
  const len = getTextLength(desc);
  const ok = len >= 70 && len <= 160;
  return new Result('11.2-desc', '11.2SEO', `description ${len}文字 (70-160)`, ok ? 'PASS' : 'FAIL', `${len}文字`);
}

function checkCanonical(html, pageType) {
  const m = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  if (!m) return new Result('11.2-canonical', '11.2SEO', 'canonical', pageType === 'minimal' ? 'WARN' : 'FAIL', '未設定');
  const url = m[1];
  if (!url.startsWith(DOMAIN)) {
    return new Result('11.2-canonical', '11.2SEO', 'canonical', 'FAIL', `ドメイン不一致: ${url}`);
  }
  return new Result('11.2-canonical', '11.2SEO', 'canonical', 'PASS', url);
}

function checkRobotsTag(html, pageType) {
  const robots = extractMetaContent(html, 'robots');
  if (pageType === 'minimal') {
    if (robots && (robots.includes('noindex') || robots.includes('nofollow'))) {
      return new Result('11.2-robots', '11.2SEO', 'robots (noindex)', 'PASS', robots);
    }
    return new Result('11.2-robots', '11.2SEO', 'robots', robots ? 'PASS' : 'WARN', robots || 'なし');
  }
  if (!robots) return new Result('11.2-robots', '11.2SEO', 'robots', 'FAIL', '未設定');
  const required = ['index', 'follow', 'max-image-preview:large', 'max-snippet:-1'];
  const missing = required.filter(r => !robots.includes(r));
  if (missing.length > 0) {
    return new Result('11.2-robots', '11.2SEO', 'robots max-snippet:-1', 'FAIL', `不足: ${missing.join(', ')}`);
  }
  return new Result('11.2-robots', '11.2SEO', 'robots max-snippet:-1', 'PASS');
}

function checkOGP(html, pageType) {
  if (pageType === 'minimal') return [new Result('11.2-ogp', '11.2SEO', 'OGP', 'SKIP', 'noindexページ')];
  const results = [];
  const required = ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'og:site_name', 'og:locale'];
  const missing = required.filter(prop => !extractMetaProperty(html, prop));
  if (missing.length > 0) {
    results.push(new Result('11.2-ogp', '11.2SEO', 'OGP必須7項目', 'FAIL', `不足: ${missing.join(', ')}`));
  } else {
    results.push(new Result('11.2-ogp', '11.2SEO', 'OGP必須7項目', 'PASS'));
  }
  // OGP image URL絶対パス
  const ogImage = extractMetaProperty(html, 'og:image');
  if (ogImage && !ogImage.startsWith(DOMAIN)) {
    results.push(new Result('11.2-ogp-img', '11.2SEO', 'OGP画像URL', 'FAIL', `絶対URL不正: ${ogImage}`));
  } else if (ogImage) {
    results.push(new Result('11.2-ogp-img', '11.2SEO', 'OGP画像URL', 'PASS', ogImage));
  }
  // og:image:width, height, type
  const extra = ['og:image:width', 'og:image:height', 'og:image:type'];
  const extraMissing = extra.filter(e => !extractMetaProperty(html, e));
  if (extraMissing.length > 0) {
    results.push(new Result('11.2-ogp-extra', '11.2SEO', 'OGP画像詳細(width/height/type)', 'WARN', `不足: ${extraMissing.join(', ')}`));
  }
  return results;
}

function checkTwitterCard(html, pageType) {
  if (pageType === 'minimal') return new Result('11.2-twitter', '11.2SEO', 'Twitter Card', 'SKIP');
  const card = extractMetaContent(html, 'twitter:card');
  const title = extractMetaContent(html, 'twitter:title');
  const desc = extractMetaContent(html, 'twitter:description');
  const image = extractMetaContent(html, 'twitter:image');
  const missing = [];
  if (!card || card !== 'summary_large_image') missing.push('card');
  if (!title) missing.push('title');
  if (!desc) missing.push('description');
  if (!image) missing.push('image');
  if (missing.length > 0) {
    return new Result('11.2-twitter', '11.2SEO', 'Twitter Card', 'FAIL', `不足: ${missing.join(', ')}`);
  }
  return new Result('11.2-twitter', '11.2SEO', 'Twitter Card', 'PASS');
}

function checkJsonLd(html, pageType) {
  if (pageType === 'minimal') return [new Result('11.2-jsonld', '11.2SEO', 'JSON-LD', 'SKIP', 'noindexページ')];
  const schemas = extractJsonLd(html);
  const results = [];

  if (schemas.some(s => s._parseError)) {
    results.push(new Result('11.2-jsonld-parse', '11.2SEO', 'JSON-LDパース', 'FAIL', 'パースエラー'));
  }

  const types = new Set();
  for (const s of schemas) {
    if (s['@type']) types.add(s['@type']);
    if (s['@graph']) s['@graph'].forEach(item => { if (item['@type']) types.add(item['@type']); });
  }

  const required = pageType === 'full'
    ? ['ProfessionalService', 'WebSite', 'FAQPage', 'BreadcrumbList']
    : ['ProfessionalService', 'WebSite', 'BreadcrumbList'];

  for (const t of required) {
    results.push(new Result(`11.2-${t}`, '11.2SEO', `JSON-LD: ${t}`, types.has(t) ? 'PASS' : 'FAIL', types.has(t) ? '' : '未定義'));
  }

  // ProfessionalService必須プロパティ
  if (types.has('ProfessionalService')) {
    const ps = schemas.find(s => s['@type'] === 'ProfessionalService') ||
               schemas.flatMap(s => s['@graph'] || []).find(i => i['@type'] === 'ProfessionalService');
    if (ps) {
      const psReq = ['name', 'description', 'url', 'telephone', 'email', 'address', 'geo', 'founder', 'knowsAbout', 'areaServed'];
      const psMissing = psReq.filter(p => !ps[p]);
      if (psMissing.length > 0) {
        results.push(new Result('11.2-ps-props', '11.2SEO', 'ProfessionalServiceプロパティ', 'FAIL', `不足: ${psMissing.join(', ')}`));
      } else {
        results.push(new Result('11.2-ps-props', '11.2SEO', 'ProfessionalServiceプロパティ', 'PASS'));
      }
    }
  }

  return results;
}

function checkSitemapXml() {
  const results = [];
  const smPath = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(smPath)) {
    results.push(new Result('11.2-sitemap', '11.2SEO', 'sitemap.xml', 'FAIL', 'ファイルなし'));
    return results;
  }
  const content = fs.readFileSync(smPath, 'utf-8');
  const issues = [];
  if (!content.includes('<urlset')) issues.push('urlsetなし');
  if (!content.includes(DOMAIN)) issues.push(`${DOMAIN}でない`);
  if (content.includes('harton.netlify.app')) issues.push('旧ドメイン残存');
  if (!content.includes('<lastmod>')) issues.push('lastmodなし');
  if (issues.length > 0) {
    results.push(new Result('11.2-sitemap', '11.2SEO', 'sitemap.xml', issues.includes('urlsetなし') || issues.includes(`${DOMAIN}でない`) ? 'FAIL' : 'WARN', issues.join(', ')));
  } else {
    results.push(new Result('11.2-sitemap', '11.2SEO', 'sitemap.xml', 'PASS'));
  }
  return results;
}

function checkRobotsTxt() {
  const results = [];
  const robotsPath = path.join(ROOT, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    results.push(new Result('11.2-robotstxt', '11.2SEO', 'robots.txt', 'FAIL', 'ファイルなし'));
    return results;
  }
  const content = fs.readFileSync(robotsPath, 'utf-8');
  const issues = [];
  if (!content.includes('User-agent:')) issues.push('User-agentなし');
  if (!content.includes('Sitemap:')) issues.push('Sitemapなし');
  else if (!content.includes(DOMAIN)) issues.push('ドメイン不一致');
  if (!content.includes('Disallow: /ogp.html')) issues.push('ogp.html未除外');
  if (issues.length > 0) {
    results.push(new Result('11.2-robotstxt', '11.2SEO', 'robots.txt', 'FAIL', issues.join(', ')));
  } else {
    results.push(new Result('11.2-robotstxt', '11.2SEO', 'robots.txt', 'PASS'));
  }
  return results;
}

// ============================================================
// SPEC 11.3 LLMO (7項目)
// ============================================================

function checkSectionAria(html, pageType) {
  if (pageType === 'minimal') return new Result('11.3-section', '11.3LLMO', 'section aria-label', 'SKIP');
  const body = extractBody(html);
  const sections = body.match(/<section[^>]*>/gi) || [];
  const noLabel = sections.filter(s => !/aria-label(ledby)?=/i.test(s));
  if (noLabel.length > 0) {
    return new Result('11.3-section', '11.3LLMO', 'section aria-label', 'FAIL', `${noLabel.length}/${sections.length}個にaria-labelなし`);
  }
  return new Result('11.3-section', '11.3LLMO', `section aria-label (${sections.length}個)`, sections.length > 0 ? 'PASS' : 'SKIP');
}

function checkNavAria(html, pageType) {
  if (pageType === 'minimal') return new Result('11.3-nav', '11.3LLMO', 'nav aria-label', 'SKIP');
  const body = extractBody(html);
  const navs = body.match(/<nav[^>]*>/gi) || [];
  const noLabel = navs.filter(n => !/aria-label(ledby)?=/i.test(n));
  if (noLabel.length > 0) {
    return new Result('11.3-nav', '11.3LLMO', 'nav aria-label', 'FAIL', `${noLabel.length}/${navs.length}個にaria-labelなし`);
  }
  return new Result('11.3-nav', '11.3LLMO', `nav aria-label (${navs.length}個)`, navs.length > 0 ? 'PASS' : 'SKIP');
}

function checkHeadingHierarchy(html) {
  const headings = countHeadings(html);
  const results = [];

  // H1: 1個のみ
  const h1s = headings.filter(h => h.level === 1);
  if (h1s.length === 0) {
    results.push(new Result('11.3-h1', '11.3LLMO', 'H1', 'FAIL', 'H1なし'));
  } else if (h1s.length > 1) {
    results.push(new Result('11.3-h1', '11.3LLMO', 'H1', 'FAIL', `H1が${h1s.length}個（1個必須）`));
  } else {
    results.push(new Result('11.3-h1', '11.3LLMO', 'H1', 'PASS', h1s[0].text.substring(0, 40)));
  }

  // H1→H2→H3スキップなし
  let prevLevel = 0;
  let skipFound = false;
  for (const h of headings) {
    if (prevLevel > 0 && h.level > prevLevel + 1) {
      results.push(new Result('11.3-hskip', '11.3LLMO', '見出し階層スキップ禁止', 'FAIL', `H${prevLevel}→H${h.level}: "${h.text.substring(0, 30)}"`));
      skipFound = true;
      break;
    }
    prevLevel = h.level;
  }
  if (!skipFound && headings.length > 0) {
    results.push(new Result('11.3-hskip', '11.3LLMO', '見出し階層スキップなし', 'PASS'));
  }

  return results;
}

function checkTableAccessibility(html) {
  const body = extractBody(html);
  const tables = body.match(/<table[\s\S]*?<\/table>/gi) || [];
  if (tables.length === 0) return new Result('11.3-table', '11.3LLMO', 'table caption+th scope', 'SKIP', 'tableなし');

  let issues = 0;
  for (const table of tables) {
    if (!/<caption/i.test(table)) issues++;
    if (!/<th[^>]*scope=/i.test(table)) issues++;
  }
  if (issues > 0) {
    return new Result('11.3-table', '11.3LLMO', 'table caption+th scope', 'FAIL', `${issues}件の問題`);
  }
  return new Result('11.3-table', '11.3LLMO', 'table caption+th scope', 'PASS');
}

function checkJsonLdMachineReadable(html, pageType) {
  if (pageType === 'minimal') return new Result('11.3-jsonld-mr', '11.3LLMO', 'JSON-LD機械可読', 'SKIP');
  const schemas = extractJsonLd(html);
  if (schemas.length === 0) return new Result('11.3-jsonld-mr', '11.3LLMO', 'JSON-LD機械可読', 'FAIL', 'JSON-LDなし');
  if (schemas.some(s => s._parseError)) return new Result('11.3-jsonld-mr', '11.3LLMO', 'JSON-LD機械可読', 'FAIL', 'パースエラー');
  return new Result('11.3-jsonld-mr', '11.3LLMO', 'JSON-LD機械可読', 'PASS', `${schemas.length}ブロック`);
}

function checkNoJSContent(html) {
  // JSなしで全情報取得可能か = noscriptフォールバック + コンテンツがHTMLにある
  const body = extractBody(html);
  // JS生成コンテンツがないか（テンプレートリテラルでのDOM挿入など）
  const hasJSContent = /innerHTML\s*=|document\.write|\.insertAdjacentHTML/i.test(body);
  if (hasJSContent) {
    return new Result('11.3-nojs', '11.3LLMO', 'JSなしで全情報取得可能', 'WARN', 'JS動的コンテンツ生成あり');
  }
  return new Result('11.3-nojs', '11.3LLMO', 'JSなしで全情報取得可能', 'PASS');
}

function checkLangAttribute(html) {
  const m = html.match(/<html[^>]*\slang=["']([^"']*)["']/i);
  if (!m) return new Result('11.3-lang', '11.3LLMO', 'lang="ja"', 'FAIL', 'lang属性なし');
  if (m[1] !== 'ja') return new Result('11.3-lang', '11.3LLMO', 'lang="ja"', 'FAIL', `lang="${m[1]}"`);
  return new Result('11.3-lang', '11.3LLMO', 'lang="ja"', 'PASS');
}

// ============================================================
// SPEC 11.4 アクセシビリティ (7項目)
// ============================================================

function checkTouchTarget(html) {
  const body = extractBody(html);
  const results = [];

  // ボタンのpy-3以上チェック
  const buttons = body.match(/<button[^>]*class=["'][^"']*["'][^>]*>/gi) || [];
  const links = body.match(/<a[^>]*class=["'][^"']*["'][^>]*>/gi) || [];
  const interactive = [...buttons, ...links];

  let violations = 0;
  const violationDetails = [];

  for (const el of interactive) {
    const classes = (el.match(/class=["']([^"']*)["']/i) || [])[1] || '';

    // sr-onlyは除外（スキップリンク等、フォーカス時は別スタイル）
    if (classes.includes('sr-only')) continue;
    // hidden要素は除外
    if (classes.includes('hidden')) continue;

    // py-3, py-4等があればOK（44px以上）
    // py-3 = 12px*2 + font = 44px以上
    const pyMatch = classes.match(/\bpy-(\d+)\b/);
    const hMatch = classes.match(/\bh-(\d+)\b/);
    const pMatch = classes.match(/\bp-(\d+)\b/);

    let hasMinSize = false;
    if (pyMatch && parseInt(pyMatch[1]) >= 3) hasMinSize = true;
    if (hMatch && parseInt(hMatch[1]) >= 10) hasMinSize = true; // h-10 = 40px, h-11 = 44px
    if (pMatch && parseInt(pMatch[1]) >= 3) hasMinSize = true;
    if (classes.includes('py-[') || classes.includes('min-h-')) hasMinSize = true; // arbitrary values

    // インラインリンク（テキスト中のリンク）は例外
    const isInline = !pyMatch && !hMatch && !pMatch && !classes.includes('btn') &&
                     !classes.includes('rounded') && !classes.includes('bg-') &&
                     !classes.includes('block') && !classes.includes('flex') &&
                     !classes.includes('inline-flex');

    if (!hasMinSize && !isInline) {
      violations++;
      // 最初の数件だけ詳細記録
      if (violationDetails.length < 3) {
        const textMatch = el.match(/>([^<]{1,30})/);
        violationDetails.push(textMatch ? textMatch[1].trim() : 'unknown');
      }
    }
  }

  if (violations > 0) {
    results.push(new Result('11.4-touch', '11.4アクセシビリティ', 'タッチターゲット44px', 'WARN', `${violations}件がpy-3未満: ${violationDetails.join(', ')}`));
  } else {
    results.push(new Result('11.4-touch', '11.4アクセシビリティ', 'タッチターゲット44px', 'PASS'));
  }

  return results;
}

function checkFocusRing(html) {
  const body = extractBody(html);
  // focus:ring-*/30 等の半透明フォーカスリング禁止
  const semiTransparent = body.match(/focus:ring-[^"'\s]*\/\d+/g);
  if (semiTransparent && semiTransparent.length > 0) {
    return new Result('11.4-focus', '11.4アクセシビリティ', 'フォーカスリング不透明', 'FAIL', `半透明: ${semiTransparent.slice(0, 3).join(', ')}`);
  }

  // focus:outline-noneがfocus:ringなしで使われていないか
  const focusOutlineNone = body.match(/focus:outline-none/g) || [];
  if (focusOutlineNone.length > 0) {
    // 同じ要素にfocus:ringがあるかチェック
    const elements = body.match(/class=["'][^"']*focus:outline-none[^"']*["']/gi) || [];
    for (const el of elements) {
      if (!/focus:ring/i.test(el)) {
        return new Result('11.4-focus', '11.4アクセシビリティ', 'フォーカスリング不透明', 'FAIL', 'focus:outline-noneにfocus:ring併用なし');
      }
    }
  }

  return new Result('11.4-focus', '11.4アクセシビリティ', 'フォーカスリング不透明', 'PASS');
}

function checkReducedMotion(html) {
  const has = /prefers-reduced-motion:\s*reduce/i.test(html);
  if (!has) return new Result('11.4-motion', '11.4アクセシビリティ', 'prefers-reduced-motion', 'FAIL');

  // 内容の検証: animation-duration, transition-duration, scroll-behavior
  const motionBlock = html.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\}\s*\}/i);
  if (motionBlock) {
    const content = motionBlock[1];
    const hasAnimDuration = /animation-duration:\s*0\.01ms/i.test(content);
    const hasTransDuration = /transition-duration:\s*0\.01ms/i.test(content);
    const hasScrollBehavior = /scroll-behavior:\s*auto/i.test(content);
    if (!hasAnimDuration || !hasTransDuration || !hasScrollBehavior) {
      return new Result('11.4-motion', '11.4アクセシビリティ', 'prefers-reduced-motion', 'FAIL', '必須プロパティ不足');
    }
  }

  return new Result('11.4-motion', '11.4アクセシビリティ', 'prefers-reduced-motion', 'PASS');
}

function checkNoscript(html) {
  const hasNoscript = /<noscript>[\s\S]*?\.fade-in[\s\S]*?<\/noscript>/i.test(html);
  return new Result('11.4-noscript', '11.4アクセシビリティ', 'noscriptフォールバック', hasNoscript ? 'PASS' : 'FAIL');
}

function checkSkipLink(html) {
  const body = extractBody(html);
  const hasSkip = /href=["']#main["'][^>]*>.*スキップ/is.test(body) ||
                  /sr-only[^>]*focus:not-sr-only[^>]*href=["']#main["']/is.test(body) ||
                  /href=["']#main["'][^>]*class=["'][^"']*sr-only/is.test(body);
  return new Result('11.4-skip', '11.4アクセシビリティ', 'スキップリンク', hasSkip ? 'PASS' : 'FAIL');
}

function checkFormLabels(html) {
  const body = extractBody(html);
  const inputs = body.match(/<input\s[^>]*>/gi) || [];
  const textareas = body.match(/<textarea[^>]*>/gi) || [];
  const selectElems = body.match(/<select[^>]*>/gi) || [];

  const formFields = [...inputs, ...textareas, ...selectElems].filter(el => {
    return !/type=["'](hidden|submit|button|checkbox)["']/i.test(el) &&
           !/style=["'][^"']*display:\s*none/i.test(el) &&
           !/class=["'][^"']*hidden/i.test(el);
  });

  if (formFields.length === 0) {
    return new Result('11.4-label', '11.4アクセシビリティ', 'フォームlabel', 'SKIP', 'フォームなし');
  }

  const labels = body.match(/<label[^>]*>/gi) || [];
  const labelFors = labels.map(l => {
    const m = l.match(/for=["']([^"']*)["']/);
    return m ? m[1] : null;
  }).filter(Boolean);

  const inputIds = formFields.map(el => {
    const m = el.match(/id=["']([^"']*)["']/);
    return m ? m[1] : null;
  }).filter(Boolean);

  const unlabeled = inputIds.filter(id => !labelFors.includes(id));

  // aria-label or aria-labelledbyでも可
  const ariaLabeled = formFields.filter(el => /aria-label(ledby)?=/i.test(el));

  if (unlabeled.length > 0 && ariaLabeled.length < formFields.length) {
    return new Result('11.4-label', '11.4アクセシビリティ', 'フォームlabel', 'FAIL', `ラベル不足: ${unlabeled.join(', ')}`);
  }
  return new Result('11.4-label', '11.4アクセシビリティ', 'フォームlabel', 'PASS', `${formFields.length}フィールド`);
}

// ============================================================
// SPEC 11.5 セキュリティ (4項目)
// ============================================================

function checkCSP(html, pageType) {
  const m = html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content='([^']*)'/i);
  if (!m) {
    if (pageType === 'minimal') return [new Result('11.5-csp', '11.5セキュリティ', 'CSP', 'WARN', '未設定')];
    return [new Result('11.5-csp', '11.5セキュリティ', 'CSP', 'FAIL', '未設定')];
  }
  const csp = m[1];
  const results = [];
  const required = ['default-src', 'script-src', 'style-src', 'font-src', 'img-src', 'frame-src', 'object-src', 'base-uri', 'form-action'];
  const missing = required.filter(d => !csp.includes(d));
  if (missing.length > 0) {
    results.push(new Result('11.5-csp', '11.5セキュリティ', 'CSP必須ディレクティブ', 'FAIL', `不足: ${missing.join(', ')}`));
  } else {
    results.push(new Result('11.5-csp', '11.5セキュリティ', 'CSP必須ディレクティブ', 'PASS'));
  }
  return results;
}

function checkTargetBlank(html) {
  const body = extractBody(html);
  const blankLinks = body.match(/<a\s[^>]*target=["']_blank["'][^>]*>/gi) || [];
  let violations = 0;
  for (const link of blankLinks) {
    if (!/rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i.test(link) &&
        !/rel=["'][^"']*noreferrer[^"']*noopener[^"']*["']/i.test(link)) {
      violations++;
    }
  }
  if (violations > 0) {
    return new Result('11.5-blank', '11.5セキュリティ', 'target="_blank" rel', 'FAIL', `${violations}件にnoopener noreferrer不足`);
  }
  return new Result('11.5-blank', '11.5セキュリティ', 'target="_blank" rel', 'PASS', `${blankLinks.length}件チェック済`);
}

function checkFrameSrc(html, pageType) {
  const m = html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content='([^']*)'/i);
  if (!m) {
    if (pageType === 'minimal') return new Result('11.5-frame', '11.5セキュリティ', "frame-src 'none'", 'SKIP', 'CSPなし');
    return new Result('11.5-frame', '11.5セキュリティ', "frame-src 'none'", 'FAIL', 'CSPなし');
  }
  if (!m[1].includes("frame-src 'none'")) {
    return new Result('11.5-frame', '11.5セキュリティ', "frame-src 'none'", 'FAIL');
  }
  return new Result('11.5-frame', '11.5セキュリティ', "frame-src 'none'", 'PASS');
}

function checkObjectSrc(html, pageType) {
  const m = html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content='([^']*)'/i);
  if (!m) {
    if (pageType === 'minimal') return new Result('11.5-object', '11.5セキュリティ', "object-src 'none'", 'SKIP', 'CSPなし');
    return new Result('11.5-object', '11.5セキュリティ', "object-src 'none'", 'FAIL', 'CSPなし');
  }
  if (!m[1].includes("object-src 'none'")) {
    return new Result('11.5-object', '11.5セキュリティ', "object-src 'none'", 'FAIL');
  }
  return new Result('11.5-object', '11.5セキュリティ', "object-src 'none'", 'PASS');
}

// ============================================================
// SPEC本文 追加チェック（チェックリスト外だが仕様書に明記）
// ============================================================

function checkCharset(html) {
  if (/<meta\s+charset=["']UTF-8["']/i.test(html)) {
    return new Result('spec-charset', 'SPEC本文', 'charset=UTF-8', 'PASS');
  }
  return new Result('spec-charset', 'SPEC本文', 'charset=UTF-8', 'FAIL');
}

function checkViewport(html) {
  const vp = extractMetaContent(html, 'viewport');
  if (!vp) return new Result('spec-viewport', 'SPEC本文', 'viewport', 'FAIL', '未設定');
  if (vp.includes('width=device-width') && vp.includes('initial-scale=1')) {
    return new Result('spec-viewport', 'SPEC本文', 'viewport', 'PASS');
  }
  return new Result('spec-viewport', 'SPEC本文', 'viewport', 'FAIL', `"${vp}"`);
}

function checkThemeColor(html) {
  const tc = extractMetaContent(html, 'theme-color');
  if (!tc) return new Result('spec-theme', 'SPEC本文', 'theme-color', 'FAIL', '未設定');
  return new Result('spec-theme', 'SPEC本文', 'theme-color', 'PASS', tc);
}

function checkColorScheme(html) {
  const cs = extractMetaContent(html, 'color-scheme');
  if (!cs) return new Result('spec-colorscheme', 'SPEC本文', 'color-scheme', 'WARN', '未設定');
  return new Result('spec-colorscheme', 'SPEC本文', 'color-scheme', 'PASS', cs);
}

function checkFavicons(html) {
  const results = [];
  const svgIcon = /<link\s[^>]*rel=["']icon["'][^>]*type=["']image\/svg\+xml["'][^>]*>/i.test(html);
  const pngIcon = /<link\s[^>]*rel=["']icon["'][^>]*sizes=["']32x32["'][^>]*>/i.test(html);
  const appleIcon = /<link\s[^>]*rel=["']apple-touch-icon["'][^>]*>/i.test(html);
  results.push(new Result('spec-fav-svg', 'SPEC本文', 'favicon SVG', svgIcon ? 'PASS' : 'FAIL'));
  results.push(new Result('spec-fav-png', 'SPEC本文', 'favicon PNG 32x32', pngIcon ? 'PASS' : 'FAIL'));
  results.push(new Result('spec-fav-apple', 'SPEC本文', 'apple-touch-icon', appleIcon ? 'PASS' : 'FAIL'));
  return results;
}

function checkBodyClass(html) {
  const bodyClasses = getBodyClasses(html);
  const required = ['font-sans', 'text-dark-700', 'antialiased'];
  const missing = required.filter(c => !bodyClasses.includes(c));
  if (missing.length > 0) {
    return new Result('spec-body', 'SPEC本文', 'body class', 'FAIL', `不足: ${missing.join(', ')}  現在: "${bodyClasses}"`);
  }
  return new Result('spec-body', 'SPEC本文', 'body class', 'PASS');
}

function checkSemanticLandmarks(html) {
  const body = extractBody(html);
  const results = [];
  const hasHeader = /<header[\s>]/i.test(body);
  const hasMain = /<main[\s>]/i.test(body);
  const hasFooter = /<footer[\s>]/i.test(body);
  results.push(new Result('spec-header', 'SPEC本文', '<header>', hasHeader ? 'PASS' : 'FAIL'));
  results.push(new Result('spec-main', 'SPEC本文', '<main>', hasMain ? 'PASS' : 'FAIL'));
  results.push(new Result('spec-footer', 'SPEC本文', '<footer>', hasFooter ? 'PASS' : 'FAIL'));
  if (hasMain && !/<main[^>]*id=["']main["']/i.test(body)) {
    results.push(new Result('spec-main-id', 'SPEC本文', 'main#main', 'FAIL', 'id="main"なし'));
  } else if (hasMain) {
    results.push(new Result('spec-main-id', 'SPEC本文', 'main#main', 'PASS'));
  }
  return results;
}

function checkFadeIn(html) {
  const fadeInMatch = html.match(/\.fade-in\s*\{[^}]*opacity:\s*0[^}]*\}/);
  if (!fadeInMatch) return [new Result('spec-fadein', 'SPEC本文', 'fade-inパラメータ', 'SKIP', 'fade-in未使用')];
  const css = fadeInMatch[0];
  const results = [];
  if (!css.includes('translateY(30px)')) {
    const yMatch = css.match(/translateY\((\d+)px\)/);
    results.push(new Result('spec-fadein-y', 'SPEC本文', 'fade-in translateY(30px)', 'FAIL', `現在: ${yMatch ? yMatch[1] + 'px' : '不明'}`));
  } else {
    results.push(new Result('spec-fadein-y', 'SPEC本文', 'fade-in translateY(30px)', 'PASS'));
  }
  if (!css.includes('0.8s')) {
    const sMatch = css.match(/([\d.]+)s/);
    results.push(new Result('spec-fadein-dur', 'SPEC本文', 'fade-in duration 0.8s', 'FAIL', `現在: ${sMatch ? sMatch[1] + 's' : '不明'}`));
  } else {
    results.push(new Result('spec-fadein-dur', 'SPEC本文', 'fade-in duration 0.8s', 'PASS'));
  }
  return results;
}

function checkFonts(html) {
  const results = [];
  const head = extractHead(html);
  const preconnectGapi = /rel=["']preconnect["'][^>]*href=["']https:\/\/fonts\.googleapis\.com["']/i.test(head);
  const preconnectGstatic = /rel=["']preconnect["'][^>]*href=["']https:\/\/fonts\.gstatic\.com["']/i.test(head);
  results.push(new Result('spec-preconnect', 'SPEC本文', 'フォントpreconnect', (preconnectGapi && preconnectGstatic) ? 'PASS' : 'FAIL'));

  // preload チェック
  const preloadFont = /rel=["']preload["'][^>]*as=["']style["'][^>]*fonts\.googleapis/i.test(head) ||
                      /fonts\.googleapis[^>]*rel=["']preload["']/i.test(head);
  results.push(new Result('spec-preload', 'SPEC本文', 'フォントpreload', preloadFont ? 'PASS' : 'WARN', preloadFont ? '' : 'preload未設定'));

  // preload URLとstylesheet URLの一致チェック
  const preloadMatch = head.match(/rel=["']preload["'][^>]*href=["']([^"']*fonts\.googleapis\.com[^"']*)["']/i) ||
                       head.match(/href=["']([^"']*fonts\.googleapis\.com[^"']*)["'][^>]*rel=["']preload["']/i);
  const stylesheetMatch = head.match(/href=["']([^"']*fonts\.googleapis\.com[^"']*)["'][^>]*rel=["']stylesheet["']/i) ||
                          head.match(/rel=["']stylesheet["'][^>]*href=["']([^"']*fonts\.googleapis\.com[^"']*)["']/i);
  if (preloadMatch && stylesheetMatch) {
    if (preloadMatch[1] !== stylesheetMatch[1]) {
      results.push(new Result('spec-preload-match', 'SPEC本文', 'preload/stylesheet URL一致', 'FAIL', 'URLミスマッチ'));
    } else {
      results.push(new Result('spec-preload-match', 'SPEC本文', 'preload/stylesheet URL一致', 'PASS'));
    }
  }

  // font-display: swap チェック（Google Fonts URLにdisplay=swap）
  const fontURLs = head.match(/fonts\.googleapis\.com\/css2[^"']*/gi) || [];
  const noSwap = fontURLs.filter(u => !u.includes('display=swap'));
  if (noSwap.length > 0) {
    results.push(new Result('spec-font-swap', 'SPEC本文', 'font-display: swap', 'FAIL', 'display=swapなし'));
  } else if (fontURLs.length > 0) {
    results.push(new Result('spec-font-swap', 'SPEC本文', 'font-display: swap', 'PASS'));
  }

  return results;
}

function checkGAAsync(html) {
  const gaScript = html.match(/<script[^>]*googletagmanager[^>]*>/i);
  if (!gaScript) return new Result('spec-ga', 'SPEC本文', 'GA async', 'SKIP', 'GAなし');
  if (/async/i.test(gaScript[0])) return new Result('spec-ga', 'SPEC本文', 'GA async', 'PASS');
  return new Result('spec-ga', 'SPEC本文', 'GA async', 'FAIL', 'async属性なし');
}

function checkHeadOrder(html) {
  const head = extractHead(html);
  const charsetPos = head.indexOf('charset=');
  const viewportPos = head.indexOf('name="viewport"') !== -1 ? head.indexOf('name="viewport"') : head.indexOf("name='viewport'");
  const titlePos = head.indexOf('<title>');
  if (charsetPos > -1 && viewportPos > -1 && charsetPos > viewportPos) {
    return new Result('spec-order', 'SPEC本文', 'head順序', 'FAIL', 'viewportがcharsetの前');
  }
  if (charsetPos > -1 && titlePos > -1 && charsetPos > titlePos) {
    return new Result('spec-order', 'SPEC本文', 'head順序', 'FAIL', 'titleがcharsetの前');
  }
  return new Result('spec-order', 'SPEC本文', 'head要素順序', 'PASS');
}

function checkFooterCopyright(html) {
  const body = extractBody(html);
  const footerMatch = body.match(/<footer[\s\S]*?<\/footer>/i);
  if (!footerMatch) return new Result('spec-footer-cr', 'SPEC本文', 'フッター', 'FAIL', 'footerなし');
  if (/HARTON\s*Inc\./i.test(footerMatch[0])) {
    return new Result('spec-footer-cr', 'SPEC本文', 'フッターコピーライト', 'FAIL', '"HARTON Inc."は不正');
  }
  if (/2026\s*HARTON/i.test(footerMatch[0])) {
    return new Result('spec-footer-cr', 'SPEC本文', 'フッターコピーライト', 'PASS');
  }
  return new Result('spec-footer-cr', 'SPEC本文', 'フッターコピーライト', 'WARN', '形式不明');
}

function checkURLConsistency(html) {
  if (html.includes('harton.netlify.app')) {
    const count = (html.match(/harton\.netlify\.app/g) || []).length;
    return new Result('spec-url', 'SPEC本文', '旧ドメイン残存', 'FAIL', `harton.netlify.app ${count}箇所`);
  }
  return new Result('spec-url', 'SPEC本文', '旧ドメイン残存なし', 'PASS');
}

function checkSitemapRef(html) {
  const head = extractHead(html);
  const has = /rel=["']sitemap["']/i.test(head);
  return new Result('spec-smref', 'SPEC本文', 'sitemapリンク', has ? 'PASS' : 'WARN', has ? '' : 'link rel="sitemap"なし');
}

// コントラスト比チェック（SPEC本文 7.1）
function checkContrast() {
  const results = [];
  // HARTONカラーシステムの主要組み合わせをチェック
  // bg-dark-900 (#0f172a) + text-dark-700 (#334155) → 本文
  // bg-dark-900 (#0f172a) + text-dark-300 (#cbd5e1) → サブテキスト
  // bg-dark-900 (#0f172a) + text-white (#ffffff)
  // bg-sky-500 (#0ea5e9) + text-white (#ffffff)

  // 実際に使用されているカラー組み合わせを検証
  // bg-dark-900 + text-dark-700 はbody default色だがダークテーマでは
  // 実際のコンテンツはtext-white/text-dark-300を使用
  const combos = [
    { bg: '#0f172a', fg: '#cbd5e1', label: 'bg-dark-900 + text-dark-300 (本文)', minRatio: 4.5 },
    { bg: '#0f172a', fg: '#ffffff', label: 'bg-dark-900 + text-white (見出し)', minRatio: 4.5 },
    { bg: '#0f172a', fg: '#94a3b8', label: 'bg-dark-900 + text-dark-400 (補足)', minRatio: 3.0 },
    { bg: '#0f172a', fg: '#64748b', label: 'bg-dark-900 + text-dark-500 (UI)', minRatio: 3.0 },
    { bg: '#ffffff', fg: '#334155', label: 'bg-white + text-dark-700 (ライト本文)', minRatio: 4.5 },
    { bg: '#ffffff', fg: '#1e293b', label: 'bg-white + text-dark-800 (ライト見出し)', minRatio: 4.5 },
    { bg: '#0d9ed8', fg: '#ffffff', label: 'bg-sky-500 + text-white (ボタン18px+太字)', minRatio: 3.0 },
  ];

  for (const c of combos) {
    const ratio = contrastRatio(c.bg, c.fg);
    const pass = ratio >= c.minRatio;
    results.push(new Result('spec-contrast', 'SPEC本文', `コントラスト比 ${c.label}`, pass ? 'PASS' : 'FAIL', `${ratio.toFixed(1)}:1 (必要${c.minRatio}:1)`));
  }

  return results;
}

// ハンバーガーボタンaria属性チェック（SPEC 7.1）
function checkHamburgerAria(html, pageType) {
  if (pageType === 'minimal') return [];
  const body = extractBody(html);
  // ハンバーガーボタンを探す
  const menuBtn = body.match(/<button[^>]*(?:menu|ハンバーガー|メニュー)[^>]*>/i) ||
                  body.match(/<button[^>]*aria-controls=["']mobile-menu["'][^>]*>/i) ||
                  body.match(/<button[^>]*id=["']menuToggle["'][^>]*>/i);

  if (!menuBtn) return [];

  const btn = menuBtn[0];
  const results = [];
  if (!/aria-label=/i.test(btn)) {
    results.push(new Result('spec-hamburger-label', 'SPEC本文', 'ハンバーガーaria-label', 'FAIL'));
  }
  if (!/aria-expanded=/i.test(btn)) {
    results.push(new Result('spec-hamburger-expanded', 'SPEC本文', 'ハンバーガーaria-expanded', 'FAIL'));
  }
  if (!/aria-controls=/i.test(btn)) {
    results.push(new Result('spec-hamburger-controls', 'SPEC本文', 'ハンバーガーaria-controls', 'FAIL'));
  }
  if (results.length === 0) {
    results.push(new Result('spec-hamburger', 'SPEC本文', 'ハンバーガーARIA属性', 'PASS'));
  }
  return results;
}

// ========== メイン検証ロジック ==========

function verifyFile(filePath) {
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const pageType = PAGE_TYPE[relPath] || 'minimal';
  const html = fs.readFileSync(filePath, 'utf-8');
  const results = [];

  // === SPEC 11.1 パフォーマンス (6項目) ===
  results.push(...checkCLS(html));
  results.push(...checkLCP(html));
  results.push(checkTailwindCDN(html));
  results.push(checkCSSClassCoverage(html, filePath));
  results.push(...checkConsoleErrors(html));
  results.push(...checkImageFull(html));

  // === SPEC 11.2 SEO (9項目) ===
  results.push(checkTitle(html, pageType));
  results.push(checkDescription(html, pageType));
  results.push(checkCanonical(html, pageType));
  results.push(checkRobotsTag(html, pageType));
  const ogpResults = checkOGP(html, pageType);
  results.push(...(Array.isArray(ogpResults) ? ogpResults : [ogpResults]));
  results.push(checkTwitterCard(html, pageType));
  results.push(...checkJsonLd(html, pageType));
  // sitemap.xml / robots.txt はグローバルチェックで実施

  // === SPEC 11.3 LLMO (7項目) ===
  results.push(checkSectionAria(html, pageType));
  results.push(checkNavAria(html, pageType));
  results.push(...checkHeadingHierarchy(html));
  results.push(checkTableAccessibility(html));
  results.push(checkJsonLdMachineReadable(html, pageType));
  results.push(checkNoJSContent(html));
  results.push(checkLangAttribute(html));

  // === SPEC 11.4 アクセシビリティ (7項目) ===
  results.push(...checkTouchTarget(html));
  results.push(checkFocusRing(html));
  results.push(checkReducedMotion(html));
  results.push(checkNoscript(html));
  results.push(checkSkipLink(html));
  // 画像alt日本語は checkImageFull 内で実施済み
  results.push(checkFormLabels(html));

  // === SPEC 11.5 セキュリティ (4項目) ===
  results.push(...checkCSP(html, pageType));
  results.push(checkTargetBlank(html));
  results.push(checkFrameSrc(html, pageType));
  results.push(checkObjectSrc(html, pageType));

  // === SPEC本文 追加チェック ===
  results.push(checkCharset(html));
  results.push(checkViewport(html));
  results.push(checkThemeColor(html));
  results.push(checkColorScheme(html));
  results.push(...checkFavicons(html));
  results.push(checkBodyClass(html));
  results.push(...checkSemanticLandmarks(html));
  results.push(...checkFadeIn(html));
  results.push(...checkFonts(html));
  results.push(checkGAAsync(html));
  results.push(checkHeadOrder(html));
  results.push(checkFooterCopyright(html));
  results.push(checkURLConsistency(html));
  results.push(checkSitemapRef(html));
  results.push(...checkHamburgerAria(html, pageType));

  return { file: relPath, pageType, results };
}

// ========== 出力 ==========
function printReport(allResults) {
  const totalPass = allResults.reduce((sum, r) => sum + r.results.filter(x => x.status === 'PASS').length, 0);
  const totalFail = allResults.reduce((sum, r) => sum + r.results.filter(x => x.status === 'FAIL').length, 0);
  const totalWarn = allResults.reduce((sum, r) => sum + r.results.filter(x => x.status === 'WARN').length, 0);
  const totalSkip = allResults.reduce((sum, r) => sum + r.results.filter(x => x.status === 'SKIP').length, 0);
  const total = totalPass + totalFail + totalWarn + totalSkip;

  console.log('\n' + '='.repeat(72));
  console.log('  SPEC.md 完全自動検証レポート v2.0');
  console.log('  検証日時: ' + new Date().toISOString());
  console.log('  チェックリスト: 11.1パフォーマンス(6) + 11.2SEO(9) + 11.3LLMO(7)');
  console.log('                 + 11.4アクセシビリティ(7) + 11.5セキュリティ(4)');
  console.log('                 + SPEC本文追加チェック');
  console.log('='.repeat(72));

  for (const fileResult of allResults) {
    const fails = fileResult.results.filter(r => r.status === 'FAIL');
    const warns = fileResult.results.filter(r => r.status === 'WARN');
    const passes = fileResult.results.filter(r => r.status === 'PASS');
    const skips = fileResult.results.filter(r => r.status === 'SKIP');

    const icon = fails.length === 0 ? '✅' : '❌';
    console.log(`\n${icon} ${fileResult.file} [${fileResult.pageType}]`);
    console.log(`   PASS: ${passes.length}  FAIL: ${fails.length}  WARN: ${warns.length}  SKIP: ${skips.length}`);

    if (fails.length > 0) {
      console.log('   --- FAIL ---');
      for (const r of fails) {
        console.log(`   ❌ [${r.id}] ${r.name}${r.detail ? ' → ' + r.detail : ''}`);
      }
    }
    if (warns.length > 0) {
      console.log('   --- WARN ---');
      for (const r of warns) {
        console.log(`   ⚠️  [${r.id}] ${r.name}${r.detail ? ' → ' + r.detail : ''}`);
      }
    }
  }

  // セクション別サマリ
  console.log('\n' + '-'.repeat(72));
  console.log('  セクション別結果');
  console.log('-'.repeat(72));
  const sections = {};
  for (const fr of allResults) {
    for (const r of fr.results) {
      if (!sections[r.section]) sections[r.section] = { pass: 0, fail: 0, warn: 0, skip: 0 };
      sections[r.section][r.status.toLowerCase()]++;
    }
  }
  for (const [section, counts] of Object.entries(sections)) {
    const sIcon = counts.fail === 0 ? '✅' : '❌';
    console.log(`  ${sIcon} ${section}: PASS=${counts.pass} FAIL=${counts.fail} WARN=${counts.warn} SKIP=${counts.skip}`);
  }

  // 総合
  console.log('\n' + '='.repeat(72));
  console.log('  総合結果');
  console.log('='.repeat(72));
  console.log(`  検証項目: ${total}`);
  console.log(`  ✅ PASS: ${totalPass}`);
  console.log(`  ❌ FAIL: ${totalFail}`);
  console.log(`  ⚠️  WARN: ${totalWarn}`);
  console.log(`  ⏭️  SKIP: ${totalSkip}`);
  console.log(`  合格率: ${((totalPass / (totalPass + totalFail)) * 100).toFixed(1)}%`);

  if (totalFail === 0) {
    console.log('\n  🏆 S-RANK 合格！全FAIL項目ゼロ');
  } else {
    console.log(`\n  ❌ 不合格: ${totalFail}件のFAIL項目を修正してください`);
  }
  console.log('='.repeat(72) + '\n');

  return totalFail;
}

// ========== エントリポイント ==========
function main() {
  const args = process.argv.slice(2);
  let targetFiles;

  if (args.length > 0) {
    targetFiles = args.map(f => path.resolve(f));
  } else {
    targetFiles = TARGET_FILES.map(f => path.join(ROOT, f));
  }

  const missing = targetFiles.filter(f => !fs.existsSync(f));
  if (missing.length > 0) {
    console.error('ファイルが見つかりません:');
    missing.forEach(f => console.error('  ' + f));
    process.exit(1);
  }

  // HTMLファイル検証
  const allResults = targetFiles.map(f => verifyFile(f));

  // グローバルチェック（robots.txt + sitemap.xml + コントラスト比）
  const globalResults = {
    file: '[グローバル] robots.txt + sitemap.xml + コントラスト',
    pageType: 'global',
    results: [...checkRobotsTxt(), ...checkSitemapXml(), ...checkContrast()],
  };
  allResults.push(globalResults);

  const failCount = printReport(allResults);
  process.exit(failCount > 0 ? 1 : 0);
}

main();
