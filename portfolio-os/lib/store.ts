import { create } from "zustand";

export type AppId =
  | "about"
  | "projects"
  | "journal"
  | "notes"
  | "contact"
  | "terminal"
  | "browser"
  | "settings"
  | "calculator"
  | "spotify"
  | "socials"
  | "craft";

export interface WinState {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  z: number;
}

/** A free-standing window for an external site (profile, project, tool). */
export interface LinkWin {
  url: string;
  title: string;
  minimized: boolean;
  maximized: boolean;
  z: number;
  /** Preferred geometry, cascaded at open time and clamped by the Window. */
  rect: { x: number; y: number; w: number; h: number };
}

const closed: WinState = { open: false, minimized: false, maximized: false, z: 0 };

interface WindowStore {
  windows: Record<AppId, WinState>;
  links: Record<string, LinkWin>;
  topZ: number;
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  openLinkWin: (url: string, title: string) => void;
  closeLinkWin: (url: string) => void;
  minimizeLinkWin: (url: string) => void;
  toggleMaximizeLinkWin: (url: string) => void;
  focusLinkWin: (url: string) => void;
}

/** Cascade each new link window down-right so stacks stay readable. */
const linkRect = (count: number) => ({
  x: 130 + (count % 5) * 34,
  y: 56 + (count % 5) * 30,
  w: 980,
  h: 620,
});

export const useWindows = create<WindowStore>((set) => ({
  links: {},
  windows: {
    about: { ...closed },
    projects: { ...closed },
    journal: { ...closed },
    notes: { ...closed },
    contact: { ...closed },
    terminal: { ...closed },
    browser: { ...closed },
    settings: { ...closed },
    calculator: { ...closed },
    spotify: { ...closed },
    socials: { ...closed },
    craft: { ...closed },
  },
  topZ: 10,

  openApp: (id) =>
    set((s) => {
      const z = s.topZ + 1;
      return {
        topZ: z,
        windows: {
          ...s.windows,
          [id]: { ...s.windows[id], open: true, minimized: false, z },
        },
      };
    }),

  closeApp: (id) =>
    set((s) => ({ windows: { ...s.windows, [id]: { ...closed } } })),

  minimizeApp: (id) =>
    set((s) => ({
      windows: { ...s.windows, [id]: { ...s.windows[id], minimized: true } },
    })),

  toggleMaximize: (id) =>
    set((s) => {
      const z = s.topZ + 1;
      return {
        topZ: z,
        windows: {
          ...s.windows,
          [id]: {
            ...s.windows[id],
            maximized: !s.windows[id].maximized,
            minimized: false,
            z,
          },
        },
      };
    }),

  focusApp: (id) =>
    set((s) => {
      if (s.windows[id].z === s.topZ) return s;
      const z = s.topZ + 1;
      return {
        topZ: z,
        windows: { ...s.windows, [id]: { ...s.windows[id], z } },
      };
    }),

  openLinkWin: (url, title) =>
    set((s) => {
      const z = s.topZ + 1;
      const existing = s.links[url];
      const win: LinkWin = existing
        ? { ...existing, minimized: false, z }
        : {
            url,
            title,
            minimized: false,
            maximized: false,
            z,
            rect: linkRect(Object.keys(s.links).length),
          };
      return { topZ: z, links: { ...s.links, [url]: win } };
    }),

  closeLinkWin: (url) =>
    set((s) => {
      const links = { ...s.links };
      delete links[url];
      return { links };
    }),

  minimizeLinkWin: (url) =>
    set((s) => ({
      links: { ...s.links, [url]: { ...s.links[url], minimized: true } },
    })),

  toggleMaximizeLinkWin: (url) =>
    set((s) => {
      const z = s.topZ + 1;
      return {
        topZ: z,
        links: {
          ...s.links,
          [url]: {
            ...s.links[url],
            maximized: !s.links[url].maximized,
            minimized: false,
            z,
          },
        },
      };
    }),

  focusLinkWin: (url) =>
    set((s) => {
      if (s.links[url].z === s.topZ) return s;
      const z = s.topZ + 1;
      return { topZ: z, links: { ...s.links, [url]: { ...s.links[url], z } } };
    }),
}));

export type FocusedWin =
  | { kind: "app"; id: AppId }
  | { kind: "link"; url: string; title: string };

let focusedCache: FocusedWin | null = null;

/** The open, non-minimized window (app or link) with the highest z, or null. */
export function useFocusedWin(): FocusedWin | null {
  return useWindows((s) => {
    let top: FocusedWin | null = null;
    let z = 0;
    for (const id of Object.keys(s.windows) as AppId[]) {
      const w = s.windows[id];
      if (w.open && !w.minimized && w.z > z) {
        z = w.z;
        top = { kind: "app", id };
      }
    }
    for (const url of Object.keys(s.links)) {
      const l = s.links[url];
      if (!l.minimized && l.z > z) {
        z = l.z;
        top = { kind: "link", url, title: l.title };
      }
    }
    // Return a stable reference when nothing changed so zustand can bail out.
    if (
      top &&
      focusedCache &&
      top.kind === focusedCache.kind &&
      (top.kind === "app"
        ? top.id === (focusedCache as { id?: AppId }).id
        : top.url === (focusedCache as { url?: string }).url)
    ) {
      return focusedCache;
    }
    focusedCache = top;
    return top;
  });
}

/** The focused app id, if the focused window is an app. */
export function useFocusedApp(): AppId | null {
  const f = useFocusedWin();
  return f?.kind === "app" ? f.id : null;
}
