# MooseTVs premium redesign

The redesign continues the existing business website from commit `65b98a6`. That commit remains in Git history and the previously exported ZIP remains intact. The existing Netlify build command (`npm run build`), publish directory (`dist`), domain and GitHub repository are retained. No DNS, Namecheap or Contabo work is involved.

## Local development

Use Node 22 or newer:

```sh
npm ci
npm run build
npm test
npm run dev
```

Open http://127.0.0.1:4173. Rebuild and refresh after editing. `dist/` is generated and ignored by Git. The project's original generator remains in history; `npm run build` now uses `scripts/build-premium.mjs`.

## Design and pages

Charcoal, warm ivory and muted gold; restrained serif emphasis; custom HTML/SVG software illustrations; shorter copy; distinct sections; responsive navigation; reduced-motion support. No remote fonts, stock imagery, invented customers or testimonials.

44 routes × 3 languages: home, service index and four services, work and seven project details, industries and eight industry pages, pricing, about, contact, quote, privacy, terms, utility pages, five account routes and seven interactive demos. The established `/digital-products/` URL continues to work with canonical metadata pointing to `/services/digital-products/`.

Core templates are in `src/redesign/`. Shared browser behavior is in `src/browser/`. Styling is in `public/premium.css`; the existing base demo styles are retained. Old `src/pages.mjs`, `src/additional-pages.mjs` and `public/locales/core.js` are legacy source and are not used by the new build.

## Translations

`src/locales/en.json`, `he.json` and `ar.json` contain matching message keys. Shared templates generate complete HTML at `/`, `/he/` and `/ar/`; every page has language, direction, canonical and hreflang metadata. English is the default. The header/footer selector persists a choice in browser local storage. Hebrew and Arabic use RTL and logical CSS properties. Main content, forms, account states, errors and demo controls are translated. Technology and fictional brand names are retained. The free editable HTML download remains an English-language starter.

Add a message to all three locale files; missing messages fail the build/test. Do not duplicate templates for another language.

## Portfolio

Edit `src/redesign/data.mjs`. Each project supports:

```js
{
  title: 'Project title', slug: 'project-slug', category: 'Website',
  shortDescription: 'One sentence.', fullDescription: 'The project story.',
  technologies: ['HTML / CSS'],
  screenshots: [{src: '/images/project.webp', alt: 'Descriptive screenshot text'}],
  status: 'Concept project', demoUrl: '/demos/business/', githubUrl: null,
  featured: true, year: 2026, visual: 'website'
}
```

Put optimized screenshots in `public/images/`, add translated copy, then build. Cards, homepage features, detail pages and sitemap entries are generated automatically. `githubUrl` should be an HTTPS URL for a public repository only. Categories and status should accurately describe the real work. Current entries are explicitly labeled concepts, not client case studies.

## Prices

Starter Website $299; Business Website $599; AI Automation $349; Maintenance $29/month; Managed Automation Support $99/month. Custom Software is quote-based. The page discloses that these are starting prices for a defined scope. Shekel estimates use the explicitly disclosed illustrative display rate of $1 = ₪3.50, rounded to whole shekels, not a live exchange rate.

## Real authentication: Supabase

The official `@supabase/supabase-js` client handles email/password signup, signin, recovery, password updates, logout and persisted sessions. Confirmation/recovery uses PKCE. Account details are obtained using `auth.getUser()`, which verifies the session with Supabase. The static account HTML is only an empty shell; no personal data is embedded. The shell redirects unauthenticated visitors to signin and remains hidden until the provider verifies a user. Do not add private project data to static HTML. Future data APIs must enforce authorization and Supabase Row Level Security on the server/database, never user-editable metadata or UI flags.

The account screen includes verified account details, display-name editing, a password-reset action and clearly marked future Projects, Quotes and Digital Products sections. No fake customer account, local-password store or simulated signup is shipped.

When credentials are missing, the public website builds normally and account forms are disabled with a clear contact message. Live signup is not activated or claimed in this state.

### Required setup

1. Sign in to https://supabase.com/dashboard and create/select a project on the Free plan. Keep email confirmation enabled and use a minimum password length of 12 in Authentication settings.
2. Under Authentication → URL Configuration, set Site URL to `https://moosetvs.com` and allow these exact redirect URLs:

```
https://moosetvs.com/account/
https://moosetvs.com/he/account/
https://moosetvs.com/ar/account/
https://moosetvs.com/reset-password/
https://moosetvs.com/he/reset-password/
https://moosetvs.com/ar/reset-password/
```

For local testing only, add the same six paths under `http://127.0.0.1:4173`. Add an exact preview origin if you want email callbacks to work in a deploy preview. Open email links in the same browser that began the flow because PKCE stores its verifier there.

3. Configure a production-capable SMTP sender in Supabase Authentication → Email/SMTP settings. Supabase's default mail sender is restricted to authorized team addresses and is not sufficient for public signup or password recovery. Use an existing/free-compatible sender within its limits. Do not disable confirmation to work around mail delivery. No SMTP credentials belong in this repository or in browser environment variables.
4. In [Netlify environment variables](https://app.netlify.com/projects/silly-sunshine-fc9622/configuration/env), add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for Builds (production and any required previews), using the project's URL and public publishable key. A legacy public `SUPABASE_ANON_KEY` is accepted instead. Redeploy after saving.
5. For local auth testing, copy `.env.example` to ignored `.env`, fill only public values, and build with `node --env-file=.env scripts/build-premium.mjs`.
6. Test signup with an owned test email, confirmation, signin, reload persistence, profile update, logout, direct account access after logout, forgot-password email, reset, expired recovery link, and login with the new password. Repeat language/RTL screens. These provider/email tests require a configured project and are distinct from the automated API-contract tests.

The build rejects secret/service-role keys. Only public project credentials are serialized. The one necessary Netlify header change allows browser connections to `https://*.supabase.co` and keeps existing CSP protections, adding `object-src 'none'`. No build/publish/domain configuration is otherwise changed.

Official guidance: https://supabase.com/docs/guides/auth/passwords and https://supabase.com/docs/guides/auth/auth-smtp

## Enquiry forms

Contact and quote forms keep the Netlify `contact` and `quote` form names and stable English field values across languages. The submitted `language` identifies the chosen locale. Confirm form detection is enabled and submission notifications go to `moosetvs1@gmail.com`. Local previews intentionally do not send enquiries. Invalid forms are blocked; network failures preserve entered details. Campaign attribution remains first-party and no analytics network integration is installed.

## Verification and deployment

`npm test` checks 132 documents, local links/anchors, locale completeness, metadata, protected shell/indexing, project schema, Netlify form contracts, public-key validation and auth-provider API contracts. Browser QA covers responsive English/Hebrew/Arabic layouts, navigation, filters, form validation and demo interactions. Live auth/email needs the setup above.

At the start of this redesign, GitHub main was `65b98a6` and Netlify's existing project `silly-sunshine-fc9622` was marked **Private**. Unauthenticated requests to `https://moosetvs.com` returned HTTP 401 before any redesign was deployed. Public access must be explicitly enabled via Netlify's **Make public** control if desired; the redesign does not silently change project access.

After pushing, verify the Netlify production deploy's commit SHA, build log, Forms detection and the actual production page. Publishing code does not configure Supabase or email delivery. Keep this distinction in the handoff report.
