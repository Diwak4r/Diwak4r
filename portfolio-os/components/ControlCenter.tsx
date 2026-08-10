"use client";

import { motion } from "motion/react";
import { Sun, SunDim, WifiHigh, WifiSlash } from "@phosphor-icons/react";
import { TONES, openSettings, useSystem } from "@/lib/system";

/** macOS-style Control Center: quick toggles without opening full Settings. */
export default function ControlCenter({ onClose }: { onClose: () => void }) {
  const wifiOn = useSystem((s) => s.wifiOn);
  const setWifi = useSystem((s) => s.setWifi);
  const tone = useSystem((s) => s.tone);
  const setTone = useSystem((s) => s.setTone);
  const brightness = useSystem((s) => s.brightness);
  const setBrightness = useSystem((s) => s.setBrightness);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="bar-chrome absolute right-2 top-8 z-50 w-64 origin-top-right rounded-2xl border border-white/[0.12] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      role="dialog"
      aria-label="Control Center"
    >
      <button
        onClick={() => setWifi(!wifiOn)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
          wifiOn ? "bg-(--accent-btn) text-(--accent-contrast)" : "bg-white/[0.06] text-white/80"
        }`}
      >
        {wifiOn ? <WifiHigh size={18} weight="bold" /> : <WifiSlash size={18} weight="bold" />}
        <span>
          <span className="block text-[13px] font-medium">Wi-Fi</span>
          <span className="block text-[11px] opacity-70">{wifiOn ? "Connected" : "Off"}</span>
        </span>
      </button>

      <div className="mt-3 rounded-xl bg-white/[0.06] p-3">
        <p className="mb-2 text-[11.5px] font-medium text-white/55">Display</p>
        <div className="flex items-center gap-2.5">
          <SunDim size={15} weight="bold" className="shrink-0 text-white/50" />
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.01}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-white"
            aria-label="Brightness"
          />
          <Sun size={16} weight="bold" className="shrink-0 text-white/50" />
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-white/[0.06] p-3">
        <p className="mb-2 text-[11.5px] font-medium text-white/55">Accent Color</p>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              aria-label={`${t.label} accent`}
              aria-pressed={tone === t.id}
              title={t.label}
              className={`h-6 w-6 rounded-full border border-white/20 transition-transform hover:scale-110 active:scale-95 ${
                tone === t.id ? "ring-2 ring-white/90 ring-offset-2 ring-offset-ink-850" : ""
              }`}
              style={{ background: t.dot }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          openSettings("wallpaper");
          onClose();
        }}
        className="mt-3 w-full rounded-xl bg-white/[0.06] px-3 py-2 text-left text-[12.5px] text-white/75 transition-colors hover:bg-white/[0.1] hover:text-white"
      >
        Change Wallpaper&hellip;
      </button>
    </motion.div>
  );
}
