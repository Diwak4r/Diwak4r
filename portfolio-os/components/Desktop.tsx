"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { APPS } from "@/lib/apps";
import { useFocusedWin, useWindows, type AppId } from "@/lib/store";
import { useSystem } from "@/lib/system";
import { useIsMobile } from "@/lib/hooks";
import Wallpaper from "./Wallpaper";
import MenuBar from "./MenuBar";
import DesktopIcon, { clearIconPositions } from "./DesktopIcon";
import Dock from "./Dock";
import Window from "./Window";
import LinkContent from "./LinkContent";
import ContextMenu, { type MenuPosition } from "./ContextMenu";
import Spotlight from "./Spotlight";
import WifiOverlay from "./WifiOverlay";
import { BootScreen, LoginScreen } from "./Onboarding";
import AboutApp from "./apps/AboutApp";
import ProjectsApp from "./apps/ProjectsApp";
import JournalApp from "./apps/JournalApp";
import NotesApp from "./apps/NotesApp";
import ContactApp from "./apps/ContactApp";
import TerminalApp from "./apps/TerminalApp";
import BrowserApp from "./apps/BrowserApp";
import SettingsApp from "./apps/SettingsApp";
import CalculatorApp from "./apps/CalculatorApp";
import SpotifyApp from "./apps/SpotifyApp";
import SocialsApp from "./apps/SocialsApp";
import CraftApp from "./apps/CraftApp";

const APP_CONTENT: Record<AppId, React.ReactNode> = {
  about: <AboutApp />,
  projects: <ProjectsApp />,
  journal: <JournalApp />,
  notes: <NotesApp />,
  contact: <ContactApp />,
  terminal: <TerminalApp />,
  browser: <BrowserApp />,
  settings: <SettingsApp />,
  calculator: <CalculatorApp />,
  socials: <SocialsApp />,
  spotify: <SpotifyApp />,
  craft: <CraftApp />,
};

type Phase = "boot" | "login" | "desktop";

const BOOTED_KEY = "dios-booted";

export default function Desktop() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const windows = useWindows((s) => s.windows);
  const links = useWindows((s) => s.links);
  const openApp = useWindows((s) => s.openApp);
  const closeApp = useWindows((s) => s.closeApp);
  const minimizeApp = useWindows((s) => s.minimizeApp);
  const toggleMaximize = useWindows((s) => s.toggleMaximize);
  const focusApp = useWindows((s) => s.focusApp);
  const closeLinkWin = useWindows((s) => s.closeLinkWin);
  const minimizeLinkWin = useWindows((s) => s.minimizeLinkWin);
  const toggleMaximizeLinkWin = useWindows((s) => s.toggleMaximizeLinkWin);
  const focusLinkWin = useWindows((s) => s.focusLinkWin);
  const focused = useFocusedWin();
  const tone = useSystem((s) => s.tone);
  const wifiOn = useSystem((s) => s.wifiOn);
  const brightness = useSystem((s) => s.brightness);
  const transparency = useSystem((s) => s.transparency);
  const grain = useSystem((s) => s.grain);
  const hydrate = useSystem((s) => s.hydrate);

  const [phase, setPhase] = useState<Phase>("boot");
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>(null);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  // Bumping this key remounts the icons, snapping them back to their spots.
  const [tidyKey, setTidyKey] = useState(0);
  const welcomed = useRef(false);

  // Restore persisted appearance; skip the boot sequence within a session.
  useEffect(() => {
    hydrate();
    if (sessionStorage.getItem(BOOTED_KEY)) setPhase("desktop");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Welcome moment: open About shortly after the desktop settles (large screens).
  useEffect(() => {
    if (phase !== "desktop" || welcomed.current) return;
    welcomed.current = true;
    if (window.innerWidth < 768) return;
    const t = setTimeout(() => openApp("about"), 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Global keys: Cmd/Ctrl+K for Spotlight; Escape closes menus, then windows.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (phase === "desktop") setSpotlightOpen((v) => !v);
        return;
      }
      if (e.key !== "Escape") return;
      if (spotlightOpen) return; // Spotlight handles its own Escape
      if (menuPos) {
        setMenuPos(null);
        return;
      }
      if (!focused) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      if (focused.kind === "app") closeApp(focused.id);
      else closeLinkWin(focused.url);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, closeApp, closeLinkWin, menuPos, spotlightOpen, phase]);

  const onDesktopContextMenu = (e: React.MouseEvent) => {
    // Only hijack right-click on the desktop surface itself, not on
    // windows or icons, so users can still inspect content normally.
    if (e.target !== e.currentTarget || isMobile) return;
    e.preventDefault();
    const rect = desktopRef.current?.getBoundingClientRect();
    setMenuPos({ x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
  };

  // macOS selection marquee: driven with direct DOM writes so dragging on the
  // desktop never re-renders React.
  const marqueeRef = useRef<HTMLDivElement>(null);
  const onDesktopPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget) return;
    setSelectedIcon(null);
    setMenuPos(null);
    if (isMobile || e.button !== 0) return;

    const surface = e.currentTarget as HTMLDivElement;
    const rect = surface.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const box = marqueeRef.current;
    if (!box) return;

    const move = (ev: PointerEvent) => {
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      box.style.display = "block";
      box.style.left = `${Math.min(sx, cx)}px`;
      box.style.top = `${Math.min(sy, cy)}px`;
      box.style.width = `${Math.abs(cx - sx)}px`;
      box.style.height = `${Math.abs(cy - sy)}px`;
    };
    const up = () => {
      box.style.display = "none";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const deskApps = APPS.filter((a) => a.desk);

  return (
    <div
      data-tone={tone}
      data-transparency={transparency ? "on" : "off"}
      className="fixed inset-0 select-none overflow-hidden bg-ink-950"
    >
      <Wallpaper />

      {phase === "desktop" && (
        <>
          <MenuBar onSpotlight={() => setSpotlightOpen(true)} />

          {/* z-10 creates a stacking context so window z-order can grow
              unbounded without ever covering the dock, menu bar, or grain. */}
          <div
            ref={desktopRef}
            className="absolute inset-x-0 bottom-0 top-7 z-10"
            onContextMenu={onDesktopContextMenu}
            onPointerDown={onDesktopPointerDown}
          >
            {/* Icons: scattered on desktop, springboard grid on mobile */}
            {isMobile === null ? null : isMobile ? (
              <div className="grid grid-cols-3 justify-items-center gap-y-8 px-6 pt-14">
                {APPS.map((app) => (
                  <DesktopIcon key={app.id} app={app} constraintsRef={desktopRef} mobile />
                ))}
              </div>
            ) : (
              deskApps.map((app) => (
                <DesktopIcon
                  key={`${app.id}-${tidyKey}`}
                  app={app}
                  constraintsRef={desktopRef}
                  mobile={false}
                  selected={selectedIcon === app.id}
                  onSelect={setSelectedIcon}
                />
              ))
            )}

            {/* Selection marquee (hidden until a drag begins) */}
            <div
              ref={marqueeRef}
              className="pointer-events-none absolute z-[5] hidden rounded-[3px] border border-(--accent-btn) bg-(--accent-btn)/15"
              aria-hidden
            />

            {/* Windows */}
            <AnimatePresence>
              {isMobile !== null &&
                APPS.filter((app) => windows[app.id].open).map((app) => (
                  <Window
                    key={app.id}
                    name={app.name}
                    title={app.windowTitle}
                    initial={app.window}
                    z={windows[app.id].z}
                    minimized={windows[app.id].minimized}
                    maximized={windows[app.id].maximized}
                    desktopRef={desktopRef}
                    focused={focused?.kind === "app" && focused.id === app.id}
                    mobile={isMobile}
                    onClose={() => closeApp(app.id)}
                    onMinimize={() => minimizeApp(app.id)}
                    onToggleMax={() => toggleMaximize(app.id)}
                    onFocus={() => focusApp(app.id)}
                  >
                    <div className="h-full cursor-auto select-text">
                      {APP_CONTENT[app.id]}
                    </div>
                  </Window>
                ))}

              {/* Independent site windows: profiles, projects, tools */}
              {isMobile !== null &&
                Object.values(links).map((l) => (
                  <Window
                    key={l.url}
                    name={l.title}
                    title={l.title}
                    initial={l.rect}
                    z={l.z}
                    minimized={l.minimized}
                    maximized={l.maximized}
                    desktopRef={desktopRef}
                    focused={focused?.kind === "link" && focused.url === l.url}
                    mobile={isMobile}
                    onClose={() => closeLinkWin(l.url)}
                    onMinimize={() => minimizeLinkWin(l.url)}
                    onToggleMax={() => toggleMaximizeLinkWin(l.url)}
                    onFocus={() => focusLinkWin(l.url)}
                  >
                    <div className="h-full cursor-auto select-text">
                      <LinkContent url={l.url} title={l.title} />
                    </div>
                  </Window>
                ))}
            </AnimatePresence>

            {/* Wi-Fi off takeover */}
            <AnimatePresence>{!wifiOn && <WifiOverlay />}</AnimatePresence>

            {/* Right-click menu */}
            <AnimatePresence>
              {menuPos && (
                <ContextMenu
                  pos={menuPos}
                  onClose={() => setMenuPos(null)}
                  onTidy={() => {
                    clearIconPositions();
                    setTidyKey((k) => k + 1);
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {isMobile === false && <Dock />}

          <Spotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
        </>
      )}

      {/* Boot and login sit above everything except the grain */}
      <AnimatePresence mode="wait">
        {phase === "boot" && (
          <BootScreen key="boot" onDone={() => setPhase("login")} />
        )}
        {phase === "login" && (
          <LoginScreen
            key="login"
            onDone={() => {
              sessionStorage.setItem(BOOTED_KEY, "1");
              setPhase("desktop");
            }}
          />
        )}
      </AnimatePresence>

      {/* Film grain sits above everything, below nothing interactive */}
      {grain && <div className="grain pointer-events-none fixed inset-0 z-[110]" aria-hidden />}

      {/* Screen brightness: a real physical display dims everything, so this
          sits above even the grain. */}
      {brightness < 1 && (
        <div
          className="pointer-events-none fixed inset-0 z-[120] bg-black"
          style={{ opacity: 1 - brightness }}
          aria-hidden
        />
      )}
    </div>
  );
}
