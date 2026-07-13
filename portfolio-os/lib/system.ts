import { create } from "zustand";
import { useWindows } from "./store";

/* ---- Accent tones: the eight real macOS accent colors ---- */

export type ToneId =
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "graphite";

export const TONES: { id: ToneId; label: string; dot: string }[] = [
  { id: "blue", label: "Blue", dot: "#0a84ff" },
  { id: "purple", label: "Purple", dot: "#bf5af2" },
  { id: "pink", label: "Pink", dot: "#ff375f" },
  { id: "red", label: "Red", dot: "#ff453a" },
  { id: "orange", label: "Orange", dot: "#ff9f0a" },
  { id: "yellow", label: "Yellow", dot: "#ffd60a" },
  { id: "green", label: "Green", dot: "#32d74b" },
  { id: "graphite", label: "Graphite", dot: "#8e8e93" },
];

/* ---- Wallpapers: gradient scenes; "dynamic" follows the accent tone ---- */

export type WallpaperId =
  | "dynamic"
  | "sequoia"
  | "horizon"
  | "emerald"
  | "rose"
  | "graphite-sky"
  | "tahoe-beach-day"
  | "tahoe-light"
  | "sequoia-sunrise"
  | "sonoma-horizon"
  | "monterey-light"
  | "monterey-classic"
  | "big-sur-day"
  | "big-sur-classic"
  | "yosemite-classic";

export interface WallpaperDef {
  id: WallpaperId;
  label: string;
  /** Rendered wallpaper artwork; when present it replaces the CSS scene */
  image?: string;
  /** Base layered gradient (bottom layer, also used for thumbnails) */
  base: string;
  /** Two parallax glow colors (CSS color values) */
  glowA: string;
  glowB: string;
}

export const WALLPAPERS: WallpaperDef[] = [
  {
    id: "dynamic",
    label: "Dynamic",
    base:
      "linear-gradient(165deg, color-mix(in srgb, var(--color-accent-600) 50%, #0b0e1a) 0%, #0e1122 48%, #060810 100%)",
    glowA: "color-mix(in srgb, var(--color-accent-500) 55%, transparent)",
    glowB: "rgb(122 90 220 / 0.35)",
  },
  {
    id: "sequoia",
    image: "/images/wallpapers/sequoia.jpg",
    label: "Sequoia Night",
    base:
      "linear-gradient(160deg, #3a3f9e 0%, #1c2060 42%, #0a0c26 100%)",
    glowA: "rgb(64 156 255 / 0.55)",
    glowB: "rgb(191 90 242 / 0.4)",
  },
  {
    id: "horizon",
    image: "/images/wallpapers/horizon.jpg",
    label: "Sunset Horizon",
    base:
      "linear-gradient(180deg, #1a0f2e 0%, #58163c 55%, #b0451e 100%)",
    glowA: "rgb(255 145 60 / 0.5)",
    glowB: "rgb(255 70 120 / 0.35)",
  },
  {
    id: "emerald",
    image: "/images/wallpapers/emerald.jpg",
    label: "Emerald Hills",
    base:
      "linear-gradient(180deg, #07231e 0%, #0d4d3c 58%, #041512 100%)",
    glowA: "rgb(52 199 120 / 0.45)",
    glowB: "rgb(90 200 250 / 0.3)",
  },
  {
    id: "rose",
    image: "/images/wallpapers/rose.jpg",
    label: "Rose Dusk",
    base:
      "linear-gradient(175deg, #2a0f33 0%, #6e1b4e 55%, #1d0a1f 100%)",
    glowA: "rgb(255 80 140 / 0.45)",
    glowB: "rgb(175 100 255 / 0.35)",
  },
  {
    id: "graphite-sky",
    image: "/images/wallpapers/graphite-sky.jpg",
    label: "Graphite",
    base:
      "linear-gradient(180deg, #2e3038 0%, #1a1b20 55%, #0a0a0d 100%)",
    glowA: "rgb(255 255 255 / 0.12)",
    glowB: "rgb(160 165 180 / 0.16)",
  },

  /* ---- Original macOS wallpapers, straight from Apple ---- */
  {
    id: "tahoe-beach-day",
    image: "/images/wallpapers/og/tahoe-beach-day.jpg",
    label: "Tahoe Beach Day",
    base: "linear-gradient(180deg, #cfe8f5 0%, #4fa8c9 55%, #0d3a52 100%)",
    glowA: "rgb(120 200 230 / 0.4)",
    glowB: "rgb(255 220 150 / 0.3)",
  },
  {
    id: "tahoe-light",
    image: "/images/wallpapers/og/tahoe-light.jpg",
    label: "Tahoe Light",
    base: "linear-gradient(180deg, #f2e9d8 0%, #d8b98a 55%, #8a5a34 100%)",
    glowA: "rgb(255 230 190 / 0.4)",
    glowB: "rgb(200 150 100 / 0.3)",
  },
  {
    id: "sequoia-sunrise",
    image: "/images/wallpapers/og/sequoia-sunrise.jpg",
    label: "Sequoia Sunrise",
    base: "linear-gradient(180deg, #ffd8a8 0%, #ff8a5c 55%, #7a2f3a 100%)",
    glowA: "rgb(255 170 100 / 0.45)",
    glowB: "rgb(255 90 110 / 0.3)",
  },
  {
    id: "sonoma-horizon",
    image: "/images/wallpapers/og/sonoma-horizon.jpg",
    label: "Sonoma Horizon",
    base: "linear-gradient(180deg, #ffd9a0 0%, #ff7a90 55%, #3a1e4a 100%)",
    glowA: "rgb(255 150 130 / 0.4)",
    glowB: "rgb(140 90 200 / 0.3)",
  },
  {
    id: "monterey-light",
    image: "/images/wallpapers/og/monterey-light.jpg",
    label: "Monterey Light",
    base: "linear-gradient(180deg, #dfe9f0 0%, #d94fc0 55%, #3a1f8a 100%)",
    glowA: "rgb(230 100 200 / 0.4)",
    glowB: "rgb(100 70 220 / 0.35)",
  },
  {
    id: "monterey-classic",
    image: "/images/wallpapers/og/monterey-classic.jpg",
    label: "Monterey",
    base: "linear-gradient(180deg, #2a4d8f 0%, #16305e 55%, #060d1e 100%)",
    glowA: "rgb(60 130 230 / 0.45)",
    glowB: "rgb(120 90 220 / 0.3)",
  },
  {
    id: "big-sur-day",
    image: "/images/wallpapers/og/big-sur-day.jpg",
    label: "Big Sur Day",
    base: "linear-gradient(180deg, #ff9d5c 0%, #e8543c 55%, #6e1f3a 100%)",
    glowA: "rgb(255 160 90 / 0.4)",
    glowB: "rgb(220 70 90 / 0.3)",
  },
  {
    id: "big-sur-classic",
    image: "/images/wallpapers/og/big-sur-classic.jpg",
    label: "Big Sur",
    base: "linear-gradient(180deg, #4a7fc9 0%, #274a8f 55%, #0a1530 100%)",
    glowA: "rgb(90 150 230 / 0.4)",
    glowB: "rgb(60 90 180 / 0.3)",
  },
  {
    id: "yosemite-classic",
    image: "/images/wallpapers/og/yosemite-classic.jpg",
    label: "Yosemite",
    base: "linear-gradient(180deg, #6ea8d8 0%, #2c5f9e 55%, #0a2040 100%)",
    glowA: "rgb(120 180 230 / 0.4)",
    glowB: "rgb(255 200 130 / 0.25)",
  },
];

/* ---- System store: appearance, connectivity, in-OS browser ---- */

export type SettingsPane = "appearance" | "wallpaper" | "desktop" | "wifi";

const TONE_KEY = "dios-tone";
const WALLPAPER_KEY = "dios-wallpaper";
const BRIGHTNESS_KEY = "dios-brightness";
const DOCK_SIZE_KEY = "dios-dock-size";
const MAGNIFY_KEY = "dios-dock-magnify";
const TRANSPARENCY_KEY = "dios-transparency";
const GRAIN_KEY = "dios-grain";

interface SystemStore {
  tone: ToneId;
  wallpaper: WallpaperId;
  wifiOn: boolean;
  /** 0 (darkest) to 1 (full brightness) */
  brightness: number;
  /** Dock icon base size in px */
  dockSize: number;
  dockMagnify: boolean;
  /** Frosted-glass chrome; off = solid surfaces (also a performance boost) */
  transparency: boolean;
  grain: boolean;
  /** null = browser start page */
  browserUrl: string | null;
  settingsPane: SettingsPane;
  setTone: (t: ToneId) => void;
  setWallpaper: (w: WallpaperId) => void;
  setWifi: (on: boolean) => void;
  setBrightness: (b: number) => void;
  setDockSize: (px: number) => void;
  setDockMagnify: (on: boolean) => void;
  setTransparency: (on: boolean) => void;
  setGrain: (on: boolean) => void;
  setBrowserUrl: (url: string | null) => void;
  setSettingsPane: (p: SettingsPane) => void;
  hydrate: () => void;
}

export const useSystem = create<SystemStore>((set) => ({
  tone: "blue",
  wallpaper: "tahoe-beach-day",
  wifiOn: true,
  brightness: 1,
  dockSize: 48,
  dockMagnify: true,
  transparency: true,
  grain: true,
  browserUrl: null,
  settingsPane: "appearance",

  setTone: (tone) => {
    localStorage.setItem(TONE_KEY, tone);
    set({ tone });
  },
  setWallpaper: (wallpaper) => {
    localStorage.setItem(WALLPAPER_KEY, wallpaper);
    set({ wallpaper });
  },
  setWifi: (wifiOn) => set({ wifiOn }),
  setBrightness: (brightness) => {
    localStorage.setItem(BRIGHTNESS_KEY, String(brightness));
    set({ brightness });
  },
  setDockSize: (dockSize) => {
    localStorage.setItem(DOCK_SIZE_KEY, String(dockSize));
    set({ dockSize });
  },
  setDockMagnify: (dockMagnify) => {
    localStorage.setItem(MAGNIFY_KEY, dockMagnify ? "1" : "0");
    set({ dockMagnify });
  },
  setTransparency: (transparency) => {
    localStorage.setItem(TRANSPARENCY_KEY, transparency ? "1" : "0");
    set({ transparency });
  },
  setGrain: (grain) => {
    localStorage.setItem(GRAIN_KEY, grain ? "1" : "0");
    set({ grain });
  },
  setBrowserUrl: (browserUrl) => set({ browserUrl }),
  setSettingsPane: (settingsPane) => set({ settingsPane }),

  /** Restore persisted appearance after mount (client only). */
  hydrate: () => {
    const tone = localStorage.getItem(TONE_KEY) as ToneId | null;
    const wallpaper = localStorage.getItem(WALLPAPER_KEY) as WallpaperId | null;
    const brightness = localStorage.getItem(BRIGHTNESS_KEY);
    const dockSize = localStorage.getItem(DOCK_SIZE_KEY);
    const magnify = localStorage.getItem(MAGNIFY_KEY);
    const transparency = localStorage.getItem(TRANSPARENCY_KEY);
    const grain = localStorage.getItem(GRAIN_KEY);
    set({
      ...(tone && TONES.some((t) => t.id === tone) ? { tone } : {}),
      ...(wallpaper && WALLPAPERS.some((w) => w.id === wallpaper) ? { wallpaper } : {}),
      ...(brightness !== null ? { brightness: Number(brightness) } : {}),
      ...(dockSize !== null ? { dockSize: Number(dockSize) } : {}),
      ...(magnify !== null ? { dockMagnify: magnify === "1" } : {}),
      ...(transparency !== null ? { transparency: transparency === "1" } : {}),
      ...(grain !== null ? { grain: grain === "1" } : {}),
    });
  },
}));

/* ---- In-OS link routing ---- */

/** Domains that allow being embedded, verified against their response headers. */
const EMBEDDABLE_HOSTS = new Set([
  "www.diwakaryadav.com.np",
  "diwakaryadav.com.np",
  "project.diwakaryadav.com.np",
]);

export function isEmbeddable(url: string): boolean {
  try {
    return EMBEDDABLE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Friendly window titles for the sites Diwakar links to. */
const HOST_TITLES: Record<string, string> = {
  "github.com": "GitHub",
  "www.linkedin.com": "LinkedIn",
  "x.com": "X",
  "www.instagram.com": "Instagram",
  "chatgpt.com": "ChatGPT",
  "claude.ai": "Claude",
  "diwak4r.zo.space": "Zo Space",
  "www.diwakaryadav.com.np": "Diwakar Yadav",
  "diwakaryadav.com.np": "Diwakar Yadav",
  "ai.diwakaryadav.com.np": "Nepal AI Gateway",
  "pryzmira.diwakaryadav.com.np": "Pryzmira",
  "project.diwakaryadav.com.np": "Police Exam Prep",
};

function linkTitle(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("diwakaryadav.com.np") && u.pathname.startsWith("/blog")) {
      return "Blog";
    }
    return HOST_TITLES[u.hostname] ?? u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Open any link inside the OS as its own independent desktop window. */
export function openLink(url: string, title?: string) {
  useWindows.getState().openLinkWin(url, title ?? linkTitle(url));
}

/** Open System Settings on a specific pane. */
export function openSettings(pane: SettingsPane) {
  useSystem.getState().setSettingsPane(pane);
  useWindows.getState().openApp("settings");
}
