# Performance & Quality Audit — main (POST-DEPLOY)

**URL:** https://www.diwakaryadav.com.np/
**Generated:** 2026-08-10T02:02:19Z
**Runs averaged:** 3
**Engine:** Chromium DevTools Protocol tracing (same measurement path Lighthouse uses)
**Status:** Deployed — `main` = f995ea68 (CLS fix + a11y tap-target fix)

## Category Scores (0-100) — before -> after

| Category | Before (baseline) | After (deployed) |
| --- | --- | --- |
| Performance | 85 | **100** |
| Accessibility | 85 | **100** |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

## Core Web Vitals & Load Metrics (averaged, after deploy)

| Metric | Value | Target |
| --- | --- | --- |
| First Contentful Paint | 544 ms | < 1800 ms |
| Largest Contentful Paint | 624 ms | < 2500 ms |
| Cumulative Layout Shift | 0.001 | < 0.1 |
| Total Blocking Time | 0 ms | < 200 ms |
| Time to First Byte | 115 ms | < 800 ms |
| Speed Index (est.) | 596 ms | < 3400 ms |

## Static Quality Findings (after deploy)
- `<h1>` count: 1 ✓
- viewport / description / canonical meta: present
- lang: en
- images: 3 total, 0 missing alt
- tap targets < 48px: 0 of 16 (was 10 of 16) — fixed
- HTTPS: yes

## Root cause & fix
The async-CSS trick (`media="print" onload="this.media='all'"`) applied the full page
layout AFTER first paint, causing a massive reflow (CLS 0.911). Replaced with a normal
render-blocking `<link rel="stylesheet">` across all 17 site HTML files. Font FOUT
(`display=swap`) proved negligible, so brand typography is preserved. Local verification
had CLS 0.899 -> 0.001; now confirmed live at **0.001**, Performance/Accessibility **100**.

> Speed Index is estimated from FCP/LCP when frame-level trace screenshots are
> unavailable; treat as indicative, not exact.
