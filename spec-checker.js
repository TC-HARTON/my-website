#!/usr/bin/env node
/**
 * SPEC.md 自動検証エージェント v1.0
 * 全HTMLファイルをSPEC.md 53項目に基づき機械的にチェック
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
  'index.html': 'full',                      // フルチェック
  'services/web/index.html': 'service',       // サービスページ
  'services/automation/index.html': 'service',
  'services/ai-prediction/index.html': 'service',
  'privacy/index.html': 'minimal',            // 最小チェック（noindex）
  'thanks.html': 'minimal',                   // 最小チェック（noindex）
};

// SPEC Section 9 許可カスタムCSS
const ALLOWED_CUSTOM_CSS = [
  'fade-in', 'hero-grid', 'glow', 'card-hover', 'nav-blur',
  'mobile-menu', 'float', 'pulse-line', 'gradient-text',
  'cat-tab', 'sr-only',
];

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
  // 日本語文字数カウント（全角=1, 半角=0.5として概算、ただしSPECは文字数）
  return [...str].length;
}

function extractTag(html, tag) {
  const regex = new RegExp(`<${tag}[^>]*>`, 'gi');
  return html.match(regex) || [];
}

function extractMetaContent(html, name) {
  // name属性
  let m = html.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, 'i'));
  if (m) return m[1];
  // content先のパターン
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
    try {
      results.push(JSON.parse(m[1]));
    } catch (e) {
      results.push({ _parseError: true, _raw: m[1] });
    }
  }
  return results;
}

function hasElement(html, selector) {
  // 簡易セレクタチェック
  if (selector.startsWith('<')) {
    return html.includes(selector);
  }
  return html.includes(selector);
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

// ========== 検証関数群 ==========

function checkHtmlLang(html, filePath) {
  const m = html.match(/<html[^>]*\slang=["']([^"']*)["']/i);
  if (!m) return new Result('3.2-lang', '3.HTML構造', 'lang="ja"', 'FAIL', 'lang属性なし');
  if (m[1] !== 'ja') return new Result('3.2-lang', '3.HTML構造', 'lang="ja"', 'FAIL', `lang="${m[1]}"`);
  return new Result('3.2-lang', '3.HTML構造', 'lang="ja"', 'PASS');
}

function checkCharset(html) {
  if (/<meta\s+charset=["']UTF-8["']/i.test(html)) {
    return new Result('3.1-charset', '3.HTML構造', 'charset=UTF-8', 'PASS');
  }
  return new Result('3.1-charset', '3.HTML構造', 'charset=UTF-8', 'FAIL', 'charset未設定');
}

function checkViewport(html) {
  const vp = extractMetaContent(html, 'viewport');
  if (!vp) return new Result('3.1-viewport', '3.HTML構造', 'viewport', 'FAIL', 'viewport未設定');
  if (vp.includes('width=device-width') && vp.includes('initial-scale=1')) {
    return new Result('3.1-viewport', '3.HTML構造', 'viewport', 'PASS');
  }
  return new Result('3.1-viewport', '3.HTML構造', 'viewport', 'FAIL', `viewport="${vp}"`);
}

function checkTitle(html, pageType) {
  const title = extractTitle(html);
  if (!title) return new Result('4.1-title', '4.SEO', 'title', 'FAIL', 'title未設定');
  const len = getTextLength(title);
  if (pageType === 'minimal') {
    return new Result('4.1-title', '4.SEO', `title (${len}文字)`, len > 0 ? 'PASS' : 'FAIL', `"${title}"`);
  }
  const ok = len >= 30 && len <= 60;
  return new Result('4.1-title', '4.SEO', `title ${len}文字 (30-60)`, ok ? 'PASS' : 'FAIL', `"${title}"`);
}

function checkDescription(html, pageType) {
  const desc = extractMetaContent(html, 'description');
  if (pageType === 'minimal') {
    return new Result('4.1-desc', '4.SEO', 'description', desc ? 'PASS' : 'WARN', desc ? `${getTextLength(desc)}文字` : 'なし');
  }
  if (!desc) return new Result('4.1-desc', '4.SEO', 'description', 'FAIL', '未設定');
  const len = getTextLength(desc);
  const ok = len >= 70 && len <= 160;
  return new Result('4.1-desc', '4.SEO', `description ${len}文字 (70-160)`, ok ? 'PASS' : 'FAIL', `${len}文字`);
}

function checkCanonical(html, pageType) {
  const m = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  if (!m) return new Result('4.1-canonical', '4.SEO', 'canonical', pageType === 'minimal' ? 'WARN' : 'FAIL', '未設定');
  const url = m[1];
  if (!url.startsWith(DOMAIN)) {
    return new Result('4.1-canonical', '4.SEO', 'canonical', 'FAIL', `ドメイン不一致: ${url}`);
  }
  return new Result('4.1-canonical', '4.SEO', 'canonical', 'PASS', url);
}

function checkRobots(html, pageType) {
  const robots = extractMetaContent(html, 'robots');
  if (pageType === 'minimal') {
    // noindex許可
    if (robots && (robots.includes('noindex') || robots.includes('nofollow'))) {
      return new Result('4.1-robots', '4.SEO', 'robots (noindex)', 'PASS', robots);
    }
    return new Result('4.1-robots', '4.SEO', 'robots', robots ? 'PASS' : 'WARN', robots || 'なし');
  }
  if (!robots) return new Result('4.1-robots', '4.SEO', 'robots', 'FAIL', '未設定');
  const required = ['index', 'follow', 'max-image-preview:large', 'max-snippet:-1'];
  const missing = required.filter(r => !robots.includes(r));
  if (missing.length > 0) {
    return new Result('4.1-robots', '4.SEO', 'robots', 'FAIL', `不足: ${missing.join(', ')}`);
  }
  return new Result('4.1-robots', '4.SEO', 'robots', 'PASS');
}

function checkOGP(html, pageType) {
  if (pageType === 'minimal') {
    return new Result('4.1-ogp', '4.SEO', 'OGP', 'SKIP', 'noindexページ');
  }
  const results = [];
  const required = [
    'og:title', 'og:description', 'og:type', 'og:url',
    'og:image', 'og:site_name', 'og:locale'
  ];
  const extra = ['og:image:width', 'og:image:height', 'og:image:type'];

  const missing = [];
  for (const prop of required) {
    const val = extractMetaProperty(html, prop);
    if (!val) missing.push(prop);
  }

  if (missing.length > 0) {
    results.push(new Result('4.1-ogp', '4.SEO', `OGP必須7項目`, 'FAIL', `不足: ${missing.join(', ')}`));
  } else {
    results.push(new Result('4.1-ogp', '4.SEO', 'OGP必須7項目', 'PASS'));
  }

  // OGP image URLチェック
  const ogImage = extractMetaProperty(html, 'og:image');
  if (ogImage && !ogImage.startsWith(DOMAIN)) {
    results.push(new Result('4.1-ogp-img', '4.SEO', 'OGP画像URL', 'FAIL', `絶対URL不正: ${ogImage}`));
  } else if (ogImage) {
    results.push(new Result('4.1-ogp-img', '4.SEO', 'OGP画像URL', 'PASS', ogImage));
  }

  // og:image:width, height, type
  const extraMissing = extra.filter(e => !extractMetaProperty(html, e));
  if (extraMissing.length > 0) {
    results.push(new Result('4.1-ogp-extra', '4.SEO', 'OGP画像詳細', 'WARN', `不足: ${extraMissing.join(', ')}`));
  }

  return results;
}

function checkTwitterCard(html, pageType) {
  if (pageType === 'minimal') return new Result('4.1-twitter', '4.SEO', 'Twitter Card', 'SKIP');
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
    return new Result('4.1-twitter', '4.SEO', 'Twitter Card', 'FAIL', `不足: ${missing.join(', ')}`);
  }
  return new Result('4.1-twitter', '4.SEO', 'Twitter Card', 'PASS');
}

function checkThemeColor(html) {
  const tc = extractMetaContent(html, 'theme-color');
  if (!tc) return new Result('3.1-theme', '3.HTML構造', 'theme-color', 'FAIL', '未設定');
  return new Result('3.1-theme', '3.HTML構造', 'theme-color', 'PASS', tc);
}

function checkColorScheme(html) {
  const cs = extractMetaContent(html, 'color-scheme');
  if (!cs) return new Result('3.1-colorscheme', '3.HTML構造', 'color-scheme', 'WARN', '未設定');
  return new Result('3.1-colorscheme', '3.HTML構造', 'color-scheme', 'PASS', cs);
}

function checkCSP(html, pageType) {
  // CSP content contains 'self' etc with single quotes inside double-quoted attribute
  const m = html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content='([^']*)'/i);
  if (!m) {
    if (pageType === 'minimal') return new Result('8.1-csp', '8.セキュリティ', 'CSP', 'WARN', '未設定');
    return new Result('8.1-csp', '8.セキュリティ', 'CSP', 'FAIL', '未設定');
  }
  const csp = m[1];
  const results = [];
  const required = ['default-src', 'script-src', 'style-src', 'font-src', 'img-src', 'frame-src', 'object-src', 'base-uri', 'form-action'];
  const missing = required.filter(d => !csp.includes(d));
  if (missing.length > 0) {
    results.push(new Result('8.1-csp', '8.セキュリティ', 'CSP必須ディレクティブ', 'FAIL', `不足: ${missing.join(', ')}`));
  } else {
    results.push(new Result('8.1-csp', '8.セキュリティ', 'CSP必須ディレクティブ', 'PASS'));
  }
  if (!csp.includes("frame-src 'none'")) {
    results.push(new Result('8.1-frame', '8.セキュリティ', "frame-src 'none'", 'FAIL'));
  }
  if (!csp.includes("object-src 'none'")) {
    results.push(new Result('8.1-object', '8.セキュリティ', "object-src 'none'", 'FAIL'));
  }
  return results;
}

function checkFavicons(html) {
  const results = [];
  const svgIcon = /<link\s[^>]*rel=["']icon["'][^>]*type=["']image\/svg\+xml["'][^>]*>/i.test(html);
  const pngIcon = /<link\s[^>]*rel=["']icon["'][^>]*sizes=["']32x32["'][^>]*>/i.test(html);
  const appleIcon = /<link\s[^>]*rel=["']apple-touch-icon["'][^>]*>/i.test(html);

  results.push(new Result('3.1-favicon-svg', '3.HTML構造', 'favicon SVG', svgIcon ? 'PASS' : 'FAIL'));
  results.push(new Result('3.1-favicon-png', '3.HTML構造', 'favicon PNG 32x32', pngIcon ? 'PASS' : 'FAIL'));
  results.push(new Result('3.1-favicon-apple', '3.HTML構造', 'apple-touch-icon', appleIcon ? 'PASS' : 'FAIL'));
  return results;
}

function checkJsonLd(html, pageType) {
  if (pageType === 'minimal') return [new Result('4.2-jsonld', '4.SEO', 'JSON-LD', 'SKIP', 'noindexページ')];

  const schemas = extractJsonLd(html);
  const results = [];

  if (schemas.some(s => s._parseError)) {
    results.push(new Result('4.2-jsonld-parse', '4.SEO', 'JSON-LDパース', 'FAIL', 'パースエラーあり'));
  }

  // @typeを収集（@graphも対応）
  const types = new Set();
  for (const s of schemas) {
    if (s['@type']) types.add(s['@type']);
    if (s['@graph']) {
      for (const item of s['@graph']) {
        if (item['@type']) types.add(item['@type']);
      }
    }
  }

  const required = pageType === 'full'
    ? ['ProfessionalService', 'WebSite', 'FAQPage', 'BreadcrumbList']
    : ['ProfessionalService', 'WebSite', 'BreadcrumbList']; // serviceページ

  for (const t of required) {
    if (types.has(t)) {
      results.push(new Result(`4.2-${t}`, '4.SEO', `JSON-LD: ${t}`, 'PASS'));
    } else {
      results.push(new Result(`4.2-${t}`, '4.SEO', `JSON-LD: ${t}`, 'FAIL', '未定義'));
    }
  }

  // ProfessionalServiceの必須プロパティチェック（fullのみ）
  if (pageType === 'full') {
    const ps = schemas.find(s => s['@type'] === 'ProfessionalService') ||
               schemas.flatMap(s => s['@graph'] || []).find(i => i['@type'] === 'ProfessionalService');
    if (ps) {
      const psRequired = ['name', 'description', 'url', 'telephone', 'email', 'address', 'geo', 'founder', 'knowsAbout', 'areaServed', 'hasOfferCatalog'];
      const psMissing = psRequired.filter(p => !ps[p]);
      if (psMissing.length > 0) {
        results.push(new Result('4.2-ps-props', '4.SEO', 'ProfessionalServiceプロパティ', 'FAIL', `不足: ${psMissing.join(', ')}`));
      } else {
        results.push(new Result('4.2-ps-props', '4.SEO', 'ProfessionalServiceプロパティ', 'PASS'));
      }
    }
  }

  return results;
}

function checkHeadings(html) {
  const headings = countHeadings(html);
  const results = [];

  // H1チェック
  const h1s = headings.filter(h => h.level === 1);
  if (h1s.length === 0) {
    results.push(new Result('3.3-h1', '3.HTML構造', 'H1', 'FAIL', 'H1なし'));
  } else if (h1s.length > 1) {
    results.push(new Result('3.3-h1', '3.HTML構造', 'H1', 'FAIL', `H1が${h1s.length}個（1個必須）`));
  } else {
    results.push(new Result('3.3-h1', '3.HTML構造', 'H1', 'PASS', h1s[0].text.substring(0, 40)));
  }

  // 階層スキップチェック
  let prevLevel = 0;
  let skipFound = false;
  for (const h of headings) {
    if (prevLevel > 0 && h.level > prevLevel + 1) {
      skipFound = true;
      results.push(new Result('3.3-skip', '3.HTML構造', '見出し階層スキップ', 'FAIL', `H${prevLevel}→H${h.level}: "${h.text.substring(0, 30)}"`));
      break;
    }
    prevLevel = h.level;
  }
  if (!skipFound && headings.length > 0) {
    results.push(new Result('3.3-skip', '3.HTML構造', '見出し階層スキップなし', 'PASS'));
  }

  return results;
}

function checkSemantics(html, pageType) {
  const results = [];
  const body = extractBody(html);

  // <header>, <main>, <footer> ランドマーク
  const hasHeader = /<header[\s>]/i.test(body);
  const hasMain = /<main[\s>]/i.test(body);
  const hasFooter = /<footer[\s>]/i.test(body);
  results.push(new Result('5.1-header', '5.LLMO', '<header>', hasHeader ? 'PASS' : 'FAIL'));
  results.push(new Result('5.1-main', '5.LLMO', '<main>', hasMain ? 'PASS' : 'FAIL'));
  results.push(new Result('5.1-footer', '5.LLMO', '<footer>', hasFooter ? 'PASS' : 'FAIL'));

  // main id="main"
  if (hasMain && !/<main[^>]*id=["']main["']/i.test(body)) {
    results.push(new Result('5.1-main-id', '5.LLMO', 'main#main', 'FAIL', 'id="main"なし'));
  } else if (hasMain) {
    results.push(new Result('5.1-main-id', '5.LLMO', 'main#main', 'PASS'));
  }

  // section aria-label チェック（fullとserviceのみ）
  if (pageType !== 'minimal') {
    const sections = body.match(/<section[^>]*>/gi) || [];
    const sectionsWithoutLabel = sections.filter(s => !/aria-label(ledby)?=/i.test(s));
    if (sectionsWithoutLabel.length > 0) {
      results.push(new Result('5.1-section-aria', '5.LLMO', 'section aria-label', 'FAIL', `${sectionsWithoutLabel.length}個のsectionにaria-labelなし`));
    } else if (sections.length > 0) {
      results.push(new Result('5.1-section-aria', '5.LLMO', `section aria-label (${sections.length}個)`, 'PASS'));
    }

    // nav aria-label
    const navs = body.match(/<nav[^>]*>/gi) || [];
    const navsWithoutLabel = navs.filter(n => !/aria-label(ledby)?=/i.test(n));
    if (navsWithoutLabel.length > 0) {
      results.push(new Result('5.1-nav-aria', '5.LLMO', 'nav aria-label', 'FAIL', `${navsWithoutLabel.length}個のnavにaria-labelなし`));
    } else if (navs.length > 0) {
      results.push(new Result('5.1-nav-aria', '5.LLMO', `nav aria-label (${navs.length}個)`, 'PASS'));
    }
  }

  return results;
}

function checkBodyClass(html) {
  const bodyClasses = getBodyClasses(html);
  const results = [];
  const required = ['font-sans', 'text-dark-700', 'antialiased'];
  // thanks.htmlやprivacyなどは異なるbodyクラスでもOK（SPECは「基本テンプレート」指定）
  const missing = required.filter(c => !bodyClasses.includes(c));
  if (missing.length > 0) {
    results.push(new Result('3.2-body', '3.HTML構造', 'body class', 'FAIL', `不足: ${missing.join(', ')}  現在: "${bodyClasses}"`));
  } else {
    results.push(new Result('3.2-body', '3.HTML構造', 'body class', 'PASS'));
  }
  return results;
}

function checkSkipLink(html) {
  const body = extractBody(html);
  const hasSkip = /href=["']#main["'][^>]*>.*スキップ/is.test(body) ||
                  /sr-only[^>]*focus:not-sr-only[^>]*href=["']#main["']/is.test(body) ||
                  /href=["']#main["'][^>]*class=["'][^"']*sr-only/is.test(body);
  return new Result('7.1-skip', '7.アクセシビリティ', 'スキップリンク', hasSkip ? 'PASS' : 'FAIL');
}

function checkNoscript(html) {
  const hasNoscript = /<noscript>[\s\S]*?\.fade-in[\s\S]*?<\/noscript>/i.test(html);
  return new Result('7.4-noscript', '7.アクセシビリティ', 'noscriptフォールバック', hasNoscript ? 'PASS' : 'FAIL');
}

function checkReducedMotion(html) {
  const has = /prefers-reduced-motion:\s*reduce/i.test(html);
  return new Result('7.3-motion', '7.アクセシビリティ', 'prefers-reduced-motion', has ? 'PASS' : 'FAIL');
}

function checkCSS(html) {
  const results = [];
  // Tailwind CDN禁止
  if (/cdn\.tailwindcss\.com/i.test(html)) {
    results.push(new Result('2.5-cdn', '2.ビルド環境', 'Tailwind CDN禁止', 'FAIL', 'cdn.tailwindcss.com使用'));
  } else {
    results.push(new Result('2.5-cdn', '2.ビルド環境', 'Tailwind CDN禁止', 'PASS'));
  }

  // ビルドCSS参照チェック
  const cssLink = html.match(/<link\s[^>]*href=["']([^"']*output\.css[^"']*)["'][^>]*rel=["']stylesheet["']/i) ||
                  html.match(/<link\s[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*output\.css[^"']*)["']/i);
  if (cssLink) {
    const href = cssLink[1];
    // 絶対パスチェック
    if (href.startsWith('/dist/output.css') || href.startsWith('./dist/output.css')) {
      results.push(new Result('3.1-css', '3.HTML構造', 'CSSパス', 'PASS', href));
    } else {
      results.push(new Result('3.1-css', '3.HTML構造', 'CSSパス', 'WARN', `パス: ${href}`));
    }
  } else {
    results.push(new Result('3.1-css', '3.HTML構造', 'ビルドCSS参照', 'WARN', 'output.css参照なし'));
  }

  return results;
}

function checkFadeIn(html) {
  // SPEC Section 9: fade-in parameters
  // Match main .fade-in with opacity: 0 (not the one inside @media or noscript)
  const fadeInMatch = html.match(/\.fade-in\s*\{[^}]*opacity:\s*0[^}]*\}/);
  if (!fadeInMatch) return new Result('9-fadein', '9.カスタムCSS', 'fade-inパラメータ', 'SKIP', 'fade-inアニメーション未使用');

  const css = fadeInMatch[0];
  const results = [];

  // translateY(30px)
  if (!css.includes('translateY(30px)')) {
    const yMatch = css.match(/translateY\((\d+)px\)/);
    results.push(new Result('9-fadein-y', '9.カスタムCSS', 'fade-in translateY', 'FAIL', `30px必須、現在: ${yMatch ? yMatch[1] + 'px' : '不明'}`));
  } else {
    results.push(new Result('9-fadein-y', '9.カスタムCSS', 'fade-in translateY(30px)', 'PASS'));
  }

  // 0.8s
  if (!css.includes('0.8s')) {
    const sMatch = css.match(/([\d.]+)s/);
    results.push(new Result('9-fadein-dur', '9.カスタムCSS', 'fade-in duration', 'FAIL', `0.8s必須、現在: ${sMatch ? sMatch[1] + 's' : '不明'}`));
  } else {
    results.push(new Result('9-fadein-dur', '9.カスタムCSS', 'fade-in duration 0.8s', 'PASS'));
  }

  return results;
}

function checkFonts(html) {
  const results = [];
  const head = extractHead(html);

  // preconnect
  const preconnectGapi = /rel=["']preconnect["'][^>]*href=["']https:\/\/fonts\.googleapis\.com["']/i.test(head);
  const preconnectGstatic = /rel=["']preconnect["'][^>]*href=["']https:\/\/fonts\.gstatic\.com["']/i.test(head);
  results.push(new Result('6.4-preconnect', '6.パフォーマンス', 'フォントpreconnect', (preconnectGapi && preconnectGstatic) ? 'PASS' : 'FAIL'));

  // Google Fonts stylesheet
  const fontsStylesheet = /href=["'][^"']*fonts\.googleapis\.com\/css2[^"']*["'][^>]*rel=["']stylesheet["']/i.test(head) ||
                          /rel=["']stylesheet["'][^>]*href=["'][^"']*fonts\.googleapis\.com\/css2/i.test(head);
  results.push(new Result('6.4-fonts', '6.パフォーマンス', 'Google Fontsスタイルシート', fontsStylesheet ? 'PASS' : 'FAIL'));

  return results;
}

function checkExternalLinks(html) {
  const results = [];
  const body = extractBody(html);
  // target="_blank" に rel="noopener noreferrer" 必須
  const blankLinks = body.match(/<a\s[^>]*target=["']_blank["'][^>]*>/gi) || [];
  let violationCount = 0;
  for (const link of blankLinks) {
    if (!/rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i.test(link) &&
        !/rel=["'][^"']*noreferrer[^"']*noopener[^"']*["']/i.test(link)) {
      violationCount++;
    }
  }
  if (violationCount > 0) {
    results.push(new Result('8.2-blank', '8.セキュリティ', 'target="_blank" rel', 'FAIL', `${violationCount}件にnoopener noreferrer不足`));
  } else {
    results.push(new Result('8.2-blank', '8.セキュリティ', 'target="_blank" rel', 'PASS', `${blankLinks.length}件チェック済`));
  }
  return results;
}

function checkFormLabels(html) {
  const body = extractBody(html);
  // input(hidden/checkbox以外)にlabel対応
  const inputs = body.match(/<input\s[^>]*>/gi) || [];
  const textareas = body.match(/<textarea[^>]*>/gi) || [];
  const selectElems = body.match(/<select[^>]*>/gi) || [];

  const formFields = [...inputs, ...textareas, ...selectElems].filter(el => {
    return !/type=["'](hidden|submit|button|checkbox)["']/i.test(el) &&
           !/style=["'][^"']*display:\s*none/i.test(el) &&
           !/class=["'][^"']*hidden/i.test(el);
  });

  if (formFields.length === 0) {
    return [new Result('7.2-label', '7.アクセシビリティ', 'フォームlabel', 'SKIP', 'フォームなし')];
  }

  // label forチェック（簡易）
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
  if (unlabeled.length > 0) {
    return [new Result('7.2-label', '7.アクセシビリティ', 'フォームlabel', 'FAIL', `ラベル不足: ${unlabeled.join(', ')}`)];
  }
  return [new Result('7.2-label', '7.アクセシビリティ', 'フォームlabel', 'PASS', `${formFields.length}フィールド`)];
}

function checkFocusRing(html) {
  // focus:ring-*/30 等の半透明フォーカスリング禁止
  const body = extractBody(html);
  const semiTransparent = body.match(/focus:ring-[^"'\s]*\/\d+/g);
  if (semiTransparent && semiTransparent.length > 0) {
    return new Result('7.1-focus', '7.アクセシビリティ', 'フォーカスリング不透明', 'FAIL', `半透明: ${semiTransparent.slice(0, 3).join(', ')}`);
  }
  return new Result('7.1-focus', '7.アクセシビリティ', 'フォーカスリング不透明', 'PASS');
}

function checkHeadOrder(html) {
  // SPEC 3.1の順序: charset → viewport → title → description → OGP → Twitter → theme-color → robots → CSP → canonical → sitemap → favicons → JSON-LD → CSS → fonts → style → noscript
  const head = extractHead(html);
  const results = [];

  // charsetが最初か
  const charsetPos = head.indexOf('charset=');
  const viewportPos = head.indexOf('name="viewport"') !== -1 ? head.indexOf('name="viewport"') : head.indexOf("name='viewport'");
  const titlePos = head.indexOf('<title>');

  if (charsetPos > -1 && viewportPos > -1 && charsetPos > viewportPos) {
    results.push(new Result('3.1-order', '3.HTML構造', 'head順序 charset→viewport', 'FAIL', 'viewportがcharsetの前'));
  }
  if (charsetPos > -1 && titlePos > -1 && charsetPos > titlePos) {
    results.push(new Result('3.1-order2', '3.HTML構造', 'head順序 charset→title', 'FAIL', 'titleがcharsetの前'));
  }

  if (results.length === 0) {
    results.push(new Result('3.1-order', '3.HTML構造', 'head要素順序', 'PASS'));
  }

  return results;
}

function checkSitemapRef(html) {
  const head = extractHead(html);
  const has = /rel=["']sitemap["']/i.test(head);
  return new Result('4.3-sitemapref', '4.SEO', 'sitemapリンク', has ? 'PASS' : 'WARN', has ? '' : 'link rel="sitemap"なし');
}

function checkGAAsync(html) {
  const gaScript = html.match(/<script[^>]*googletagmanager[^>]*>/i);
  if (!gaScript) return new Result('6.5-ga', '6.パフォーマンス', 'GA async', 'SKIP', 'GAなし');
  if (/async/i.test(gaScript[0])) {
    return new Result('6.5-ga', '6.パフォーマンス', 'GA async', 'PASS');
  }
  return new Result('6.5-ga', '6.パフォーマンス', 'GA async', 'FAIL', 'async属性なし');
}

function checkFooterCopyright(html) {
  const body = extractBody(html);
  const footerMatch = body.match(/<footer[\s\S]*?<\/footer>/i);
  if (!footerMatch) return new Result('10-footer', '10.デザイン', 'フッター', 'FAIL', 'footerなし');

  const footer = footerMatch[0];
  // 年号チェック
  if (/2026\s*HARTON/i.test(footer)) {
    return new Result('10-footer', '10.デザイン', 'フッターコピーライト', 'PASS');
  }
  // "Inc." 不正チェック
  if (/HARTON\s*Inc\./i.test(footer)) {
    return new Result('10-footer', '10.デザイン', 'フッターコピーライト', 'FAIL', '"HARTON Inc."は不正。"HARTON"のみ');
  }
  return new Result('10-footer', '10.デザイン', 'フッターコピーライト', 'WARN', 'コピーライト形式不明');
}

function checkURLConsistency(html, filePath) {
  const results = [];
  // harton.netlify.app が残っていないか
  if (html.includes('harton.netlify.app')) {
    const count = (html.match(/harton\.netlify\.app/g) || []).length;
    results.push(new Result('url-netlify', 'URL整合性', '旧ドメイン残存', 'FAIL', `harton.netlify.app が${count}箇所`));
  } else {
    results.push(new Result('url-netlify', 'URL整合性', '旧ドメイン残存なし', 'PASS'));
  }
  return results;
}

function checkImageAttributes(html) {
  const body = extractBody(html);
  const imgs = body.match(/<img\s[^>]*>/gi) || [];
  if (imgs.length === 0) return [new Result('6.3-img', '6.パフォーマンス', '画像属性', 'SKIP', '画像なし')];

  const results = [];
  let noAlt = 0;
  let noWH = 0;

  for (const img of imgs) {
    if (!/alt=/i.test(img)) noAlt++;
    if (!/width=/i.test(img) || !/height=/i.test(img)) noWH++;
  }

  if (noAlt > 0) {
    results.push(new Result('6.3-alt', '6.パフォーマンス', '画像alt属性', 'FAIL', `${noAlt}/${imgs.length}個にalt不足`));
  } else {
    results.push(new Result('6.3-alt', '6.パフォーマンス', '画像alt属性', 'PASS', `${imgs.length}個チェック済`));
  }

  return results;
}

// ========== メイン検証ロジック ==========

function verifyFile(filePath) {
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const pageType = PAGE_TYPE[relPath] || 'minimal';
  const html = fs.readFileSync(filePath, 'utf-8');
  const results = [];

  // 全ページ共通チェック
  results.push(checkHtmlLang(html, filePath));
  results.push(checkCharset(html));
  results.push(checkViewport(html));
  results.push(checkTitle(html, pageType));
  results.push(checkDescription(html, pageType));
  results.push(checkCanonical(html, pageType));
  results.push(checkRobots(html, pageType));
  results.push(checkThemeColor(html));
  results.push(checkColorScheme(html));
  results.push(checkSkipLink(html));
  results.push(checkNoscript(html));
  results.push(checkReducedMotion(html));
  results.push(checkFocusRing(html));
  results.push(checkFooterCopyright(html));
  results.push(checkGAAsync(html));

  // OGP, Twitter Card
  const ogpResults = checkOGP(html, pageType);
  results.push(...(Array.isArray(ogpResults) ? ogpResults : [ogpResults]));
  results.push(checkTwitterCard(html, pageType));

  // CSP
  const cspResults = checkCSP(html, pageType);
  results.push(...(Array.isArray(cspResults) ? cspResults : [cspResults]));

  // Favicons
  results.push(...checkFavicons(html));

  // JSON-LD
  results.push(...checkJsonLd(html, pageType));

  // 見出し
  results.push(...checkHeadings(html));

  // セマンティクス
  results.push(...checkSemantics(html, pageType));

  // Body class
  results.push(...checkBodyClass(html));

  // CSS
  results.push(...checkCSS(html));

  // fade-in パラメータ
  const fadeResults = checkFadeIn(html);
  results.push(...(Array.isArray(fadeResults) ? fadeResults : [fadeResults]));

  // フォント
  results.push(...checkFonts(html));

  // head順序
  results.push(...checkHeadOrder(html));

  // sitemap参照
  results.push(checkSitemapRef(html));

  // 外部リンク
  results.push(...checkExternalLinks(html));

  // フォームlabel
  results.push(...checkFormLabels(html));

  // 画像
  results.push(...checkImageAttributes(html));

  // URL整合性
  results.push(...checkURLConsistency(html, filePath));

  return { file: relPath, pageType, results };
}

// ========== robots.txt / sitemap.xml チェック ==========
function checkRobotsTxt() {
  const results = [];
  const robotsPath = path.join(ROOT, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    results.push(new Result('4.4-robots', '4.SEO', 'robots.txt', 'FAIL', 'ファイルなし'));
    return results;
  }
  const content = fs.readFileSync(robotsPath, 'utf-8');
  if (!content.includes('User-agent:')) {
    results.push(new Result('4.4-robots-ua', '4.SEO', 'robots.txt User-agent', 'FAIL'));
  }
  if (!content.includes('Sitemap:')) {
    results.push(new Result('4.4-robots-sm', '4.SEO', 'robots.txt Sitemap参照', 'FAIL'));
  } else if (!content.includes(DOMAIN)) {
    results.push(new Result('4.4-robots-domain', '4.SEO', 'robots.txt ドメイン', 'FAIL', `${DOMAIN}でない`));
  }
  if (!content.includes('Disallow: /ogp.html')) {
    results.push(new Result('4.4-robots-ogp', '4.SEO', 'robots.txt ogp.html除外', 'WARN'));
  }
  if (results.length === 0) {
    results.push(new Result('4.4-robots', '4.SEO', 'robots.txt', 'PASS'));
  }
  return results;
}

function checkSitemapXml() {
  const results = [];
  const smPath = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(smPath)) {
    results.push(new Result('4.3-sitemap', '4.SEO', 'sitemap.xml', 'FAIL', 'ファイルなし'));
    return results;
  }
  const content = fs.readFileSync(smPath, 'utf-8');
  if (!content.includes('<urlset')) {
    results.push(new Result('4.3-sitemap-valid', '4.SEO', 'sitemap.xml形式', 'FAIL', 'urlsetなし'));
  }
  if (!content.includes(DOMAIN)) {
    results.push(new Result('4.3-sitemap-domain', '4.SEO', 'sitemap.xmlドメイン', 'FAIL', `${DOMAIN}でない`));
  }
  if (content.includes('harton.netlify.app')) {
    results.push(new Result('4.3-sitemap-netlify', '4.SEO', 'sitemap.xml旧ドメイン', 'FAIL', 'harton.netlify.app残存'));
  }
  if (!content.includes('<lastmod>')) {
    results.push(new Result('4.3-sitemap-lastmod', '4.SEO', 'sitemap.xml lastmod', 'WARN', 'lastmodなし'));
  }
  if (results.length === 0) {
    results.push(new Result('4.3-sitemap', '4.SEO', 'sitemap.xml', 'PASS'));
  }
  return results;
}

// ========== 出力 ==========
function printReport(allResults) {
  const totalPass = allResults.reduce((sum, r) => sum + r.results.filter(x => x.status === 'PASS').length, 0);
  const totalFail = allResults.reduce((sum, r) => sum + r.results.filter(x => x.status === 'FAIL').length, 0);
  const totalWarn = allResults.reduce((sum, r) => sum + r.results.filter(x => x.status === 'WARN').length, 0);
  const totalSkip = allResults.reduce((sum, r) => sum + r.results.filter(x => x.status === 'SKIP').length, 0);
  const total = totalPass + totalFail + totalWarn + totalSkip;

  console.log('\n' + '='.repeat(72));
  console.log('  SPEC.md 自動検証レポート');
  console.log('  検証日時: ' + new Date().toISOString());
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

  // サマリ
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

  // ファイル存在チェック
  const missing = targetFiles.filter(f => !fs.existsSync(f));
  if (missing.length > 0) {
    console.error('ファイルが見つかりません:');
    missing.forEach(f => console.error('  ' + f));
    process.exit(1);
  }

  // HTMLファイル検証
  const allResults = targetFiles.map(f => verifyFile(f));

  // robots.txt / sitemap.xml
  const globalResults = {
    file: '[グローバル] robots.txt + sitemap.xml',
    pageType: 'global',
    results: [...checkRobotsTxt(), ...checkSitemapXml()],
  };
  allResults.push(globalResults);

  // レポート出力
  const failCount = printReport(allResults);
  process.exit(failCount > 0 ? 1 : 0);
}

main();
