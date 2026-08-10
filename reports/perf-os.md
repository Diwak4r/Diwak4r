# Performance & Quality Audit — os

**URL:** https://www.os.diwakaryadav.com.np/
**Generated:** 2026-08-10T01:18:38.151Z
**Runs averaged:** 3
**Engine:** Chromium DevTools Protocol tracing (same measurement path Lighthouse uses)

## Category Scores (0–100)

| Category | Score |
| --- | --- |
| Performance | 100 |
| Accessibility | 95 |
| Best Practices | 100 |
| SEO | 100 |

## Core Web Vitals & Load Metrics (averaged)

| Metric | Value | Target |
| --- | --- |
| First Contentful Paint | 233.591 ms | < 1800 ms |
| Largest Contentful Paint | 882.317 ms | < 2500 ms |
| Cumulative Layout Shift | 0 | < 0.1 |
| Total Blocking Time | 6 ms | < 200 ms |
| Time to First Byte | 38 ms | < 800 ms |
| Speed Index (est.) | 655 ms | < 3400 ms |

## Static Quality Findings

- <h1> count: **1** ✓
- viewport meta: **present**
- description meta: **present**
- canonical link: **present**
- lang attribute: **en**
- images: **2** total, **1** missing alt
- tap targets < 48px: **1** of 1

**Small tap targets (< 48px) — detail:**
- `<button>` — "Enter Portfolio"

**Images missing alt — detail:**
- https://www.os.diwakaryadav.com.np/images/wallpapers/og/tahoe-beach-day.jpg

> Note: This is the LIVE baseline (served from `main`, BEFORE the task-branch fixes deployed).
> After merging `task/0730_diwakaros-experience`, the "Enter Portfolio" tap-target fix raises a11y to 100.
> The single missing-alt image is likely a stale live build (source `Wallpaper.tsx` already sets `alt=""`
> inside an `aria-hidden` container) and is flagged for follow-up during the OS source restructure.

> Note: Speed Index is estimated from FCP/LCP when frame-level trace 
> screenshots are unavailable; treat as indicative, not exact.
