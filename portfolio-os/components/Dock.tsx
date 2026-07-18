"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Trash, type IconWeight } from "@phosphor-icons/react";
import { APPS, type AppDef } from "@/lib/apps";
import { trashedItems, useFiles } from "@/lib/files";
import { useAppWinCount, useWindows } from "@/lib/store";
import { openLink, useSystem } from "@/lib/system";
import { ChatGptMark, ClaudeMark, GithubMark, ZoMark } from "./brand/BrandMarks";
import AppTile from "./AppTile";

interface QuickLink {
  id: string;
  label: string;
  url: string;
  icon: React.ComponentType<{ className?: string; weight?: IconWeight }>;
  tile: string;
}

/** Web shortcuts: the tools Diwakar actually works in, each in its own window. */
const QUICK_LINKS: QuickLink[] = [
  {
    id: "zo-space",
    label: "Zo Space",
    url: "https://diwak4r.zo.space/",
    icon: ZoMark,
    tile: "linear-gradient(145deg, #7ee0d0, #1f9e8a)",
  },
  {
    id: "github",
    label: "GitHub",
    url: "https://github.com/Diwak4r",
    icon: GithubMark,
    tile: "linear-gradient(145deg, #3a3f47, #101215)",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    url: "https://chatgpt.com/",
    icon: ChatGptMark,
    tile: "linear-gradient(145deg, #74aa9c, #0f4f43)",
  },
  {
    id: "claude",
    label: "Claude",
    url: "https://claude.ai/",
    icon: ClaudeMark,
    tile: "linear-gradient(145deg, #d97a5c, #a54a2e)",
  },
];

const REACH = 150;

/** Dock size and magnification follow System Settings › Desktop & Dock. */
function useDockSizing() {
  const base = useSystem((s) => s.dockSize);
  const magnify = useSystem((s) => s.dockMagnify);
  return { base, peak: magnify ? Math.round(base * 1.8) : base };
}

/** macOS dock magnification: size follows the cursor with a smooth falloff. */
function useMagnify(mouseX: MotionValue<number>, ref: React.RefObject<HTMLElement | null>) {
  const { base, peak } = useDockSizing();
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - bounds.x - bounds.width / 2;
  });
  const sizeRaw = useTransform(distance, [-REACH, 0, REACH], [base, peak, base]);
  return useSpring(sizeRaw, { mass: 0.1, stiffness: 220, damping: 16 });
}

/** Right-click menu on a dock icon: the app's windows, New Window, Close All. */
function DockAppMenu({ app, onClose }: { app: AppDef; onClose: () => void }) {
  const windows = useWindows((s) => s.wins);
  const newAppWindow = useWindows((s) => s.newAppWindow);
  const focus = useWindows((s) => s.focus);
  const closeAllOf = useWindows((s) => s.closeAllOf);
  const own = Object.values(windows).filter((w) => w.appId === app.id);

  useEffect(() => {
    const onDown = () => onClose();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    // Defer so the opening right-click itself doesn't close it.
    const t = setTimeout(() => {
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const item =
    "block w-full rounded-md px-2.5 py-1.5 text-left text-[13px] text-white/85 transition-colors hover:bg-(--accent-btn) hover:text-(--accent-contrast)";

  return (
    <div
      className="bar-chrome absolute bottom-[calc(100%+14px)] left-1/2 z-50 w-52 -translate-x-1/2 rounded-lg border border-white/[0.12] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      role="menu"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {own.map((w, i) => (
        <button
          key={w.winId}
          role="menuitem"
          className={`${item} truncate`}
          onClick={() => {
            focus(w.winId);
            onClose();
          }}
        >
          {w.title}
          {own.length > 1 ? ` — ${i + 1}` : ""}
        </button>
      ))}
      {own.length > 0 && <div className="mx-2 my-1 border-t border-white/[0.08]" aria-hidden />}
      <button
        role="menuitem"
        className={item}
        onClick={() => {
          newAppWindow(app.id);
          onClose();
        }}
      >
        New Window
      </button>
      {own.length > 0 && (
        <button
          role="menuitem"
          className={item}
          onClick={() => {
            closeAllOf(app.id);
            onClose();
          }}
        >
          Close All
        </button>
      )}
    </div>
  );
}

function DockItem({ app, mouseX }: { app: AppDef; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const base = useSystem((s) => s.dockSize);
  const openApp = useWindows((s) => s.openApp);
  const isOpen = useAppWinCount(app.id) > 0;
  const size = useMagnify(mouseX, ref);
  const [scope, animate] = useAnimate();
  const [menuOpen, setMenuOpen] = useState(false);

  const launch = () => {
    // The classic launch bounce, only when the app isn't already running.
    if (!reduce && !isOpen && scope.current) {
      animate(scope.current, { y: [0, -26, 0, -12, 0] }, { duration: 0.65, ease: "easeOut" });
    }
    openApp(app.id);
  };

  return (
    <div className="relative">
      <motion.button
        ref={ref}
        onClick={launch}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(true);
        }}
        style={reduce ? { width: base, height: base } : { width: size, height: size }}
        className="group relative aspect-square"
        aria-label={`${isOpen ? "Focus" : "Open"} ${app.name}`}
      >
        <span ref={scope} className="block h-full w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]">
          <AppTile app={app} />
        </span>

        {/* Tooltip */}
        {!menuOpen && (
          <span className="dock-tip pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-[12px] text-white/90 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
            {app.name}
          </span>
        )}

        {/* Running indicator */}
        {isOpen && (
          <span
            className="absolute -bottom-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/70"
            aria-hidden
          />
        )}
      </motion.button>

      {menuOpen && <DockAppMenu app={app} onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

/** A dock shortcut to an external site, opened as an independent window. */
function LinkItem({ link, mouseX }: { link: QuickLink; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const base = useSystem((s) => s.dockSize);
  const size = useMagnify(mouseX, ref);
  const [scope, animate] = useAnimate();

  const launch = () => {
    if (!reduce && scope.current) {
      animate(scope.current, { y: [0, -26, 0, -12, 0] }, { duration: 0.65, ease: "easeOut" });
    }
    openLink(link.url, link.label);
  };

  return (
    <motion.button
      ref={ref}
      onClick={launch}
      style={reduce ? { width: base, height: base } : { width: size, height: size }}
      className="group relative aspect-square"
      aria-label={`Open ${link.label}`}
    >
      <span
        ref={scope}
        className="flex h-full w-full items-center justify-center rounded-[26%] drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
        style={{ background: link.tile }}
      >
        <link.icon weight="fill" className="h-[52%] w-[52%] text-white/90" />
      </span>

      <span className="dock-tip pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-[12px] text-white/90 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {link.label}
      </span>
    </motion.button>
  );
}

/** The Trash can. Opens the Trash window; fills up when it has items. */
function TrashItem({ mouseX }: { mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const base = useSystem((s) => s.dockSize);
  const openApp = useWindows((s) => s.openApp);
  const hasItems = trashedItems(useFiles((s) => s.items)).length > 0;
  const size = useMagnify(mouseX, ref);
  const [scope, animate] = useAnimate();

  const launch = () => {
    if (!reduce && scope.current) {
      animate(scope.current, { y: [0, -18, 0, -8, 0] }, { duration: 0.5, ease: "easeOut" });
    }
    openApp("trash");
  };

  return (
    <motion.button
      ref={ref}
      onClick={launch}
      style={reduce ? { width: base, height: base } : { width: size, height: size }}
      aria-label={hasItems ? "Trash, has items" : "Trash, empty"}
      className="group relative flex aspect-square items-center justify-center rounded-[26%] bg-white/[0.09] shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
    >
      <span ref={scope} className="flex h-[55%] w-[55%] items-center justify-center">
        <Trash
          className={`h-full w-full ${hasItems ? "text-white/90" : "text-white/50"}`}
          weight={hasItems ? "fill" : "duotone"}
        />
      </span>
      <span className="dock-tip pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-[12px] text-white/90 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        Trash
      </span>
    </motion.button>
  );
}

/** Shrinks the whole dock uniformly to fit the viewport, like real macOS —
 *  never clips or scrolls, no matter how many icons are added. */
function useFitScale(navRef: React.RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(1);
  const dockSize = useSystem((s) => s.dockSize);

  useEffect(() => {
    const recompute = () => {
      const el = navRef.current;
      if (!el) return;
      const natural = el.scrollWidth;
      const available = window.innerWidth - 32;
      setScale(natural > available ? Math.max(0.5, available / natural) : 1);
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [navRef, dockSize]);

  return scale;
}

export default function Dock() {
  const mouseX = useMotionValue<number>(Infinity);
  const navRef = useRef<HTMLElement>(null);
  const scale = useFitScale(navRef);

  return (
    <div className="absolute inset-x-0 bottom-3 z-40 flex justify-center">
      <motion.nav
        ref={navRef}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={{ scale, transformOrigin: "bottom center" }}
        className="dock-chrome flex items-end gap-2.5 rounded-[26px] border border-white/[0.14] px-3 pb-2 pt-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        aria-label="Dock"
      >
        {APPS.map((app) => (
          <DockItem key={app.id} app={app} mouseX={mouseX} />
        ))}
        <span className="mx-0.5 h-11 w-px self-end bg-white/15" aria-hidden />
        {QUICK_LINKS.map((link) => (
          <LinkItem key={link.id} link={link} mouseX={mouseX} />
        ))}
        <span className="mx-0.5 h-11 w-px self-end bg-white/15" aria-hidden />
        <TrashItem mouseX={mouseX} />
      </motion.nav>
    </div>
  );
}
