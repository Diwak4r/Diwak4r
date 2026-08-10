# Performance & Quality Audit — os (POST-DEPLOY)

**URL:** https://www.os.diwakaryadav.com.np/
**Generated:** 2026-08-10T02:02:15Z
**Runs averaged:** 3
**Engine:** Chromium DevTools Protocol tracing (same measurement path Lighthouse uses)
**Status:** Deployed — `main` = f995ea68. No OS-specific change in this deploy; the OS
source is mid-restructure on `task/portfolio-os-restructure` (not yet merged to main).

## Category Scores (0-100)

| Category | Score |
| --- | --- |
| Performance | 100 |
| Accessibility | 95 |
| Best Practices | 100 |
| SEO | 100 |

## Core Web Vitals & Load Metrics (averaged, after deploy)

| Metric | Value | Target |
| --- | --- | --- |
| First Contentful Paint | 375 ms | < 1800 ms |
| Largest Contentful Paint | 783 ms | < 2500 ms |
| Cumulative Layout Shift | 0 | < 0.1 |
| Total Blocking Time | 33 ms | < 200 ms |
| Time to First Byte | 180 ms | < 800 ms |
| Speed Index (est.) | 640 ms | < 3400 ms |

## Static Quality Findings
- `<h1>` count: 1 ✓
- viewport / description / canonical meta: present
- lang: en
- images: 2 total, 1 missing alt
- tap targets < 48px: 1 of 1

**Small tap targets (< 48px) — detail:**
- `<button>` — "Enter Portfolio"

**Images missing alt — detail:**
- https://www.os.diwakaryadav.com.np/images/wallpapers/og/tahoe-beach-day.jpg
- HTTPS: yes

## Notes
- OS was already at P=100; this deploy did not change OS (its source is being restructured
  on `task/portfolio-os-restructure`, not yet merged to main).
- The single missing-alt image and the "Enter Portfolio" tap-target are pre-existing OS
  issues. `Wallpaper.tsx` already sets `alt=""` inside an `aria-hidden` container, so the
  missing-alt is likely a stale live build; the tap-target is a real follow-up (the OS
  onboarding button needs a min 48px hit area). Both are tracked for the OS restructure.

> Speed Index is estimated from FCP/LCP when frame-level trace screenshots are
> unavailable; treat as indicative, not exact.
