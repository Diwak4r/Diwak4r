"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { APPS } from "@/lib/apps";
import AppTile from "./AppTile";
import { useWindows } from "@/lib/store";

export default function Launchpad() {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const openApp = useWindows(s => s.openApp);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = APPS.filter(a => q === "" || a.name.toLowerCase().includes(q));

  return (
    <div className="flex h-full flex-col bg-black/60 backdrop-blur-2xl">
      <input ref={inputRef} value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search apps"
        className="mx-auto mt-10 w-64 rounded-xl bg-white/[0.12] px-4 py-2.5 text-center text-[15px] text-white/90 outline-none placeholder:text-white/35 backdrop-blur-md" />
      <div className="os-scroll mt-8 flex-1 overflow-y-auto px-8 pb-8">
        <div className="mx-auto grid max-w-[600px] grid-cols-4 gap-6 @xl:grid-cols-5 @3xl:grid-cols-6">
          {filtered.map(app => (
            <button key={app.id} onClick={() => openApp(app.id)}
              className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-white/[0.08]">
              <span className="block h-16 w-16 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]">
                <AppTile app={app} />
              </span>
              <span className="text-[12px] font-medium text-white/85 group-hover:text-white">{app.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
