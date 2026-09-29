const toggle = document.querySelector('.menu-toggle');
toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); document.querySelector('#navigation').classList.toggle('open', open); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { toggle.click(); toggle.focus(); } });

// Optional first-party analytics hook. Never includes form contents or contact details.
const track = (name, detail={}) => window.dispatchEvent(new CustomEvent('moosetvs:analytics', {detail:{name,path:location.pathname,...detail}}));
document.querySelectorAll('[data-track]').forEach(el=>el.addEventListener('click',()=>track(el.dataset.track,{label:el.textContent.trim()})));
const params = new URLSearchParams(location.search);
let attribution = {};
try { attribution = JSON.parse(sessionStorage.getItem('moosetvs_campaign') || '{}'); } catch { /* Storage may be blocked. */ }
if(!attribution || typeof attribution !== 'object' || Array.isArray(attribution)) attribution={};
const campaignFields=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
if(campaignFields.some(k=>params.has(k))) {
  attribution = {landing_page:location.pathname};
  for(const k of campaignFields) attribution[k]=(params.get(k)||'').slice(0,200);
  try { sessionStorage.setItem('moosetvs_campaign',JSON.stringify(attribution)); } catch { /* Still attach to forms on this page. */ }
}
if(!attribution.landing_page) attribution.landing_page=location.pathname;
document.querySelectorAll('[data-lead-form]').forEach(form=>{
  for(const key of [...campaignFields,'landing_page']) if(form.elements[key]) form.elements[key].value=String(attribution[key]||'').slice(0,200);
  if(form.elements.service && [...form.elements.service.options].some(o=>o.value===params.get('service'))) form.elements.service.value=params.get('service');
  const phone=form.elements.phone;
  const method=form.elements.contact_method;
  const validateContact = () => { if(phone) {phone.required=Boolean(method && method.value && method.value!=='Email');phone.setCustomValidity(phone.required && !phone.value.trim() ? 'Add a phone number for phone or WhatsApp contact.' : '');} };
  method?.addEventListener('change',validateContact);phone?.addEventListener('input',validateContact);
  form.addEventListener('submit',async e=>{
    e.preventDefault();validateContact();if(!form.reportValidity())return;
    const status=form.querySelector('.form-status');
    if(['localhost','127.0.0.1'].includes(location.hostname)) {status.textContent='This is the local preview; forms send only after Netlify Forms is enabled on the deployed site. You can email moosetvs1@gmail.com now.';return;}
    const submit=form.querySelector('[type="submit"]');submit.disabled=true;status.textContent='Sending your enquiry…';
    try {
      const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
      if(!response.ok) throw new Error('Submission failed');
      const formName=form.getAttribute('name');
      track(formName==='quote'?'quote_submission':'contact_submission',{form:formName});
      location.assign('/thank-you/');
    } catch {status.textContent='We couldn’t send your enquiry. Your details are still here. Please try again or email moosetvs1@gmail.com.';submit.disabled=false;}
  });
});
const localDate = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
document.querySelectorAll('[data-future-date]').forEach(input=>{input.min=localDate();input.value=localDate();});
const safe = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// The support concept is deliberately deterministic; it never calls a live AI service.
const chat=document.querySelector('#chat-log');
if(chat){
  const initial=chat.innerHTML;
  const answer = question => {
    const q=question.toLowerCase();
    if(/hour|open|close|weekend/.test(q))return 'In this fictional studio, we’re open Monday–Friday, 7am–8pm, and Saturday, 9am–2pm. We’re closed Sunday.';
    if(/price|cost|pay|member/.test(q))return 'Sample pricing: a drop-in class is $15 and a monthly membership is $79. These are invented demo prices.';
    if(/book|visit|trial|first/.test(q))return 'You can try the booking demo from our Work page. For a sample follow-up, fill out the handoff form beside this conversation. No real booking is made.';
    if(/class|train|yoga|fitness/.test(q))return 'Our fictional timetable includes strength, mobility and small-group fitness sessions. Select your interest in the handoff form to prepare a sample enquiry.';
    if(/where|location|address/.test(q))return 'Cedar Studio is a fictional business, so it has no real address. This demo shows how a business could answer location questions.';
    if(/hello|hi\b|hey/.test(q))return 'Hello! Try asking about opening hours, class prices or a first visit.';
    return 'That needs a person’s input. This scripted demo covers hours, classes, prices and booking. Use the sample handoff form to show how a question could reach a human.';
  };
  function send(question){if(!question.trim())return;for(const [text,user] of [[question,true],[answer(question),false]]){const bubble=document.createElement('div');bubble.className='bubble'+(user?' user':'');bubble.textContent=text;chat.append(bubble);}chat.scrollTop=chat.scrollHeight;}
  document.querySelector('#chat-form').addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#chat-input');send(input.value);input.value='';input.focus();});
  document.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.question)));
  document.querySelector('#chat-reset').addEventListener('click',()=>{chat.innerHTML=initial;document.querySelector('#handoff-result').hidden=true;document.querySelector('#handoff-form').reset();});
  document.querySelector('#handoff-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);const result=document.querySelector('#handoff-result');result.hidden=false;result.textContent=`Sample handoff ready: ${data.get('name')} (${data.get('email')}) is interested in ${data.get('interest').toLowerCase()}. Next step: a team member reviews the enquiry. Nothing has been sent.`;});
}
const bookingForm=document.querySelector('#booking-form');
if(bookingForm){
  const bookings=[];let id=0;const list=document.querySelector('#bookings-list');
  const render=()=>{list.innerHTML=bookings.length?bookings.map(b=>`<article class="booking-item"><span class="demo-label">DEMO BOOKING</span><h3>${safe(b.name)}</h3><p>${safe(b.service)}</p><strong>${safe(b.date)} · ${safe(b.time)}</strong><button class="text-button" data-cancel="${b.id}" aria-label="Cancel demo booking for ${safe(b.name)}">Cancel booking</button></article>`).join(''):'<p class="empty-state">No demo appointments. Choose a time to get started.</p>';};
  bookingForm.addEventListener('submit',e=>{e.preventDefault();const b=Object.fromEntries(new FormData(bookingForm));const status=bookingForm.querySelector('.form-status');if(b.date<localDate()){status.textContent='Please choose today or a future date.';return;}if(bookings.some(x=>x.date===b.date && x.time===b.time)){status.textContent='That demo slot is already booked. Choose another time or cancel the existing appointment.';return;}bookings.push({...b,id:++id});render();status.textContent=`Demo booking added for ${b.date} at ${b.time}. No real appointment was made.`;});
  list.addEventListener('click',e=>{const btn=e.target.closest('[data-cancel]');if(!btn)return;const i=bookings.findIndex(b=>b.id===Number(btn.dataset.cancel));if(i!==-1)bookings.splice(i,1);render();bookingForm.querySelector('.form-status').textContent='Demo booking cancelled. The slot is available again.';});
}
document.querySelectorAll('[data-menu-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-menu-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));document.querySelectorAll('[data-menu-category]').forEach(dish=>dish.hidden=btn.dataset.menuFilter!=='all'&&dish.dataset.menuCategory!==btn.dataset.menuFilter);}));
for(const [id,message] of [['reservation-form',d=>`Sample request prepared for ${d.name}: ${d.party}, ${d.date} at ${d.time}. In a live site, the restaurant would confirm availability. Nothing was sent or reserved.`],['business-form',d=>`Sample enquiry prepared for ${d.name} about ${d.service.toLowerCase()}. A live business would receive these details for follow-up. This demo has not sent anything.`]]){
  document.getElementById(id)?.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));e.currentTarget.querySelector('.form-status').textContent=message(d);});
}
const leadRows=document.querySelector('#lead-rows');
if(leadRows){
  const leads=[['Alex Reed','Cedar Studio','Website','New',799],['Sam Taylor','Olive & Ember','Automation','In progress',499],['Jamie Morgan','Northline','Website','Won',799],['Robin Lee','Harbour Homes','Custom software','New',2400],['Casey Ellis','The Corner Store','Website','In progress',399],['Jordan Quinn','Maple Salon','Automation','Won',650],['Avery Gray','City Fitness','Custom software','In progress',1800],['Riley Brooks','Parkside Garage','Website','New',799]];
  const status=document.querySelector('#lead-status'),search=document.querySelector('#lead-search');
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  function render(){const q=search.value.trim().toLowerCase();const filtered=leads.filter(r=>(status.value==='all'||r[3]===status.value)&&r.slice(0,3).some(t=>t.toLowerCase().includes(q)));leadRows.innerHTML=filtered.length?filtered.map(([n,c,s,st,v])=>`<tr><td>${safe(n)}</td><td>${safe(c)}</td><td>${s}</td><td><span class="stage stage-${st.toLowerCase().replace(' ','-')}">${st}</span></td><td>${money(v)}</td></tr>`).join(''):'<tr><td colspan="5" class="empty-state">No leads match your filters.</td></tr>';document.querySelector('#dashboard-metrics').innerHTML=[['Matching leads',filtered.length],['Potential pipeline value',money(filtered.filter(r=>r[3]!=='Won').reduce((a,r)=>a+r[4],0))],['Won project value',money(filtered.filter(r=>r[3]==='Won').reduce((a,r)=>a+r[4],0))]].map(([n,v])=>`<div><span>${n}</span><strong>${v}</strong></div>`).join('');document.querySelector('#pipeline-chart').innerHTML=['New','In progress','Won'].map(st=>{const n=filtered.filter(r=>r[3]===st).length;return `<div class="chart-row"><span>${st}</span><meter min="0" max="${Math.max(filtered.length,1)}" value="${n}" aria-label="${st}: ${n} of ${filtered.length} leads">${n}</meter><strong>${n}</strong></div>`;}).join('');}
  search.addEventListener('input',render);status.addEventListener('change',render);document.querySelector('#reset-dashboard').addEventListener('click',()=>{search.value='';status.value='all';render();});render();
}
const run=document.querySelector('#run-workflow');
if(run){
  let token=0;const steps=[...document.querySelectorAll('.simulation-steps li')];const result=document.querySelector('#workflow-result');const scenario=document.querySelector('#workflow-scenario');
  const reset=()=>{token++;steps.forEach(li=>{li.classList.remove('complete','running');li.querySelector('.simulation-status').textContent='Waiting';});run.disabled=false;scenario.disabled=false;result.textContent='Ready when you are.';};
  document.querySelector('#reset-workflow').addEventListener('click',reset);
  run.addEventListener('click',async()=>{reset();const current=token;run.disabled=true;scenario.disabled=true;const labels={website:'Web Development',automation:'AI Automation',software:'Custom Software'};for(let i=0;i<steps.length;i++){if(current!==token)return;const step=steps[i];step.classList.add('running');step.querySelector('.simulation-status').textContent='Running';result.textContent=`Step ${i+1} of 5: ${step.querySelector('h3').textContent}.`;await new Promise(r=>setTimeout(r,500));if(current!==token)return;step.classList.remove('running');step.classList.add('complete');step.querySelector('.simulation-status').textContent='Done';}result.textContent=`Simulation complete. Service: ${labels[scenario.value]}. Sample record prepared, acknowledgement drafted and owner handoff queued. No external action was taken.`;run.disabled=false;scenario.disabled=false;});
}
