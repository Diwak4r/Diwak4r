"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { APPS } from "@/lib/apps";
import { useFocusedWin, useWindows, type AppId, type Win } from "@/lib/store";
import { openSettings, useSystem, type SettingsPane } from "@/lib/system";
import { useIsMobile } from "@/lib/hooks";
import Wallpaper from "./Wallpaper";
import MenuBar from "./MenuBar";
import DesktopIcon, { clearIconPositions } from "./DesktopIcon";
import Dock from "./Dock";
import Window from "./Window";
import LinkContent from "./LinkContent";
import ContextMenu, { type MenuEntry, type MenuPosition } from "./ContextMenu";
import DeskFileIcon from "./DeskFileIcon";
import GetInfo from "./GetInfo";
import { childrenOf, useFiles, type DeskItem } from "@/lib/files";
import Spotlight from "./Spotlight";
import WifiOverlay from "./WifiOverlay";
import { BootScreen, LoginScreen } from "./Onboarding";

// Lazy-everything: each app chunks out of the boot bundle.
const AboutApp = lazy(() => import("./apps/AboutApp"));
const ProjectsApp = lazy(() => import("./apps/ProjectsApp"));
const JournalApp = lazy(() => import("./apps/JournalApp"));
const NotesApp = lazy(() => import("./apps/NotesApp"));
const ContactApp = lazy(() => import("./apps/ContactApp"));
const TerminalApp = lazy(() => import("./apps/TerminalApp"));
const BrowserApp = lazy(() => import("./apps/BrowserApp"));
const SettingsApp = lazy(() => import("./apps/SettingsApp"));
const CalculatorApp = lazy(() => import("./apps/CalculatorApp"));
const SpotifyApp = lazy(() => import("./apps/SpotifyApp"));
const SocialsApp = lazy(() => import("./apps/SocialsApp"));
const CraftApp = lazy(() => import("./apps/CraftApp"));
const FinderApp = lazy(() => import("./apps/FinderApp"));
const CodeApp = lazy(() => import("./apps/CodeApp"));
const PhotosApp = lazy(() => import("./apps/PhotosApp"));
const WeatherApp = lazy(() => import("./apps/WeatherApp"));
const WhatsAppApp = lazy(() => import("./apps/WhatsAppApp"));
const Launchpad = lazy(() => import("./Launchpad"));

const APP_SPINNER = (
  <div className="flex h-full items-center justify-center">
    <span className="animate-pulse text-[13px] text-white/30">Loading…</span>
  </div>
);

/** Content per window instance. Each instance mounts its own component tree
 *  (keyed by winId), so two Terminals have two independent histories. */
const APP_RENDER: Record<AppId, (win: Win) => React.ReactNode> = {
  about: () => <AboutApp />,
  projects: () => <ProjectsApp />,
  journal: () => <JournalApp />,
  notes: () => <NotesApp />,
  contact: () => <ContactApp />,
  terminal: (w) => <TerminalApp winId={w.winId} />,
  browser: (w) => <BrowserApp startUrl={w.props?.url as string | undefined} />,
  settings: (w) => <SettingsApp paneProp={w.props?.pane as SettingsPane | undefined} />,
  calculator: () => <CalculatorApp />,
  socials: () => <SocialsApp />,
  spotify: () => <SpotifyApp />,
  craft: () => <CraftApp />,
  finder: (w) => <FinderApp path={w.props?.path as string | undefined} />,
  code: (w) => <CodeApp fileId={w.props?.fileId as string | undefined} />,
  photos: () => <PhotosApp />,
  weather: () => <WeatherApp />,
  whatsapp: () => <WhatsAppApp />,
  launchpad: () => <Launchpad />,
};

type Phase = "boot" | "login" | "desktop";

const BOOTED_KEY = "dios-booted";

export default function Desktop() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const wins = useWindows((s) => s.wins);
  const openApp = useWindows((s) => s.openApp);
  const close = useWindows((s) => s.close);
  const minimize = useWindows((s) => s.minimize);
  const toggleMax = useWindows((s) => s.toggleMax);
  const focus = useWindows((s) => s.focus);
  const focused = useFocusedWin();
  const tone = useSystem((s) => s.tone);
  const wifiOn = useSystem((s) => s.wifiOn);
  const brightness = useSystem((s) => s.brightness);
  const transparency = useSystem((s) => s.transparency);
  const grain = useSystem((s) => s.grain);
  const nightShift = useSystem((s) => s.nightShift);
  const hydrate = useSystem((s) => s.hydrate);

  const files = useFiles((s) => s.items);
  const hydrateFiles = useFiles((s) => s.hydrate);
  const createFile = useFiles((s) => s.create);
  const removeFile = useFiles((s) => s.remove);
  const duplicateFile = useFiles((s) => s.duplicate);
  const setFilePos = useFiles((s) => s.setPos);

  const [phase, setPhase] = useState<Phase>("boot");
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [infoItem, setInfoItem] = useState<DeskItem | null>(null);
  const [menu, setMenu] = useState<{ pos: MenuPosition; entries: MenuEntry[] } | null>(null);
  // Bumping this key remounts the icons, snapping them back to their spots.
  const [tidyKey, setTidyKey] = useState(0);
  const welcomed = useRef(false);

  // Restore persisted appearance; skip the boot sequence within a session.
  useEffect(() => {
    hydrate();
    hydrateFiles();
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
      if (menu) {
        setMenu(null);
        return;
      }
      if (infoItem) {
        setInfoItem(null);
        return;
      }
      if (!focused) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      close(focused.winId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, close, menu, infoItem, spotlightOpen, phase]);

  const deskFiles = childrenOf(files, null);

  const openDeskItem = (item: DeskItem) => {
    if (item.kind === "folder") openApp("finder", { path: item.id });
    else openApp("code", { fileId: item.id });
  };

  /** Lay the user's desktop items back onto a tidy grid, in the given order. */
  const gridDeskItems = (ordered: DeskItem[]) => {
    ordered.forEach((item, i) => {
      setFilePos(item.id, { x: 140 + (i % 6) * 100, y: 90 + Math.floor(i / 6) * 110 });
    });
  };

  const surfaceEntries = (pos: MenuPosition): MenuEntry[] => [
    { label: "New Folder", action: () => setRenamingId(createFile("folder", null, pos)) },
    { label: "New Text File", action: () => setRenamingId(createFile("file", null, pos)) },
    { label: "Change Wallpaper", action: () => openSettings("wallpaper"), divider: true },
    { label: "Change Accent Color", action: () => openSettings("appearance") },
    {
      label: "Sort By",
      divider: true,
      submenu: [
        {
          label: "Name",
          action: () => gridDeskItems([...deskFiles].sort((a, b) => a.name.localeCompare(b.name))),
        },
        {
          label: "Kind",
          action: () => gridDeskItems(deskFiles), // childrenOf already sorts folders first
        },
      ],
    },
    {
      label: "Tidy Up Icons",
      action: () => {
        clearIconPositions();
        setTidyKey((k) => k + 1);
        gridDeskItems(deskFiles);
      },
    },
    { label: "Open Terminal Here", action: () => openApp("terminal"), divider: true },
    { label: "About This Portfolio", action: () => openApp("about") },
  ];

  const itemEntries = (item: DeskItem): MenuEntry[] => [
    { label: "Open", action: () => openDeskItem(item) },
    { label: "Rename", action: () => setRenamingId(item.id), divider: true },
    { label: "Duplicate", action: () => duplicateFile(item.id) },
    { label: "Get Info", action: () => setInfoItem(item) },
    {
      label: "Move to Trash",
      divider: true,
      danger: true,
      action: () => {
        removeFile(item.id);
        setSelectedFile(null);
      },
    },
  ];

  const onDesktopContextMenu = (e: React.MouseEvent) => {
    // Only hijack right-click on the desktop surface itself, not on
    // windows or icons, so users can still inspect content normally.
    if (e.target !== e.currentTarget || isMobile) return;
    e.preventDefault();
    const rect = desktopRef.current?.getBoundingClientRect();
    const pos = { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
    setMenu({ pos, entries: surfaceEntries(pos) });
  };

  // macOS selection marquee: driven with direct DOM writes so dragging on the
  // desktop never re-renders React.
  const marqueeRef = useRef<HTMLDivElement>(null);
  const onDesktopPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget) return;
    setSelectedIcon(null);
    setSelectedFile(null);
    setMenu(null);
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

            {/* User-created files and folders */}
            {isMobile === false &&
              deskFiles.map((item) => (
                <DeskFileIcon
                  key={item.id}
                  item={item}
                  selected={selectedFile === item.id}
                  renaming={renamingId === item.id}
                  onSelect={setSelectedFile}
                  onOpen={openDeskItem}
                  onMenu={(it, client) => {
                    const rect = desktopRef.current?.getBoundingClientRect();
                    setMenu({
                      pos: { x: client.x - (rect?.left ?? 0), y: client.y - (rect?.top ?? 0) },
                      entries: itemEntries(it),
                    });
                  }}
                  onRenamed={() => setRenamingId(null)}
                />
              ))}

            {/* Selection marquee (hidden until a drag begins) */}
            <div
              ref={marqueeRef}
              className="pointer-events-none absolute z-[5] hidden rounded-[3px] border border-(--accent-btn) bg-(--accent-btn)/15"
              aria-hidden
            />

            {/* Windows: every instance is independent (apps and link sites) */}
            <AnimatePresence>
              {isMobile !== null &&
                Object.values(wins).map((w) => (
                  <Window
                    key={w.winId}
                    name={w.title}
                    title={w.title}
                    initial={w.rect}
                    z={w.z}
                    minimized={w.minimized}
                    maximized={w.maximized}
                    desktopRef={desktopRef}
                    focused={focused?.winId === w.winId}
                    mobile={isMobile}
                    onClose={() => close(w.winId)}
                    onMinimize={() => minimize(w.winId)}
                    onToggleMax={() => toggleMax(w.winId)}
                    onFocus={() => focus(w.winId)}
                  >
                    <div className="h-full cursor-auto select-text">
                      <Suspense fallback={APP_SPINNER}>
                        {w.kind === "app" && w.appId
                          ? APP_RENDER[w.appId](w)
                          : w.kind === "link"
                          ? <LinkContent url={w.url!} title={w.title} />
                          : null}
                      </Suspense>
                    </div>
                  </Window>
                ))}
            </AnimatePresence>

            {/* Wi-Fi off takeover */}
            <AnimatePresence>{!wifiOn && <WifiOverlay />}</AnimatePresence>

            {/* Right-click menu (desktop surface or a desktop item) */}
            <AnimatePresence>
              {menu && (
                <ContextMenu pos={menu.pos} entries={menu.entries} onClose={() => setMenu(null)} />
              )}
            </AnimatePresence>

            {/* Get Info panel */}
            <AnimatePresence>
              {infoItem && files[infoItem.id] && (
                <GetInfo item={files[infoItem.id]} onClose={() => setInfoItem(null)} />
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

      {/* Night Shift warm filter: sits below grain and brightness, above windows */}
      {nightShift > 0 && (
        <div className="pointer-events-none fixed inset-0 z-[65]" style={{
          background: `rgba(255, 170, 80, ${nightShift * 0.4})`,
          mixBlendMode: "multiply",
        }} aria-hidden />
      )}

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
