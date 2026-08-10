"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Command, Sparkle, X } from "@phosphor-icons/react";
import { useWindows } from "@/lib/store";

const SEEN_KEY = "dios-experience-coach-seen";

export default function ExperienceCoach() {
  const reduce = useReducedMotion();
  const openApp = useWindows((s) => s.openApp);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      // Show the coach when storage is unavailable rather than hiding guidance.
    }
    const timer = window.setTimeout(() => setVisible(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Dismiss still works for the current mount.
    }
  };

  const explore = () => {
    dismiss();
    openApp("terminal");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 28 }}
          className="bar-chrome absolute bottom-28 left-5 z-[45] w-[310px] rounded-2xl border border-white/[0.12] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.52)]"
          aria-label="DiwakarOS quick tour"
        >
          <button
            onClick={dismiss}
            aria-label="Dismiss quick tour"
            className="absolute right-3 top-3 rounded-md p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <X size={14} aria-hidden />
          </button>

          <div className="flex items-center gap-2 text-white/90">
            <Sparkle size={17} weight="fill" className="text-accent-300" aria-hidden />
            <p className="text-[13px] font-semibold">This desktop is alive.</p>
          </div>
          <p className="mt-2 pr-5 text-[12px] leading-5 text-white/52">
            Drag windows, right-click the desktop, change the wallpaper, or press
            <span className="mx-1 inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.07] px-1.5 py-0.5 text-white/75">
              <Command size={11} weight="bold" aria-hidden /> K
            </span>
            to launch anything.
          </p>
          <button
            onClick={explore}
            className="mt-3 w-full rounded-lg bg-(--accent-btn) px-3 py-2 text-[12.5px] font-semibold text-(--accent-contrast) transition active:scale-[0.98]"
          >
            Try the hidden Terminal
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
