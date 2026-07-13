"use client";

import {
  Divide,
  EnvelopeSimple,
  GearSix,
  Minus,
  Plus,
  ShareNetwork,
  SquaresFour,
  X,
} from "@phosphor-icons/react";
import type { AppDef } from "@/lib/apps";
import { SpotifyMark } from "./brand/BrandMarks";

/**
 * macOS-style app icon artwork. Squircle shape, soft top gloss, and
 * recognizable per-app faces modeled on their real macOS counterparts
 * (drawn from scratch, not Apple's assets). Scales with its container.
 */
export default function AppTile({ app }: { app: AppDef }) {
  return (
    <span className="relative block h-full w-full overflow-hidden rounded-[26%]">
      <Face id={app.id} tile={app.tile} Icon={app.icon} />
      {/* Soft gloss + seat shadow shared by every icon */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[26%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 46%, rgba(0,0,0,0.04) 54%, rgba(0,0,0,0.14))",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.25)",
        }}
      />
    </span>
  );
}

function Face({
  id,
  tile,
  Icon,
}: {
  id: AppDef["id"];
  tile: string;
  Icon: AppDef["icon"];
}) {
  switch (id) {
    case "about":
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/images/diwakar-portrait.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
          draggable={false}
        />
      );

    case "notes":
      // Notes: white pad with a yellow header strip and faint rule lines
      return (
        <span
          className="absolute inset-0 flex flex-col"
          style={{ background: "linear-gradient(180deg, #fdfdfd, #ececf0)" }}
        >
          <span
            className="h-[27%] w-full"
            style={{ background: "linear-gradient(180deg, #ffd339, #f8b500)" }}
          />
          <span className="flex flex-1 flex-col justify-center gap-[9%] px-[16%]">
            <span className="h-[5%] min-h-px w-full rounded-full bg-[#c9c9d0]" />
            <span className="h-[5%] min-h-px w-full rounded-full bg-[#c9c9d0]" />
            <span className="h-[5%] min-h-px w-[62%] rounded-full bg-[#c9c9d0]" />
          </span>
        </span>
      );

    case "contact":
      // Mail: white envelope on the signature blue
      return (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(180deg, #1f8cf5, #0b5ed9)" }}
        >
          <EnvelopeSimple
            weight="fill"
            className="h-[54%] w-[54%] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
          />
        </span>
      );

    case "browser":
      // Safari: silver squircle, blue dial, red-and-white needle
      return (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(180deg, #f4f7fb, #cfd8e4)" }}
        >
          <svg viewBox="0 0 48 48" className="h-[82%] w-[82%]" aria-hidden>
            <defs>
              <radialGradient id="dial" cx="0.5" cy="0.35" r="0.75">
                <stop offset="0" stopColor="#3aa0ff" />
                <stop offset="1" stopColor="#0b5cc9" />
              </radialGradient>
            </defs>
            <circle cx="24" cy="24" r="21" fill="url(#dial)" />
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x="23.5"
                y="4.5"
                width="1"
                height="3.5"
                rx="0.5"
                fill="rgba(255,255,255,0.85)"
                transform={`rotate(${i * 30} 24 24)`}
              />
            ))}
            <g transform="rotate(45 24 24)">
              <polygon points="24,7 28.5,24 19.5,24" fill="#ff3b30" />
              <polygon points="19.5,24 28.5,24 24,41" fill="#f5f5f7" />
            </g>
          </svg>
        </span>
      );

    case "terminal":
      // Terminal: near-black screen with the prompt in the top corner
      return (
        <span
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #3c414c, #15171c 30%)" }}
        >
          <span className="absolute left-[14%] top-[12%] font-mono text-[0.55em] font-bold leading-none text-white">
            &gt;_
          </span>
        </span>
      );

    case "projects":
      // A bento grid of mismatched tiles, like a Launchpad shelf of little apps
      return (
        <span
          className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[8%] p-[16%]"
          style={{ background: tile }}
        >
          <span className="rounded-[22%] bg-white/95" />
          <span className="rounded-[22%] bg-white/55" />
          <span className="rounded-[22%] bg-white/55" />
          <span className="rounded-[22%] bg-white/95" />
        </span>
      );

    case "journal":
      // A closed notebook cover with a bookmark ribbon
      return (
        <span className="absolute inset-0" style={{ background: tile }}>
          <span
            className="absolute inset-y-0 left-0 w-[86%] rounded-r-[8%]"
            style={{ background: "linear-gradient(180deg, #fbf3df, #efe0b8)" }}
          />
          <span className="absolute left-[18%] top-0 h-[62%] w-[10%] bg-[#c0392b]" />
          <span className="absolute left-[34%] top-[30%] h-[4%] w-[38%] rounded-full bg-[#c9b98a]" />
          <span className="absolute left-[34%] top-[42%] h-[4%] w-[30%] rounded-full bg-[#c9b98a]" />
        </span>
      );

    case "calculator":
      // Dark screen strip over a grid of buttons, its own layout (not Apple's)
      return (
        <span className="absolute inset-0 flex flex-col p-[10%]" style={{ background: tile }}>
          <span className="mb-[8%] flex h-[22%] items-center justify-end rounded-[14%] bg-black/60 px-[8%] font-mono text-[0.5em] text-[#8affc1]">
            42
          </span>
          <span className="grid flex-1 grid-cols-2 gap-[8%]">
            <span className="flex items-center justify-center rounded-[16%] bg-white/15 text-white/85">
              <Plus weight="bold" className="h-[45%] w-[45%]" />
            </span>
            <span className="flex items-center justify-center rounded-[16%] bg-white/15 text-white/85">
              <Minus weight="bold" className="h-[45%] w-[45%]" />
            </span>
            <span className="flex items-center justify-center rounded-[16%] bg-[#ff9f0a]">
              <X weight="bold" className="h-[45%] w-[45%] text-white" />
            </span>
            <span className="flex items-center justify-center rounded-[16%] bg-[#ff9f0a]">
              <Divide weight="bold" className="h-[45%] w-[45%] text-white" />
            </span>
          </span>
        </span>
      );

    case "spotify":
      // The real Spotify mark: green glyph on the near-black tile
      return (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(180deg, #232323, #121212)" }}
        >
          <SpotifyMark className="h-[68%] w-[68%] text-[#1ed760]" />
        </span>
      );

    case "socials":
      // Connected nodes on the indigo tile
      return (
        <span className="absolute inset-0 flex items-center justify-center" style={{ background: tile }}>
          <ShareNetwork weight="fill" className="h-[52%] w-[52%] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
        </span>
      );

    case "craft":
      // Stacked isometric voxel blocks — an original motif, not Minecraft's textures
      return (
        <span className="absolute inset-0 flex items-center justify-center" style={{ background: tile }}>
          <svg viewBox="0 0 48 48" className="h-[70%] w-[70%]" aria-hidden>
            <g>
              <polygon points="24,4 42,14 24,24 6,14" fill="#bdeb8f" />
              <polygon points="6,14 24,24 24,44 6,34" fill="#5a9c3f" />
              <polygon points="42,14 24,24 24,44 42,34" fill="#3d7a2a" />
            </g>
          </svg>
        </span>
      );

    case "settings":
      // System Settings: a dark gear on brushed silver
      return (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(180deg, #dcdce2, #86868f)" }}
        >
          <GearSix
            weight="fill"
            className="h-[62%] w-[62%] text-[#43434b] drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]"
          />
        </span>
      );

    default: {
      // Gradient tile + glyph (Projects and any future app)
      const Glyph = Icon ?? SquaresFour;
      return (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: tile }}
        >
          <Glyph
            weight="fill"
            className="h-[52%] w-[52%] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
          />
        </span>
      );
    }
  }
}
