"use client";

import { useEffect, useRef, type RefObject } from "react";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import type { AppDef } from "@/lib/apps";
import { useWindows } from "@/lib/store";
import AppTile from "./AppTile";

/** Dragged icon offsets, per app, so the desktop remembers your layout. */
const POS_KEY = "dios-icon-pos";

type StoredPos = Record<string, { x: number; y: number }>;

function readPositions(): StoredPos {
  try {
    return JSON.parse(localStorage.getItem(POS_KEY) ?? "{}") as StoredPos;
  } catch {
    return {};
  }
}

export function clearIconPositions() {
  localStorage.removeItem(POS_KEY);
}

/**
 * A desktop app icon with real macOS behavior on desktop: single click
 * selects, double click opens, and it drags like a physical desktop item.
 * On mobile a single tap opens.
 */
export default function DesktopIcon({
  app,
  constraintsRef,
  mobile,
  selected = false,
  onSelect,
}: {
  app: AppDef;
  constraintsRef: RefObject<HTMLDivElement | null>;
  mobile: boolean;
  selected?: boolean;
  onSelect?: (id: AppDef["id"] | null) => void;
}) {
  const openApp = useWindows((s) => s.openApp);
  const reduce = useReducedMotion();
  const dragging = useRef(false);

  // Drag offset from the icon's home spot, restored across visits.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    if (mobile) return;
    const p = readPositions()[app.id];
    if (p) {
      x.set(p.x);
      y.set(p.y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  const savePosition = () => {
    const all = readPositions();
    all[app.id] = { x: x.get(), y: y.get() };
    localStorage.setItem(POS_KEY, JSON.stringify(all));
  };

  const handleClick = () => {
    if (dragging.current) return;
    if (mobile) {
      openApp(app.id);
      return;
    }
    if (selected) {
      // Second click on a selected icon opens it: forgiving for visitors
      // who expect single-click while staying mac-like on the first click.
      openApp(app.id);
      onSelect?.(null);
    } else {
      onSelect?.(app.id);
    }
  };

  const handleDoubleClick = () => {
    if (mobile || dragging.current) return;
    openApp(app.id);
    onSelect?.(null);
  };

  return (
    <motion.button
      drag={!mobile && !reduce}
      dragConstraints={constraintsRef}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => (dragging.current = true)}
      onDragEnd={() => {
        savePosition();
        // Let the click event that follows the drag pass before re-arming.
        requestAnimationFrame(() => (dragging.current = false));
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={mobile ? undefined : { position: "absolute", ...app.desk, x, y }}
      className="group z-10 flex w-[76px] cursor-default flex-col items-center gap-1.5 outline-none"
      aria-label={`Open ${app.name}`}
      aria-pressed={selected}
    >
      <motion.span
        whileHover={reduce ? undefined : { scale: 1.06 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={`block h-[64px] w-[64px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)] ${
          selected ? "brightness-75" : ""
        }`}
      >
        <AppTile app={app} />
      </motion.span>
      <span
        className={`rounded px-1.5 py-px text-[12px] font-medium ${
          selected
            ? "bg-(--accent-btn) text-(--accent-contrast)"
            : "text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
        } group-focus-visible:bg-(--accent-btn) group-focus-visible:text-(--accent-contrast)`}
      >
        {app.name}
      </span>
    </motion.button>
  );
}
