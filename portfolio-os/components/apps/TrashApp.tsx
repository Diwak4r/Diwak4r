"use client";

import { ArrowCounterClockwise, Trash } from "@phosphor-icons/react";
import { trashedItems, useFiles } from "@/lib/files";

/** The Trash window: everything deleted from the desktop, with Restore and
 *  Empty Trash. Items sit here recoverably until emptied — like real macOS. */
export default function TrashApp() {
  const items = useFiles((s) => s.items);
  const restore = useFiles((s) => s.restore);
  const emptyTrash = useFiles((s) => s.emptyTrash);
  const trashed = trashedItems(items);

  return (
    <div className="flex h-full flex-col bg-[#161616]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5">
        <div className="flex items-center gap-2 text-white/85">
          <Trash size={16} weight="fill" className="text-white/60" />
          <span className="text-[13px] font-semibold">Trash</span>
          <span className="text-[11px] text-white/40">
            {trashed.length} item{trashed.length === 1 ? "" : "s"}
          </span>
        </div>
        {trashed.length > 0 && (
          <button
            onClick={emptyTrash}
            className="rounded-md bg-white/[0.08] px-2.5 py-1 text-[11.5px] text-white/80 transition hover:bg-white/[0.14]"
          >
            Empty Trash
          </button>
        )}
      </div>

      <div className="os-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {trashed.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/30">
            <Trash size={40} weight="thin" />
            <p className="text-[12.5px]">Trash is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {trashed.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.03] px-3 py-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.06] text-white/60">
                  {it.kind === "folder" ? "📁" : "📄"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-white/85">{it.name}</span>
                  <span className="block text-[10.5px] text-white/35">
                    {it.kind === "folder" ? "Folder" : "Text file"} · deleted{" "}
                    {new Date(it.trashedAt ?? 0).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </span>
                <button
                  onClick={() => restore(it.id)}
                  aria-label={`Restore ${it.name}`}
                  className="flex items-center gap-1.5 rounded-md bg-white/[0.08] px-2.5 py-1 text-[11px] text-white/80 transition hover:bg-(--accent-btn) hover:text-(--accent-contrast)"
                >
                  <ArrowCounterClockwise size={13} weight="bold" />
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
