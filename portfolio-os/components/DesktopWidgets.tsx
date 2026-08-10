"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/content";
import { useWindows } from "@/lib/store";

/**
 * Desktop widgets: ambient cards pinned to the top-right of the desktop,
 * below the menu bar — the same place real macOS stacks Notification Center
 * widgets. Each is self-contained (no new store). Rollback-safe: this file
 * plus one render call in Desktop.tsx is the whole surface.
 *
 * The calendar/now-playing are static except for ONE cheap, GPU-composited
 * equalizer animation that only runs while a track is actually playing —
 * nothing animates over the wallpaper otherwise (see perf constraints).
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Calendar widget with a real-macOS red weekday header and red today dot. */
function CalendarWidget() {
  const [now, setNow] = useState<Date | null>(null);

  // Tick once a minute; mounted client-side only so no hydration drift.
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!now) return <WidgetShell label="Calendar">{null}</WidgetShell>;

  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <WidgetShell label="Calendar">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-semibold text-white/90">
          {MONTHS[month]} <span className="text-white/40">{year}</span>
        </p>
      </div>

      {/* Weekday header: the signature macOS red row */}
      <div className="mt-2 grid grid-cols-7 rounded-md bg-(--accent-btn)/90 py-[3px] text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-[8.5px] font-semibold text-(--accent-contrast)">
            {d}
          </span>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-y-[3px] text-center">
        {cells.map((d, i) => {
          const isToday = d === today;
          return (
            <span key={i} className="flex justify-center">
              <span
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] tabular-nums ${
                  isToday
                    ? "bg-(--accent-btn) font-semibold text-(--accent-contrast)"
                    : d
                    ? "text-white/70"
                    : ""
                }`}
              >
                {d ?? ""}
              </span>
            </span>
          );
        })}
      </div>
    </WidgetShell>
  );
}

/** "Now Playing" card with a live equalizer that only animates while playing. */
const SPOTIFY_KEY = "dios-spotify-last";
type LastTrack = { title: string; artist: string } | null;

function NowPlayingWidget() {
  const [track, setTrack] = useState<LastTrack>(null);
  const openApp = useWindows((s) => s.openApp);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(SPOTIFY_KEY);
        if (raw) setTrack(JSON.parse(raw));
      } catch {
        /* localStorage may be unavailable; widget just shows the fallback */
      }
    };
    read();
    // Cross-tab sync: if a track changes in the Spotify app, update here.
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  const playing = track !== null;

  return (
    <WidgetShell label="Now Playing">
      <button
        onClick={() => openApp("spotify")}
        className="pointer-events-auto flex w-full items-center gap-2.5 rounded-md text-left outline-offset-4 transition active:scale-[0.98]"
        aria-label="Open Spotify"
      >
        {/* Equalizer bars. They animate ONLY while a track is playing —
            transform/scaleY on the compositor, so no blur repaint under glass. */}
        <div className="flex h-8 w-8 shrink-0 items-end justify-center gap-[2px] rounded-md bg-(--accent-btn)/15 p-[5px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-[3px] origin-bottom rounded-full bg-(--accent-btn) ${
                playing ? "eq-bar" : ""
              }`}
              style={{
                height: "100%",
                animationDelay: playing ? `${i * 0.18}s` : undefined,
                transform: playing ? undefined : `scaleY(${[0.42, 0.66, 0.3][i]})`,
              }}
            />
          ))}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-medium text-white/90">
            {track?.title ?? profile.role}
          </p>
          <p className="truncate text-[11px] text-white/45">
            {track ? track.artist : "Open Spotify to play"}
          </p>
        </div>
      </button>
    </WidgetShell>
  );
}

/** Shared glass shell. Matches the dock/menu-bar treatment:
 *  ink surface at low opacity + capped blur + self-colored edge. */
function WidgetShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-[208px] rounded-xl border border-white/[0.06] bg-ink-900/55 px-3.5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-white/30">
        {label}
      </p>
      {children}
    </div>
  );
}

/** The widget column. Pinned to the top-right of the desktop, a touch further
 *  in from the edge and below the menu bar — reads as a deliberate column, not
 *  a floating card. The column itself ignores input; interactive children opt
 *  back in so Now Playing can launch Spotify without blocking desktop drag. */
export default function DesktopWidgets() {
  return (
    <div className="pointer-events-none absolute right-6 top-6 z-[6] flex flex-col gap-3">
      <CalendarWidget />
      <NowPlayingWidget />
    </div>
  );
}
