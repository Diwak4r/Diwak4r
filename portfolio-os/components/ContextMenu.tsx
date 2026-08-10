"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CaretRight } from "@phosphor-icons/react";

export interface MenuPosition {
  x: number;
  y: number;
}

export interface MenuEntry {
  label: string;
  action?: () => void;
  /** Draws a separator line above this entry */
  divider?: boolean;
  /** Nested entries open on hover, mac-style */
  submenu?: { label: string; action: () => void }[];
  danger?: boolean;
}

const itemClass = (danger?: boolean) =>
  `flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-(--accent-btn) hover:text-(--accent-contrast) ${
    danger ? "text-[#ff6961]" : "text-white/85"
  }`;

/** A macOS-style right-click menu; reused by the desktop, its items, and Finder. */
export default function ContextMenu({
  pos,
  entries,
  onClose,
}: {
  pos: MenuPosition;
  entries: MenuEntry[];
  onClose: () => void;
}) {
  const [openSub, setOpenSub] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      style={{ left: pos.x, top: pos.y }}
      className="bar-chrome absolute z-[9999] w-56 origin-top-left rounded-lg border border-white/[0.12] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      role="menu"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {entries.map((entry) => (
        <div
          key={entry.label}
          className={`relative ${entry.divider ? "mt-1 border-t border-white/[0.08] pt-1" : ""}`}
          onMouseEnter={() => setOpenSub(entry.submenu ? entry.label : null)}
        >
          <button
            role="menuitem"
            onClick={() => {
              if (entry.submenu) return;
              entry.action?.();
              onClose();
            }}
            className={itemClass(entry.danger)}
          >
            {entry.label}
            {entry.submenu && <CaretRight size={11} weight="bold" className="opacity-60" />}
          </button>

          {entry.submenu && openSub === entry.label && (
            <div
              className="bar-chrome absolute left-[calc(100%-4px)] top-0 w-40 rounded-lg border border-white/[0.12] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
              role="menu"
            >
              {entry.submenu.map((sub) => (
                <button
                  key={sub.label}
                  role="menuitem"
                  onClick={() => {
                    sub.action();
                    onClose();
                  }}
                  className={itemClass()}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}
