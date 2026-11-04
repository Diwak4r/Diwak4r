"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CONSENT_OPEN,
  PRIVACY_URL,
  analyticsConfigured,
  choose,
  readChoice,
  startIfAccepted,
} from "@/lib/consent";
import { openLink } from "@/lib/system";

const ASK_DELAY_MS = 1500;

// Accept and decline share one style on purpose: neither choice is pushed.
const choiceButton =
  "flex-1 rounded-lg border border-white/25 bg-white/[0.07] px-3 py-2 text-[12.5px] font-semibold text-white/90 transition-colors hover:bg-white/[0.14]";

/** Asks once whether Google Analytics may run. Solid surface, no backdrop blur. */
export default function ConsentBanner() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!analyticsConfigured) return;
    startIfAccepted();
    const timer = readChoice() === null ? window.setTimeout(() => setOpen(true), ASK_DELAY_MS) : undefined;
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN, reopen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CONSENT_OPEN, reopen);
    };
  }, []);

  const pick = (analytics: boolean) => {
    choose(analytics);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          role="dialog"
          aria-labelledby="consent-title"
          initial={reduce ? false : { y: -12 }}
          animate={{ y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
          className="absolute inset-x-0 top-9 z-[46] mx-auto w-[min(340px,calc(100%-24px))] rounded-xl border border-white/[0.12] bg-[#1b1c20] p-4 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)]"
        >
          <h2 id="consent-title" className="text-[13px] font-semibold text-white/90">
            Analytics cookies
          </h2>
          <p className="mt-1.5 text-[12px] leading-5 text-white/60">
            May I use Google Analytics to learn how people use this site? It sets cookies and records the apps you
            open, your clicks, your device and your country. I do not use it for ads.
          </p>
          <button
            type="button"
            onClick={() => openLink(PRIVACY_URL, "Privacy")}
            className="mt-2 text-[12px] text-white/80 underline underline-offset-2 transition-colors hover:text-white"
          >
            Read the privacy note
          </button>
          <div className="mt-3 flex gap-2.5">
            <button type="button" onClick={() => pick(true)} className={choiceButton}>
              Accept analytics
            </button>
            <button type="button" onClick={() => pick(false)} className={choiceButton}>
              No thanks
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
