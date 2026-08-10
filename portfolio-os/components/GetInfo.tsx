"use client";

import { motion } from "motion/react";
import { FileText, Folder, X } from "@phosphor-icons/react";
import { sizeOf, useFiles, type DeskItem } from "@/lib/files";

const fmt = (ts: number) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ts));

/** The little macOS "Get Info" panel for a desktop item. */
export default function GetInfo({ item, onClose }: { item: DeskItem; onClose: () => void }) {
  const items = useFiles((s) => s.items);

  const rows: [string, string][] = [
    ["Kind", item.kind === "folder" ? "Folder" : "Plain text document"],
    ["Size", sizeOf(items, item)],
    ["Where", item.parentId === null ? "Desktop" : items[item.parentId]?.name ?? "—"],
    ["Created", fmt(item.createdAt)],
    ["Modified", fmt(item.updatedAt)],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ type: "spring", stiffness: 450, damping: 32 }}
      className="window-chrome absolute left-1/2 top-24 z-[9998] w-64 -translate-x-1/2 rounded-xl border border-white/[0.12] shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
      role="dialog"
      aria-label={`Info: ${item.name}`}
      data-focused="true"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-3 py-2">
        <button
          onClick={onClose}
          aria-label="Close info"
          className="flex h-3 w-3 items-center justify-center rounded-full border border-black/20 bg-[#ff5f57]"
        >
          <X size={8} weight="bold" className="text-black/60 opacity-0 hover:opacity-100" />
        </button>
        <span className="flex-1 truncate text-center text-[12.5px] font-medium text-white/80">
          {item.name} Info
        </span>
        <span className="w-3" aria-hidden />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        {item.kind === "folder" ? (
          <Folder size={34} weight="fill" className="shrink-0 text-[#57a8f4]" />
        ) : (
          <FileText size={30} className="shrink-0 text-white/80" />
        )}
        <p className="truncate text-[13.5px] font-semibold text-white/90">{item.name}</p>
      </div>

      <dl className="space-y-1.5 border-t border-white/[0.08] px-4 py-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2 text-[12px]">
            <dt className="w-16 shrink-0 text-white/40">{k}</dt>
            <dd className="min-w-0 flex-1 truncate text-white/80">{v}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
