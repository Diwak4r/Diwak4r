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
    { label: "Zo Space", action: () => openLink("https://diwak4r.zo.space/"), divider: true },
    {
      label: "Classic Portfolio Site",
      action: () => openLink("https://www.diwakaryadav.com.np/"),
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
  const [battOpen, setBattOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ccRef = useRef<HTMLDivElement>(null);
  const battRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);

  const focusedId = focused?.kind === "app" ? focused.appId ?? null : null;
  const focusedName =
    focused?.kind === "link"
      ? focused.title
      : APPS.find((a) => a.id === focusedId)?.name ?? "Desktop";

  const anyOpen = menuOpen || ccOpen || battOpen || calOpen;

  // Close every popover on outside click or Escape.
  useEffect(() => {
    if (!anyOpen) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuOpen && !menuRef.current?.contains(t)) setMenuOpen(false);
      if (ccOpen && !ccRef.current?.contains(t)) setCcOpen(false);
      if (battOpen && !battRef.current?.contains(t)) setBattOpen(false);
      if (calOpen && !calRef.current?.contains(t)) setCalOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setCcOpen(false);
        setBattOpen(false);
        setCalOpen(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [anyOpen, menuOpen, ccOpen, battOpen, calOpen]);

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

      {/* Real macOS menu bar: only the standard menus, never every app.
          Each opens the app it most plausibly controls. */}
      <nav className="hidden items-center gap-0.5 md:flex" aria-label="Menus">
        {(
          [
            ["File", "finder"],
            ["Edit", "notes"],
            ["View", "photos"],
            ["Window", focusedId ?? "finder"],
            ["Help", "about"],
          ] as const
        ).map(([menu, appId]) => (
          <button
            key={menu}
            onClick={() => openApp(appId)}
            className="rounded px-2 py-0.5 text-[13px] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {menu}
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

        {/* Battery: click opens a live battery panel (real level + charging state). */}
        <div ref={battRef} className="relative flex items-center">
          <button
            onClick={() => setBattOpen((v) => !v)}
            aria-label="Battery status"
            aria-expanded={battOpen}
            className={`rounded px-1 py-0.5 transition-colors ${battOpen ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <BatteryFull size={20} className="text-white/65" aria-hidden />
          </button>
          <AnimatePresence>{battOpen && <BatteryPanel />}</AnimatePresence>
        </div>

        {/* Clock: click opens the macOS calendar popup. */}
        <div ref={calRef} className="relative flex items-center">
          <button
            onClick={() => setCalOpen((v) => !v)}
            aria-label="Date and time"
            aria-expanded={calOpen}
            className={`rounded px-1 py-0.5 transition-colors ${calOpen ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <Clock />
          </button>
          <AnimatePresence>{calOpen && <CalendarPopup />}</AnimatePresence>
        </div>
      </div>
    </header>
  );
}

/** Live battery panel: reads the Battery Status API, falls back gracefully. */
function BatteryPanel() {
  const [info, setInfo] = useState<{ level: number; charging: boolean } | null>(null);

  useEffect(() => {
    let alive = true;
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; charging: boolean; addEventListener?: any; removeEventListener?: any }> };
    if (!nav.getBattery) { setInfo({ level: 0.86, charging: false }); return; }
    nav.getBattery().then((b) => {
      if (!alive) return;
      const update = () => setInfo({ level: b.level, charging: b.charging });
      update();
      b.addEventListener?.("levelchange", update);
      b.addEventListener?.("chargingchange", update);
    }).catch(() => setInfo({ level: 0.86, charging: false }));
    return () => { alive = false; };
  }, []);

  const pct = info ? Math.round(info.level * 100) : 86;
  const charging = info?.charging ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="bar-chrome absolute right-0 top-8 z-50 w-56 origin-top-right rounded-lg border border-white/[0.12] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      role="menu"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-4 w-8 rounded-[4px] border-2 border-white/60 p-[2px]">
          <div className={`h-full rounded-[2px] ${charging ? "bg-green-400" : pct < 25 ? "bg-red-400" : "bg-white/85"}`} style={{ width: `${pct}%` }} />
          <div className="absolute -right-[5px] top-1/2 h-2 w-[3px] -translate-y-1/2 rounded-r-sm bg-white/60" />
        </div>
        <div className="text-[13px]">
          <p className="font-semibold text-white/90">{pct}%</p>
          <p className="text-[11px] text-white/50">{charging ? "Charging" : "On battery"}</p>
        </div>
      </div>
      <div className="mt-2.5 border-t border-white/[0.08] pt-2.5 text-[11px] text-white/45">
        Power source: {charging ? "Adapter" : "Battery"}
      </div>
    </motion.div>
  );
}

/** macOS-style calendar popup on the clock. */
function CalendarPopup() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const year = now?.getFullYear() ?? 0;
  const month = now?.getMonth() ?? 0;
  const today = now?.getDate() ?? 0;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const WEEKDAYS = ["S","M","T","W","T","F","S"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="bar-chrome absolute right-0 top-8 z-50 w-64 origin-top-right rounded-lg border border-white/[0.12] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      role="menu"
    >
      <p className="mb-2 text-center text-[14px] font-semibold text-white/90">
        {now ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""}
      </p>
      <div className="mb-1 flex items-center justify-between text-[11px] text-white/50">
        <span>{MONTHS[month]} {year}</span>
      </div>
      <div className="grid grid-cols-7 text-center text-[9px] font-semibold uppercase text-white/35">
        {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-[3px] text-center">
        {cells.map((d, i) => {
          const isToday = d === today;
          return (
            <span key={i} className="flex justify-center">
              <span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] tabular-nums ${
                isToday ? "bg-(--accent-btn) font-semibold text-(--accent-contrast)" : d ? "text-white/75" : ""
              }`}>
                {d ?? ""}
              </span>
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
