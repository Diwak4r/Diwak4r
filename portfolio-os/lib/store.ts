import { create } from "zustand";
import { appById } from "./apps";

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

export type WinKind = "app" | "link";

export interface WinRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One open window. Every window is an independent instance: the same app
 *  can be open many times, each with its own content state. */
export interface Win {
  winId: string;
  kind: WinKind;
  /** kind === "app" */
  appId?: AppId;
  /** kind === "link" */
  url?: string;
  title: string;
  /** Per-instance parameters (browser start URL, settings pane, finder path…) */
  props?: Record<string, unknown>;
  minimized: boolean;
  maximized: boolean;
  z: number;
  /** Preferred geometry, cascaded at open time and clamped by the Window. */
  rect: WinRect;
}

/** macOS caps runaway window spam too, just less politely. */
const MAX_PER_APP = 8;

let seq = 0;
const nextWinId = (prefix: string) => `${prefix}-${++seq}`;

const cascade = (base: WinRect, n: number): WinRect => ({
  x: base.x + (n % 5) * 34,
  y: base.y + (n % 5) * 30,
  w: base.w,
  h: base.h,
});

interface WindowStore {
  wins: Record<string, Win>;
  topZ: number;
  /** Focus the app's top window if it has one, otherwise open a new one. */
  openApp: (id: AppId, props?: Record<string, unknown>) => void;
  /** Always open another window of the app (up to the per-app cap). */
  newAppWindow: (id: AppId, props?: Record<string, unknown>) => void;
  /** Focus the existing window for this URL, or open one. */
  openLinkWin: (url: string, title: string) => void;
  close: (winId: string) => void;
  closeAllOf: (appId: AppId) => void;
  minimize: (winId: string) => void;
  toggleMax: (winId: string) => void;
  focus: (winId: string) => void;
}

const appWins = (wins: Record<string, Win>, id: AppId): Win[] =>
  Object.values(wins).filter((w) => w.appId === id);

const topOf = (list: Win[]): Win | null =>
  list.reduce<Win | null>((top, w) => (top === null || w.z > top.z ? w : top), null);

export const useWindows = create<WindowStore>((set) => ({
  wins: {},
  topZ: 10,

  openApp: (id, props) =>
    set((s) => {
      const existing = topOf(appWins(s.wins, id));
      const z = s.topZ + 1;
      if (existing) {
        return {
          topZ: z,
          wins: {
            ...s.wins,
            [existing.winId]: {
              ...existing,
              minimized: false,
              z,
              ...(props ? { props: { ...existing.props, ...props } } : {}),
            },
          },
        };
      }
      const app = appById(id);
      const winId = nextWinId(id);
      const win: Win = {
        winId,
        kind: "app",
        appId: id,
        title: app.windowTitle,
        props,
        minimized: false,
        maximized: false,
        z,
        rect: { ...app.window },
      };
      return { topZ: z, wins: { ...s.wins, [winId]: win } };
    }),

  newAppWindow: (id, props) =>
    set((s) => {
      const siblings = appWins(s.wins, id);
      const z = s.topZ + 1;
      if (siblings.length >= MAX_PER_APP) {
        const top = topOf(siblings)!;
        return {
          topZ: z,
          wins: { ...s.wins, [top.winId]: { ...top, minimized: false, z } },
        };
      }
      const app = appById(id);
      const winId = nextWinId(id);
      const win: Win = {
        winId,
        kind: "app",
        appId: id,
        title: app.windowTitle,
        props,
        minimized: false,
        maximized: false,
        z,
        rect: cascade(app.window, siblings.length),
      };
      return { topZ: z, wins: { ...s.wins, [winId]: win } };
    }),

  openLinkWin: (url, title) =>
    set((s) => {
      const existing = Object.values(s.wins).find((w) => w.kind === "link" && w.url === url);
      const z = s.topZ + 1;
      if (existing) {
        return {
          topZ: z,
          wins: { ...s.wins, [existing.winId]: { ...existing, minimized: false, z } },
        };
      }
      const linkCount = Object.values(s.wins).filter((w) => w.kind === "link").length;
      const winId = nextWinId("link");
      const win: Win = {
        winId,
        kind: "link",
        url,
        title,
        minimized: false,
        maximized: false,
        z,
        rect: cascade({ x: 130, y: 56, w: 980, h: 620 }, linkCount),
      };
      return { topZ: z, wins: { ...s.wins, [winId]: win } };
    }),

  close: (winId) =>
    set((s) => {
      const wins = { ...s.wins };
      delete wins[winId];
      return { wins };
    }),

  closeAllOf: (appId) =>
    set((s) => {
      const wins: Record<string, Win> = {};
      for (const w of Object.values(s.wins)) {
        if (w.appId !== appId) wins[w.winId] = w;
      }
      return { wins };
    }),

  minimize: (winId) =>
    set((s) => ({
      wins: { ...s.wins, [winId]: { ...s.wins[winId], minimized: true } },
    })),

  toggleMax: (winId) =>
    set((s) => {
      const z = s.topZ + 1;
      const w = s.wins[winId];
      return {
        topZ: z,
        wins: {
          ...s.wins,
          [winId]: { ...w, maximized: !w.maximized, minimized: false, z },
        },
      };
    }),

  focus: (winId) =>
    set((s) => {
      if (s.wins[winId]?.z === s.topZ) return s;
      const z = s.topZ + 1;
      return {
        topZ: z,
        wins: { ...s.wins, [winId]: { ...s.wins[winId], z } },
      };
    }),
}));

/** How many windows an app has open (cheap, for dock dots). */
export function useAppWinCount(id: AppId): number {
  return useWindows((s) => {
    let n = 0;
    for (const key in s.wins) if (s.wins[key].appId === id) n++;
    return n;
  });
}

/** The open, non-minimized window with the highest z, or null.
 *  Returns the Win object itself; reference-stable while nothing changes. */
export function useFocusedWin(): Win | null {
  return useWindows((s) => {
    let top: Win | null = null;
    for (const key in s.wins) {
      const w = s.wins[key];
      if (!w.minimized && (top === null || w.z > top.z)) top = w;
    }
    return top;
  });
}

/** The focused app id, if the focused window is an app. */
export function useFocusedApp(): AppId | null {
  const f = useFocusedWin();
  return f?.kind === "app" ? (f.appId ?? null) : null;
}
