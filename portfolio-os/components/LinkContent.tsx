"use client";

import { useState } from "react";
import {
  ArrowSquareOut,
  GlobeSimple,
  InstagramLogo,
  LinkedinLogo,
  LockSimple,
} from "@phosphor-icons/react";
import { isEmbeddable } from "@/lib/system";
import { ChatGptMark, ClaudeMark, GithubMark, XMark, ZoMark } from "./brand/BrandMarks";

const HOST_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "github.com": GithubMark,
  "www.linkedin.com": LinkedinLogo,
  "www.instagram.com": InstagramLogo,
  "x.com": XMark,
  "chatgpt.com": ChatGptMark,
  "claude.ai": ClaudeMark,
  "diwak4r.zo.space": ZoMark,
};

const prettyUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return url;
  }
};

/** The body of an independent site window: real in-frame browsing for sites
 *  that permit embedding, a hand-off card for the ones that refuse. */
export default function LinkContent({ url, title }: { url: string; title: string }) {
  const embeddable = isEmbeddable(url);
  const [loading, setLoading] = useState(embeddable);

  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {}
  const HostIcon = HOST_ICONS[host] ?? GlobeSimple;

  return (
    <div className="flex h-full flex-col">
      {/* Slim Safari-style location bar */}
      <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-white/[0.07] px-2.5">
        <div className="mx-1 flex h-6 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-white/[0.07] px-3">
          <LockSimple size={10} weight="fill" className="shrink-0 text-white/45" />
          <span className="truncate text-[11.5px] text-white/60">{prettyUrl(url)}</span>
        </div>
        <button
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          aria-label="Open in new tab"
          className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10"
        >
          <ArrowSquareOut size={15} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        {embeddable ? (
          <>
            <iframe
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
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
            <span className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.06]">
              <HostIcon className="h-[30px] w-[30px] text-white/85" />
            </span>
            <h2 className="text-[15px] font-semibold text-white/90">{title}</h2>
            <p className="text-[12px] text-white/40">{prettyUrl(url)}</p>
            <p className="mt-2 max-w-[300px] text-[13px] leading-relaxed text-white/60">
              This site doesn&apos;t allow embedding inside another page, so it
              opens in its own tab.
            </p>
            <button
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              className="mt-4 rounded-lg bg-(--accent-btn) px-4 py-2 text-[13px] font-semibold text-(--accent-contrast) transition hover:brightness-110 active:scale-[0.98]"
            >
              Open in New Tab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
