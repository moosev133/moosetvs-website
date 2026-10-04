# Real-work showcase

Added at the owner's request on 2026-10-04. The previous source snapshot is
`../MooseTVs-backups/moosetvs-before-real-portfolio-e08fc68.zip`; Git history is retained.

The four real entries live in `src/redesign/portfolio-data.mjs`. Their translations
are in `portfolio-copy.mjs`; original fictional demos remain separately labeled.

## Visual provenance and publication limits

- **Moose Engine:** portfolio name for the owner's stated MQL5 / MT5 bot project.
  No matching `.mq5` source or terminal screenshot was available during this update.
  `moose-engine.svg` is an original, clearly labeled technical illustration, not
  a terminal, backtest, profit chart, or performance claim. Replace with approved
  real captures when available; do not invent strategy or risk-control details.
- **Aurum:** inspected the TradingAgents workspace README and implementation.
  Genuine application screenshots taken from an isolated local preview with an
  empty database, disabled background tasks and no provider credentials. This is
  paper research with no broker/order execution. Credit to TradingAgents is retained.
  No private deployment URL, research records, API keys, or server credentials are published.
- **ReeMove:** inspected the Flutter/Firebase app and release-status documentation.
  Genuine welcome and account-creation screenshots from its existing local web
  build, in desktop and 390×844 mobile layouts. No account was created or signed in.
  This is an app in development; no store release or live user metrics are claimed.
- **Saleh Solar System:** genuine captures of the publicly published GitHub Pages
  homepage and the interactive panel-detail view. Public visit link is included.
  No admin link or credentials are included. Daylight values are illustrative.

Screenshot bytes are JPEG, preserved without retouching; the composition, browser
frames and device frames are HTML/CSS. Assets are locally hosted and lazy-loaded.
The total image payload is under 500 KB. Full-size images open from the galleries.

## Maintenance

### Animated feature reel

The approved pre-animation version is preserved in
`../MooseTVs-backups/moosetvs-before-animated-showcase-29428b8.zip` and commit `29428b8`.
The homepage now uses a single rotating, eight-second project banner, followed by
the all-projects link. `/work/` retains the complete portfolio and project filters.
`project-scenes.mjs` supplies lightweight SVG/CSS motion covers to the banner,
portfolio, and detail pages. Original full-size screenshots remain in the galleries.

The trading candles, data flow, robot, research network and solar energy are
illustrative motion design, not live data or performance claims. Aurum contains
exactly the twelve research roles from the source application. ReeMove includes
its genuine mobile welcome screenshot in a moving device frame.

The reel pauses on hover, stops rotating on keyboard/manual interaction, offers
explicit play/pause and previous/next controls, and supports horizontal touch
swipes without capturing vertical page scrolling. Inactive slides are inert.
Illustrations stop offscreen, in background tabs, and with the site's motion
control or the operating system's reduced-motion preference. No-JavaScript
visitors can scroll the banner horizontally and follow all four project links.

Keep project statuses accurate. A development project must not silently become
“Live website.” Add only verified public URLs, never localhost or private dashboards.
Keep original concept demo URLs available, with fictional/sample-data labels.
Run `npm run build` and `npm test` before publishing; verify all three languages,
small screens, filters, screenshots, and the public Saleh link.
