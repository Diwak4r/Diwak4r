"use client";

import { useEffect, useState } from "react";
import {
  ArrowSquareOut,
  Article,
  CaretLeft,
  Cpu,
  GithubLogo,
  GraduationCap,
  House,
  InstagramLogo,
  LinkedinLogo,
  LockSimple,
  Waveform,
  XLogo,
  type Icon,
} from "@phosphor-icons/react";
import { isEmbeddable } from "@/lib/system";

interface Bookmark {
  label: string;
  url: string;
  icon: Icon;
}

const FAVORITES: Bookmark[] = [
  { label: "Classic Portfolio", url: "https://www.diwakaryadav.com.np/", icon: House },
  { label: "Blog", url: "https://www.diwakaryadav.com.np/blog/", icon: Article },
  { label: "Police Exam Prep", url: "https://project.diwakaryadav.com.np/", icon: GraduationCap },
  { label: "Nepal AI Gateway", url: "https://ai.diwakaryadav.com.np/", icon: Cpu },
  { label: "Pryzmira", url: "https://pryzmira.diwakaryadav.com.np/", icon: Waveform },
  { label: "GitHub", url: "https://github.com/Diwak4r", icon: GithubLogo },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/diwak4r/", icon: LinkedinLogo },
  { label: "X", url: "https://x.com/Norwakar", icon: XLogo },
  { label: "Instagram", url: "https://www.instagram.com/diwak4r/", icon: InstagramLogo },
];

const prettyUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return url;
  }
};

function StartPage({ onOpen }: { onOpen: (url: string) => void }) {
  return (
    <div className="@container os-scroll h-full overflow-y-auto p-6">
      <h2 className="mb-3 text-[13px] font-semibold text-white/55">Favorites</h2>
      <div className="grid grid-cols-3 gap-3 @lg:grid-cols-4 @2xl:grid-cols-5">
        {FAVORITES.map((b) => (
          <button
            key={b.label}
            onClick={() => onOpen(b.url)}
            className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-white/[0.06]"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.06] transition-transform group-hover:scale-[1.04] group-active:scale-[0.97]">
              <b.icon size={26} weight="fill" className="text-white/85" />
            </span>
            <span className="text-[12px] text-white/70">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ExternalCard({ url }: { url: string }) {
  const bookmark = FAVORITES.find((b) => b.url === url);
  const Icon = bookmark?.icon ?? ArrowSquareOut;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
      <span className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.06]">
        <Icon size={30} weight="fill" className="text-white/85" />
      </span>
      <h2 className="text-[15px] font-semibold text-white/90">
        {bookmark?.label ?? prettyUrl(url)}
      </h2>
      <p className="text-[12px] text-white/40">{prettyUrl(url)}</p>
      <p className="mt-2 max-w-[300px] text-[13px] leading-relaxed text-white/60">
        This site doesn&apos;t allow embedding inside another page, so it opens
        in its own tab.
      </p>
      <button
        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        className="mt-4 rounded-lg bg-(--accent-btn) px-4 py-2 text-[13px] font-semibold text-(--accent-contrast) transition hover:brightness-110 active:scale-[0.98]"
      >
        Open in New Tab
      </button>
    </div>
  );
}

/** Safari-style browser window: favorites, and real in-frame browsing for
 *  Diwakar's own sites (the ones whose headers permit embedding).
 *  Each window keeps its own page, so two Browsers browse independently. */
export default function BrowserApp({ startUrl }: { startUrl?: string }) {
  const [url, setBrowserUrl] = useState<string | null>(startUrl ?? null);
  const [loading, setLoading] = useState(false);

  // A later openApp("browser", { url }) retargets this window.
  useEffect(() => {
    if (startUrl) {
      setLoading(isEmbeddable(startUrl));
      setBrowserUrl(startUrl);
    }
  }, [startUrl]);

  const open = (next: string) => {
    setLoading(isEmbeddable(next));
    setBrowserUrl(next);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-white/[0.07] px-2.5">
        <button
          onClick={() => setBrowserUrl(null)}
          disabled={!url}
          aria-label="Back to start page"
          className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <button
          onClick={() => setBrowserUrl(null)}
          aria-label="Start page"
          className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10"
        >
          <House size={16} weight="fill" />
        </button>

        <div className="mx-1 flex h-7 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.07] px-3">
          {url && <LockSimple size={11} weight="fill" className="shrink-0 text-white/45" />}
          <span className="truncate text-[12px] text-white/60">
            {url ? prettyUrl(url) : "Start Page"}
          </span>
        </div>

        <button
          onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
          disabled={!url}
          aria-label="Open in new tab"
          className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          <ArrowSquareOut size={16} />
        </button>
      </div>

      {/* Page area */}
      <div className="relative min-h-0 flex-1">
        {url === null ? (
          <StartPage onOpen={open} />
        ) : isEmbeddable(url) ? (
          <>
            <iframe
              key={url}
              src={url}
              title={`Browsing ${prettyUrl(url)}`}
              onLoad={() => setLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="h-full w-full border-0 bg-white"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-850">
                <p className="animate-pulse text-[13px] text-white/50">
                  Loading {prettyUrl(url)}
                </p>
              </div>
            )}
          </>
        ) : (
          <ExternalCard url={url} />
        )}
      </div>
    </div>
  );
}
