# DiwakarOS Feedback Round 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the round-2 feedback set for the macOS-style portfolio: multi-instance windows, 40+ roast terminal commands, a real-Spotify player with full songs, more real wallpapers, six new apps, desktop files/folders, richer right-click menus, interlinking, settings expansion, and a performance pass — tested in a real browser and deployed.

**Architecture:** One window-instance store (zustand) replaces the per-app record; every window is an instance row and app content mounts per `winId`. New apps are plain client components registered in `lib/apps.ts`. User desktop items live in a persisted zustand store. Assets (audio, covers, wallpapers) are processed once by local scripts into `public/`.

**Tech Stack:** Next.js 15 static export, React 19, Tailwind v4, zustand 5, motion 12, @phosphor-icons/react, ffmpeg (local asset prep), iTunes Search API (one-time cover fetch), Open-Meteo (runtime weather).

## Global Constraints

- No unit-test infrastructure (user rule: no tests on prototypes unless asked). Every task verifies via `npm run dev` + real browser interaction, plus `npx next build` at checkpoints.
- Static export only — no server routes; all runtime fetches must be public no-key APIs (Open-Meteo) with designed offline fallbacks.
- Wallpaper layer must stay static; nothing animates underneath `backdrop-filter` glass (project performance memory).
- Content is real data only — no invented projects, quotes, or fake logos.
- Anti-slop law applies to all new UI; macOS-authentic patterns (dock dots, traffic lights) are deliberately in-character and allowed.
- All work happens in `portfolio-os/` except Task 15 (OG site root) and deployment.

---

### Task 1: Window-instance store refactor

**Files:**
- Rewrite: `portfolio-os/lib/store.ts`
- Modify: `portfolio-os/components/Desktop.tsx`, `Dock.tsx`, `MenuBar.tsx`, `Spotlight.tsx`, `ContextMenu.tsx`, `DesktopIcon.tsx`, `components/apps/TerminalApp.tsx` (open/exit calls), `lib/system.ts` (openLink/openSettings)

**Interfaces (produces):**
```ts
export type WinKind = "app" | "link";
export interface Win {
  winId: string;            // `${appId}-${n}` or `link-${n}`
  kind: WinKind;
  appId?: AppId;            // kind === "app"
  url?: string;             // kind === "link"
  title: string;
  props?: Record<string, unknown>; // per-instance params (browser url, finder path, code file)
  minimized: boolean;
  maximized: boolean;
  z: number;
  rect: { x: number; y: number; w: number; h: number };
}
interface WindowStore {
  wins: Record<string, Win>;
  topZ: number;
  openApp: (id: AppId, props?: Record<string, unknown>) => void;   // focus-or-open
  newAppWindow: (id: AppId, props?: Record<string, unknown>) => void; // always new (cap 8/app)
  openLinkWin: (url: string, title: string) => void;               // focus-or-open by url
  close: (winId: string) => void;
  minimize: (winId: string) => void;
  toggleMax: (winId: string) => void;
  focus: (winId: string) => void;
  closeAllOf: (appId: AppId) => void;
}
export function useAppWins(appId: AppId): Win[];
export function useFocusedWin(): Win | null;
```
- `openApp`: if any non-minimized/minimized instance exists → focus + restore the top one; else create instance (cascade rect from app default + 34/30px per existing sibling).
- Desktop renders `Object.values(wins)` sorted stably by winId; content = `<AppContent appId key={winId} winId />`.
- Dock `DockItem` shows dot when `useAppWins(app.id).length > 0`; click = `openApp`; context menu (right-click) = New Window / per-window focus list / Close All.
- Launch bounce (already present) now also fires when a *new window* is created while app already running? No — only when app has zero windows (macOS behavior).
- Escape key, Spotlight, MenuBar "focused app" logic all read `useFocusedWin()`.

- [ ] Step 1: Rewrite store with instance table, cap 8 per app, cascade rects.
- [ ] Step 2: Update Desktop rendering + all call sites; keep genie minimize.
- [ ] Step 3: Dock right-click context menu component (New Window, window list, Close All).
- [ ] Step 4: Verify in browser: two Terminals with independent histories; two Browsers; minimize/maximize/close each independently; dock menu works; Escape closes only focused.
- [ ] Step 5: Commit.

### Task 2: Per-instance app props (Browser, Settings)

**Files:**
- Modify: `portfolio-os/components/apps/BrowserApp.tsx` (url = local state seeded from `props.url`), `SettingsApp.tsx` (pane = local state seeded from `props.pane`), `lib/system.ts` (`openSettings(pane)` → `openApp("settings", { pane })`; remove `browserUrl`/`settingsPane` from system store), any callers.

- [ ] Step 1: Move state, update `openSettings`/browser launch paths (Safari favorites still work).
- [ ] Step 2: Verify: two Browser windows on different pages; Settings opens on requested pane.
- [ ] Step 3: Commit.

### Task 3: Terminal — 40+ roast commands + history

**Files:**
- Create: `portfolio-os/lib/terminal-commands.ts` (command table: `{ [cmd: string]: string[] | string[][] }` with randomized reply pools)
- Modify: `portfolio-os/components/apps/TerminalApp.tsx`

Commands (each 2–4 randomized replies, roasting with relatability — student life, dev culture, Nepali life):
`roastme, roast, motivation, gf, bf, crush, rizz, gym, sleep, wake, coffee, chai, chiya, momo, maggi, cgpa, attendance, backlog, exam, assignment, homework, internship, job, salary, resume, cv, linkedin, leetcode, dsa, bug, deploy, prod, wifi password, password, nepse, bitcoin, crypto, loadshedding, tiktok, reels, insta, valorant, pubg, freefire, deadline, hostel, mess, cowsay, fortune, sl, matrix, hack, uptime, man, whois, touch grass, sudo make me a sandwich`
Plus: `history` (real session history), arrow-up/down cycling, `og` / `zo` / `classic` link commands (Task 15 wires targets).

- [ ] Step 1: Write command table with distinct, funny, non-repeating pools.
- [ ] Step 2: Wire prefix matching + history (ArrowUp/Down), keep existing commands.
- [ ] Step 3: Verify a sample of ≥10 commands in browser incl. history keys.
- [ ] Step 4: Commit.

### Task 4: Audio pipeline — full songs, viral cuts, real covers

**Files:**
- Create: `scripts/prep-audio.sh` (repo root; ffmpeg: copy/normalize full songs to `portfolio-os/public/audio/full/<slug>.mp3` at 128k; cut 4 viral clips for the 14 new tracks into `portfolio-os/public/audio/<slug>-N.mp3` using loudness peaks à la `music/find_peaks.py`)
- Create: `scripts/fetch-covers.mjs` (iTunes Search API → `portfolio-os/public/images/music-covers/<slug>.jpg`, 600px)
- Modify: `portfolio-os/lib/content.ts` — playlist model:
```ts
export interface Track {
  slug: string; title: string; artist: string; cover: string;
  full: string;                       // /audio/full/<slug>.mp3
  clips: { label: string; audio: string }[]; // may be empty
}
export const playlist: Track[];
```

- [ ] Step 1: Slugify + identify the 14 numbered files; fetch iTunes metadata (artist names) + covers; visually verify each cover.
- [ ] Step 2: ffmpeg: full versions for all 19 (5 from `music/`, 14 re-encoded), 4 clips each for the new 14.
- [ ] Step 3: Update `content.ts` with all 19 tracks (real artist names).
- [ ] Step 4: Verify files play (spot check via browser).
- [ ] Step 5: Commit (audio + covers + content).

### Task 5: Spotify redesign (real UI, Full vs Viral)

**Files:**
- Rewrite: `portfolio-os/components/apps/SpotifyApp.tsx`

Design: left library sidebar (playlist entries: All Songs / Viral Cuts), main area with green-to-#121212 gradient header ("Diwakar's Picks"), responsive card grid (cover, hover play button, title/artist), per-track mode chips; bottom now-playing bar: cover, title/artist, shuffle · prev · play/pause · next · repeat, seek bar with times, volume. Full mode auto-advances to next song; viral mode advances clips then next song. Shuffle = random next; repeat = loop current.

- [ ] Step 1: Build layout + playback logic (one `<audio>`, per-instance state).
- [ ] Step 2: Verify: full/viral toggle, shuffle/repeat, seek, volume persist, end-of-track advance, two Spotify windows don't fight (each has own audio).
- [ ] Step 3: Commit.

### Task 6: Wallpapers — new real macOS set

**Files:**
- Create: `scripts/prep-wallpapers.mjs` (ffmpeg scale to 2560w JPEG q~82 → `portfolio-os/public/images/wallpapers/og/`)
- Modify: `portfolio-os/lib/system.ts` (new `WallpaperId`s + defs + optional `group: "dynamic" | "macos" | "scenes"`), `SettingsApp.tsx` WallpaperPane (grouped sections)

Sources: `wallpaper/10-0_10-1-6k.jpg` (Yosemite/El Capitan era), `10-4-6k.jpg`, `10-12-6k.jpg`, `11-Big-Sur-Day-6k.jpg` (replace lower-res), `12-Monterey-Light.jpg`, `14-Sonoma-Horizon.png`, `15-Sequoia-Sunrise.png`, `26-Tahoe-*.png` + download from 512pixels mirrors: Ventura, Sonoma (day), Catalina Day, Mojave Day (skip any that fail; never fake).

- [ ] Step 1: Process local 6K files; attempt curated downloads; verify each image renders.
- [ ] Step 2: Add defs with matching base gradients (used pre-load), group the pane.
- [ ] Step 3: Verify switching wallpapers in browser; check menu-bar legibility on light ones.
- [ ] Step 4: Commit.

### Task 7: Desktop files & folders + right-click expansion

**Files:**
- Create: `portfolio-os/lib/files.ts`:
```ts
export interface DeskItem {
  id: string; kind: "folder" | "file";
  name: string; parentId: string | null;  // null = desktop
  content?: string;                        // files
  pos?: { x: number; y: number };          // desktop-level items
  createdAt: number; updatedAt: number;
}
interface FilesStore {
  items: Record<string, DeskItem>;
  create(kind, parentId, name?): string;   // auto "untitled folder 2" naming
  rename(id, name): void; remove(id): void; duplicate(id): string;
  setPos(id, pos): void; setContent(id, content): void;
  childrenOf(parentId: string | null): DeskItem[];
}
```
  Persisted to localStorage (`dios-files`), corrupt-safe hydrate.
- Rewrite: `portfolio-os/components/ContextMenu.tsx` → generic menu (items, dividers, submenu for Sort By) usable for desktop surface, desktop items, dock icons, Finder rows.
- Create: `portfolio-os/components/DeskFileIcon.tsx` (draggable icon, inline rename on Enter/second-click, double-click opens: folder → Finder window `props.path`, file → Code window `props.fileId`)
- Create: `portfolio-os/components/GetInfo.tsx` (small info window: icon, name, kind, size, created/modified)
- Modify: `Desktop.tsx` (render user items, context-menu routing, marquee unchanged)

Desktop surface menu: New Folder · New Text File | Change Wallpaper · Change Accent | Sort By ▸ (Name/Kind) · Tidy Up | Open Terminal Here · About This Portfolio.
Item menu: Open · Rename · Duplicate · Get Info | Move to Trash.

- [ ] Step 1: files store + hydrate.
- [ ] Step 2: generic ContextMenu + desktop wiring + DeskFileIcon (create/rename/drag/persist).
- [ ] Step 3: Get Info window; duplicate; delete w/ confirm.
- [ ] Step 4: Verify full lifecycle in browser incl. reload persistence.
- [ ] Step 5: Commit.

### Task 8: Finder app

**Files:**
- Create: `portfolio-os/components/apps/FinderApp.tsx`
- Modify: `lib/apps.ts` (id `finder`, blue/white smile tile via custom glyph), `lib/store.ts` AppId union, Desktop registry.

Sidebar (Favorites): Desktop, Documents, Projects, Pictures, Music. Content grid/list:
- Desktop → live user items (open/rename/delete via context menu, same store).
- Documents → journal entries + notes (read-only rows, open Journal/Notes).
- Projects → project rows; double-click opens live site link window.
- Pictures → wallpapers + project shots; double-click opens Photos at image.
- Music → tracks; double-click opens Spotify.
Toolbar: back, path breadcrumb, view toggle (grid/list). `props.path` selects initial sidebar item.

- [ ] Step 1: Build app + register; folders from desktop open here (`props.path = folderId`).
- [ ] Step 2: Verify navigation, context menus, opening items.
- [ ] Step 3: Commit.

### Task 9: Code app (source viewer + user file editor)

**Files:**
- Create: `portfolio-os/components/apps/CodeApp.tsx`
- Create: `portfolio-os/lib/source-snapshots.ts` (real source of ~6 files of this project inlined at build: `store.ts`, `TerminalApp.tsx`, `Window.tsx`, `Dock.tsx`, `system.ts`, `page.tsx` — generated by `portfolio-os/scripts/snapshot-source.mjs`)
- Create: `portfolio-os/scripts/snapshot-source.mjs`
- Modify: `lib/apps.ts` (+`code`), store union, Desktop registry.

VS Code-style: activity bar + file tree (two roots: "diwakar-os" read-only snapshots, "My Files" = user text files), tab bar, editor pane. Read-only files: lightweight regex highlighting (keywords/strings/comments — no heavy dependency). User files: plain `<textarea>` styled as editor, autosaves to files store. `props.fileId` opens a user file directly.

- [ ] Step 1: snapshot script + generated module.
- [ ] Step 2: app UI + editing + registration.
- [ ] Step 3: Verify: open source file (highlighted), edit user file, changes persist, desktop double-click opens correct file.
- [ ] Step 4: Commit.

### Task 10: Photos app

**Files:**
- Create: `portfolio-os/components/apps/PhotosApp.tsx`
- Modify: `lib/apps.ts` (+`photos`, rainbow-flower tile), store union, Desktop registry.

Albums sidebar (Library, Wallpapers, Projects, Album Art), justified grid of images (all already in `public/images`), click → lightbox (arrow keys, set-as-wallpaper button for wallpaper images). `props.image` deep-links.

- [ ] Step 1: Build + register.
- [ ] Step 2: Verify grid, lightbox, set-as-wallpaper.
- [ ] Step 3: Commit.

### Task 11: Weather app

**Files:**
- Create: `portfolio-os/components/apps/WeatherApp.tsx`
- Modify: `lib/apps.ts` (+`weather`), store union, Desktop registry.

Open-Meteo (`latitude=27.7172&longitude=85.324`, current + daily 7-day, no key). Condition-mapped gradient scene (clear/cloud/rain/snow/night by weathercode + is_day), big temp, H/L, hourly strip, 7-day rows. Wi-Fi off or fetch fail → designed offline card ("Weather is off the grid"). Cache last response in localStorage.

- [ ] Step 1: Build + register with fallback states.
- [ ] Step 2: Verify live fetch, offline state (toggle Wi-Fi), reload cache.
- [ ] Step 3: Commit.

### Task 12: WhatsApp app

**Files:**
- Create: `portfolio-os/components/apps/WhatsAppApp.tsx`
- Modify: `lib/apps.ts` (+`whatsapp`, green tile with real WhatsApp glyph from simple-icons), store union, Desktop registry.

Dark WA layout: chat list (single chat "Diwakar Yadav", verified tick), thread with date chip, incoming greeting; composer sends user bubble → typed reply from a small intent bot (projects/hire/socials/skills/default), quick-reply chips, "Continue by email" handoff (opens Contact app prefilled). Chat history per window (not persisted).

- [ ] Step 1: Build + register.
- [ ] Step 2: Verify chat flow, chips, email handoff.
- [ ] Step 3: Commit.

### Task 13: Launchpad

**Files:**
- Create: `portfolio-os/components/Launchpad.tsx`
- Modify: `Dock.tsx` (Launchpad rocket tile first in dock), `Desktop.tsx` (overlay state), `MenuBar.tsx`? (no)

Fullscreen frosted overlay (wallpaper-blur backdrop), search field top-center, grid of all apps (AppTile + name), click opens app + closes overlay, Escape/backdrop click closes, F4 also opens. Content visible immediately (no opacity-0 gating).

- [ ] Step 1: Build overlay + dock entry.
- [ ] Step 2: Verify open/search/launch/escape.
- [ ] Step 3: Commit.

### Task 14: Settings expansion + About Me refresh + sounds

**Files:**
- Create: `portfolio-os/lib/sounds.ts` (WebAudio: click, open, close, chime — synthesized, no assets)
- Modify: `lib/system.ts` (+`sounds: boolean`, `nightShift: number` 0–1 persisted), `SettingsApp.tsx` (+ Sounds pane, Night Shift pane with slider + preview, About This Mac pane: DiwakarOS 3.0, chip "Apple M∞", memory "∞ GB unified vibes", uptime ticker, credits), `Desktop.tsx` (night-shift warm overlay layer + sound hooks on open/close), `components/apps/AboutApp.tsx` (layout/copy refresh, links to Classic/Zo, exploring chips, timeline)

- [ ] Step 1: sounds module + toggles + panes.
- [ ] Step 2: night shift overlay (z below grain, above windows? — below brightness, above wallpaper+windows like a real screen filter).
- [ ] Step 3: About Me refresh.
- [ ] Step 4: Verify all panes, sounds audible when enabled, persistence.
- [ ] Step 5: Commit.

### Task 15: Interlinking

**Files:**
- Modify: `portfolio-os/components/apps/BrowserApp.tsx` (add Zo Space favorite + URL/search bar: embeddable → iframe, external → card, plain text → DuckDuckGo new tab), `SocialsApp.tsx` (+ Classic Portfolio + Zo Space rows), `MenuBar.tsx` (Apple menu: "Classic Portfolio", "Zo Space" items), `TerminalApp.tsx`/`terminal-commands.ts` (`og`, `zo`, `classic` open link windows)
- Modify (OG site): `index.html` + shared nav/footer files under repo root (`about/`, `projects/`, `blog/`, `contact/`) — add Zo Space link beside the existing DiwakarOS link (match existing markup style)

- [ ] Step 1: OS-side links + browser URL bar.
- [ ] Step 2: OG-site Zo Space link (check each page's nav/footer pattern first).
- [ ] Step 3: Verify all links open correctly (link windows in OS; anchors on OG).
- [ ] Step 4: Commit.

### Task 16: Performance pass

**Files:**
- Modify: `Desktop.tsx` (React.lazy + Suspense per app content, memoized instance renderer), `Window.tsx` (`content-visibility` when minimized), `app/layout.tsx` (preload default wallpaper), audit selectors (every component subscribes narrowly), `globals.css` as needed

- [ ] Step 1: Lazy app content (each app chunk splits out of the boot bundle).
- [ ] Step 2: Selector + memo audit (drag one window → React DevTools shows no sibling re-render; verified via store design).
- [ ] Step 3: `npx next build` — compare first-load JS before/after; verify no regression in behavior.
- [ ] Step 4: Commit.

### Task 17: Full test pass, build, deploy

- [ ] Step 1: Browser click-through checklist: boot→login→desktop; multi-window per app; dock menus; every terminal command family; Spotify full/viral/shuffle/repeat; every wallpaper; files/folders lifecycle + reload; Finder/Code/Photos/Weather/WhatsApp/Launchpad; settings panes incl. sounds/night shift; Safari URL bar + favorites; interlinks; mobile viewport sanity (375px).
- [ ] Step 2: Anti-slop law re-check pass over every new surface (per user's global instructions).
- [ ] Step 3: `npx next build` static export clean.
- [ ] Step 4: Deploy `out/` to the diwakaros Pages repo (locate repo / use gh CLI), verify live site.
- [ ] Step 5: Final commit + report.
