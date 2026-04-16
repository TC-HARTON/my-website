#!/usr/bin/env node
/**
 * generate-blog.js — HARTON自社サイト用ブログHTML生成
 * articles.json → blog/{slug}/index.html + blog/index.html
 *
 * blog.js (site-builder) と articles.json 形式は完全互換。
 * HTML出力は HARTON サイト品質（リッチヘッダー/フッター/チャット）に合わせる。
 */
const fs = require('fs');
const path = require('path');

const SITE_DIR = __dirname;
const ARTICLES_PATH = path.join(SITE_DIR, 'blog', 'articles.json');
const DOMAIN = 'https://harton.pages.dev';
const SITE_NAME = 'HARTON（ハートン）';
const SITE_NAME_SHORT = 'HARTON';
const AUTHOR = '大内 達也';
const AUTHOR_TITLE = '代表 / 開発エンジニア';
const GA_ID = 'G-DMGZG751KF';
const THEME_COLOR = '#0d9ed8';

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── 共通パーツ ───

const HEAD_COMMON = `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="${THEME_COLOR}">
  <meta name="color-scheme" content="light">
  <meta name="author" content="${AUTHOR}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap">
  <link rel="stylesheet" href="/dist/output.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>`;

const INLINE_STYLES = `  <style>
    html { scroll-behavior: smooth; }
    .prose h2 { color: #fff; font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .prose h3 { color: #e2e8f0; font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; }
    .prose p { color: #cbd5e1; line-height: 1.8; margin-bottom: 1rem; }
    .prose ul, .prose ol { color: #cbd5e1; margin-bottom: 1rem; padding-left: 1.5rem; }
    .prose li { margin-bottom: 0.5rem; line-height: 1.7; }
    .prose strong { color: #fff; }
    .prose a { color: #0d9ed8; text-decoration: underline; text-underline-offset: 2px; }
    .prose a:hover { color: #38bdf8; }
    .prose code { background: rgba(13,158,216,0.1); color: #7dd3fc; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    .prose blockquote { border-left: 3px solid #0d9ed8; padding-left: 1rem; color: #94a3b8; font-style: italic; margin: 1.5rem 0; }
    .fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
    .nav-blur { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
    .mobile-menu { transform: translateX(100%); transition: transform 0.3s ease; }
    .mobile-menu.open { transform: translateX(0); }
    .sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0; }
    @media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important; } .fade-in{opacity:1!important;transform:none!important;} }
  </style>`;

function buildHeader() {
  return `  <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-3 focus:bg-white focus:text-dark-900 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500">メインコンテンツへスキップ</a>
  <header role="banner" class="fixed top-0 left-0 right-0 z-50 nav-blur bg-dark-900/80 border-b border-dark-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <a href="/" class="text-xl font-bold text-white hover:opacity-80 transition-opacity py-3">${SITE_NAME_SHORT}</a>
        <nav aria-label="メインナビゲーション" class="hidden md:flex items-center space-x-1">
          <a href="/" class="text-sm font-medium text-dark-300 hover:text-white transition-colors py-3 px-2">ホーム</a>
          <a href="/#services" class="text-sm font-medium text-dark-300 hover:text-white transition-colors py-3 px-2">サービス</a>
          <a href="/blog/" class="text-sm font-medium text-dark-300 hover:text-white transition-colors py-3 px-2">ブログ</a>
          <a href="/#contact" class="text-sm font-medium text-dark-300 hover:text-white transition-colors py-3 px-2">お問い合わせ</a>
        </nav>
        <button type="button" id="menu-toggle" class="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-expanded="false" aria-controls="mobile-menu" aria-label="メニューを開く">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>
    <div id="mobile-menu" class="mobile-menu fixed inset-0 z-50 bg-dark-900/95 nav-blur" role="dialog" aria-label="モバイルナビゲーション">
      <div class="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-dark-800/50">
        <span class="text-xl font-bold text-white">${SITE_NAME_SHORT}</span>
        <button type="button" id="menu-close" class="p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="メニューを閉じる">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <nav aria-label="モバイルナビゲーション" class="px-4 py-6 space-y-1">
        <a href="/" class="block text-lg font-medium text-dark-200 hover:text-white py-3 px-4 rounded-lg hover:bg-dark-800 transition-colors" onclick="closeMobileMenu()">ホーム</a>
        <a href="/#services" class="block text-lg font-medium text-dark-200 hover:text-white py-3 px-4 rounded-lg hover:bg-dark-800 transition-colors" onclick="closeMobileMenu()">サービス</a>
        <a href="/blog/" class="block text-lg font-medium text-dark-200 hover:text-white py-3 px-4 rounded-lg hover:bg-dark-800 transition-colors" onclick="closeMobileMenu()">ブログ</a>
        <a href="/#contact" class="block text-lg font-medium text-dark-200 hover:text-white py-3 px-4 rounded-lg hover:bg-dark-800 transition-colors" onclick="closeMobileMenu()">お問い合わせ</a>
      </nav>
    </div>
  </header>`;
}

function buildFooter() {
  return `  <footer role="contentinfo" class="bg-dark-950 border-t border-dark-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-lg font-bold text-white mb-4">${escHtml(SITE_NAME)}</h3>
          <p class="text-dark-400 text-sm mb-2">〒410-0012 静岡県沼津市大岡</p>
          <p class="text-dark-400 text-sm flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> 080-1058-0538</p>
          <p class="text-dark-400 text-sm flex items-center gap-2 mt-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> <a href="mailto:harton.info@gmail.com" class="hover:text-white transition-colors">harton.info@gmail.com</a></p>
        </div>
        <div>
          <h3 class="text-lg font-bold text-white mb-4">ナビゲーション</h3>
          <nav aria-label="フッターナビゲーション" class="flex flex-col space-y-2">
            <a href="/" class="text-dark-400 hover:text-white transition-colors py-1">ホーム</a>
            <a href="/blog/" class="text-dark-400 hover:text-white transition-colors py-1">ブログ</a>
            <a href="/privacy/" class="text-dark-400 hover:text-white transition-colors py-1">プライバシーポリシー</a>
            <a href="/profile/" class="text-dark-400 hover:text-white transition-colors py-1">プロフィール</a>
          </nav>
        </div>
        <div>
          <h3 class="text-lg font-bold text-white mb-4">営業時間</h3>
          <p class="text-dark-400 text-sm flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> 09:00 - 18:00</p>
          <p class="text-dark-400 text-sm mt-1">月曜日〜金曜日</p>
        </div>
      </div>
      <div class="border-t border-dark-800 mt-8 pt-8 text-center">
        <p class="text-dark-500 text-sm">&copy; 2026 ${escHtml(SITE_NAME)}. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
}

const SCRIPTS = `  <noscript><style>.fade-in{opacity:1!important;transform:none!important;}</style></noscript>
  <script>
    (function(){var els=document.querySelectorAll('.fade-in');if('IntersectionObserver' in window){var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});els.forEach(function(el){obs.observe(el);});}else{els.forEach(function(el){el.classList.add('visible');});}})();
  </script>
  <script>
    (function(){var toggle=document.getElementById('menu-toggle'),close=document.getElementById('menu-close'),menu=document.getElementById('mobile-menu');function openMenu(){menu.classList.add('open');toggle.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';}function closeMobileMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');document.body.style.overflow='';}if(toggle)toggle.addEventListener('click',openMenu);if(close)close.addEventListener('click',closeMobileMenu);window.closeMobileMenu=closeMobileMenu;})();
  </script>`;

// ─── 記事ページ生成 ───

function generateArticlePage(article) {
  const articleUrl = DOMAIN + '/blog/' + article.slug + '/';
  const now = article.publishedAt || '2026-04-12';
  const updated = article.updatedAt || now;
  const ogImage = DOMAIN + '/ogp.png';

  // JSON-LD (HowTo for guide type)
  const mainLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    image: ogImage,
    datePublished: now,
    dateModified: updated,
    author: { '@type': 'Person', name: AUTHOR, url: DOMAIN + '/profile/' },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: DOMAIN + '/' },
      { '@type': 'ListItem', position: 2, name: 'ブログ', item: DOMAIN + '/blog/' },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  };

  let html = `<!DOCTYPE html>
<html lang="ja">
<head>
${HEAD_COMMON}
  <title>${escHtml(article.title)} | ${SITE_NAME_SHORT}</title>
  <meta name="description" content="${escAttr(article.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${escAttr(articleUrl)}">
  <meta property="og:title" content="${escAttr(article.title)}">
  <meta property="og:description" content="${escAttr(article.description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escAttr(articleUrl)}">
  <meta property="og:image" content="${escAttr(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${SITE_NAME_SHORT}">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escAttr(article.title)}">
  <meta name="twitter:description" content="${escAttr(article.description)}">
  <meta name="twitter:image" content="${escAttr(ogImage)}">
  <script type="application/ld+json">
  ${JSON.stringify(mainLd, null, 4)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbLd, null, 4)}
  </script>
${INLINE_STYLES}
</head>
<body class="bg-dark-900 text-dark-300 antialiased">
${buildHeader()}

  <main id="main">
    <nav aria-label="パンくずリスト" class="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-2">
      <ol class="flex items-center flex-wrap text-sm">
        <li class="flex items-center">
          <a href="/" class="text-dark-400 hover:text-white transition-colors py-1">ホーム</a>
          <span class="mx-2 text-dark-600">/</span>
        </li>
        <li class="flex items-center">
          <a href="/blog/" class="text-dark-400 hover:text-white transition-colors py-1">ブログ</a>
          <span class="mx-2 text-dark-600">/</span>
        </li>
        <li><span class="text-dark-300" aria-current="page">${escHtml(article.title)}</span></li>
      </ol>
    </nav>

    <article class="max-w-3xl mx-auto px-4 sm:px-6 pb-20 fade-in">
      <header class="mb-8 pt-4">
        <h1 class="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">${escHtml(article.title)}</h1>
        <div class="flex items-center flex-wrap gap-4 text-sm text-dark-400">
          <time datetime="${now}">公開: ${now}</time>
${updated !== now ? `          <time datetime="${updated}">更新: ${updated}</time>\n` : ''}\
          <span>著者: <a href="/profile/" class="text-sky-400 hover:underline">${escHtml(AUTHOR)}</a></span>
        </div>
${article.category || (article.tags && article.tags.length) ? `        <div class="flex flex-wrap gap-2 mt-4">
${article.category ? `          <span class="bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-xs font-medium">${escHtml(article.category)}</span>\n` : ''}\
${(article.tags || []).map(t => `          <span class="bg-dark-700 text-dark-300 px-3 py-1 rounded-full text-xs">#${escHtml(t)}</span>`).join('\n')}
        </div>` : ''}
      </header>

      <div class="prose max-w-none">
        ${article.content || '<p>本文を入力してください。</p>'}
      </div>

      <aside class="mt-16 p-6 bg-dark-800 rounded-xl border border-dark-700">
        <h2 class="text-lg font-bold text-white mb-2">著者について</h2>
        <p class="text-dark-300 text-sm">
          <a href="/profile/" class="text-sky-400 hover:underline font-medium">${escHtml(AUTHOR)}</a>
          — ${escHtml(AUTHOR_TITLE)}。${escHtml(SITE_NAME)}代表。
          WEB制作・業務自動化・AI活用の実践情報を発信しています。
        </p>
      </aside>
    </article>
  </main>

${buildFooter()}
${SCRIPTS}
</body>
</html>`;

  return html;
}

// ─── 一覧ページ生成 ───

function generateBlogIndex(articles) {
  const sorted = articles.slice().sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: DOMAIN + '/' },
      { '@type': 'ListItem', position: 2, name: 'ブログ' },
    ],
  };

  let cards = '';
  sorted.forEach(art => {
    cards += `          <a href="/blog/${art.slug}/" class="block p-6 bg-dark-800 rounded-xl border border-dark-700 hover:border-sky-500/50 transition-all hover:-translate-y-1 hover:shadow-lg group">
            <h2 class="text-xl font-bold text-white group-hover:text-sky-400 transition-colors mb-2">${escHtml(art.title)}</h2>
            <p class="text-dark-400 text-sm mb-3 line-clamp-2">${escHtml(art.description)}</p>
            <div class="flex items-center flex-wrap gap-3 text-xs text-dark-500">
              <time datetime="${art.publishedAt || ''}">${art.publishedAt || ''}</time>
${art.category ? `              <span class="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">${escHtml(art.category)}</span>` : ''}
            </div>
          </a>\n`;
  });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
${HEAD_COMMON}
  <title>ブログ | ${SITE_NAME}</title>
  <meta name="description" content="${SITE_NAME}の技術ブログ。Site Builderの使い方ガイド、WEB制作・業務自動化・AI活用の実践情報を発信。">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${DOMAIN}/blog/">
  <meta property="og:title" content="ブログ | ${SITE_NAME}">
  <meta property="og:description" content="${SITE_NAME}の技術ブログ。Site Builderの使い方ガイド。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${DOMAIN}/blog/">
  <meta property="og:image" content="${DOMAIN}/ogp.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${SITE_NAME_SHORT}">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="ブログ | ${SITE_NAME}">
  <meta name="twitter:description" content="${SITE_NAME}の技術ブログ。Site Builderの使い方ガイド。">
  <meta name="twitter:image" content="${DOMAIN}/ogp.png">
  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbLd, null, 4)}
  </script>
${INLINE_STYLES}
</head>
<body class="bg-dark-900 text-dark-300 antialiased">
${buildHeader()}

  <main id="main">
    <nav aria-label="パンくずリスト" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-2">
      <ol class="flex items-center flex-wrap text-sm">
        <li class="flex items-center">
          <a href="/" class="text-dark-400 hover:text-white transition-colors py-1">ホーム</a>
          <span class="mx-2 text-dark-600">/</span>
        </li>
        <li><span class="text-dark-300" aria-current="page">ブログ</span></li>
      </ol>
    </nav>

    <section aria-label="ブログ記事一覧" class="pt-8 pb-20 sm:pb-28">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="fade-in">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">ブログ</h1>
          <p class="text-dark-400 mb-10">Site Builderの使い方ガイドや、WEB制作・AI活用の実践情報を発信しています。</p>
          <div class="grid gap-6">
${cards}\
          </div>
        </div>
      </div>
    </section>
  </main>

${buildFooter()}
${SCRIPTS}
</body>
</html>`;
}

// ─── メイン処理 ───

function main() {
  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));
  console.log('Loaded ' + articles.length + ' articles from articles.json');

  let generated = 0;

  // 個別記事ページ
  articles.forEach(art => {
    const dir = path.join(SITE_DIR, 'blog', art.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const html = generateArticlePage(art);
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
    generated++;
    console.log('  [' + generated + '] /blog/' + art.slug + '/');
  });

  // 一覧ページ
  const indexHtml = generateBlogIndex(articles);
  fs.writeFileSync(path.join(SITE_DIR, 'blog', 'index.html'), indexHtml, 'utf-8');
  console.log('  [index] /blog/');

  console.log('Done! Generated ' + generated + ' article pages + blog index.');
}

main();
