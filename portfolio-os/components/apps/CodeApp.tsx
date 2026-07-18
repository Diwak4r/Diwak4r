"use client";

import { useEffect, useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import {
  Bell,
  Circle,
  Files as FilesIcon,
  GitBranch,
  Play,
  MagnifyingGlass,
  Gear as GearIcon,
  GitMerge,
} from "@phosphor-icons/react";
import { useFiles } from "@/lib/files";

/** JSX/TS syntax highlight: keywords, strings, comments, JSX tags.
 *  Output is sanitized with DOMPurify before render (only color-span tags
 *  are allowed; everything else is stripped or escaped). */
function highlight(code: string): string {
  const raw = code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="tk-c">$1</span>')
    .replace(/(`[^`]*`|'[^']*'|"[^"]*")/g, '<span class="tk-s">$1</span>')
    .replace(/\b(import|export|const|let|var|function|return|if|else|for|while|class|interface|type|from|as|default|new|this|void|null|undefined|true|false|async|await|try|catch|throw)\b/g,
      '<span class="tk-k">$1</span>')
    .replace(/(<\/?[A-Za-z]\w*[^>]*\/?>)/g, '<span class="tk-t">$1</span>')
    .replace(/\{(\/\*[^*]*\*\/)?\}/g, '<span class="tk-b">$&</span>');
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ["span"],
    ALLOWED_ATTR: ["class"],
  });
}

const SAMPLES: Record<string, string> = {};

/** A faithful VS Code recreation: activity bar, explorer, tab strip, editor
 *  with line numbers + syntax highlight, and the blue status bar. */
export default function CodeApp({ fileId }: { fileId?: string }) {
  const items = useFiles((s) => s.items);
  const setContent = useFiles((s) => s.setContent);

  const myFiles = Object.values(items).filter((i) => i.kind === "file");
  const [tab, setTab] = useState<string>(fileId ?? myFiles[0]?.id ?? "welcome");
  const [dirty, setDirty] = useState("");
  const item = items[tab];

  useEffect(() => {
    if (tab === "welcome" || SAMPLES[tab]) return;
    import(`@/lib/source-snapshots`)
      .then((m: any) => { Object.assign(SAMPLES, m.SAMPLES || {}); setDirty(""); })
      .catch(() => {});
  }, [tab]);

  const isUserFile = item && item.kind === "file";
  const source = isUserFile ? (dirty || item.content || "") : (SAMPLES[tab] ?? "// Loading source…");

  const ActivityBtn = ({ active, label, children }: { active?: boolean; label: string; children: React.ReactNode }) => (
    <button
      aria-label={label}
      className={`relative flex h-12 w-12 items-center justify-center ${
        active ? "text-white" : "text-[#858585] hover:text-white/80"
      }`}
    >
      {active && <span className="absolute left-0 top-0 h-full w-[2px] bg-white" />}
      {children}
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] text-[#cccccc]">
      <div className="flex min-h-0 flex-1">
        {/* Activity bar */}
        <div className="flex w-12 shrink-0 flex-col items-center justify-between bg-[#333333] py-1">
          <div className="flex flex-col">
            <ActivityBtn active label="Explorer"><FilesIcon size={22} /></ActivityBtn>
            <ActivityBtn label="Search"><MagnifyingGlass size={22} /></ActivityBtn>
            <ActivityBtn label="Source Control"><GitMerge size={22} /></ActivityBtn>
            <ActivityBtn label="Run and Debug"><Play size={22} /></ActivityBtn>
          </div>
          <div className="flex flex-col">
            <ActivityBtn label="Accounts"><Circle size={22} weight="fill" /></ActivityBtn>
            <ActivityBtn label="Manage"><GearIcon size={22} /></ActivityBtn>
          </div>
        </div>

        {/* Explorer */}
        <div className="flex w-52 shrink-0 flex-col bg-[#252526] text-[13px]">
          <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#858585]">Explorer</p>
          <div className="px-2">
            <p className="flex items-center gap-1 px-2 py-1 font-semibold text-[#cccccc]">▾ DIWAKAR-OS</p>
            <div className="os-scroll overflow-y-auto">
              {myFiles.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setTab(f.id); setDirty(f.content || ""); }}
                  className={`flex w-full items-center gap-1.5 rounded px-2 py-[3px] text-left ${
                    tab === f.id ? "bg-[#37373d] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
                  }`}
                >
                  <span className="text-[#519aba]">TS</span>
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Tab strip */}
          <div className="flex shrink-0 bg-[#252526] text-[12.5px]">
            {tab !== "welcome" && (
              <div className="flex items-center gap-1.5 border-t-2 border-t-[#007acc] bg-[#1e1e1e] px-3 py-1.5 text-white">
                <span className="text-[#519aba]">TS</span>
                <span className="truncate">{isUserFile ? item.name : tab}</span>
              </div>
            )}
          </div>

          {/* Editor */}
          {tab === "welcome" && myFiles.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 text-[#858585]">
              <p className="text-[22px] font-light text-[#5a5a5a]">diwakar-os</p>
              <p className="text-[12.5px]">Select a file from the Explorer, or create one on the desktop</p>
            </div>
          ) : source.startsWith("// Loading") ? (
            <div className="flex flex-1 items-center justify-center text-[13px] text-[#858585]">Loading source…</div>
          ) : isUserFile ? (
            <textarea
              value={dirty}
              onChange={(e) => { setDirty(e.target.value); setContent(tab, e.target.value); }}
              className="os-scroll min-h-0 flex-1 resize-none bg-[#1e1e1e] p-4 font-mono text-[13px] leading-[1.55] text-[#d4d4d4] outline-none"
              spellCheck={false}
            />
          ) : (
            <div className="os-scroll min-h-0 flex-1 overflow-y-auto">
              <div className="flex font-mono text-[13px] leading-[1.55]">
                <pre className="select-none border-r border-[#2b2b2b] bg-[#1e1e1e] px-3 py-4 text-right text-[#6e7681]">
                  {source.split("\n").map((_, i) => i + 1).join("\n")}
                </pre>
                <pre
                  className="flex-1 whitespace-pre-wrap p-4 text-[#d4d4d4] [&_.tk-b]:text-[#d4d4d4] [&_.tk-c]:text-[#6a9955] [&_.tk-k]:text-[#569cd6] [&_.tk-s]:text-[#ce9178] [&_.tk-t]:text-[#4ec9b0]"
                  dangerouslySetInnerHTML={{ __html: highlight(source) }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex shrink-0 items-center justify-between bg-[#007acc] px-3 text-[12px] text-white">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><GitBranch size={13} weight="bold" /> main</span>
          <span>✕ 0 ⚠ 0</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{isUserFile ? "UTF-8" : "Plain Text"}</span>
          <span>TypeScript JSX</span>
          <span>Prettier</span>
          <Bell size={13} />
        </div>
      </div>
    </div>
  );
}
