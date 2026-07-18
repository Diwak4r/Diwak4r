"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/content";

/**
 * Desktop widgets: always-visible, ambient cards that make the desktop feel
 * lived-in instead of sparse. Each is self-contained and reads only from
 * things that already exist (no new store). Rollback-safe: this whole file
 * + one render call in Desktop.tsx is the entire surface area.
 *
 * Kept deliberately static (no entrance animation, no opacity-0) per the
 * "content visible by default" rule, and because the wallpaper must stay
 * static under the backdrop-filter glass (see portfolio-os-performance note).
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Compact calendar with today highlighted in the accent color. */
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
  // Date of the 1st: 0=Sun..6=Sat
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
        <p className="text-[11px] tabular-nums text-white/40">{today}</p>
      </div>
      <div className="mt-2.5 grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-[9px] font-medium text-white/30">{d}</span>
        ))}
        {cells.map((d, i) => {
          const isToday = d === today;
          return (
            <span
              key={i}
              className={`text-[10px] tabular-nums leading-5 ${
                isToday
                  ? "rounded-full bg-(--accent-btn) font-semibold text-(--accent-contrast)"
                  : d
                  ? "text-white/70"
                  : ""
              }`}
            >
              {d ?? ""}
            </span>
          );
        })}
      </div>
    </WidgetShell>
  );
}

/** "Now Playing" card. Reads the same localStorage key SpotifyApp writes its
 *  last-played track to, so it reflects whatever the user actually listened to.
 *  Falls back to a profile tagline when nothing has played yet. */
const SPOTIFY_KEY = "dios-spotify-last";
type LastTrack = { title: string; artist: string } | null;

function NowPlayingWidget() {
  const [track, setTrack] = useState<LastTrack>(null);

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

  return (
    <WidgetShell label="Now Playing">
      <div className="flex items-center gap-2.5">
        {/* Equalizer bars — static when nothing's playing so there's no
            always-running animation under the glass chrome (perf note). */}
        <div className="flex h-8 w-8 shrink-0 items-end justify-center gap-[2px] rounded-md bg-(--accent-btn)/15">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-(--accent-btn)"
              style={{ height: track ? [10, 16, 7][i] : 6 }}
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
      </div>
    </WidgetShell>
  );
}

/** Shared glass shell. Matches the dock/menu-bar treatment:
 *  ink surface at low opacity + capped blur + self-colored edge. */
function WidgetShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-[200px] rounded-xl border border-white/[0.06] bg-ink-900/55 px-3.5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-white/30">
        {label}
      </p>
      {children}
    </div>
  );
}

/** The widget stack. Fixed to the top-right of the desktop, below the menu bar.
 *  pointer-events-none on the wrapper so it never blocks desktop drag/select;
 *  the widgets themselves are non-interactive (pure ambient display). */
export default function DesktopWidgets() {
  return (
    <div className="pointer-events-none absolute right-4 top-10 z-[6] flex flex-col gap-2.5">
      <CalendarWidget />
      <NowPlayingWidget />
    </div>
  );
}
