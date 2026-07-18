"use client";

import { useEffect, useState } from "react";
import { Desktop as DesktopIconGlyph, Image as ImageIcon, Info, Moon, MusicNotes, PaintBrushBroad, Sun, SunHorizon, WifiHigh } from "@phosphor-icons/react";
import {
  TONES,
  WALLPAPERS,
  useSystem,
  type SettingsPane,
} from "@/lib/system";
import { profile } from "@/lib/content";
import { openLink } from "@/lib/system";

const PANES: { id: SettingsPane; label: string; icon: typeof WifiHigh }[] = [
  { id: "appearance", label: "Appearance", icon: PaintBrushBroad },
  { id: "wallpaper", label: "Wallpaper", icon: ImageIcon },
  { id: "desktop", label: "Desktop & Dock", icon: DesktopIconGlyph },
  { id: "sounds", label: "Sounds", icon: MusicNotes },
  { id: "nightshift", label: "Night Shift", icon: SunHorizon },
  { id: "wifi", label: "Wi-Fi", icon: WifiHigh },
  { id: "about", label: "About This Mac", icon: Info },
];

/** macOS-style switch: green when on, like the real thing. */
function Switch({
  on,
  label,
  onChange,
}: {
  on: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="h-[26px] w-[42px] shrink-0 rounded-full p-[2px] transition-colors duration-200"
      style={{ background: on ? "#34c759" : "rgba(255,255,255,0.2)" }}
    >
      <span
        className="block h-[22px] w-[22px] rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: on ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}

function SettingRow({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
      <div>
        <p className="text-[13.5px] font-medium text-white/90">{title}</p>
        <p className="text-[12px] text-white/45">{detail}</p>
      </div>
      {children}
    </div>
  );
}

function DesktopDockPane() {
  const dockSize = useSystem((s) => s.dockSize);
  const setDockSize = useSystem((s) => s.setDockSize);
  const dockMagnify = useSystem((s) => s.dockMagnify);
  const setDockMagnify = useSystem((s) => s.setDockMagnify);
  const transparency = useSystem((s) => s.transparency);
  const setTransparency = useSystem((s) => s.setTransparency);
  const grain = useSystem((s) => s.grain);
  const setGrain = useSystem((s) => s.setGrain);

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-white/90">Desktop &amp; Dock</h2>
      <p className="mb-5 mt-1 text-[12.5px] text-white/50">
        Shape the desktop the way you like it. Everything here is remembered.
      </p>

      <div className="space-y-3">
        <SettingRow title="Dock size" detail={`${dockSize}px icons`}>
          <input
            type="range"
            min={40}
            max={64}
            step={2}
            value={dockSize}
            onChange={(e) => setDockSize(Number(e.target.value))}
            aria-label="Dock size"
            className="w-36 accent-(--accent-btn)"
          />
        </SettingRow>

        <SettingRow title="Dock magnification" detail="Icons swell as the pointer passes">
          <Switch on={dockMagnify} label="Toggle dock magnification" onChange={setDockMagnify} />
        </SettingRow>

        <SettingRow
          title="Transparency"
          detail="Frosted glass everywhere. Turn off for solid panels and extra speed"
        >
          <Switch on={transparency} label="Toggle transparency" onChange={setTransparency} />
        </SettingRow>

        <SettingRow title="Film grain" detail="A whisper of analog texture over the screen">
          <Switch on={grain} label="Toggle film grain" onChange={setGrain} />
        </SettingRow>
      </div>
    </div>
  );
}

function Appearance() {
  const tone = useSystem((s) => s.tone);
  const setTone = useSystem((s) => s.setTone);
  const appearance = useSystem((s) => s.appearance);
  const setAppearance = useSystem((s) => s.setAppearance);
  const current = TONES.find((t) => t.id === tone);

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-white/90">Appearance</h2>
      <p className="mb-5 mt-1 text-[12.5px] text-white/50">
        Highlights, buttons, and the Dynamic wallpaper follow your accent color.
      </p>

      <h3 className="mb-2.5 text-[12.5px] font-semibold text-white/55">Theme</h3>
      <div className="mb-6 flex gap-2">
        {(
          [
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAppearance(id)}
            aria-pressed={appearance === id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-[13px] transition-colors ${
              appearance === id
                ? "border-accent-400 bg-accent-500/20 text-accent-200"
                : "border-white/[0.08] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white/85"
            }`}
          >
            <Icon size={16} weight={appearance === id ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </div>

      <h3 className="mb-2.5 text-[12.5px] font-semibold text-white/55">Accent color</h3>
      <div className="flex flex-wrap items-center gap-2.5">
        {TONES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTone(t.id)}
            aria-label={`${t.label} accent`}
            aria-pressed={tone === t.id}
            title={t.label}
            className={`h-7 w-7 rounded-full border border-white/20 transition-transform hover:scale-110 active:scale-95 ${
              tone === t.id ? "ring-2 ring-white/90 ring-offset-2 ring-offset-ink-850" : ""
            }`}
            style={{ background: t.dot }}
          />
        ))}
        <span className="ml-1 text-[12.5px] text-white/55">{current?.label}</span>
      </div>
    </div>
  );
}

function WallpaperGrid({ items }: { items: typeof WALLPAPERS }) {
  const wallpaper = useSystem((s) => s.wallpaper);
  const setWallpaper = useSystem((s) => s.setWallpaper);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((w) => (
        <button
          key={w.id}
          onClick={() => setWallpaper(w.id)}
          aria-pressed={wallpaper === w.id}
          className={`overflow-hidden rounded-xl border-2 text-left transition-transform hover:scale-[1.02] active:scale-[0.99] ${
            wallpaper === w.id ? "border-accent-400" : "border-white/10"
          }`}
        >
          {w.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={w.image}
              alt=""
              className="block aspect-video w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span
              className="block aspect-video w-full"
              style={{
                background: `radial-gradient(90% 90% at 18% 105%, ${w.glowA}, transparent 70%), radial-gradient(80% 80% at 90% -10%, ${w.glowB}, transparent 70%), ${w.base}`,
              }}
            />
          )}
          <span className="block px-2.5 py-1.5 text-[12px] text-white/75">
            {w.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function WallpaperPane() {
  const macos = WALLPAPERS.filter((w) => w.group === "macos");
  const scenes = WALLPAPERS.filter((w) => w.group !== "macos");

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-white/90">Wallpaper</h2>
      <p className="mb-5 mt-1 text-[12.5px] text-white/50">
        Also available from the desktop: right-click and choose Change Wallpaper.
      </p>

      <h3 className="mb-2.5 text-[12.5px] font-semibold text-white/55">macOS originals</h3>
      <WallpaperGrid items={macos} />

      <h3 className="mb-2.5 mt-6 text-[12.5px] font-semibold text-white/55">Scenes</h3>
      <WallpaperGrid items={scenes} />
    </div>
  );
}

function WifiPane() {
  const wifiOn = useSystem((s) => s.wifiOn);
  const setWifi = useSystem((s) => s.setWifi);

  return (
    <div>
      <h2 className="mb-5 text-[15px] font-semibold text-white/90">Wi-Fi</h2>

      <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
        <div>
          <p className="text-[13.5px] font-medium text-white/90">Wi-Fi</p>
          <p className="text-[12px] text-white/45">
            {wifiOn ? "Connected" : "Off"}
          </p>
        </div>
        {/* macOS-style switch: green when on, like the real thing */}
        <button
          role="switch"
          aria-checked={wifiOn}
          aria-label="Toggle Wi-Fi"
          onClick={() => setWifi(!wifiOn)}
          className="h-[26px] w-[42px] rounded-full p-[2px] transition-colors duration-200"
          style={{ background: wifiOn ? "#34c759" : "rgba(255,255,255,0.2)" }}
        >
          <span
            className="block h-[22px] w-[22px] rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: wifiOn ? "translateX(16px)" : "translateX(0)" }}
          />
        </button>
      </div>

      <p className="mt-3 text-[12px] text-white/45">
        Turning Wi-Fi off disconnects the desktop until you turn it back on.
      </p>
    </div>
  );
}

function SoundsPane() {
  const sounds = useSystem(s => s.sounds);
  const setSounds = useSystem(s => s.setSounds);
  return (
    <div>
      <h2 className="text-[15px] font-semibold text-white/90">Sounds</h2>
      <p className="mb-5 mt-1 text-[12.5px] text-white/50">UI sound effects: window open, close, and the classic Mac startup chime.</p>
      <div className="space-y-3">
        <SettingRow title="Play sound effects" detail="A subtle click when windows open and close">
          <Switch on={sounds} label="Toggle sounds" onChange={setSounds} />
        </SettingRow>
      </div>
    </div>
  );
}

function NightShiftPane() {
  const nightShift = useSystem(s => s.nightShift);
  const setNightShift = useSystem(s => s.setNightShift);

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-white/90">Night Shift</h2>
      <p className="mb-5 mt-1 text-[12.5px] text-white/50">Warm the display colors. Easier on the eyes in the dark.</p>
      <div className="space-y-3">
        <SettingRow title="Color temperature" detail={`${nightShift === 0 ? "Off" : `${Math.round(nightShift * 100)}% warm`}`}>
          <input type="range" min={0} max={1} step={0.1} value={nightShift} onChange={e => setNightShift(Number(e.target.value))}
            className="w-36 accent-(--accent-btn)" aria-label="Warmth level" />
        </SettingRow>
      </div>
    </div>
  );
}

function AboutPane() {
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    setUptime(Math.floor((Date.now() - performance.timeOrigin) / 1000));
    const t = setInterval(() => setUptime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = uptime % 60;

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-white/90">About This Mac</h2>
      <div className="mt-5 space-y-3">
        <div className="flex justify-between"><span className="text-[13px] text-white/50">OS</span><span className="text-[13px] text-white/85">DiwakarOS 3.0</span></div>
        <div className="flex justify-between"><span className="text-[13px] text-white/50">Chip</span><span className="text-[13px] text-white/85">Apple M∞ · fabricated in Kathmandu</span></div>
        <div className="flex justify-between"><span className="text-[13px] text-white/50">Memory</span><span className="text-[13px] text-white/85">∞ GB unified vibes</span></div>
        <div className="flex justify-between"><span className="text-[13px] text-white/50">Built with</span><span className="text-[13px] text-white/85">Claude Code + Next.js + caffeine</span></div>
        <div className="flex justify-between"><span className="text-[13px] text-white/50">Owner</span><span className="text-[13px] text-white/85">{profile.name}</span></div>
        <div className="flex justify-between"><span className="text-[13px] text-white/50">Uptime</span><span className="text-[13px] tabular-nums text-white/85">{h}h {m}m {s}s</span></div>
        <div className="mt-4 flex gap-2 pt-3 border-t border-white/[0.08]">
          <button onClick={() => openLink("https://www.diwakaryadav.com.np/")} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] text-white/80 hover:bg-white/20">Classic Portfolio</button>
          <button onClick={() => openLink("https://diwak4r.zo.space/")} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] text-white/80 hover:bg-white/20">Zo Space</button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsApp({ paneProp }: { paneProp?: SettingsPane }) {
  const [pane, setPane] = useState<SettingsPane>(paneProp ?? "appearance");

  // openSettings("wallpaper") on an already-open window switches its pane.
  useEffect(() => {
    if (paneProp) setPane(paneProp);
  }, [paneProp]);

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      {/* Section rail: wraps into a grid of chips on narrow windows, a proper
          sidebar once there's room. */}
      <nav
        className="flex shrink-0 flex-wrap gap-1 border-b border-white/[0.06] p-2 md:w-44 md:flex-col md:flex-nowrap md:border-b-0 md:border-r md:p-3"
        aria-label="Settings sections"
      >
        {PANES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPane(id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
              pane === id
                ? "bg-accent-500/20 text-accent-200"
                : "text-white/60 hover:bg-white/[0.06] hover:text-white/85"
            }`}
            aria-current={pane === id ? "page" : undefined}
          >
            <Icon size={16} weight={pane === id ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </nav>

      <div className="os-scroll min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
        {pane === "appearance" && <Appearance />}
        {pane === "wallpaper" && <WallpaperPane />}
        {pane === "desktop" && <DesktopDockPane />}
        {pane === "sounds" && <SoundsPane />}
        {pane === "nightshift" && <NightShiftPane />}
        {pane === "about" && <AboutPane />}
        {pane === "wifi" && <WifiPane />}
      </div>
    </div>
  );
}
