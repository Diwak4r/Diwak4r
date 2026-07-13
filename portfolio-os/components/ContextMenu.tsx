"use client";

import { motion } from "motion/react";
import { useWindows } from "@/lib/store";
import { openSettings } from "@/lib/system";

export interface MenuPosition {
  x: number;
  y: number;
}

/** Right-click menu for the desktop surface, mac-style. */
export default function ContextMenu({
  pos,
  onClose,
  onTidy,
}: {
  pos: MenuPosition;
  onClose: () => void;
  onTidy: () => void;
}) {
  const openApp = useWindows((s) => s.openApp);

  const items: { label: string; action: () => void; divider?: boolean }[] = [
    { label: "About This Portfolio", action: () => openApp("about") },
    { label: "Change Wallpaper", action: () => openSettings("wallpaper") },
    { label: "Change Accent Color", action: () => openSettings("appearance") },
    { label: "Tidy Up Icons", action: onTidy },
    { label: "Open Terminal Here", action: () => openApp("terminal"), divider: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      style={{ left: pos.x, top: pos.y }}
      className="bar-chrome absolute z-[9999] w-52 origin-top-left rounded-lg border border-white/[0.12] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      role="menu"
    >
      {items.map((item) => (
        <button
          key={item.label}
          role="menuitem"
          onClick={() => {
            item.action();
            onClose();
          }}
          className={`block w-full rounded-md px-2.5 py-1.5 text-left text-[13px] text-white/85 transition-colors hover:bg-(--accent-btn) hover:text-(--accent-contrast) ${
            item.divider ? "mt-1 border-t border-white/[0.08] pt-2" : ""
          }`}
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}
