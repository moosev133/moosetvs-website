import { mkdir, writeFile, cp } from 'node:fs/promises';
import { pages } from '../src/pages.mjs';
import { extendPages } from '../src/additional-pages.mjs';
extendPages(pages);
import { header, footer, esc } from '../src/components.mjs';
const origin = process.env.CONTEXT && process.env.CONTEXT !== 'production' ? process.env.DEPLOY_PRIME_URL : process.env.URL;
const base = origin || 'https://moosetvs.com';
await mkdir('dist', {recursive:true});
await cp('public','dist',{recursive:true});
for (const p of pages) {
  const url = `${base}/${p.path}${p.path?'/':''}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#3458ed"><title>${esc(p.title)} | MooseTVs</title><meta name="description" content="${esc(p.description)}"><link rel="canonical" href="${esc(url)}"><meta property="og:title" content="${esc(p.title)} | MooseTVs"><meta property="og:description" content="${esc(p.description)}"><meta property="og:type" content="website"><meta property="og:url" content="${esc(url)}"><meta name="twitter:card" content="summary">${p.noindex?'<meta name="robots" content="noindex">':''}<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/style.css"><script src="/script.js" defer></script></head><body>${header(p.path)}<main id="main">${p.body}</main>${footer()}</body></html>`;
  const document = html.replace('</head>','<link rel="stylesheet" href="/pages.css"><link rel="manifest" href="/site.webmanifest"></head>').replace('<body>',`<body class="${p.path.startsWith('demos/')?'page-demo':'page-site'}" itemscope itemtype="https://schema.org/Organization"><meta itemprop="name" content="MooseTVs"><meta itemprop="email" content="moosetvs1@gmail.com"><link itemprop="url" href="${esc(base)}/">`);
  if(p.path==='404') await writeFile('dist/404.html',document);
  else {await mkdir(`dist/${p.path}`, {recursive:true});await writeFile(`dist/${p.path}${p.path?'/':''}index.html`,document);}
}
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p=>!p.noindex).map(p=>`<url><loc>${esc(base)}/${p.path}${p.path?'/':''}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${pages.length} pages into dist/`);
