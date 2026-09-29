# MooseTVs business website

Static, dependency-free business website replacing the original trading site. Content and shared components are authored in `src/`, with browser assets in `public/`. Node generates complete HTML for all routes so SEO and Netlify Forms do not depend on client-side rendering.

## Local development

Requires Node 20+ (Netlify uses Node 22). No npm dependencies or install are needed.

```sh
npm run build
npm test
npm run dev
```

Open http://127.0.0.1:4173. Re-run the build and refresh after source edits. `dist/` is generated and ignored. The local server deliberately rejects POST requests: preview forms show an explanation and the real email link, never a fake success.

## Included

- Home; services; AI automation; web development; custom software; digital products; work; industries; eight industry pages; pricing; about; contact; quote; privacy; terms; thank-you; 404.
- Seven demo routes: deterministic support assistant and sample handoff, booking and admin view, restaurant menu/reservation concept, local-business enquiry concept, searchable dashboard, workflow simulation, downloadable HTML starter (MIT).
- Responsive layouts, accessible labels and native controls, unique titles/descriptions, social metadata, canonical URLs, sitemap, robots, favicon and Organization microdata.
- All actual business contact links use **moosetvs1@gmail.com**. There is no invented business phone, location, client, testimonial or social account.

## Netlify deployment

`netlify.toml` sets build command `npm run build` and publish directory `dist`. It keeps hosting on Netlify, with no functions, paid packages, API keys, login system or database required.

1. Review the local build before publishing. The old files are retained in Git history.
2. Enable **Forms → Enable form detection** for the existing Netlify project, then deploy.
3. Verify that `quote` and `contact` are detected in Netlify Forms.
4. Under **Forms → Submission notifications**, add email notifications to **moosetvs1@gmail.com** for both forms. An address in the website source does not configure Netlify notifications.
5. Submit an authorised test enquiry on the deployed site, check its Netlify record and email receipt. Check spam handling and account limits. Live form delivery cannot be verified locally.
6. Review the deployed temporary Netlify URL before any domain work. Leave Namecheap DNS and the unrelated Contabo service untouched.

Official setup: https://docs.netlify.com/manage/forms/setup/
Notifications: https://docs.netlify.com/manage/forms/notifications/

Deployment previews use `DEPLOY_PRIME_URL` for canonical metadata; production uses Netlify's `URL`, falling back to `https://moosetvs.com` locally. After the domain is approved and connected, rebuild and verify the primary domain, canonical URLs, sitemap, HTTPS and www redirect.

## Editing

- Shared branding, navigation and email: `src/components.mjs`
- Homepage hero: `src/pages.mjs`
- Service, industry, pricing and portfolio data: `src/content.mjs`
- Page composition and legal copy: `src/additional-pages.mjs`
- Real enquiry form fields: `src/forms.mjs`
- Demo markup: `src/demos.mjs`
- Layout/theme: `public/style.css` and `public/pages.css`
- Browser interactions: `public/script.js`

## Important behaviour

Demos run entirely in page memory and never send messages or create real appointments. Refresh resets demo data. The assistant is scripted and labelled accordingly. The dashboard is fictional. The free download is a working standalone template, with example business copy and email intended to be customised.

UTM values and landing path are retained in session storage and included with enquiry submissions. Form/contact/CTA hooks dispatch `moosetvs:analytics` events in page memory; no analytics network request or third-party tracking is installed. A future analytics integration can listen to those events without adding personal form contents to them. Do not send PII as analytics event properties.

Pricing follows the supplied brief and is indicative, in USD. Confirm commercial terms and the privacy notice before public launch. No paid checkout or SaaS product is represented as available.

## Validation

`npm test` checks all generated routes and internal references, duplicate IDs, anchors, unique metadata, demo labels, contact details, legacy-content removal, Netlify form contracts and sitemap exclusions. Browser checks cover desktop/mobile layout and the interactive journeys. Netlify form delivery and deployed domain behaviour require separate live verification.
