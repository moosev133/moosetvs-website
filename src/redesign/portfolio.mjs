import {esc,href,icon,link,heading,pageHero,cta} from './layout.mjs';
import {animatedProjectMedia} from './project-scenes.mjs';

export function projectMedia(ctx,p){
 return animatedProjectMedia(ctx,p);
}

export function realProjectPage(ctx,p){
 const t=ctx.t;
 return pageHero(ctx,p.category,p.title,p.shortDescription)+`<section class="wrap project-detail section-first real-project-detail"><div class="project-showcase">${projectMedia(ctx,p)}</div><div class="project-story"><div><p class="eyebrow">${t(p.status)} · ${p.year}</p><h2>${t('The project')}</h2><p>${t(p.fullDescription)}</p><div class="button-row">${p.liveUrl?`<a class="button" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer">${t('Visit live website')}${icon('arrow')}<span class="sr-only"> (${t('opens in a new tab')})</span></a>`:''}${link('Build something like this','quote',ctx,p.liveUrl?'text-link':'button')}${link('All work','work',ctx,'text-link')}</div></div><aside><h3>${t('Built with')}</h3><div class="technology-list">${p.technologies.map(x=>`<span>${esc(x)}</span>`).join('')}</div><h3>${t('Status')}</h3><p>${t(p.status)}</p></aside></div><div class="project-capabilities">${p.highlights.map((h,i)=>`<div><span>0${i+1}</span><h3>${t(h)}</h3></div>`).join('')}</div><section class="project-gallery" aria-label="${t('Project gallery')}">${heading(ctx,'A closer look',p.visual==='engine'?'Inside the idea.':'The details make the difference.')}<div class="project-gallery-grid">${p.screenshots.map(s=>`<figure class="project-figure${s.mobile?' is-mobile':''}"><a href="${esc(s.src)}" target="_blank" rel="noopener noreferrer" aria-label="${t('Open full image')}: ${t(s.alt)} (${t('opens in a new tab')})"><img src="${esc(s.src)}" alt="${t(s.alt)}" width="${s.mobile?390:p.visual==='engine'?1200:1265}" height="${s.mobile?844:p.visual==='engine'?800:712}" loading="lazy"></a><figcaption>${t(s.caption)} <span aria-hidden="true">↗</span></figcaption></figure>`).join('')}</div></section><div class="project-context"><span>${icon('info')}</span><p>${t(p.note)}</p></div></section>`+cta(ctx);
}
