"use client";

import { ArrowsInSimple, ArrowsOutSimple, Minus, X } from "@phosphor-icons/react";

/**
 * macOS traffic lights. Glyphs appear when the group is hovered;
 * lights grey out when the window loses focus, like the real thing.
 */
export default function TrafficLights({
  focused,
  maximized,
  onClose,
  onMinimize,
  onMaximize,
  hideExtras = false,
}: {
  focused: boolean;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  hideExtras?: boolean;
}) {
  const lights = [
    { label: "Close window", color: "#ff5f57", Glyph: X, action: onClose, show: true },
    { label: "Minimize window", color: "#febc2e", Glyph: Minus, action: onMinimize, show: !hideExtras },
    {
      label: maximized ? "Restore window" : "Maximize window",
      color: "#28c840",
      Glyph: maximized ? ArrowsInSimple : ArrowsOutSimple,
      action: onMaximize,
      show: !hideExtras,
    },
  ];

  return (
    <div
      className="group flex items-center gap-2"
      // Keep title-bar drag from hijacking clicks on the lights.
      onPointerDown={(e) => e.stopPropagation()}
    >
      {lights
        .filter((l) => l.show)
        .map(({ label, color, Glyph, action }) => (
          <button
            key={label}
            onClick={action}
            aria-label={label}
            className="flex h-3 w-3 items-center justify-center rounded-full border border-black/20 transition-transform active:scale-90"
            style={{ background: focused ? color : "rgba(255,255,255,0.22)" }}
          >
            <Glyph
              size={8}
              weight="bold"
              className="text-black/60 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
            />
          </button>
        ))}
    </div>
  );
}
