"use client";

import { useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";

/**
 * A scrollable, full-page live snapshot of an external site, for the hosts
 * that forbid iframe embedding (GitHub, LinkedIn, X…). The snapshot is
 * rendered by thum.io from the real page, so the window shows the actual
 * site and scrolls through all of it; clicking anywhere opens the live one.
 */
export default function SiteSnapshot({
  url,
  title,
  fallback,
}: {
  url: string;
  title: string;
  /** Shown if the snapshot service is unreachable. */
  fallback: React.ReactNode;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const snap = `https://image.thum.io/get/width/1200/fullpage/${url}`;

  if (state === "error") return <>{fallback}</>;

  return (
    <div className="flex h-full flex-col">
      {/* Honest, quiet note: this is a snapshot, the real thing is one click away */}
      <div className="flex h-8 shrink-0 items-center justify-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-3">
        <span className="truncate text-[11.5px] text-white/45">
          Live snapshot of {title} — scroll it, click to visit the real site
        </span>
        <button
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          Open live
          <ArrowSquareOut size={11} />
        </button>
      </div>

      <div className="os-scroll relative min-h-0 flex-1 overflow-y-auto bg-[#0d1117]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={snap}
          alt={`Snapshot of ${title}`}
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          className="block w-full cursor-pointer"
        />
        {state === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-850">
            <p className="animate-pulse text-[13px] text-white/50">
              Taking a live snapshot of {title}…
            </p>
            <p className="text-[11.5px] text-white/30">first visit can take a few seconds</p>
          </div>
        )}
      </div>
    </div>
  );
}
