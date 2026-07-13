"use client";

import { ArrowUpRight, Broom, FolderSimple } from "@phosphor-icons/react";
import { projects } from "@/lib/content";
import { openLink } from "@/lib/system";

const rowIcons: Record<string, { icon: typeof Broom; tile: string }> = {
  "SystemCleaner Pro": {
    icon: Broom,
    tile: "linear-gradient(145deg, #5f83a3, #33506b)",
  },
  "File Organizer": {
    icon: FolderSimple,
    tile: "linear-gradient(145deg, #454c59, #23272f)",
  },
};

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
      Live
    </span>
  );
}

export default function ProjectsApp() {
  const featured = projects.find((p) => p.flagship)!;
  const cards = projects.filter((p) => !p.flagship && p.image);
  const rows = projects.filter((p) => !p.flagship && !p.image);

  return (
    <div className="@container space-y-4 p-4 @md:p-6">
      {/* Flagship */}
      <article className="overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.03]">
        {featured.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={featured.image}
            alt={`${featured.name} website`}
            className="aspect-[16/9] w-full border-b border-white/[0.07] object-cover object-top"
          />
        )}
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[16px] font-semibold tracking-tight text-white">
              {featured.name}
            </h1>
            {featured.live && <LiveBadge />}
          </div>
          <p className="max-w-prose text-[13px] leading-relaxed text-white/65">
            {featured.description}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => openLink(featured.href, featured.name)}
              className="flex items-center gap-1.5 rounded-lg bg-(--accent-btn) px-3.5 py-2 text-[13px] font-semibold text-(--accent-contrast) transition hover:brightness-110 active:scale-[0.98]"
            >
              {featured.linkLabel}
              <ArrowUpRight size={14} weight="bold" />
            </button>
            <span className="text-[11.5px] text-white/40">
              {featured.tags.slice(0, 2).join(" · ")}
            </span>
          </div>
        </div>
      </article>

      {/* Live products with screenshots */}
      <div className="grid gap-3 @xl:grid-cols-2">
        {cards.map((p) => (
          <button
            key={p.name}
            onClick={() => openLink(p.href, p.name)}
            className="group overflow-hidden rounded-xl border border-white/[0.07] text-left transition-colors hover:bg-white/[0.04]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image!}
              alt={`${p.name} website`}
              className="aspect-video w-full border-b border-white/[0.06] object-cover object-top"
            />
            <span className="block space-y-1.5 p-4">
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[14px] font-semibold text-white/90">
                  {p.name}
                  <ArrowUpRight
                    size={13}
                    weight="bold"
                    className="text-accent-300 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </span>
                {p.live && <LiveBadge />}
              </span>
              <span className="block text-[12.5px] leading-relaxed text-white/60">
                {p.description}
              </span>
              <span className="block pt-0.5 text-[11.5px] text-white/40">
                {p.tags.slice(0, 2).join(" · ")}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Utilities on GitHub */}
      <div className="grid gap-3 @xl:grid-cols-2">
        {rows.map((p) => {
          const meta = rowIcons[p.name];
          const Icon = meta?.icon ?? FolderSimple;
          return (
            <button
              key={p.name}
              onClick={() => openLink(p.href, p.name)}
              className="group flex items-start gap-3.5 rounded-xl border border-white/[0.07] p-4 text-left transition-colors hover:bg-white/[0.04]"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                style={{ background: meta?.tile }}
              >
                <Icon size={20} weight="fill" className="text-white" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-[14px] font-semibold text-white/90">
                  {p.name}
                  <ArrowUpRight
                    size={13}
                    weight="bold"
                    className="text-accent-300 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </span>
                <span className="mt-1 block text-[12.5px] leading-relaxed text-white/60">
                  {p.description}
                </span>
                <span className="mt-1.5 block text-[11.5px] text-white/40">
                  {p.tags.join(" · ")}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
