"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import TrafficLights from "./TrafficLights";

const MIN_W = 380;
const MIN_H = 300;
const MAX_MARGIN = 8;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

const springIn = { type: "spring", stiffness: 380, damping: 30 } as const;
const springGeo = { type: "spring", stiffness: 320, damping: 34 } as const;

export interface WindowRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function Window({
  name,
  title,
  initial,
  z,
  minimized,
  maximized,
  focused,
  mobile,
  desktopRef,
  onClose,
  onMinimize,
  onToggleMax,
  onFocus,
  children,
}: {
  name: string;
  title: string;
  initial: WindowRect;
  z: number;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  mobile: boolean;
  desktopRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMax: () => void;
  onFocus: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  // Window geometry lives in motion values so drag and resize never re-render React.
  const x = useMotionValue(initial.x);
  const y = useMotionValue(initial.y);
  const w = useMotionValue(initial.w);
  const h = useMotionValue(initial.h);
  const beforeMax = useRef<WindowRect | null>(null);

  // Clamp the preferred geometry into the actual desktop on mount.
  useEffect(() => {
    const desk = desktopRef.current;
    if (!desk || mobile) return;
    const dw = desk.clientWidth;
    const dh = desk.clientHeight;
    const ww = clamp(initial.w, MIN_W, dw - 24);
    const wh = clamp(initial.h, MIN_H, dh - 24);
    w.set(ww);
    h.set(wh);
    x.set(clamp(initial.x, 12, Math.max(12, dw - ww - 12)));
    y.set(clamp(initial.y, 8, Math.max(8, dh - wh - 12)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  // Animate between free and maximized geometry.
  useEffect(() => {
    const desk = desktopRef.current;
    if (!desk || mobile) return;
    if (maximized) {
      beforeMax.current = { x: x.get(), y: y.get(), w: w.get(), h: h.get() };
      animate(x, MAX_MARGIN, springGeo);
      animate(y, MAX_MARGIN, springGeo);
      animate(w, desk.clientWidth - MAX_MARGIN * 2, springGeo);
      animate(h, desk.clientHeight - MAX_MARGIN * 2, springGeo);
    } else if (beforeMax.current) {
      const p = beforeMax.current;
      beforeMax.current = null;
      animate(x, p.x, springGeo);
      animate(y, p.y, springGeo);
      animate(w, p.w, springGeo);
      animate(h, p.h, springGeo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maximized, mobile]);

  /** Title-bar drag, done by hand: motion values move, React never re-renders,
   *  and programmatic geometry animations (maximize/restore) stay untouched. */
  const startDrag = (e: React.PointerEvent) => {
    if (maximized || e.button !== 0) return;
    const desk = desktopRef.current;
    const startX = e.clientX;
    const startY = e.clientY;
    const sx = x.get();
    const sy = y.get();
    const deskW = desk?.clientWidth ?? Infinity;
    const deskH = desk?.clientHeight ?? Infinity;
    const ww = w.get();

    const move = (ev: PointerEvent) => {
      // Keep at least a sliver of the title bar reachable on every side.
      x.set(clamp(sx + ev.clientX - startX, -ww + 80, deskW - 80));
      y.set(clamp(sy + ev.clientY - startY, 0, deskH - 40));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  /** Resize from any edge or corner; left/top edges also shift x/y to keep the opposite edge fixed. */
  const startResize = (edges: { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean }) => (
    e: React.PointerEvent
  ) => {
    if (maximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    const desk = desktopRef.current;
    const startX = e.clientX;
    const startY = e.clientY;
    const sw = w.get();
    const sh = h.get();
    const sx = x.get();
    const sy = y.get();
    const deskW = desk?.clientWidth ?? Infinity;
    const deskH = desk?.clientHeight ?? Infinity;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (edges.right) {
        w.set(clamp(sw + dx, MIN_W, deskW - sx - MAX_MARGIN));
      } else if (edges.left) {
        const newX = clamp(sx + dx, 12, sx + sw - MIN_W);
        w.set(sx + sw - newX);
        x.set(newX);
      }

      if (edges.bottom) {
        h.set(clamp(sh + dy, MIN_H, deskH - sy - MAX_MARGIN));
      } else if (edges.top) {
        const newY = clamp(sy + dy, 8, sy + sh - MIN_H);
        h.set(sy + sh - newY);
        y.set(newY);
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  /* ---- Mobile: full-screen sheet ---- */
  if (mobile) {
    return (
      <motion.section
        role="dialog"
        aria-label={name}
        initial={{ y: "100%" }}
        animate={{ y: 0, transition: reduce ? { duration: 0 } : springIn }}
        exit={{ y: "100%", transition: { duration: 0.22, ease: "easeIn" } }}
        style={{ zIndex: z }}
        className="window-chrome absolute inset-x-0 bottom-0 top-1 flex flex-col overflow-hidden rounded-t-2xl"
        data-focused="true"
      >
        <div className="relative flex h-11 shrink-0 items-center border-b border-white/[0.06] px-4">
          <TrafficLights
            focused
            maximized={false}
            hideExtras
            onClose={onClose}
            onMinimize={() => {}}
            onMaximize={() => {}}
          />
          <span className="absolute inset-x-0 text-center text-[13px] font-medium text-white/80">
            {title}
          </span>
        </div>
        <div className="os-scroll min-h-0 flex-1 overflow-y-auto">{children}</div>
      </motion.section>
    );
  }

  /* ---- Desktop: free-floating window ---- */
  return (
    <motion.section
      role="dialog"
      aria-label={name}
      onPointerDown={onFocus}
      style={{
        x,
        y,
        width: w,
        height: h,
        zIndex: z,
        pointerEvents: minimized ? "none" : "auto",
      }}
      className="absolute left-0 top-0"
    >
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 1, scale: 0.92, y: 16 }}
        animate={
          minimized
            ? reduce
              ? {
                  opacity: 0,
                  scale: 1,
                  transition: { duration: 0.15 },
                  transitionEnd: { visibility: "hidden" },
                }
              : {
                  opacity: [1, 1, 0],
                  scaleX: [1, 0.82, 0.28],
                  scaleY: [1, 1.08, 0.1],
                  y: [0, 12, 280],
                  transition: { duration: 0.42, times: [0, 0.4, 1], ease: [0.6, 0, 0.4, 1] },
                  // Once hidden, the compositor stops paying for this window's
                  // backdrop blur entirely.
                  transitionEnd: { visibility: "hidden" },
                }
            : reduce
              ? { opacity: 1, scale: 1, visibility: "visible", transition: { duration: 0.15 } }
              : {
                  opacity: 1,
                  scaleX: 1,
                  scaleY: 1,
                  y: 0,
                  visibility: "visible",
                  transition: springIn,
                }
        }
        exit={{ opacity: 0, scale: reduce ? 1 : 0.96, transition: { duration: 0.16, ease: "easeIn" } }}
        className="window-chrome flex h-full w-full origin-bottom flex-col overflow-hidden rounded-2xl"
        data-focused={focused ? "true" : "false"}
      >
        {/* Title bar: drag handle, double-click to zoom */}
        <div
          onPointerDown={startDrag}
          onDoubleClick={onToggleMax}
          className="relative flex h-10 shrink-0 items-center border-b border-white/[0.06] px-3.5"
        >
          <TrafficLights
            focused={focused}
            maximized={maximized}
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onToggleMax}
          />
          <span
            className={`pointer-events-none absolute inset-x-0 text-center text-[13px] font-medium ${
              focused ? "text-white/80" : "text-white/35"
            }`}
          >
            {title}
          </span>
        </div>

        <div className="os-scroll min-h-0 flex-1 overflow-y-auto">{children}</div>
      </motion.div>

      {/* Resize handles: siblings of the rounded/clipped window-chrome, so the
          rounded-corner curve never eats into their hit-test area. */}
      <div
        onPointerDown={startResize({ right: true })}
        className="absolute bottom-6 right-0 top-6 z-10 w-2 cursor-ew-resize"
        aria-hidden
      />
      <div
        onPointerDown={startResize({ left: true })}
        className="absolute bottom-6 left-0 top-6 z-10 w-2 cursor-ew-resize"
        aria-hidden
      />
      <div
        onPointerDown={startResize({ bottom: true })}
        className="absolute bottom-0 left-6 right-6 z-10 h-2 cursor-ns-resize"
        aria-hidden
      />
      <div
        onPointerDown={startResize({ top: true })}
        className="absolute left-6 right-6 top-0 z-10 h-2 cursor-ns-resize"
        aria-hidden
      />
      <div
        onPointerDown={startResize({ right: true, bottom: true })}
        className="absolute bottom-0 right-0 z-10 h-5 w-5 cursor-nwse-resize"
        aria-hidden
      />
      <div
        onPointerDown={startResize({ left: true, bottom: true })}
        className="absolute bottom-0 left-0 z-10 h-5 w-5 cursor-nesw-resize"
        aria-hidden
      />
      <div
        onPointerDown={startResize({ right: true, top: true })}
        className="absolute right-0 top-0 z-10 h-5 w-5 cursor-nesw-resize"
        aria-hidden
      />
      {/* Top-left corner: kept small so it never covers the close button */}
      <div
        onPointerDown={startResize({ left: true, top: true })}
        className="absolute left-0 top-0 z-10 h-2.5 w-2.5 cursor-nwse-resize"
        aria-hidden
      />
    </motion.section>
  );
}
