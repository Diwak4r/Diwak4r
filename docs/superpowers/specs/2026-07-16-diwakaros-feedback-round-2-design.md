# DiwakarOS Feedback Round 2 — Design

Date: 2026-07-16
Project: `portfolio-os/` (Next.js static export, deployed to the diwakaros Pages repo at www.os.diwakaryadav.com.np)

## Goal

Address the user-feedback round on the macOS-style portfolio desktop: independent
multi-instance windows, a much chattier terminal, a real-Spotify-style player with
full songs, more real macOS wallpapers, a performance pass, interlinking with the
classic portfolio and Zo Space, expanded settings, new apps (Launchpad, Photos,
Weather, Finder, Code, WhatsApp), user-created desktop files/folders, and a richer
right-click experience. Then test end-to-end and deploy.

## In scope

1. **Multi-instance window system.** Replace `Record<AppId, WinState>` with an
   instance table: `{ winId, kind: app|link, appId?, url?, title, rect, z,
   minimized, maximized }`. All apps can open multiple windows (cap 8 per app).
   Dock click = open-or-focus; dock right-click menu = New Window / window list /
   Close All. Terminal `open <app>` always spawns a new window. Per-app global
   state (browser URL, settings pane) moves into per-instance props/state.
2. **Dock launch bounce.** Icon bounces with spring hops while its first window
   opens. Running-indicator dots stay.
3. **Terminal.** ~40 new relatable roast commands (student life, dev culture,
   Nepali life), each with randomized replies; arrow-key command history.
4. **Spotify.** 19 tracks (5 existing + 14 new uncut). Full versions of the
   original 5 copied from `music/`. Full vs. Viral toggle per track; cut 3–4
   viral clips for new tracks with ffmpeg if available, else full-only. Real
   Spotify desktop layout: library sidebar, gradient header, hover-play cards,
   bottom now-playing bar with shuffle/repeat. Real cover art fetched once from
   the iTunes Search API, bundled locally, visually verified.
5. **Wallpapers.** Add the three unused 6K originals from `wallpaper/`
   (downscaled ~2560px) plus a curated set of vibrant official macOS wallpapers
   (Ventura, Sonoma, Catalina, Mojave family) from the 512pixels archive.
   Wallpaper pane grouped into sections.
6. **Performance.** Lazy-load app components, fine-grained selectors,
   content-visibility on minimized windows, preload current wallpaper, compressed
   images, keep wallpaper static under glass (existing rule). Target: smooth
   drag, fast boot.
7. **Interlinking.** OS → Classic Portfolio + Zo Space in Safari favorites,
   Socials app, About window, Terminal (`og`, `zo`), Apple menu. OG site (repo
   root) → add Zo Space link next to the existing DiwakarOS link. Other project
   repos are out of scope (separate codebases).
8. **Settings + About Me.** New panes: Sounds (WebAudio UI sounds + boot chime,
   off by default), Night Shift (warm overlay + intensity), About This Mac
   (version, chip joke, uptime, credits). About Me app: refreshed layout/copy,
   photo, timeline, exploring chips, links to other spaces.
9. **New apps.**
   - Launchpad: fullscreen frosted app grid with search (the app drawer).
   - Photos: albums sidebar (Wallpapers / Projects / Covers), grid, lightbox.
   - Weather: Kathmandu via Open-Meteo (no key), condition gradients, 7-day
     forecast, offline fallback.
   - Finder: virtual FS (Desktop = user items, Documents = journal/notes,
     Projects = live sites, Pictures = wallpapers, Music = playlist).
   - Code: VS Code-style read-only viewer of this project's real source files
     with lightweight syntax highlighting; doubles as editor for user text files.
   - WhatsApp: dark chat UI with a canned-reply "Diwakar" bot + email handoff
     (no phone number available; wa.me link can be added later).
10. **Desktop files & folders.** Right-click → New Folder / New Text File.
    Persisted in localStorage; draggable, renamable, deletable. Folders open in
    Finder; text files open in Code.
11. **Right-click expansion.**
    - Desktop: New Folder, New Text File, Change Wallpaper, Tidy Up, Sort By,
      Open Terminal Here, toggle grain/transparency shortcuts.
    - Desktop icons/files/folders: Open, Rename, Duplicate, Get Info (popup),
      Move to Trash (delete with confirm).
    - Finder items: Open, Open in New Window (folders), Rename, Duplicate,
      Delete, Get Info.
12. **Test & deploy.** Browser click-through of every feature, `next build`
    static export, deploy to the diwakaros Pages repo (user approved).

## Out of scope

- Editing other project codebases (Nepal AI Gateway, Pryzmira, Police Exam Prep).
- Zo Space side of the interlinking (user does it themselves).
- Real WhatsApp number integration (pending user's number).
- A full Trash bin app (delete is confirm-then-remove).

## Key decisions (user-confirmed)

- All apps multi-window (cap 8/app).
- Real cover art via iTunes Search API, bundled locally.
- New apps: Photos, Weather, Finder, Code (VS Code/TextEdit), WhatsApp, Launchpad.
- Deploy to the live Pages repo once tested.

## Failure modes / edge cases

- iTunes lookup misses a track → design a clean fallback cover locally.
- ffmpeg absent → new tracks are full-only; toggle hidden for them.
- Open-Meteo unreachable or Wi-Fi toggled off → Weather shows a designed offline
  state, never a blank window.
- localStorage full/corrupt → desktop items fail soft (fresh desktop).
- Window cap reached → focus newest instead of opening; subtle feedback.
- Non-embeddable sites in Safari keep the existing open-in-new-tab card.

## Architecture notes

- `lib/store.ts` becomes the single window-instance store; `lib/apps.ts` gains
  new app defs; desktop items live in a new `lib/files.ts` zustand store with
  localStorage persistence.
- App content renders per `winId` (each instance mounts its own component
  state). Apps that need per-window params (Browser start URL, Finder path,
  Code file) receive them via instance `props` stored on the window record.
- All new imagery flows through the existing static pipeline
  (`public/images/...`); audio via `public/audio`.
