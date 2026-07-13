"use client";

import { motion } from "motion/react";
import { WifiSlash } from "@phosphor-icons/react";
import { useSystem } from "@/lib/system";

/** Shown when the user turns Wi-Fi off: the desktop "loses" its connection. */
export default function WifiOverlay() {
  const setWifi = useSystem((s) => s.setWifi);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-[9998] flex flex-col items-center justify-center bg-ink-950/75 backdrop-blur-xl"
      role="alert"
    >
      <WifiSlash size={56} className="text-white/70" />
      <h2 className="mt-5 text-lg font-semibold text-white/90">
        No Internet Connection
      </h2>
      <p className="mt-1.5 max-w-[320px] text-center text-[13px] leading-relaxed text-white/60">
        This desktop lost its connection. Turn Wi-Fi back on to keep exploring
        Diwakar&apos;s work.
      </p>
      <button
        onClick={() => setWifi(true)}
        className="mt-6 rounded-lg bg-(--accent-btn) px-4 py-2 text-[13px] font-semibold text-(--accent-contrast) transition hover:brightness-110 active:scale-[0.98]"
      >
        Turn Wi-Fi On
      </button>
    </motion.div>
  );
}
