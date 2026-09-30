import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {sitePages} from '../src/redesign/pages.mjs';
import {demoPages} from '../src/redesign/demo-pages.mjs';
import {header,footer,href} from '../src/redesign/layout.mjs';
import {context,catalogs,usedMessages} from '../src/redesign/i18n.mjs';
import {projects} from '../src/redesign/data.mjs';
import {authConfig} from '../src/redesign/config.mjs';
const root=resolve('dist');
async function walk(dir){const all=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);all.push(...(e.isDirectory()?await walk(p):[p]));}return all;}
const files=(await walk(root)).filter(p=>extname(p)==='.html'&&!p.includes('/downloads/'));
test('all routes have semantic, localized HTML and intact local references',async()=>{
 const titles=new Set();let refs=0;
 assert.equal(files.length,141);
 for(const file of files){
  const html=await readFile(file,'utf8');const lang=html.match(/<html lang="(\w+)"/)?.[1];assert(['en','he','ar'].includes(lang));
  assert(html.includes(`dir="${lang==='en'?'ltr':'rtl'}"`));assert.equal((html.match(/<h1\b/g)||[]).length,1,file);
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];assert(title);assert(!title.includes('&amp;amp;'),file);
  if(!file.includes('/digital-products/index.html')||file.includes('/services/')){assert(!titles.has(`${lang}:${title}`),`Duplicate title: ${file}`);titles.add(`${lang}:${title}`);}
  assert(html.includes('name="description" content="'));assert(html.includes('property="og:title"'));assert(html.includes('hreflang="x-default"'));assert(html.includes('https://schema.org/Organization'));
  const visible=html.replace(/<script[\s\S]*?<\/script>/g,'');assert(!/MT5|scalping|trading|signals|signupModal|signinModal/i.test(visible));
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate IDs: ${file}`);
  for(const match of html.matchAll(/(?:href|src|action)="([^"]+)"/g)){
   const url=match[1].replaceAll('&amp;','&');if(/^(https?:|mailto:|data:)/.test(url))continue;
   const parsed=new URL(url,'https://example.test/'+file.slice(root.length+1).replace(/index.html$/,''));
   const target=resolve(root,'.'+decodeURIComponent(parsed.pathname));assert(target.startsWith(root+'/')||target===root);
   let dest=target;try{if((await stat(dest)).isDirectory())dest=resolve(dest,'index.html');await stat(dest);}catch{throw Error(`Broken reference ${url} in ${file}`);}
   if(parsed.hash&&extname(dest)==='.html')assert((await readFile(dest,'utf8')).includes(`id="${parsed.hash.slice(1)}"`),`Broken anchor ${url}`);refs++;
  }
 }
 console.log(`Verified ${files.length} documents and ${refs} local references.`);
});
test('all template and runtime strings have complete dedicated locale catalogs',async()=>{
 const keys=Object.keys(catalogs.en).sort();for(const lang of ['he','ar'])assert.deepEqual(Object.keys(catalogs[lang]).sort(),keys);
 for(const lang of ['en','he','ar']){const ctx=context(lang);sitePages(ctx);demoPages(ctx);header(ctx,'');footer(ctx);}
 for(const key of usedMessages)for(const lang of ['en','he','ar'])assert(catalogs[lang][key],`${lang}: ${key}`);
 for(const name of ['site.js','auth.js','demos.js','auth-service.mjs','motion.js','valid.js']){
  const src=await readFile(`src/browser/${name}`,'utf8');
  for(const [,key] of src.matchAll(/(?:\bt|\btr|\bsay)\('([^']*)'/g))if(key)assert(catalogs.en[key],`Runtime translation missing: ${key}`);
 }
});
test('all localized forms keep Netlify names, required fields and localized destinations',async()=>{
 for(const lang of ['en','he','ar'])for(const name of ['quote','contact']){
  const html=await readFile(`dist${href(name,lang)}index.html`,'utf8');
  for(const token of ['data-netlify="true"','method="POST"',`name="form-name" value="${name}"`,`action="${href('thank-you',lang)}"`,`name="language" value="${lang}"`])assert(html.includes(token),token);
  for(const field of ['name','company','email','phone','service','industry','budget','timeline','message','privacy_consent','utm_source','utm_medium','utm_campaign','landing_page'])assert(html.includes(`name="${field}"`),field);
 }
});
test('project schema generates detail pages and valid demo links',async()=>{
 const slugs=new Set();for(const p of projects){assert(!slugs.has(p.slug));slugs.add(p.slug);for(const key of ['title','slug','category','shortDescription','fullDescription','technologies','screenshots','status','demoUrl','githubUrl','featured','year'])assert(Object.hasOwn(p,key),key);if(p.demoUrl)assert(p.demoUrl.startsWith('/demos/'));if(p.githubUrl)assert(new URL(p.githubUrl).protocol==='https:');for(const lang of ['en','he','ar'])await stat(`dist${href('work/'+p.slug,lang)}index.html`);}
});
test('account pages have no indexed or embedded private user data',async()=>{
 const sitemap=await readFile('dist/sitemap.xml','utf8');for(const route of ['account','sign-in','sign-up','forgot-password','reset-password','thank-you']){
  assert(!sitemap.includes(`/${route}/`));const html=await readFile(`dist/${route}/index.html`,'utf8');assert(html.includes('noindex'));
  if(route==='account'){assert(html.includes('data-account-content hidden'));assert(html.includes('<p data-user-email dir="ltr"></p>'));}
  else if(route!=='thank-you')assert(html.includes('<fieldset disabled>'));
 }
 assert(!sitemap.includes('404'));assert(!sitemap.includes('localhost'));
});
test('only public Supabase project configuration can enter the build',()=>{
 assert.deepEqual(authConfig({}),{url:'',key:''});assert.throws(()=>authConfig({SUPABASE_URL:'https://example.supabase.co'}));
 assert.throws(()=>authConfig({SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_secret_test'}));
 const jwt=role=>'e30.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.test';
 assert.throws(()=>authConfig({SUPABASE_URL:'https://example.supabase.co',SUPABASE_ANON_KEY:jwt('service_role')}));
 assert.throws(()=>authConfig({SUPABASE_URL:'http://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'}));
 assert.equal(authConfig({SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'}).key,'sb_publishable_test');
});
