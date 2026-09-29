import {t,localPath} from './site.js';
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr=s=>safe(t(s));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
document.querySelectorAll('[data-future-date]').forEach(input=>{input.min=today();input.value=today();});
const chat=document.getElementById('chat-log');
if(chat){
 const initial=chat.innerHTML;
 function send(question){
  let answer='This scripted demo covers hours, prices and first visits. Try the sample handoff for other questions.';
  if(/hour|open|שעות|פתוח|ساعات|دوام|Opening hours/i.test(question))answer='Sample hours: Monday–Friday, 7am–8pm. Saturday, 9am–2pm.';
  if(/price|cost|מחיר|עולה|سعر|أسعار|تكلف/i.test(question))answer='Sample pricing: $15 for one class. These are fictional demo prices.';
  if(/visit|book|ביקור|תור|زيارة|حجز/i.test(question))answer='Try the booking demo or prepare a sample handoff. No real appointment is made.';
  for(const [text,user] of [[question,true],[t(answer),false]]){const bubble=document.createElement('div');bubble.className='bubble'+(user?' user':'');bubble.textContent=text;chat.append(bubble);}chat.scrollTop=chat.scrollHeight;
 }
 document.getElementById('chat-form').addEventListener('submit',e=>{e.preventDefault();const input=document.getElementById('chat-input');if(input.value.trim())send(input.value);input.value='';input.focus();});
 document.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>send(t(b.dataset.question))));
 document.getElementById('chat-reset').addEventListener('click',()=>{chat.innerHTML=initial;document.getElementById('handoff-form').reset();document.querySelector('#handoff-form .form-status').textContent='';});
 document.getElementById('handoff-form').addEventListener('submit',e=>{e.preventDefault();e.currentTarget.querySelector('.form-status').textContent=t('Sample handoff prepared. Nothing was sent.');});
}
const booking=document.getElementById('booking-form');
if(booking){
 let serial=0;const bookings=[],list=document.getElementById('bookings-list'),status=booking.querySelector('.form-status');
 const render=()=>list.innerHTML=bookings.length?bookings.map(b=>`<article class="booking-item"><span class="demo-label">${tr('Demo')}</span><h3>${safe(b.name)}</h3><p>${tr(b.service)}</p><strong><bdi>${safe(b.date)} · ${safe(b.time)}</bdi></strong><button class="text-button" data-cancel="${b.id}">${tr('Cancel booking')}</button></article>`).join(''):`<p class="empty-state">${tr('No sample appointments yet.')}</p>`;
 booking.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(booking));if(data.date<today()){status.textContent=t('Choose today or a future date.');return;}if(bookings.some(b=>b.date===data.date&&b.time===data.time)){status.textContent=t('That sample slot is taken. Choose another time.');return;}bookings.push({...data,id:++serial});render();status.textContent=t('Sample appointment added. No real booking was made.');});
 list.addEventListener('click',e=>{const button=e.target.closest('[data-cancel]');if(!button)return;const index=bookings.findIndex(b=>b.id===Number(button.dataset.cancel));if(index<0)return;bookings.splice(index,1);render();status.textContent=t('Sample appointment cancelled.');});
}
document.querySelectorAll('[data-menu-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-menu-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('[data-menu-category]').forEach(x=>x.hidden=b.dataset.menuFilter!=='all'&&x.dataset.menuCategory!==b.dataset.menuFilter);}));
for(const id of ['reservation-form','business-form'])document.getElementById(id)?.addEventListener('submit',e=>{e.preventDefault();e.currentTarget.querySelector('.form-status').textContent=t('Sample request prepared. Nothing was sent or reserved.');});
const rows=document.getElementById('lead-rows');
if(rows){
 const data=[['Alex Reed','Cedar Studio','Website','New',599],['Sam Taylor','Olive & Ember','AI Automation','In progress',349],['Jamie Morgan','Northline','Website','Won',599],['Robin Lee','Harbour Homes','Custom Software','New',2400],['Casey Ellis','The Corner Store','Website','In progress',299],['Jordan Quinn','Maple Salon','AI Automation','Won',650],['Avery Gray','City Fitness','Custom Software','In progress',1800],['Riley Brooks','Parkside Garage','Website','New',599]];
 const search=document.getElementById('lead-search'),filter=document.getElementById('lead-status');
 const money=n=>new Intl.NumberFormat(document.documentElement.lang,{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
 function render(){
  const q=search.value.trim().toLowerCase();const result=data.filter(r=>(filter.value==='all'||r[3]===filter.value)&&[...r.slice(0,3),t(r[2])].some(x=>x.toLowerCase().includes(q)));
  rows.innerHTML=result.length?result.map(([name,company,service,stage,value])=>`<tr><td>${safe(name)}</td><td>${safe(company)}</td><td>${tr(service)}</td><td><span class="stage">${tr(stage)}</span></td><td><bdi>${safe(money(value))}</bdi></td></tr>`).join(''):`<tr><td colspan="5" class="empty-state">${tr('No leads match your filters.')}</td></tr>`;
  document.getElementById('dashboard-metrics').innerHTML=[['Matching leads',result.length],['Potential value',money(result.filter(r=>r[3]!=='Won').reduce((n,r)=>n+r[4],0))],['Won value',money(result.filter(r=>r[3]==='Won').reduce((n,r)=>n+r[4],0))]].map(([label,value])=>`<div><span>${tr(label)}</span><strong><bdi>${safe(value)}</bdi></strong></div>`).join('');
  document.getElementById('pipeline-chart').innerHTML=['New','In progress','Won'].map(stage=>{const n=result.filter(r=>r[3]===stage).length;return `<div class="chart-row"><span>${tr(stage)}</span><meter min="0" max="${Math.max(result.length,1)}" value="${n}" aria-label="${tr(stage)}">${n}</meter><span>${n}</span></div>`;}).join('');
 }
 search.addEventListener('input',render);filter.addEventListener('change',render);document.getElementById('reset-dashboard').addEventListener('click',()=>{search.value='';filter.value='all';render();});render();
}
const run=document.getElementById('run-workflow');
if(run){const result=document.getElementById('workflow-result'),steps=[...document.querySelectorAll('.simulation-steps li')];let timer;
 const reset=()=>{clearTimeout(timer);run.disabled=false;for(const step of steps){step.classList.remove('complete','running');step.querySelector('.simulation-status').textContent=t('Waiting');}result.textContent=t('Ready when you are.');};
 run.addEventListener('click',()=>{reset();run.disabled=true;let index=0;function next(){if(index>0){steps[index-1].classList.replace('running','complete');steps[index-1].querySelector('.simulation-status').textContent=t('Done');}if(index===steps.length){run.disabled=false;result.textContent=t('Simulation complete. No records or messages were sent.');return;}steps[index].classList.add('running');steps[index].querySelector('.simulation-status').textContent=t('Running');result.textContent=document.getElementById('workflow-scenario').selectedOptions[0].textContent;index++;timer=setTimeout(next,350);}next();});
 document.getElementById('reset-workflow').addEventListener('click',reset);
}
