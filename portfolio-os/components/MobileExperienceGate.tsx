"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Copy, Desktop, DeviceMobile, Check } from "@phosphor-icons/react";

const DISMISSED_KEY = "dios-mobile-guide-dismissed";

export function wasMobileGuideDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export default function MobileExperienceGate({ onContinue }: { onContinue: () => void }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be blocked in private contexts. The visible URL
      // remains available in the browser address bar as a reliable fallback.
    }
  };

  const continueMobile = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // The experience still works when browser storage is unavailable.
    }
    onContinue();
  };

  return (
    <motion.section
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-experience-title"
      aria-describedby="mobile-experience-description"
      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[150] flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-[#090a0d] px-5 py-8 text-white"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-[-12%] h-72 w-72 rounded-full bg-[#247bff]/20 blur-3xl" />
        <div className="absolute -right-20 bottom-[-10%] h-80 w-80 rounded-full bg-[#8a5cff]/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm text-center">
        <div className="mx-auto flex h-24 w-32 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <Desktop size={58} weight="duotone" className="text-white/90" aria-hidden />
          <DeviceMobile
            size={28}
            weight="fill"
            className="-mb-9 -ml-3 rounded-md bg-[#14151a] p-1 text-[#67a8ff] shadow-xl"
            aria-hidden
          />
        </div>

        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
          DiwakarOS
        </p>
        <h1 id="mobile-experience-title" className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.035em]">
          Built for a bigger screen.
        </h1>
        <p id="mobile-experience-description" className="mx-auto mt-4 max-w-[34ch] text-[14px] leading-6 text-white/58">
          The full Mac-like experience unlocks resizable windows, the Dock, keyboard shortcuts, desktop files, and more on a laptop or desktop.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2" aria-label="Desktop-only highlights">
          {[
            ["19", "apps"],
            ["Multi", "window"],
            ["⌘ K", "Spotlight"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-2 py-3">
              <span className="block text-[15px] font-semibold text-white/90">{value}</span>
              <span className="mt-0.5 block text-[10px] text-white/40">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={continueMobile}
          className="mt-7 w-full rounded-xl bg-white px-4 py-3 text-[14px] font-semibold text-[#101116] transition active:scale-[0.98]"
        >
          Continue on mobile
        </button>
        <button
          onClick={copyLink}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[13px] font-medium text-white/75 transition hover:bg-white/[0.1] active:scale-[0.98]"
        >
          {copied ? <Check size={16} weight="bold" aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied ? "Link copied" : "Copy link for desktop"}
        </button>
        <p className="mt-4 text-[11px] leading-4 text-white/35">
          Mobile mode is still fully usable, with a touch-friendly app launcher.
        </p>
      </div>
    </motion.section>
  );
}
