"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { FileText, Folder } from "@phosphor-icons/react";
import { useFiles, type DeskItem } from "@/lib/files";

/**
 * A user-created desktop item (folder or text file): selects on click,
 * opens on double click, drags anywhere, renames inline, and its position
 * survives reloads. Right-click hands the event to the desktop's menu.
 */
export default function DeskFileIcon({
  item,
  selected,
  renaming,
  onSelect,
  onOpen,
  onMenu,
  onRenamed,
}: {
  item: DeskItem;
  selected: boolean;
  /** Puts the label into an editable input */
  renaming: boolean;
  onSelect: (id: string | null) => void;
  onOpen: (item: DeskItem) => void;
  onMenu: (item: DeskItem, pos: { x: number; y: number }) => void;
  onRenamed: () => void;
}) {
  const reduce = useReducedMotion();
  const setPos = useFiles((s) => s.setPos);
  const rename = useFiles((s) => s.rename);
  const dragging = useRef(false);
  const [draft, setDraft] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const x = useMotionValue(item.pos?.x ?? 140);
  const y = useMotionValue(item.pos?.y ?? 90);

  useEffect(() => {
    if (renaming) {
      setDraft(item.name);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [renaming, item.name]);

  const commitRename = () => {
    rename(item.id, draft);
    onRenamed();
  };

  /** Manual drag, same approach as windows: motion values only. */
  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0 || renaming) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const sx = x.get();
    const sy = y.get();
    let moved = false;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      dragging.current = moved;
      x.set(sx + dx);
      y.set(sy + dy);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (moved) setPos(item.id, { x: x.get(), y: y.get() });
      requestAnimationFrame(() => (dragging.current = false));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <motion.div
      style={{ position: "absolute", left: 0, top: 0, x, y }}
      className="z-10 flex w-[84px] cursor-default flex-col items-center gap-1"
      onPointerDown={startDrag}
      onClick={() => !dragging.current && onSelect(item.id)}
      onDoubleClick={() => !dragging.current && onOpen(item)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(item.id);
        onMenu(item, { x: e.clientX, y: e.clientY });
      }}
      role="button"
      aria-label={`${item.kind === "folder" ? "Folder" : "File"}: ${item.name}`}
    >
      <motion.span
        whileHover={reduce ? undefined : { scale: 1.06 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={`flex h-[58px] w-[58px] items-center justify-center drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] ${
          selected ? "brightness-75" : ""
        }`}
      >
        {item.kind === "folder" ? (
          <Folder size={54} weight="fill" className="text-[#57a8f4]" />
        ) : (
          <span className="flex h-12 w-10 items-center justify-center rounded-[6px] border border-black/10 bg-white/95">
            <FileText size={22} className="text-black/50" />
          </span>
        )}
      </motion.span>

      {renaming ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") onRenamed();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-[92px] rounded border border-(--accent-btn) bg-black/70 px-1 py-px text-center text-[12px] text-white outline-none"
          aria-label="Rename"
        />
      ) : (
        <span
          className={`max-w-[92px] truncate rounded px-1.5 py-px text-[12px] font-medium ${
            selected
              ? "bg-(--accent-btn) text-(--accent-contrast)"
              : "text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
          }`}
        >
          {item.name}
        </span>
      )}
    </motion.div>
  );
}
