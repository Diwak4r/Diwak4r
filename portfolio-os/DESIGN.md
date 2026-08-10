# DiwakarOS: Portfolio as a macOS Desktop

A personal portfolio built as a minimal, premium macOS desktop simulation.
Visitors boot the machine, log in, and land on a living desktop where every
window carries real content. This is one of two ways to experience the
portfolio; the classic site at www.diwakaryadav.com.np is the other, and it
is browsable inside this OS through the Browser app.

## 0. The Experience Layer (v2)

- **Onboarding:** Apple-style boot (glyph + progress bar) into a macOS lock
  screen (big clock, avatar, "Enter Portfolio", Enter key works). Skipped on
  repeat visits within the same session.
- **Accent tones:** all 8 real macOS accents (blue, purple, pink, red,
  orange, yellow, green, graphite) selectable in System Settings, from the
  desktop right-click menu, or via `theme <tone>` in the terminal. Buttons,
  highlights, selections, and the Dynamic wallpaper all follow. Light tones
  get dark button labels, like real macOS. Persisted in localStorage.
- **Wallpapers:** 6 gradient scenes (Dynamic follows the accent). Change via
  right-click > Change Wallpaper or System Settings.
- **Wi-Fi:** functional toggle in the menu bar and Settings. Off = full
  "No Internet Connection" takeover with a reconnect button. The terminal
  can also `wifi off`.
- **Spotlight:** Cmd/Ctrl+K or the menu-bar magnifier. Searches apps,
  projects, posts, and links; keyboard navigable.
- **Browser app:** Safari-style window with favorites. Diwakar's own
  embeddable sites (classic portfolio, blog, Police Exam Prep) load in an
  iframe inside the window; sites that send X-Frame-Options get a clean
  "opens in its own tab" card. Every social and project link in the OS
  routes through it.
- **Terminal:** help, about, projects, skills, social, contact, whoami,
  open <app>, theme <tone>, wifi <on|off>, ls, pwd, echo, date, neofetch,
  claude, sudo, clear/cls, exit.

## 1. Concept & Structure

- **The desktop is the homepage.** No scrolling landing page. A wallpaper with
  pointer parallax and film grain, a menu bar, desktop icons, and a dock.
- **Apps are sections.** About Me, Projects, Journal, Contact, Terminal.
  Each opens a floating window with traffic lights, drag, resize, minimize
  (to dock), maximize (zoom), and focus-based stacking.
- **Welcome moment:** About Me auto-opens ~650ms after load on desktop, so the
  first impression is Diwakar's face, name, and role, framed by the OS.
- **Multiple entry points:** desktop icons (single-click selects, double-click
  opens, drag to move), dock (click, magnification, running dots), menu bar
  launcher, the system menu behind the command glyph, a right-click desktop
  context menu, and terminal commands (`open projects`, etc).
- **Mobile (<768px):** the desktop becomes a springboard icon grid; windows
  become full-screen sheets that slide up, with a single close light.

## 2. Design Direction

- **Type:** Geist (UI) + Geist Mono (terminal, clock). Apple-adjacent, neutral,
  loaded via `next/font`.
- **Color:** "Ink" graphite surface scale (`#08090c` base) with one accent,
  "Ember" (`#ef8438`), carried over from the previous site's `#FB923C` brand
  orange and recalibrated. The accent is used for all interactive emphasis:
  buttons, links, selection, chips, terminal prompt. App tile hues (steel blue,
  ember, graphite) are OS iconography, not extra accents.
- **Materials:** frosted-glass window chrome (backdrop blur 18px + 1px white
  border + inner highlight), tinted shadows, fixed film grain at 5% opacity.
  Labeled honestly as a web glassmorphism approximation, not Apple Liquid Glass.
- **Motion language:** springs everywhere (stiffness 300-400, damping 22-34),
  never linear. Open = scale/fade spring; minimize = accelerate down into the
  dock; dock magnification via motion values; wallpaper parallax via springs
  on pointer position. Everything gates on `prefers-reduced-motion`.
- **Shape system:** soft radii only. Windows 12px, tiles 14-16px, buttons 8px,
  chips full-pill. No sharp/pill mixing.
- **Performance rules:** transform/opacity animation only, no filter blur on
  animated wallpaper layers (soft radial gradients do the work), no scroll or
  pointer listeners feeding React state (motion values only), grain on a fixed
  pointer-events-none layer.

## 3. Component Architecture

```
app/
  layout.tsx          fonts, metadata, viewport
  page.tsx            renders <Desktop />
  globals.css         tokens (@theme), window/bar chrome, grain, scrollbars
lib/
  content.ts          ALL real content: profile, jobs, education, skills,
                      projects, posts, socials (single source of truth)
  apps.ts             app registry: id, name, icon, tile gradient,
                      default window rect, desktop icon position
  store.ts            zustand window manager: open/close/minimize/maximize/
                      focus + z-order counter; useFocusedApp() selector
  hooks.ts            useIsMobile (matchMedia, null before mount)
components/
  Desktop.tsx         orchestrator: wallpaper, menubar, icons, windows,
                      dock, context menu, Escape handling, tidy-up
  Wallpaper.tsx       layered gradients + pointer parallax + ambient drift
  MenuBar.tsx         system menu, bold focused-app name, launcher,
                      socials, wifi/battery, live clock
  DesktopIcon.tsx     draggable icon; select on click, open on double-click
  Dock.tsx            magnification (motion values), tooltips, running
                      dots, separator, trash
  Window.tsx          the window engine: drag (dragControls from title bar),
                      corner resize (pointer capture into motion values),
                      maximize/restore (animated motion values with saved
                      rect), minimize, enter/exit, mobile sheet mode
  TrafficLights.tsx   close/minimize/zoom with hover glyphs, grey when blurred
  ContextMenu.tsx     right-click desktop menu
  apps/
    AboutApp.tsx      sidebar (Story/Experience/Skills) via container queries
    ProjectsApp.tsx   featured card w/ live screenshot + project rows
    JournalApp.tsx    post list linking to the live blog
    ContactApp.tsx    Mail-style compose; posts to the same formsubmit.co
                      endpoint with identical field names as the old site
    TerminalApp.tsx   interactive shell: help/about/projects/skills/social/
                      contact/whoami/clear/open <app>
```

Key engineering decisions:

- **Window geometry lives in motion values** (x, y, w, h), so drag and resize
  never re-render React. Maximize animates the same values and restores the
  saved rect.
- **Z-order** is a store counter; the desktop surface is its own stacking
  context (`z-10`) so windows can never climb above the dock, menu bar, or
  grain.
- **Windows stay mounted while minimized** (state preserved), and
  `AnimatePresence` handles open/close mount animations.
- **Container queries** (Tailwind v4 `@container`) adapt app layouts to their
  own window size, so resizing a window reflows its content like a real app.

## 4. Stack & Running

- Next.js 15 + TypeScript + Tailwind v4 + Motion (`motion/react`) + zustand +
  Phosphor icons. Static export (`output: "export"`), images unoptimized,
  so it deploys to GitHub Pages exactly like the current site.

```bash
cd portfolio-os
npm install
npm run dev     # http://localhost:3000
npm run build   # static site in out/
```

Deployment (when approved): publish `out/` to the Pages branch/root with the
existing CNAME. The previous static site at the repo root remains untouched
until then.
