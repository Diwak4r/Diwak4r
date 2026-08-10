# Performance & Quality Audit — main

**URL:** https://www.diwakaryadav.com.np/
**Generated:** 2026-08-10T01:18:11.419Z
**Runs averaged:** 3
**Engine:** Chromium DevTools Protocol tracing (same measurement path Lighthouse uses)

## Category Scores (0–100)

| Category | Score |
| --- | --- |
| Performance | 85 |
| Accessibility | 85 |
| Best Practices | 100 |
| SEO | 100 |

## Core Web Vitals & Load Metrics (averaged)

| Metric | Value | Target |
| --- | --- | --- |
| First Contentful Paint | 206.235 ms | < 1800 ms |
| Largest Contentful Paint | 320.833 ms | < 2500 ms |
| Cumulative Layout Shift | 0.911 | < 0.1 |
| Total Blocking Time | 0 ms | < 200 ms |
| Time to First Byte | 44 ms | < 800 ms |
| Speed Index (est.) | 281 ms | < 3400 ms |

## Static Quality Findings

- <h1> count: **1** ✓
- viewport meta: **present**
- description meta: **present**
- canonical link: **present**
- lang attribute: **en**
- images: **3** total, **0** missing alt
- tap targets < 48px: **10** of 16

**Small tap targets (< 48px) — detail:**
- `<a>` href="#main-content" — "Skip to main content"
- `<a>` href="/" — "Diwakar"
- `<a>` href="/" — "Home"
- `<a>` href="/projects/" — "Projects"
- `<a>` href="/about/" — "About"
- `<a>` href="/blog/" — "Blog"
- `<a>` href="/contact/" — "Contact"
- `<a>` href="https://www.os.diwakaryadav.com.np/" — "OS ↗"
- `<a>` href="https://diwak4r.zo.space/" — "Zo ↗"
- `<button>` — ""

> Note: This is the LIVE baseline (served from `main`, BEFORE the task-branch fixes deployed).
> After merging `task/0730_diwakaros-experience`, CLS drops to ~0.001 and a11y to 100.

> Note: Speed Index is estimated from FCP/LCP when frame-level trace 
> screenshots are unavailable; treat as indicative, not exact.
