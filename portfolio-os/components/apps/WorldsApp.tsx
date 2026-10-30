"use client";

import { useEffect, useState } from "react";
import { ArrowSquareOut, CaretLeft } from "@phosphor-icons/react";
import { worlds, type World } from "@/lib/content";

/** The 3D worlds from the classic site, explorable right inside a window. */
export default function WorldsApp({ worldId, request }: { worldId?: string; request?: number }) {
  const [current, setCurrent] = useState<World | null>(
    () => worlds.find((w) => w.id === worldId) ?? null
  );

  // Opening a specific world from Projects reuses this window. `request`
  // changes on every open, so the same world reopens after "All worlds".
  useEffect(() => {
    const w = worlds.find((x) => x.id === worldId);
    if (w) setCurrent(w);
  }, [worldId, request]);

  if (current) return <WorldView world={current} onBack={() => setCurrent(null)} />;

  return (
    <div className="@container p-5 @md:p-6">
      <p className="max-w-prose text-[13.5px] leading-relaxed text-white/65">
        Small worlds I build when a new AI model drops, to see what it can really do.
        Each one is a single web page. Pick one and step inside.
      </p>

      <div className="mt-5 grid gap-4 @xl:grid-cols-2">
        {worlds.map((w) => (
          <button
            key={w.id}
            onClick={() => setCurrent(w)}
            className="group overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] text-left transition-colors hover:border-white/[0.16] hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-btn)"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={w.image}
              alt={`${w.name}, a 3D world`}
              width={640}
              height={400}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover"
              draggable={false}
            />
            <span className="block p-4">
              <span className="block text-[15px] font-semibold tracking-tight text-white/90">
                {w.name}
              </span>
              <span className="mt-1 block text-[12.5px] leading-relaxed text-white/60">
                {w.description}
              </span>
              <span className="mt-2 block text-[11.5px] text-white/40">{w.tags.join(" · ")}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorldView({ world, onBack }: { world: World; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => setLoading(true), [world.id]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.07] px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CaretLeft size={13} weight="bold" />
          All worlds
        </button>
        <span className="min-w-0 flex-1 truncate text-center text-[12.5px] font-medium text-white/80">
          {world.name}
        </span>
        <button
          onClick={() => window.open(world.href, "_blank", "noopener,noreferrer")}
          aria-label={`Open ${world.name} in a new tab`}
          className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowSquareOut size={15} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 bg-black">
        <iframe
          key={world.id}
          src={world.src}
          title={world.name}
          onLoad={() => setLoading(false)}
          sandbox={world.sandbox}
          allow="pointer-lock; fullscreen; autoplay; gamepad; focus-without-user-activation 'none'"
          allowFullScreen
          className="h-full w-full border-0"
        />
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black">
            <p className="text-[13px] text-white/50">Loading {world.name}…</p>
          </div>
        )}
      </div>
    </div>
  );
}
