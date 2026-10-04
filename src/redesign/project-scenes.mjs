import {esc} from './layout.mjs';

// Lightweight, illustrative covers. Genuine product captures remain in each gallery.
export const agentRoles=['Technical Analyst','Price Action Analyst','Macro Analyst','News Analyst','Sentiment Analyst','Bull Researcher','Bear Researcher','Research Manager','Aggressive Risk','Conservative Risk','Neutral Risk','Final Manager'];
const svg=(content)=>`<svg class="project-scene-art" viewBox="0 0 720 460" fill="none" aria-hidden="true" focusable="false">${content}</svg>`;
const dots=Array.from({length:42},(_,i)=>`<circle class="engine-dot" cx="${32+i%7*42}" cy="${112+Math.floor(i/7)*48}" r="1.5" style="--delay:${-(i%9)*.45}s"/>`).join('');

function engine(){
 const candles=[{y:242,h:49,up:true},{y:213,h:34,up:true},{y:221,h:41,up:false},{y:198,h:31,up:true},{y:171,h:37,up:true},{y:183,h:40,up:false},{y:161,h:32,up:true},{y:143,h:31,up:true}];
 return svg(`${dots}<ellipse cx="220" cy="375" rx="94" ry="13" fill="#000" opacity=".18"/>
 <path class="engine-wire" d="M273 263H334V195H371M272 289H316V329H590" stroke="#6c9c91" stroke-width="1"/>
 <path class="engine-signal" d="M273 263H334V195H371M272 289H316V329H590" stroke="#c9e9c7" stroke-width="3" stroke-linecap="round"/>
 <g class="engine-terminal"><rect x="352" y="113" width="319" height="226" rx="12" fill="#162e2d" stroke="#527069"/>
 <path d="M352 151H671" stroke="#39534d"/><circle cx="371" cy="132" r="3" fill="#b6c7b2"/><circle cx="383" cy="132" r="3" fill="#627c71"/><circle cx="395" cy="132" r="3" fill="#627c71"/>
 <text x="654" y="136" text-anchor="end" fill="#bdd0bf" font-size="11" letter-spacing="2">METATRADER 5</text>
 ${[183,224,265,305].map(y=>`<path d="M373 ${y}H651" stroke="#2e4943" stroke-dasharray="3 6"/>`).join('')}
 ${candles.map((c,i)=>`<g class="engine-candle" style="--delay:${-i*.38}s;transform-origin:${387+i*35}px ${c.y+c.h/2}px" stroke="${c.up?'#b7d7ad':'#bc947d'}" fill="${c.up?'#b7d7ad':'#bc947d'}"><path d="M${387+i*35} ${c.y-11}v${c.h+22}"/><rect x="${382+i*35}" y="${c.y}" width="10" height="${c.h}" rx="1"/></g>`).join('')}
 <path class="engine-trace" d="M374 292L412 266L442 279L479 246L512 261L548 231L583 245L619 214L651 224" stroke="#ccb88a" stroke-width="1.6" stroke-linecap="round"/>
 </g><g class="engine-bot">
 <path d="M180 298v46m80-46v46" stroke="#6b9990" stroke-width="19" stroke-linecap="round"/>
 <rect x="158" y="338" width="38" height="20" rx="8" fill="#c3d9cb"/><rect x="245" y="338" width="38" height="20" rx="8" fill="#c3d9cb"/>
 <path d="M170 257q-35-2-38 30" stroke="#aec7b8" stroke-width="15" stroke-linecap="round"/><path class="bot-arm" d="M270 257q38-7 34-41" stroke="#aec7b8" stroke-width="15" stroke-linecap="round"/>
 <rect x="168" y="238" width="105" height="76" rx="25" fill="#84a99b" stroke="#d1e0cc"/>
 <path d="m202 265-10 9 10 9m37-18 10 9-10 9m-20-21-6 23" stroke="#193b34" stroke-width="3" stroke-linecap="round"/>
 <g class="bot-head"><path d="M219 157v-21" stroke="#c1d6c4" stroke-width="4"/><circle class="bot-antenna" cx="219" cy="130" r="6" fill="#dcc590"/>
 <rect x="153" y="155" width="134" height="87" rx="32" fill="#d2ddc5"/><rect x="167" y="171" width="107" height="54" rx="22" fill="#173b35"/>
 <g class="bot-eyes" stroke="#d1e6b8" stroke-width="6" stroke-linecap="round"><path d="M194 189v11m52-11v11"/></g><path d="M211 209q10 6 20 0" stroke="#8ec4a4" stroke-width="2.5" stroke-linecap="round"/></g></g>
 <g fill="#9fb6a7" font-size="10" letter-spacing="2"><text x="72" y="409">MQL5</text><text x="647" y="409" text-anchor="end">EXPERT ADVISOR</text></g>`);
}

function aurum(ctx){
 const abbreviations=['TA','PA','MA','NA','SA','BR','BE','RM','AR','CR','NR','FM'];
 const nodes=agentRoles.map((role,i)=>{const a=(-90+i*30)*Math.PI/180;return {role,i,x:360+Math.cos(a)*260,y:260+Math.sin(a)*145};});
 return svg(`<ellipse cx="360" cy="260" rx="260" ry="145" stroke="#584939" stroke-dasharray="2 9"/>
 <ellipse cx="360" cy="260" rx="177" ry="102" stroke="#3f362c"/>
 ${nodes.map(n=>`<path class="agent-wire" d="M${n.x.toFixed(1)} ${n.y.toFixed(1)}L360 260" stroke="#9c805c" opacity=".32"/>
 <path class="agent-flow" style="--delay:${-n.i*.55}s" d="M${n.x.toFixed(1)} ${n.y.toFixed(1)}L360 260" pathLength="100" stroke="#e7c791" stroke-width="2"/>`).join('')}
 <circle class="agent-halo" cx="360" cy="260" r="69" stroke="#b8915b"/><circle cx="360" cy="260" r="55" fill="#b99360"/><circle cx="360" cy="260" r="51" stroke="#e8cc9d"/>
 <text x="360" y="268" text-anchor="middle" fill="#201c17" font-size="42" font-family="Georgia,serif">12</text>
 <text x="360" y="291" text-anchor="middle" fill="#312519" font-size="9" letter-spacing="1.2">${ctx.t('AGENTS')}</text>
 ${nodes.map(n=>`<g class="agent-node" data-agent-role="${esc(n.role)}" style="--delay:${-n.i*.55}s"><title>${ctx.t(n.role)}</title><rect x="${n.x-32}" y="${n.y-23}" width="64" height="46" rx="13" fill="#2c261f" stroke="#8d7656"/><circle cx="${n.x+21}" cy="${n.y-13}" r="2" fill="#d4b67c"/><text x="${n.x}" y="${n.y+6}" text-anchor="middle" fill="#e8d8bc" font-size="15" letter-spacing="2">${abbreviations[n.i]}</text></g>`).join('')}`);
}

function reemove(ctx,p){
 const s=p.screenshots[1];
 return `<div class="sport-words" aria-hidden="true"><span>${ctx.t('Move.')}</span><span>${ctx.t('Connect.')}</span><span>${ctx.t('Grow.')}</span></div>
 ${svg(`<path d="M-80 360C160 174 186 506 461 330S710 201 821 340" stroke="#93c798" stroke-width="1"/><path d="M-80 375C160 189 186 521 461 345S710 216 821 355" stroke="#93c798" stroke-width="1"/><path class="sport-track" d="M-80 345C160 159 186 491 461 315S710 186 821 325" stroke="#f1ff8e" stroke-width="3" pathLength="100"/>
 <g class="sport-runner" stroke="#eaffb8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><circle cx="164" cy="292" r="11" fill="#eaffb8" stroke="none"/><path d="m154 313-9 36"/><path class="runner-arm-a" d="m153 315-24 11-14-15"/><path class="runner-arm-b" d="m153 315 17 14 16-6"/><path class="runner-leg-a" d="m146 344-8 24-29 3"/><path class="runner-leg-b" d="m146 344 28 14 4 28"/></g>
 <g class="sport-ball" stroke="#daeb87" stroke-width="1.5"><circle cx="292" cy="360" r="21" fill="#729c55"/><path d="M272 360h40m-20-21v42m-14-36q24 15 0 30m28-30q-24 15 0 30"/></g>`)}
 <div class="sport-phone"><div class="sport-phone-speaker"></div><img src="${esc(s.src)}" alt="${ctx.t(s.alt)}" width="390" height="844" loading="lazy"></div>`;
}

function solar(){
 // Isometric panel geometry, without another WebGL context on mobile.
 const panel=(x,y,i)=>`<g class="solar-panel" style="--delay:${-i*.5}s"><path d="M${x} ${y+12}l76-36 91 42-76 39z" fill="#758b95"/>
 <path d="M${x} ${y}l76-36 91 42-76 39z" fill="#254b60" stroke="#8db0ba" stroke-width="2"/>
 ${[1,2,3].map(v=>`<path d="M${x+v*19} ${y-v*9}l91 42M${x+v*22.75} ${y+v*10.5}l76-36" stroke="#7c9caa" stroke-width=".7"/>`).join('')}
 <path class="panel-glint" d="M${x+19} ${y-9}l91 42" stroke="#dae9e0" stroke-width="4"/></g>`;
 return svg(`<path d="M73 277Q309-29 653 170" stroke="#cabc8e" stroke-dasharray="3 8"/>
 <g class="solar-sun"><circle cx="569" cy="124" r="53" fill="#edcf85" opacity=".22"/><circle cx="569" cy="124" r="37" fill="#e7bd5d"/>
 ${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return `<path d="M${569+Math.cos(a)*64} ${124+Math.sin(a)*64}l${Math.cos(a)*11} ${Math.sin(a)*11}" stroke="#cb9c45" stroke-width="2" stroke-linecap="round"/>`;}).join('')}</g>
 <path class="solar-rays" d="m505 139-173 79m201-41-115 89m83-42-36 62" stroke="#ccab59" stroke-width="1.6" stroke-dasharray="3 14"/>
 <ellipse cx="339" cy="359" rx="204" ry="31" fill="#3b535b" opacity=".09"/>
 <path d="M194 324v35m114-71v103m122-65v30" stroke="#879a99" stroke-width="6"/>
 ${[[266,201],[355,245],[177,243],[266,287]].map(([x,y],i)=>panel(x,y,i)).join('')}
 <path d="M449 337h59v38h54" stroke="#b5b9a2" stroke-width="2"/><path class="solar-energy" d="M449 337h59v38h54" pathLength="100" stroke="#bc9036" stroke-width="3"/>
 <g transform="translate(566 337)" stroke="#526d6b" stroke-width="2"><path d="m-3 16 27-20 27 20M4 11v37h39V11"/><path d="M17 48V28h12v20"/><path d="m20 10-5 9h8l-4 8" stroke="#b98c32"/></g>`);
}

export function animatedProjectMedia(ctx,p){
 const subtitles={engine:'Automation, set in motion.',aurum:'Twelve minds. One research flow.',reemove:'Move together. Grow stronger.',solar:'An experience, not just a website.'};
 const descriptions={engine:'Animated bot, moving data dots and illustrative market candles.',aurum:'Twelve connected research roles exchange information around a shared workspace.',reemove:'A running athlete, moving sports typography and the actual ReeMove welcome screen.',solar:'Sunlight travels across an illustrative solar array and energy flows toward a home.'};
 const illustration=p.visual==='reemove'?'App interface + motion design':'Animated project illustration';
 return `<div class="work-cover animated-cover scene-${esc(p.visual)}" data-project-scene="${esc(p.visual)}" data-scene-playing="false" dir="ltr"><span class="sr-only">${ctx.t(descriptions[p.visual])}</span><div class="scene-wordmark"><span>${esc(p.title)}</span><small dir="${ctx.lang==='en'?'ltr':'rtl'}">${ctx.t(subtitles[p.visual])}</small></div>${p.visual==='engine'?engine():p.visual==='aurum'?aurum(ctx):p.visual==='reemove'?reemove(ctx,p):solar()}<span class="scene-caption" dir="${ctx.lang==='en'?'ltr':'rtl'}">${ctx.t(illustration)}</span>${p.visual==='aurum'?`<span class="scene-corner-label">${ctx.t('Paper research')}</span>`:''}</div>`;
}
