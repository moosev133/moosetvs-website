const lang=document.documentElement.lang;
const base=lang==='en'?'':`/${lang}`;
const strings=JSON.parse(document.getElementById('ui-messages').textContent);
export const t=key=>strings[key]||key;
export const localPath=path=>`${base}/${path.replace(/^\/+|\/+$/g,'')}/`;
const route=document.body.dataset.route;
// Language is encoded in the URL for shareable, fully rendered pages. Remember the choice.
try{
 const selected=localStorage.getItem('moosetvs_language');
 const explicit=new URLSearchParams(location.search).has('lang');
 const authCallback=/[?#&](?:code|access_token|error|token_hash)=/.test(location.href);
 if(lang==='en'&&['he','ar'].includes(selected)&&!explicit&&!authCallback){location.replace(`/${selected}${location.pathname}${location.search}${location.hash}`);}
 if(lang!=='en'||explicit)localStorage.setItem('moosetvs_language',lang);
}catch{/* Language links still work when browser storage is unavailable. */}
document.querySelectorAll('[data-language]').forEach(select=>select.addEventListener('change',()=>{
 const next=select.value;if(!['en','he','ar'].includes(next))return;
 try{localStorage.setItem('moosetvs_language',next);}catch{}
 const path=`${next==='en'?'':`/${next}`}/${route==='404'?'404.html':route+(route?'/':'')}`;
 const query=new URLSearchParams(location.search);query.set('lang',next);
 location.assign(path+'?'+query.toString()+location.hash);
}));
const toggle=document.querySelector('.menu-toggle');
const nav=document.getElementById('navigation');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){toggle.click();toggle.focus();}});
nav?.addEventListener('click',e=>{if(e.target.closest('a')&&toggle.getAttribute('aria-expanded')==='true')toggle.click();});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('[data-project-category]').forEach(card=>card.hidden=button.dataset.filter!=='All'&&card.dataset.projectCategory!==button.dataset.filter);
}));
let attribution={};const params=new URLSearchParams(location.search);
try{const saved=JSON.parse(sessionStorage.getItem('moosetvs_campaign')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))attribution=saved;}catch{}
const fields=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
if(fields.some(k=>params.has(k))){attribution={landing_page:location.pathname};for(const k of fields)attribution[k]=(params.get(k)||'').slice(0,200);try{sessionStorage.setItem('moosetvs_campaign',JSON.stringify(attribution));}catch{}}
for(const form of document.querySelectorAll('[data-enquiry]')){
 for(const key of [...fields,'landing_page'])form.elements[key].value=String(attribution[key]||(key==='landing_page'?location.pathname:'')).slice(0,200);
 const plan=params.get('plan'),service=params.get('service')||(plan?.includes('Website')?'Web Development':plan);
 if([...form.elements.service.options].some(o=>o.value===service))form.elements.service.value=service;
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!form.reportValidity())return;
  const status=form.querySelector('.form-status'),submit=form.querySelector('[type=submit]');
  if(['localhost','127.0.0.1'].includes(location.hostname)){status.textContent=t('Local preview: enquiries send on the live Netlify site. You can email moosetvs1@gmail.com.');return;}
  submit.disabled=true;status.textContent=t('Sending your enquiry…');
  try{const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});if(!response.ok)throw new Error();location.assign(form.action);}
  catch{status.textContent=t('We couldn’t send your enquiry. Your details are still here. Please try again or email us.');status.dataset.error='true';submit.disabled=false;}
 });
}
