"use client";

import { motion } from "motion/react";
import { useSystem, WALLPAPERS } from "@/lib/system";

/**
 * The desktop wallpaper. Static like a real macOS desktop: the menu bar, dock,
 * and windows all sample it through backdrop-filter, so any per-frame motion
 * here would force the GPU to re-blur every pane of glass continuously. A
 * still wallpaper keeps the whole desktop idle at zero paint cost.
 */
export default function Wallpaper() {
  const wallpaperId = useSystem((s) => s.wallpaper);
  const scene = WALLPAPERS.find((w) => w.id === wallpaperId) ?? WALLPAPERS[0];

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-ink-950">
      {scene.image ? (
        <motion.img
          key={scene.id}
          src={scene.image}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <>
          {/* Base gradient scene */}
          <div className="absolute inset-0" style={{ background: scene.base }} />

          {/* Primary glow, lower left */}
          <div
            className="absolute -bottom-[28%] -left-[18%] h-[75vh] w-[70vw] rounded-full"
            style={{
              background: `radial-gradient(closest-side, ${scene.glowA}, transparent 72%)`,
            }}
          />

          {/* Secondary glow, upper right */}
          <div
            className="absolute -right-[15%] -top-[30%] h-[70vh] w-[60vw] rounded-full"
            style={{
              background: `radial-gradient(closest-side, ${scene.glowB}, transparent 72%)`,
            }}
          />
        </>
      )}

      {/* Vignette to seat the desktop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 58%, rgb(0 0 0 / 0.35) 100%)",
        }}
      />
    </div>
  );
}
