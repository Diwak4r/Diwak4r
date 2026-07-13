"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/lib/content";

/** Apple-style boot: dark screen, glyph, a single progress bar. */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
      className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-black"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/apple-logo.png" alt="" className="h-14 w-14 object-contain" />
      <div className="h-1 w-56 overflow-hidden rounded-full bg-white/15">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: reduce ? 0.2 : 1.6, ease: "easeInOut" }}
          onAnimationComplete={onDone}
          className="h-full rounded-full bg-white"
        />
      </div>
    </motion.div>
  );
}

/** macOS login screen over the blurred wallpaper: clock, avatar, one action. */
export function LoginScreen({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [now, setNow] = useState<{ time: string; date: string } | null>(null);

  useEffect(() => {
    const d = new Date();
    setNow({
      time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(d),
      date: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(d),
    });
  }, []);

  const enter = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    onDone();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      exit={{
        opacity: 0,
        scale: reduce ? 1 : 1.05,
        transition: { duration: 0.45, ease: "easeIn" },
      }}
      className="absolute inset-0 z-[90] flex flex-col items-center bg-black/30 backdrop-blur-2xl"
    >
      <div className="flex flex-col items-center pt-[12vh] text-center">
        <p className="text-[15px] font-medium text-white/70">{now?.date ?? " "}</p>
        <p className="text-6xl font-semibold tracking-tight text-white/90">
          {now?.time ?? " "}
        </p>
      </div>

      <div className="mt-auto flex flex-col items-center pb-[16vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/diwakar-portrait.jpg"
          alt={`Portrait of ${profile.name}`}
          className="h-24 w-24 rounded-full border-2 border-white/30 object-cover object-top shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        />
        <p className="mt-4 text-[17px] font-semibold text-white">{profile.name}</p>
        <p className="mt-0.5 text-[12.5px] text-white/60">{profile.role}</p>
        <button
          onClick={enter}
          className="mt-6 rounded-full bg-white/15 px-7 py-2 text-[13.5px] font-medium text-white backdrop-blur transition hover:bg-white/25 active:scale-[0.97]"
        >
          Enter Portfolio
        </button>
        <p className="mt-3 text-[12px] text-white/45">or press Enter</p>
      </div>
    </motion.div>
  );
}
