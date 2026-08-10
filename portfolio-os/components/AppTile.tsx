"use client";

import { ShareNetwork, SquaresFour } from "@phosphor-icons/react";
import type { AppDef } from "@/lib/apps";

/**
 * Real macOS app icons, drawn from the Tahoe-era assets vendored in
 * public/images/icons (squircle, full-bleed, no extra gloss — the artwork
 * already carries its own depth and highlight). Apps that have no macOS
 * counterpart keep a hand-drawn face so nothing falls back to a generic
 * glyph-on-gradient tile.
 */
const PNG_ICONS: Partial<Record<AppDef["id"], string>> = {
  finder: "/images/icons/finder.png",
  browser: "/images/icons/browser.png",
  contact: "/images/icons/contact.png",
  terminal: "/images/icons/terminal.png",
  settings: "/images/icons/settings.png",
  calculator: "/images/icons/calculator.png",
  notes: "/images/icons/notes.png",
  photos: "/images/icons/photos.png",
  spotify: "/images/icons/spotify.png",
  socials: "/images/icons/messages.png",
};

export default function AppTile({ app }: { app: AppDef }) {
  const png = PNG_ICONS[app.id];
  return (
    <span className="relative block h-full w-full overflow-hidden rounded-[26%]">
      {png ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={png}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <Face id={app.id} tile={app.tile} Icon={app.icon} />
      )}
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

    case "socials":
      // Connected nodes on the indigo tile
      return (
        <span className="absolute inset-0 flex items-center justify-center" style={{ background: tile }}>
          <ShareNetwork weight="fill" className="h-[52%] w-[52%] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
        </span>
      );

    default: {
      // Gradient tile + glyph (any app without a bespoke face yet)
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
