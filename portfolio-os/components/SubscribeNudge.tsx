"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useWindows } from "@/lib/store";
import { CONSENT_CHANGED, isPending } from "@/lib/consent";
import { markSaved, shouldAsk } from "@/lib/subscribe";

const DELAY_MS = 45_000;

/** A notification banner under the menu bar, like a macOS alert. Solid surface,
 *  no backdrop blur, so it adds no cost over the static wallpaper. */
export default function SubscribeNudge() {
  const reduce = useReducedMotion();
  const openApp = useWindows((s) => s.openApp);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldAsk()) return;
    // One question at a time: wait until the analytics choice is made.
    const show = () => setVisible(true);
    let stopWaiting: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      if (!isPending()) return show();
      window.addEventListener(CONSENT_CHANGED, show, { once: true });
      stopWaiting = () => window.removeEventListener(CONSENT_CHANGED, show);
    }, DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      stopWaiting?.();
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    markSaved("dismissed");
  };

  const subscribe = () => {
    dismiss();
    openApp("newsletter");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={reduce ? false : { y: -12 }}
          animate={{ y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
          className="absolute inset-x-0 top-9 z-[45] mx-auto w-[320px] rounded-xl border border-white/[0.12] bg-[#1b1c20] p-4 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)]"
          aria-label="Newsletter"
        >
          <p className="text-[13px] font-semibold text-white/90">New posts by email</p>
          <p className="mt-1.5 text-[12px] leading-5 text-white/60">
            Diwakar writes about testing new AI models by building with them. Get each new post in your inbox.
          </p>
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={subscribe}
              className="rounded-lg bg-(--accent-btn) px-3.5 py-1.5 text-[12.5px] font-semibold text-(--accent-contrast) transition hover:brightness-110"
            >
              Subscribe
            </button>
            <button onClick={dismiss} className="text-[12.5px] text-white/60 transition hover:text-white">
              Not now
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
