"use client";

import { useEffect, useMemo, useState } from "react";
import { useFiles } from "@/lib/files";
import { useWindows } from "@/lib/store";

/** Lightweight JSX/TS syntax highlight: keywords, strings, comments, JSX tags. */
function highlight(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="text-[#6a9955]">$1</span>')
    .replace(/(`[^`]*`|'[^']*'|"[^"]*")/g, '<span class="text-[#ce9178]">$1</span>')
    .replace(/\b(import|export|const|let|var|function|return|if|else|for|while|class|interface|type|from|as|default|new|this|void|null|undefined|true|false|async|await|try|catch|throw)\b/g,
      '<span class="text-[#569cd6]">$1</span>')
    .replace(/(<\/?[A-Za-z]\w*[^>]*\/?>)/g, '<span class="text-[#4ec9b0]">$1</span>')
    .replace(/\{(\/\*[^*]*\*\/)?\}/g, '<span class="text-[#d4d4d4]">$&</span>');
}

const FILES: { path: string; label: string }[] = [
  { path: "store.ts", label: "lib/store.ts" },
  { path: "terminal", label: "TerminalApp.tsx" },
  { path: "window", label: "Window.tsx" },
  { path: "dock", label: "Dock.tsx" },
  { path: "system", label: "lib/system.ts" },
];

const SAMPLES: Record<string, string> = {};

export default function CodeApp({ fileId }: { fileId?: string }) {
  const items = useFiles((s) => s.items);
  const setContent = useFiles((s) => s.setContent);
  const openApp = useWindows((s) => s.openApp);

  const [tab, setTab] = useState<string>("welcome");
  const [dirty, setDirty] = useState("");

  const item = fileId ? items[fileId] : null;

  // Load built-in source samples lazily
  useEffect(() => {
    if (tab === "welcome" || SAMPLES[tab]) return;
    import(`@/lib/source-snapshots`)
      .then((m: any) => { Object.assign(SAMPLES, m.SAMPLES || {}); setDirty(""); })
      .catch(() => {});
  }, [tab]);

  const source = !fileId ? (SAMPLES[tab] ?? "// Loading source…") : (dirty || item?.content || "");

  const myFiles = Object.values(items).filter(i => i.kind === "file");

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] text-[#d4d4d4]">
      <div className="flex border-b border-[#333] text-[12px]">
        <div className="flex min-w-0 flex-1">
          <button onClick={() => { setTab("welcome"); setDirty(""); }}
            className={`shrink-0 border-r border-[#333] px-4 py-1.5 ${tab === "welcome" && !fileId ? "border-t-2 border-t-[#007acc] bg-[#252526]" : "text-white/50 hover:bg-[#2d2d2d]"}`}>
            diwakar-os
          </button>
          {myFiles.map(f => (
            <button key={f.id} onClick={() => { setTab(f.id); setDirty(f.content || ""); }}
              className={`shrink-0 border-r border-[#333] px-4 py-1.5 ${(fileId || tab) === f.id ? "border-t-2 border-t-[#007acc] bg-[#252526]" : "text-white/50 hover:bg-[#2d2d2d]"}`}>
              {f.name}
            </button>
          ))}
        </div>
        <span className="shrink-0 self-center px-3 text-[11px] text-white/25">{fileId ? item?.name : ""}</span>
      </div>

      {fileId ? (
        <textarea value={dirty} onChange={e => { setDirty(e.target.value); setContent(fileId, e.target.value); }}
          className="os-scroll min-h-0 flex-1 resize-none bg-[#1e1e1e] p-4 font-mono text-[13px] leading-relaxed text-[#d4d4d4] outline-none" spellCheck={false} />
      ) : tab === "welcome" ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 opacity-60">
          <p className="text-[15px] font-semibold">Code</p>
          <p className="text-[12.5px]">Select a source file from the left, or open a text file from the desktop</p>
          <p className="mt-4 text-[11.5px] text-white/30">{myFiles.length} user file{myFiles.length === 1 ? "" : "s"} in this workspace</p>
        </div>
      ) : source.startsWith("// Loading") ? (
        <div className="flex h-full items-center justify-center text-[13px] text-white/30">Loading source…</div>
      ) : (
        <div className="os-scroll min-h-0 flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed">
          <pre className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlight(source) }} />
        </div>
      )}
    </div>
  );
}
