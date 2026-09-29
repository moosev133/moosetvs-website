import {mkdir,writeFile,cp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {build} from 'esbuild';
import {sitePages} from '../src/redesign/pages.mjs';
import {context,catalogs,usedMessages} from '../src/redesign/i18n.mjs';
import {header,footer,href,esc} from '../src/redesign/layout.mjs';
import {demoPages} from '../src/redesign/demo-pages.mjs';
import {authConfig} from '../src/redesign/config.mjs';
// Replace only the generated output. Source and Git history are preserved.
const out=resolve('dist');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const asset of ['style.css','pages.css','typography.css','premium.css','favicon.svg','site.webmanifest','downloads'])await cp(`public/${asset}`,`dist/${asset}`,{recursive:true});
try{await cp('public/images','dist/images',{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
const {url,key}=authConfig();
const origin=process.env.CONTEXT&&process.env.CONTEXT!=='production'?process.env.DEPLOY_PRIME_URL:null;
const base=(origin||'https://moosetvs.com').replace(/\/$/,'');
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
await build({entryPoints:{app:'src/browser/auth.js'},bundle:true,minify:true,splitting:true,format:'esm',target:['es2022'],outdir:'dist',chunkNames:'assets/[name]-[hash]',legalComments:'eof'});
const sitemap=[];let count=0;
for(const lang of Object.keys(catalogs)){
 const ctx=context(lang);
 const pages=sitePages(ctx);
 pages.push(...demoPages(ctx));
 for(const p of pages){
  const path=href(p.path,lang),canonical=`${base}${href(p.canonical??p.path,lang)}`;
  const alternate=Object.keys(catalogs).map(l=>`<link rel="alternate" hreflang="${l}" href="${base}${href(p.canonical??p.path,l)}">`).join('');
  const document=`<!doctype html><html lang="${lang}" dir="${lang==='en'?'ltr':'rtl'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#191c19"><title>${esc(p.title)} | MooseTVs</title><meta name="description" content="${esc(p.description)}"><link rel="canonical" href="${canonical}">${alternate}<link rel="alternate" hreflang="x-default" href="${base}${href(p.canonical??p.path,'en')}"><meta property="og:title" content="${esc(p.title)} | MooseTVs"><meta property="og:description" content="${esc(p.description)}"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}"><meta property="og:locale" content="${{en:'en_US',he:'he_IL',ar:'ar_IL'}[lang]}"><meta name="twitter:card" content="summary">${p.noindex?'<meta name="robots" content="noindex,nofollow">':''}<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="manifest" href="/site.webmanifest">${p.legacyDemo?'<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/pages.css">':''}<link rel="stylesheet" href="/premium.css"><script type="application/json" id="ui-messages">${json(catalogs[lang])}</script><script type="application/json" id="auth-config">${json({url,key})}</script><script type="module" src="/app.js"></script></head><body class="premium ${p.legacyDemo?'page-demo':'page-site'}" data-route="${p.path}" itemscope itemtype="https://schema.org/Organization"><meta itemprop="name" content="MooseTVs"><meta itemprop="email" content="moosetvs1@gmail.com"><link itemprop="url" href="https://moosetvs.com/">${header(ctx,p.path)}<main id="main">${p.body}</main>${footer(ctx)}</body></html>`;
  const destination=p.path==='404'?(lang==='en'?'dist/404.html':`dist/${lang}/404.html`):`dist${path}index.html`;
  await mkdir(resolve(destination,'..'),{recursive:true});await writeFile(destination,document);count++;
  if(!p.noindex)sitemap.push(`${base}${path}`);
 }
}
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.map(url=>`<url><loc>${esc(url)}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${count} pages in English, Hebrew and Arabic. Auth: ${url?'configured':'awaiting project credentials'}.`);
if(process.argv.includes('--messages'))console.log(JSON.stringify([...usedMessages].sort(),null,2));
