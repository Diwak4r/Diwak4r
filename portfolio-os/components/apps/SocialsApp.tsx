"use client";

import { ArrowSquareOut, LinkedinLogo } from "@phosphor-icons/react";
import { socials, profile } from "@/lib/content";
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

/** Every social profile for Diwakar, one tap to open inside a Browser window. */
export default function SocialsApp() {
  return (
    <div className="h-full overflow-y-auto os-scroll bg-[#161616] p-5">
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-white/90">Socials</h2>
        <p className="text-[12.5px] text-white/50">
          Tap a profile to open it inside a Browser window. Stays in the desktop.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {socials.map((s) => {
          const Glyph = ICONS[s.label] ?? GithubMark;
          const handle = s.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
          return (
            <button
              key={s.label}
              onClick={() => openLink(s.href, s.label)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.07]"
            >
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[26%] shadow-[0_6px_16px_rgba(0,0,0,0.4)]"
                style={{ background: TILES[s.label] ?? "linear-gradient(145deg, #5c5c64, #2c2c30)" }}
              >
                <Glyph className="h-6 w-6 text-white" />
              </span>
              <span className="text-[12.5px] font-medium text-white/85">{s.label}</span>
              <span className="truncate text-[10.5px] text-white/40">{handle}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-[12px] text-white/55">
        <p className="font-semibold text-white/80">Reach out</p>
        <p className="mt-0.5 truncate">{profile.email}</p>
        <p className="mt-1 text-white/40">Opens in the in-desktop Browser app — never leaves the OS.</p>
      </div>

      <button
        onClick={() => openLink("https://www.diwakaryadav.com.np/", "Diwakar Yadav")}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px] text-white/65 transition hover:bg-white/[0.06]"
      >
        Open classic portfolio
        <ArrowSquareOut size={12} />
      </button>
    </div>
  );
}
