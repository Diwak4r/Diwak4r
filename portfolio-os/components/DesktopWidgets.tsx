"use client";

import { useEffect, useState } from "react";
import { playlist } from "@/lib/content";
import { useWindows } from "@/lib/store";

/**
 * Desktop widgets: ambient cards pinned to the top-right of the desktop,
 * below the menu bar — the same place real macOS stacks Notification Center
 * widgets. Each is self-contained (no new store). Rollback-safe: this file
 * plus one render call in Desktop.tsx is the whole surface.
 *
 * Both widgets are static: nothing animates over the wallpaper (see perf
 * constraints). They copy the macOS 27 widget look: Liquid Glass material,
 * 22px corners, no label row.
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
      <p className="text-[11px] font-bold uppercase tracking-[0.02em] text-[#ff453a]">
        {MONTHS[month]}
      </p>

      <div className="mt-1.5 grid grid-cols-7 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-[9px] font-semibold text-white/45">
            {d}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-[2px] text-center">
        {cells.map((d, i) => {
          const isToday = d === today;
          return (
            <span key={i} className="flex justify-center">
              <span
                className={`flex h-[17px] w-[17px] items-center justify-center rounded-full text-[10px] font-medium tabular-nums ${
                  isToday ? "bg-[#ff453a] font-semibold text-white" : "text-white/90"
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


  const cover = playlist.find((t) => t.title === track?.title)?.cover;

  return (
    <WidgetShell label="Now Playing">
      <button
        onClick={() => openApp("spotify")}
        className="pointer-events-auto flex w-full items-center gap-2.5 rounded-lg text-left outline-offset-4"
        aria-label={track ? `Open Spotify, last played ${track.title}` : "Open Spotify"}
      >
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cover}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-lg object-cover shadow-[0_1px_3px_rgb(0_0_0/0.35)]"
            draggable={false}
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-end justify-center gap-[2px] rounded-lg bg-white/[0.08] p-2.5" aria-hidden>
            {[0.42, 0.66, 0.3].map((h, i) => (
              <span key={i} className="w-[3px] rounded-full bg-white/50" style={{ height: `${h * 100}%` }} />
            ))}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold text-white/95">
            {track?.title ?? "Nothing playing"}
          </span>
          <span className="block truncate text-[11px] text-white/55">
            {track ? track.artist : "Open Spotify to play"}
          </span>
        </span>
      </button>
    </WidgetShell>
  );
}

/** Shared glass shell. Matches the dock/menu-bar treatment:
 *  ink surface at low opacity + capped blur + self-colored edge. */
function WidgetShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section aria-label={label} className="widget-chrome w-[172px] rounded-[22px] p-3.5">
      {children}
    </section>
  );
}

/** The widget column. Pinned to the top-right of the desktop, a touch further
 *  in from the edge and below the menu bar — reads as a deliberate column, not
 *  a floating card. The column itself ignores input; interactive children opt
 *  back in so Now Playing can launch Spotify without blocking desktop drag. */
export default function DesktopWidgets({ right }: { right: number }) {
  return (
    <div
      className="pointer-events-none absolute top-4 z-[6] flex flex-col gap-3"
      style={{ right }}
    >
      <CalendarWidget />
      <NowPlayingWidget />
    </div>
  );
}
