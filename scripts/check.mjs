import {readFile, readdir, stat} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
async function walk(dir){const results=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);results.push(...(e.isDirectory()?await walk(p):[p]));}return results;}
const files=await walk(root);
const htmlFiles=files.filter(p=>extname(p)==='.html'&&!p.includes('/downloads/'));
const titles=new Set(),descriptions=new Set();let links=0;
for(const file of htmlFiles){
 const html=await readFile(file,'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: exactly one H1`);
 const title=html.match(/<title>(.*?)<\/title>/)?.[1];assert(title,`${file}: title`);assert(!titles.has(title),`${file}: duplicate title`);titles.add(title);
 const desc=html.match(/<meta name="description" content="([^"]+)"/)?.[1];assert(desc,`${file}: description`);assert(!descriptions.has(desc),`${file}: duplicate description`);descriptions.add(desc);
 assert(html.includes('moosetvs1@gmail.com'),`${file}: contact email missing`);
 assert(!/MT5|scalping|trading|signals|signupModal|signinModal/i.test(html),`${file}: legacy content remains`);
 assert(html.includes('property="og:title"'),`${file}: social title missing`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`${file}: duplicate IDs`);
 for(const match of html.matchAll(/(?:href|src|action)="([^"]+)"/g)){
  const url=match[1];if(/^(https?:|mailto:|data:)/.test(url))continue;
  const parsed=new URL(url,'https://example.test/'+file.slice(root.length+1).replace(/index.html$/,''));
  const target=resolve(root,'.'+decodeURIComponent(parsed.pathname));
  assert(target.startsWith(root+'/')||target===root,`Out-of-root target ${url}`);
  let targetFile=target;try{if((await stat(target)).isDirectory())targetFile=resolve(target,'index.html');await stat(targetFile);}catch{throw new Error(`Broken reference ${url} in ${file}`);}
  if(parsed.hash&&extname(targetFile)==='.html'){const targetHtml=await readFile(targetFile,'utf8');assert(targetHtml.includes(`id="${parsed.hash.slice(1)}"`),`Missing anchor ${url} in ${file}`);}
  links++;
 }
 if(file.includes('/demos/'))assert(html.includes('Concept project'),`${file}: demo disclosure missing`);
}
for(const name of ['quote','contact']){
 const html=await readFile(resolve(root,name,'index.html'),'utf8');
 assert(html.includes('data-netlify="true"')&&html.includes('method="POST"')&&html.includes(`name="form-name" value="${name}"`),`${name}: Netlify form contract`);
 for(const field of ['name','email','message','privacy_consent','utm_source','utm_medium','utm_campaign','landing_page'])assert(html.includes(`name="${field}"`),`${name}: missing ${field}`);
}
const quote=await readFile(resolve(root,'quote/index.html'),'utf8');
for(const field of ['company','phone','service','industry','budget','timeline','contact_method'])assert(quote.includes(`name="${field}"`),`Quote missing ${field}`);
assert.equal(htmlFiles.length,31,'Expected full site route count');
const sitemap=await readFile(resolve(root,'sitemap.xml'),'utf8');assert(!sitemap.includes('/404/')&&!sitemap.includes('/thank-you/'),'Utility pages must not be indexed');
console.log(`PASS: ${htmlFiles.length} pages, ${links} local references, unique metadata, page anchors, form contracts and legacy-content checks.`);
