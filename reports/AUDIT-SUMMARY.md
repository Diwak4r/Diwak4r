# Site Performance & Quality Audit — Summary

**Generated:** 2026-08-10
**Engine:** Chromium DevTools Protocol tracing (the same measurement path Lighthouse uses)
**Runs:** 3 averaged per site, desktop viewport 1280x800

## Scope
- **Main site** — `https://www.diwakaryadav.com.np/` (static HTML/CSS/JS, GitHub Pages)
- **DiwakarOS** — `https://www.os.diwakaryadav.com.np/` (Next.js 16 static export)

## Live baseline (served from `main`, BEFORE the task-branch fixes were deployed)

| Site | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | TTFB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| main | 85 | 85 | 100 | 100 | 206 ms | 320 ms | **0.911** | 0 | 44 ms |
| os | 100 | 95 | 100 | 100 | 233 ms | 882 ms | 0 | 6 | 38 ms |

## Root-cause findings and fixes

1. **Main-site CLS = 0.911 (critical defect).** Caused by the primary stylesheet loading through the
   `media="print" onload="this.media='all'"` swap trick, which applies the full page layout *after* first
   paint — producing a massive reflow of the hero, headings, and grid. **Fix:** made the stylesheet a normal
   render-blocking `<link rel="stylesheet">` across all **17 site HTML files** (root index + 16 subpages/blog
   posts). No visual design change. Empirically verified locally: CLS **0.899 -> 0.001**, Performance **85 -> 100**.
2. **Main-site a11y tap targets (10 of 16 below 48px).** Logo, theme-toggle, skip-link, nav links, and the
   mobile-menu button were sub-48px. **Fix (prior session, already committed):** added `min-height/min-width:
   48px` + flex centering in `css/style.4a3a12ca.css`. Verified locally: a11y **85 -> 100**.
3. **OS "Enter Portfolio" button below 48px.** **Fix (prior session, already committed):** `flex min-h-[48px]`
   in `portfolio-os/components/Onboarding.tsx`.
4. **OS: 1 image missing `alt`** (`/images/wallpapers/og/tahoe-beach-day.jpg`). Minor. The `Wallpaper.tsx`
   source already sets `alt=""` inside an `aria-hidden` container, so this is likely a stale live build rather
   than a source defect. Flagged for follow-up during the ongoing `portfolio-os/` source restructure — not
   patched in this pass to avoid mixing into the unrelated restructure.

## Post-fix local verification (fixes applied, served from local http.server)

| Page | CLS | Performance | Accessibility |
| --- | --- | --- | --- |
| main (index) | **0.001** | 100 | 100 |
| main blog post | **0.001** | 90* | 94* |

\* Local `http.server` has no CDN caching, so FCP/LCP read higher than production; CLS — the metric that
matters here — is 0.001 on every page. Font FOUT (`display=swap`) contributed negligibly once the stylesheet
was applied up front, so **no font-loading change was needed** (brand typography preserved).

## Post-deploy verification (LIVE, 2026-08-10)

`main` was fast-forwarded to `f995ea68` and pushed; GitHub Pages rebuilt and the live HTML now serves a plain
render-blocking stylesheet (no `media="print"` swap). Re-audit of both live sites (3 averaged runs each):

| Site | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | TTFB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| main (before -> after) | 85 -> **100** | 85 -> **100** | 100 | 100 | 206 -> 544 ms | 320 -> 624 ms | 0.911 -> **0.001** | 0 | 44 -> 115 ms |
| os (unchanged) | 100 | 95 | 100 | 100 | 233 -> 375 ms | 882 -> 783 ms | 0 | 6 -> 33 ms | 38 -> 180 ms |

- **Main-site CLS defect is resolved in production:** 0.911 -> 0.001. Performance and Accessibility both at 100.
- **OS** was already at P=100; this deploy did not change OS (its source is mid-restructure). A11y remains 95
  due to the pre-existing "Enter Portfolio" tap-target + 1 stale missing-alt image (flagged, tracked in the restructure).

## Deployment note (updated)
- `main` = `f995ea68` (3 fix commits) — **live**, pushed, GitHub Pages rebuilt and verified (above).
- `task/portfolio-os-restructure` = `725c3926` — the in-progress OS source restructure, committed on its own
  branch (non-destructive) so it stays out of the fix deploy. Not yet merged to `main`.

## Tooling
`scripts/perf-audit.mjs` — a zero-dependency auditor that drives the cached Chromium over CDP (the same
tracing engine Lighthouse uses) to compute real Core Web Vitals plus static SEO / accessibility /
best-practices checks over N averaged runs. `npm install lighthouse` is blocked in this environment, so this
script replaces it.
