"use client";

import { ArrowSquareOut, LinkedinLogo } from "@phosphor-icons/react";
import { socials } from "@/lib/content";
import { openLink } from "@/lib/system";
import { GithubMark, InstagramMark, XMark } from "@/components/brand/BrandMarks";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  GitHub: GithubMark,
  LinkedIn: LinkedinLogo,
  X: XMark,
  Instagram: InstagramMark,
};

const TILES: Record<string, string> = {
  GitHub: "linear-gradient(145deg, #3a3f47, #101215)",
  LinkedIn: "linear-gradient(145deg, #4da3ff, #0a66c2)",
  X: "linear-gradient(145deg, #3a3a3c, #0a0a0b)",
  Instagram: "linear-gradient(145deg, #f6a35a, #c231a8 55%, #5a4fd6)",
};

/** All of Diwakar's social profiles in one place, one tap to visit each. */
export default function SocialsApp() {
  return (
    <div className="h-full overflow-y-auto os-scroll bg-[#161616] p-5">
      <h2 className="mb-1 text-[16px] font-semibold text-white/90">Socials</h2>
      <p className="mb-5 text-[12.5px] text-white/50">
        Every profile, one tap away &mdash; opens in the Browser app.
      </p>

      <div className="flex flex-col gap-2.5">
        {socials.map((s) => {
          const Glyph = ICONS[s.label] ?? GithubMark;
          const handle = s.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
          return (
            <button
              key={s.label}
              onClick={() => openLink(s.href)}
              className="group flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.06]"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[26%] shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                style={{ background: TILES[s.label] ?? "linear-gradient(145deg, #5c5c64, #2c2c30)" }}
              >
                <Glyph className="h-5 w-5 text-white" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium text-white/90">{s.label}</span>
                <span className="block truncate text-[11.5px] text-white/45">{handle}</span>
              </span>
              <ArrowSquareOut
                size={16}
                className="shrink-0 text-white/30 transition group-hover:text-white/70"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
