import {esc,href,icon,link} from './layout.mjs';
import {animatedProjectMedia} from './project-scenes.mjs';

export function projectBanner(ctx,projects){
 const t=ctx.t;
 return `<div class="project-reel" data-project-reel role="region" aria-label="${t('Featured project showcase')}">
 <div class="reel-viewport" id="project-reel-slides"><div class="reel-track">
 ${projects.map((p,i)=>`<article class="reel-slide" data-reel-slide aria-label="${esc(p.title)} · ${i+1} / ${projects.length}"><a class="reel-art-link" href="${href('work/'+p.slug,ctx.lang)}" aria-label="${t('View Project')}: ${esc(p.title)}">${animatedProjectMedia(ctx,p)}</a><div class="reel-copy"><p class="reel-index" dir="ltr">0${i+1}<span> / 0${projects.length}</span></p><p class="eyebrow">${t(p.category)}</p><h3>${esc(p.title)}</h3><p class="reel-description">${t(p.shortDescription)}</p><p class="reel-status"><span></span>${t(p.status)}</p>${link('Explore project','work/'+p.slug,ctx,'text-link')}</div></article>`).join('')}
 </div></div>
 <div class="reel-controls" data-reel-controls hidden><div class="reel-selectors" role="group" aria-label="${t('Choose a project')}">${projects.map((p,i)=>`<button type="button" class="reel-selector" data-reel-select="${i}" aria-controls="project-reel-slides" aria-label="${t('Show project')}: ${esc(p.title)}" aria-pressed="${i===0}"><span class="reel-selector-number" aria-hidden="true">0${i+1}</span><span class="reel-selector-title">${esc(p.title)}</span><span class="reel-progress" aria-hidden="true"></span></button>`).join('')}</div><div class="reel-transport"><button type="button" data-reel-previous aria-label="${t('Previous project')}">${icon('arrow')}</button><button type="button" data-reel-pause aria-label="${t('Pause showcase')}" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path class="reel-pause-icon" d="M9 6v12M15 6v12"/><path class="reel-play-icon" d="m9 6 9 6-9 6Z"/></svg></button><button type="button" data-reel-next aria-label="${t('Next project')}">${icon('arrow')}</button></div></div>
 <p class="sr-only" data-reel-announcement aria-live="polite" aria-atomic="true"></p></div>
 <div class="reel-footer"><p>${t('Four projects. Different challenges. The same care for the details.')}</p>${link('View all projects','work',ctx,'button outline')}</div>`;
}
