"use client";

import { useState } from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { useSystem, WALLPAPERS } from "@/lib/system";
import { projects } from "@/lib/content";

const playlist = import("@/lib/content").then(m => m.playlist).catch(() => []);

export default function PhotosApp() {
  const [album, setAlbum] = useState<string>("wallpapers");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const setWallpaper = useSystem((s) => s.setWallpaper);

  const wallpaperImages = WALLPAPERS.filter(w => w.image).map(w => ({ src: w.image!, label: w.label, id: w.id }));
  const projectImages = projects.filter(p => p.image).map(p => ({ src: p.image!, label: p.name }));

  const items = album === "wallpapers" ? wallpaperImages : album === "projects" ? projectImages : [];

  return (
    <div className="flex h-full flex-col bg-[#1c1c1e] text-white">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 text-[12.5px] text-white/65">
        <button onClick={() => setAlbum("wallpapers")} className={`px-2 py-0.5 rounded ${album === "wallpapers" ? "bg-white/12 text-white" : "hover:bg-white/8"}`}>Wallpapers</button>
        <button onClick={() => setAlbum("covers")} className={`px-2 py-0.5 rounded ${album === "covers" ? "bg-white/12 text-white" : "hover:bg-white/8"}`}>Covers</button>
        <button onClick={() => setAlbum("projects")} className={`px-2 py-0.5 rounded ${album === "projects" ? "bg-white/12 text-white" : "hover:bg-white/8"}`}>Projects</button>
      </div>

      <div className="os-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {album === "covers" ? (
          <CoverGrid />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 @xl:grid-cols-3 @3xl:grid-cols-4">
            {items.map((img, i) => (
              <button key={i} onClick={() => setLightbox(img.src)}
                className="overflow-hidden rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.label} className="block aspect-[4/3] w-full object-cover" loading="lazy" />
                <span className="block px-2 py-1.5 text-[11.5px] text-white/65">{img.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute right-4 top-4 text-white/70 hover:text-white"><X size={20} /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain" onClick={e => e.stopPropagation()} />
          {album === "wallpapers" && (
            <button onClick={() => {
              const w = wallpaperImages.find(w => w.src === lightbox);
              if (w && "id" in w) setWallpaper(w.id as any);
              setLightbox(null);
            }} className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-xl bg-white/15 px-6 py-2.5 text-[13px] font-semibold text-white backdrop-blur-md transition hover:bg-white/25">Set as Wallpaper</button>
          )}
        </div>
      )}
    </div>
  );
}

function CoverGrid() {
  import("@/lib/content").then(m => {
    // Dynamic import for cover grid - will be populated when content loads
  });
  // Static cover list
  const covers = [
    "/images/music-covers/udi-udi.jpg",
    "/images/music-covers/sunflower.jpg",
    "/images/music-covers/after-hours.jpg",
    "/images/music-covers/reminder.jpg",
    "/images/music-covers/timeless.jpg",
    "/images/music-covers/kanhaiyya.jpg",
    "/images/music-covers/aakhri-ishq.jpg",
    "/images/music-covers/gehra-hua.jpg",
    "/images/music-covers/ishq-jalakar.jpg",
    "/images/music-covers/destiny-mann-atkeya.jpg",
    "/images/music-covers/lutt-le-gaya.jpg",
    "/images/music-covers/move-yeh-ishq-ishq.jpg",
    "/images/music-covers/bhatbhatey-ma.jpg",
    "/images/music-covers/aaahh-men.jpg",
    "/images/music-covers/sorry.jpg",
    "/images/music-covers/gata-only.jpg",
    "/images/music-covers/gata-only-remix.jpg",
    "/images/music-covers/me-and-the-devil.jpg",
    "/images/music-covers/f1.jpg",
  ];
  return (
    <div className="grid grid-cols-3 gap-2 @xl:grid-cols-4 @3xl:grid-cols-5">
      {covers.map((src, i) => (
        <div key={i} className="overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="block aspect-square w-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>
  );
}
