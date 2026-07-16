"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BatteryFull,
  Command,
  LinkedinLogo,
  MagnifyingGlass,
  SlidersHorizontal,
  WifiHigh,
  WifiSlash,
} from "@phosphor-icons/react";
import { APPS } from "@/lib/apps";
import { useFocusedWin, useWindows } from "@/lib/store";
import { openLink, openSettings, useSystem } from "@/lib/system";
import { socials } from "@/lib/content";
import { GithubMark, XMark } from "@/components/brand/BrandMarks";
import ControlCenter from "./ControlCenter";

function Clock() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const day = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(d);
      const time = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
      setNow(`${day}  ${time}`);
    };
    fmt();
    const t = setInterval(fmt, 1_000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="whitespace-pre text-[12.5px] tabular-nums text-white/70">
      {now}
    </span>
  );
}

const barIcons = {
  GitHub: GithubMark,
  LinkedIn: LinkedinLogo,
  X: XMark,
} as const;

/** The system menu behind the "logo": real actions, mac-style presentation. */
function SystemMenu({ onClose }: { onClose: () => void }) {
  const openApp = useWindows((s) => s.openApp);

  const items: { label: string; action: () => void; divider?: boolean }[] = [
    { label: "About This Portfolio", action: () => openApp("about") },
    { label: "System Settings", action: () => openSettings("appearance") },
    { label: "Open Terminal", action: () => openApp("terminal") },
    {
      label: "Classic Portfolio Site",
      action: () => openLink("https://www.diwakaryadav.com.np/"),
      divider: true,
    },
    { label: "View Source on GitHub", action: () => openLink("https://github.com/Diwak4r") },
    { label: "Email Diwakar", action: () => openApp("contact") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="bar-chrome absolute left-2 top-8 z-50 w-56 origin-top-left rounded-lg border border-white/[0.12] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      role="menu"
    >
      {items.map((item) => (
        <button
          key={item.label}
          role="menuitem"
          onClick={() => {
            item.action();
            onClose();
          }}
          className={`block w-full rounded-md px-2.5 py-1.5 text-left text-[13px] text-white/85 transition-colors hover:bg-(--accent-btn) hover:text-(--accent-contrast) ${
            item.divider ? "mt-1 border-t border-white/[0.08] pt-2" : ""
          }`}
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

export default function MenuBar({ onSpotlight }: { onSpotlight: () => void }) {
  const openApp = useWindows((s) => s.openApp);
  const focused = useFocusedWin();
  const wifiOn = useSystem((s) => s.wifiOn);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ccOpen, setCcOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ccRef = useRef<HTMLDivElement>(null);

  const focusedId = focused?.kind === "app" ? focused.appId ?? null : null;
  const focusedName =
    focused?.kind === "link"
      ? focused.title
      : APPS.find((a) => a.id === focusedId)?.name ?? "Desktop";

  // Close the system menu or Control Center on outside click or Escape.
  useEffect(() => {
    if (!menuOpen && !ccOpen) return;
    const onDown = (e: PointerEvent) => {
      if (menuOpen && !menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
      if (ccOpen && !ccRef.current?.contains(e.target as Node)) setCcOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setCcOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, ccOpen]);

  return (
    <header className="bar-chrome absolute inset-x-0 top-0 z-50 flex h-7 items-center gap-0.5 border-b border-white/[0.08] px-2">
      <div ref={menuRef} className="relative flex items-center">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="System menu"
          aria-expanded={menuOpen}
          className={`rounded px-2 py-0.5 transition-colors ${
            menuOpen ? "bg-white/15" : "hover:bg-white/10"
          }`}
        >
          <Command size={14} weight="bold" className="text-white/90" />
        </button>
        <AnimatePresence>
          {menuOpen && <SystemMenu onClose={() => setMenuOpen(false)} />}
        </AnimatePresence>
      </div>

      <span className="px-2 text-[13px] font-semibold tracking-tight text-white/90">
        {focusedName}
      </span>

      {/* The focused app is already named in bold, so skip it here,
          the way real menu bars never repeat the app name. */}
      <nav className="hidden items-center gap-0.5 md:flex" aria-label="Open apps">
        {APPS.filter((app) => app.id !== focusedId).map((app) => (
          <button
            key={app.id}
            onClick={() => openApp(app.id)}
            className="rounded px-2 py-0.5 text-[12.5px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {app.name}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2.5">
        {socials
          .filter((s) => s.label in barIcons)
          .map((s) => {
            const Icon = barIcons[s.label as keyof typeof barIcons];
            return (
              <button
                key={s.label}
                onClick={() => openLink(s.href)}
                aria-label={s.label}
                className="text-white/60 transition-colors hover:text-white"
              >
                <Icon className="h-[15px] w-[15px]" />
              </button>
            );
          })}
        <span className="mx-0.5 h-3.5 w-px bg-white/15" aria-hidden />
        <button
          onClick={onSpotlight}
          aria-label="Spotlight search"
          className="text-white/65 transition-colors hover:text-white"
        >
          <MagnifyingGlass size={15} weight="bold" />
        </button>
        {wifiOn ? (
          <WifiHigh size={16} weight="bold" className="text-white/65" aria-hidden />
        ) : (
          <WifiSlash size={16} weight="bold" className="text-white/65" aria-hidden />
        )}
        <div ref={ccRef} className="relative flex items-center">
          <button
            onClick={() => setCcOpen((v) => !v)}
            aria-label="Control Center"
            aria-expanded={ccOpen}
            className={`rounded px-1 py-0.5 transition-colors ${
              ccOpen ? "bg-white/15" : "hover:bg-white/10"
            }`}
          >
            <SlidersHorizontal size={15} weight="bold" className="text-white/65" />
          </button>
          <AnimatePresence>
            {ccOpen && <ControlCenter onClose={() => setCcOpen(false)} />}
          </AnimatePresence>
        </div>
        <BatteryFull size={20} className="text-white/65" aria-hidden />
        <Clock />
      </div>
    </header>
  );
}
