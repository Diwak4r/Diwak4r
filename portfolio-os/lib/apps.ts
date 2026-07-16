import type { CSSProperties } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  Calculator,
  CloudSun,
  CodeSimple,
  Compass,
  Cube,
  Folder,
  GearSix,
  MagnifyingGlass,
  MusicNotes,
  Notebook,
  Notepad,
  PaperPlaneTilt,
  Rabbit,
  ShareNetwork,
  SquaresFour,
  TerminalWindow,
  WhatsappLogo,
} from "@phosphor-icons/react";
import type { AppId } from "./store";

export interface AppDef {
  id: AppId;
  /** Label under the desktop icon and in the dock tooltip */
  name: string;
  /** Title shown in the window title bar */
  windowTitle: string;
  /** Phosphor glyph for the tile; About uses a portrait photo instead */
  icon: Icon | null;
  /** CSS gradient for the app tile */
  tile: string;
  /** Preferred window size and cascade position (clamped to the desktop) */
  window: { w: number; h: number; x: number; y: number };
  /** Desktop icon placement; omit for dock-only apps */
  desk?: CSSProperties;
}

export const APPS: AppDef[] = [
  {
    id: "about",
    name: "About Me",
    windowTitle: "About Me",
    icon: null,
    tile: "linear-gradient(145deg, #4d6076, #2b3a4c)",
    window: { w: 760, h: 540, x: 120, y: 48 },
    desk: { right: 26, top: 22 },
  },
  {
    id: "projects",
    name: "Projects",
    windowTitle: "Projects",
    icon: SquaresFour,
    tile: "linear-gradient(145deg, #f7a94b, #e0731d)",
    window: { w: 700, h: 580, x: 220, y: 84 },
    desk: { right: 26, top: 124 },
  },
  {
    id: "journal",
    name: "Journal",
    windowTitle: "Journal",
    icon: Notebook,
    tile: "linear-gradient(145deg, #e7b34a, #c07f12)",
    window: { w: 560, h: 460, x: 320, y: 120 },
    desk: { right: 26, top: 226 },
  },
  {
    id: "notes",
    name: "Notes",
    windowTitle: "Notes",
    icon: Notepad,
    tile: "linear-gradient(145deg, #ffd339, #f8b500)",
    window: { w: 480, h: 440, x: 380, y: 150 },
    desk: { right: 26, top: 430 },
  },
  {
    id: "contact",
    name: "Contact",
    windowTitle: "New Message",
    icon: PaperPlaneTilt,
    tile: "linear-gradient(145deg, #4da3ff, #0b63d8)",
    window: { w: 560, h: 620, x: 420, y: 60 },
    desk: { right: 26, top: 328 },
  },
  {
    id: "browser",
    name: "Browser",
    windowTitle: "Browser",
    icon: Compass,
    tile: "linear-gradient(145deg, #6cc1ff, #1668dc)",
    window: { w: 980, h: 640, x: 90, y: 40 },
  },
  {
    id: "terminal",
    name: "Terminal",
    windowTitle: "diwakar@portfolio",
    icon: TerminalWindow,
    tile: "linear-gradient(145deg, #23272f, #0c0e12)",
    window: { w: 620, h: 420, x: 180, y: 200 },
    desk: { left: 26, bottom: 118 },
  },
  {
    id: "settings",
    name: "Settings",
    windowTitle: "System Settings",
    icon: GearSix,
    tile: "linear-gradient(145deg, #9a9aa2, #5c5c64)",
    window: { w: 660, h: 480, x: 260, y: 140 },
  },
  {
    id: "calculator",
    name: "Calculator",
    windowTitle: "Calculator",
    icon: Calculator,
    tile: "linear-gradient(145deg, #4a4a4f, #1c1c1f)",
    window: { w: 300, h: 440, x: 500, y: 90 },
  },
  {
    id: "spotify",
    name: "Spotify",
    windowTitle: "Spotify",
    icon: MusicNotes,
    tile: "linear-gradient(145deg, #2be08a, #1db954)",
    window: { w: 760, h: 560, x: 160, y: 70 },
  },
  {
    id: "socials",
    name: "Socials",
    windowTitle: "Socials",
    icon: ShareNetwork,
    tile: "linear-gradient(145deg, #7d8cff, #4457d6)",
    window: { w: 520, h: 480, x: 300, y: 110 },
    desk: { right: 26, top: 534 },
  },
  {
    id: "craft",
    name: "CraftJS",
    windowTitle: "CraftJS",
    icon: Cube,
    tile: "linear-gradient(145deg, #7bc96f, #3f7d3a)",
    window: { w: 960, h: 640, x: 80, y: 30 },
    desk: { left: 26, bottom: 230 },
  },
  {
    id: "finder",
    name: "Finder",
    windowTitle: "Finder",
    icon: Folder,
    tile: "linear-gradient(180deg, #168fd6, #0a5f9c)",
    window: { w: 700, h: 500, x: 240, y: 110 },
  },
  {
    id: "code",
    name: "Code",
    windowTitle: "Code",
    icon: CodeSimple,
    tile: "linear-gradient(145deg, #007acc, #00447c)",
    window: { w: 780, h: 560, x: 200, y: 80 },
  },
  {
    id: "photos",
    name: "Photos",
    windowTitle: "Photos",
    icon: MagnifyingGlass,
    tile: "linear-gradient(145deg, #ff6b6b, #c0392b)",
    window: { w: 820, h: 560, x: 180, y: 70 },
  },
  {
    id: "weather",
    name: "Weather",
    windowTitle: "Weather",
    icon: CloudSun,
    tile:
      "linear-gradient(160deg, #2980b9, #1a3056)",
    window: { w: 560, h: 440, x: 320, y: 100 },
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    windowTitle: "WhatsApp",
    icon: WhatsappLogo,
    tile: "linear-gradient(145deg, #25d366, #128c7e)",
    window: { w: 400, h: 580, x: 500, y: 60 },
  },
  {
    id: "launchpad",
    name: "Launchpad",
    windowTitle: "Launchpad",
    icon: Rabbit,
    tile: "linear-gradient(145deg, #b86ef7, #6e3bb5)",
    window: { w: 640, h: 440, x: 260, y: 120 },
  },
];

export const appById = (id: AppId): AppDef => {
  const app = APPS.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
};
