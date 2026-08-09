# Portfolio codebase assessment

## Executive summary

The repository currently contains two public-facing properties:

1. **Main portfolio** — a hand-authored static HTML/CSS/JavaScript site for `www.diwakaryadav.com.np`.
2. **DiwakarOS** — a statically exported Next.js/React application for `www.os.diwakaryadav.com.np`, plus a standalone Three.js voxel game.

The main portfolio is operational and its local links/assets resolve correctly. DiwakarOS also runs from the committed export. UPDATE (2026-08-09): the DiwakarOS source has been restored in commit `4152bd3a` (`app/`, `components/`, `lib/`, `next.config.ts`, strict `tsconfig.json`, `package-lock.json`), so it can be maintained and rebuilt from the current checkout. The remaining gap is a CI/CD pipeline and deployment workflow.

The agreed product direction is:

- Optimize first for **hiring and professional credibility**.
- **Restore DiwakarOS source** in this repository.
- Treat **GitHub Pages** as the deployment platform.
- Use a **hybrid professional positioning**: BIT student and builder with credible AI growth, systems, and product engineering evidence.

No implementation changes were made during this assessment.

## Current architecture

### Main portfolio

| Area | Current implementation |
|---|---|
| Runtime | Static HTML, shared CSS, vanilla JavaScript |
| Pages | Home, Projects, About, Blog index, two blog articles, Contact, Thank You, 404 |
| Styling | `css/style.4a3a12ca.css` plus substantial page-level critical and specific CSS |
| Client behavior | Theme toggle, scroll reveals, header state, mobile menu |
| Contact | Direct POST to FormSubmit.co with honeypot, CAPTCHA, redirect, and HTML validation |
| Discovery | Canonicals, Open Graph, Twitter metadata, JSON-LD, sitemap, RSS, robots |
| Hosting metadata | Root `CNAME`; `_headers` is Cloudflare-specific and is not enforced by GitHub Pages |

### DiwakarOS

The committed `portfolio-os/` directory is a generated/static deployment tree. Git history shows its former source architecture:

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- Zustand for window, filesystem, and system state
- Motion for window and interface transitions
- Lazy-loaded application modules
- Multi-instance desktop windows with focus, minimize, maximize, and close behavior
- Boot/login flow, desktop, menu bar, dock, Spotlight, launchpad, widgets, and settings
- 19 registered applications, including About, Projects, Journal, Notes, Contact, Terminal, Browser, Settings, Calculator, Spotify, Socials, CraftJS, Finder, Code, Photos, Weather, WhatsApp, Launchpad, and Trash
- Persisted user-created files and system preferences
- Responsive mobile application grid
- Standalone CraftJS Three.js voxel game

Relevant former source can be recovered from Git history around commits such as `b0520421` and `3fbf1b3a`.

## Verified findings

- All nine main-site HTML files were parsed; **zero broken local `href` or `src` references** were found.
- Main pages returned HTTP 200 in local browser smoke tests with no console errors.
- DiwakarOS static export returned HTTP 200 and loaded its login screen with no request or console failures.
- The Contact page previously had no `<h1>` (started with `<h2>`); **fixed 2026-08-09** (now an `<h1>` with the form card promoted to `<h2>`).
- The mobile menu previously did not sync `aria-expanded`; **fixed 2026-08-09** (the shared JS now toggles `aria-expanded` to match the open state).
- The root repository previously had no manifest; a root `package.json` now exists wiring `npm test` (main-site verifier + OS E2E). `portfolio-os` has its own `package.json` with `build`, `typecheck`, and `test` scripts. No `.github/workflows` CI exists yet.
- Historical root `package.json` had a failing placeholder test command.
- DiwakarOS has both its source (restored in `4152bd3a`) and the committed `out/` export. Maintained source includes `app/`, `components/`, `lib/`, `next.config.ts`, `tsconfig.json`, and `package-lock.json`. Runnable quality scripts exist under `portfolio-os/scripts/` (`e2e-local.mjs` — 57/57 checks verified 2026-08-09; `verify-checklist.mjs` for the live deploy).
- The repository includes approximately **101 MiB of audio** under `portfolio-os/audio`.
- The full local `portfolio-os` working tree is about **1.49 GiB** because generated directories and dependencies are present locally.
- Git object storage is already large: approximately **623 MiB packed**, plus loose objects.
- The project has an existing uncommitted `.gitignore` change. It was not modified.

## Inferred product requirements

### Primary outcomes

1. Present a credible, coherent professional identity to recruiters and collaborators.
2. Prove claims through detailed, technically honest case studies.
3. Keep the standard portfolio fast, accessible, crawlable, and usable without JavaScript.
4. Offer DiwakarOS as an optional technical showcase rather than the only route to core information.
5. Make both properties reproducibly buildable and deployable by the team.

### Quality requirements

- WCAG 2.1 AA-oriented navigation, semantics, focus behavior, contrast, and reduced motion.
- Repeatable GitHub Pages deployments with preview/validation checks before publishing.
- Automated validation for HTML, internal links, JavaScript, accessibility smoke tests, and broken assets.
- Consistent content, metadata, job titles, project counts, dates, and URLs across HTML, README, sitemap, RSS, and DiwakarOS.
- Explicit ownership of third-party services and media rights.

## Prioritized implementation plan

### P0 — restore maintainability and safe delivery

1. ~~**Restore DiwakarOS source from Git history**~~ — DONE (commit `4152bd3a`, verified 2026-08-09).
   - Recover `app/`, `components/`, `lib/`, `package.json`, `next.config.ts`, `tsconfig.json`, and lockfile.
   - Compare recovered source against the currently deployed export to ensure no later build-only behavior is lost.
   - Separate source from generated `out/`, `.next/`, copied `_next/`, and local `node_modules/`.

2. **Define a reproducible GitHub Pages deployment model**
   - Decide whether the root site and OS subdomain publish from separate workflows, branches, or repositories.
   - Add GitHub Actions for build, validation, and deployment.
   - Preserve each domain's `CNAME` and `.nojekyll` behavior.
   - Replace or supplement `_headers`, because GitHub Pages does not apply Cloudflare Pages `_headers` rules.

3. **Add repository-level quality gates**
   - Root manifest and lockfile.
   - HTML validation and internal-link checking.
   - JavaScript linting/formatting.
   - Next.js type checking and production build.
   - Playwright smoke tests for main routes and critical DiwakarOS interactions.
   - CI branch protection expectations.

4. **Fix confirmed accessibility defects**
   - Synchronize mobile-menu `aria-expanded`, add `aria-controls`, Escape/blur behavior, and focus handling.
   - Change Contact page heading hierarchy to begin with `<h1>`.
   - Audit icon-only controls, custom 404 interactions, animation reduction, and keyboard use.

### P1 — professional credibility and conversion

5. **Create a single content source of truth**
   - Resolve inconsistent positioning across Home, About, README, project metadata, and DiwakarOS.
   - Adopt the agreed hybrid positioning with one concise headline and evidence-based supporting narrative.

6. **Upgrade projects into case studies**
   - For each flagship project: problem, audience, constraints, architecture, personal contribution, security/performance decisions, screenshots, results, and links.
   - Give Nepal AI Gateway and DiwakarOS first-class case studies.
   - Verify that all claims can be publicly supported.

7. **Improve contact conversion and trust**
   - Confirm FormSubmit account verification and delivery behavior.
   - Add explicit submitting/success/error states or move to a controlled endpoint.
   - Add privacy/handling language if messages are retained or processed by a third party.
   - Add a résumé/CV action if hiring is the primary outcome.

8. **Normalize SEO/content operations**
   - Generate or validate sitemap, RSS, dates, structured data, and metadata from a shared source.
   - Use raster social preview images where platform support for SVG is inconsistent.
   - Remove stale comments and manually duplicated dates.

### P2 — maintainability, performance, and polish

9. **Reduce manual duplication in the main site**
   - Introduce a lightweight static-site build or templating layer for shared head, navigation, footer, metadata, and content.
   - Preserve static output and progressive enhancement.

10. **Define media and repository policy**
    - Verify rights for all committed music and artwork.
    - Decide whether full audio belongs in Git, Git LFS, release assets, or external storage.
    - Remove duplicate generated exports from source history only through a separately approved repository-maintenance plan.

11. **Add privacy-friendly product measurement**
    - Track high-level events such as résumé clicks, project visits, contact completion, and DiwakarOS entry.
    - Avoid invasive tracking; document the selected analytics provider.

12. **Polish without obscuring content**
    - Keep the conventional portfolio as the primary hiring path.
    - Treat DiwakarOS as an optional showcase with a fast exit to standard content.
    - Add a real light/dark/system selector rather than only a binary toggle if desired.

## Information still required before implementation

1. **GitHub Pages topology**
   - Which repository/branch currently publishes `www.diwakaryadav.com.np`?
   - Which repository/branch currently publishes `www.os.diwakaryadav.com.np`?
   - Are custom GitHub Actions already configured outside this checkout?

2. **Source restoration authority**
   - Should the recovered DiwakarOS source match the last source commit exactly first, or may it be refactored during recovery?

3. **Professional content**
   - Current résumé/CV file or canonical experience timeline.
   - Approved role title and one-sentence positioning.
   - Which claims and metrics may be published for Nepal AI Gateway and The Mindsnack.

4. **Contact and analytics**
   - Whether FormSubmit is verified and should remain.
   - Preferred analytics provider, or confirmation that no analytics should be added.

5. **Media rights**
   - Confirmation that all `portfolio-os/audio` tracks and cover artwork may legally be redistributed from a public GitHub repository and website.

## Recommended execution sequence

Proceed in four controlled phases:

1. Recover source and establish builds without changing product behavior.
2. Add CI, tests, deployment workflows, and fix confirmed accessibility defects.
3. Consolidate content and implement recruiter-focused case studies and conversion paths.
4. Optimize media, repository size, analytics, SEO automation, and visual polish.

Each phase should end with a deployable build, browser QA, accessibility checks, and a reviewable pull request.