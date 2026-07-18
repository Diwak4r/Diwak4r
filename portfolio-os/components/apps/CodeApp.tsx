"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import {
  Bell,
  Circle,
  Files as FilesIcon,
  FilePlus,
  GitBranch,
  Play,
  MagnifyingGlass,
  Gear as GearIcon,
  GitMerge,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useFiles } from "@/lib/files";
import type { DeskItem } from "@/lib/files";

/** JS/TS syntax highlight: keywords, strings, comments, numbers.
 *  Output is sanitized with DOMPurify before render (only color-span tags
 *  are allowed; everything else is stripped or escaped). */
function highlight(code: string): string {
  const raw = code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="tk-c">$1</span>')
    .replace(/(`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g, '<span class="tk-s">$1</span>')
    .replace(/\b(import|export|const|let|var|function|return|if|else|for|while|class|interface|type|from|as|default|new|this|void|null|undefined|true|false|async|await|try|catch|throw|of|in|do|switch|case|break|continue)\b/g,
      '<span class="tk-k">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tk-n">$1</span>');
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ["span"],
    ALLOWED_ATTR: ["class"],
  });
}

const isRunnable = (name: string) => /\.(mjs|cjs|js|ts|jsx|tsx)$/i.test(name);

const languageOf = (name: string): string => {
  if (/\.tsx$/i.test(name)) return "TypeScript JSX";
  if (/\.ts$/i.test(name)) return "TypeScript";
  if (/\.jsx$/i.test(name)) return "JavaScript JSX";
  if (/\.[mc]?js$/i.test(name)) return "JavaScript";
  if (/\.json$/i.test(name)) return "JSON";
  if (/\.md$/i.test(name)) return "Markdown";
  if (/\.txt$/i.test(name)) return "Plain Text";
  return "Plain Text";
};

/** Run JS in-process with a captured console. No eval of remote code:
 *  the only thing executed is what the user typed in their own editor. */
function runCode(src: string): string[] {
  const out: string[] = [];
  const fmt = (a: unknown): string => {
    if (typeof a === "string") return a;
    if (a instanceof Error) return `${a.name}: ${a.message}`;
    try { return JSON.stringify(a, null, 2) ?? String(a); } catch { return String(a); }
  };
  const fakeConsole = {
    log: (...a: unknown[]) => out.push(a.map(fmt).join(" ")),
    info: (...a: unknown[]) => out.push(a.map(fmt).join(" ")),
    warn: (...a: unknown[]) => out.push(`⚠ ${a.map(fmt).join(" ")}`),
    error: (...a: unknown[]) => out.push(`✕ ${a.map(fmt).join(" ")}`),
  };
  try {
    const fn = new Function("console", `"use strict";\n${src}`);
    const result = fn(fakeConsole);
    if (result !== undefined) out.push(`⟵ ${fmt(result)}`);
  } catch (e) {
    out.push(`✕ ${fmt(e)}`);
  }
  return out.length ? out : ["(no output)"];
}

/** Activity-bar icon, faithful to VS Code's left rail. */
function ActivityBtn({ active, label, onClick, children }: {
  active?: boolean;
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`relative flex h-12 w-12 items-center justify-center ${
        active ? "text-white" : "text-[#858585] hover:text-white/80"
      }`}
    >
      {active && <span className="absolute left-0 top-0 h-full w-[2px] bg-white" />}
      {children}
    </button>
  );
}

/** A working VS Code: editable files, create/rename/delete, multi-tab,
 *  and a Run button that executes JS/TS in an integrated output panel. */
export default function CodeApp({ fileId }: { fileId?: string }) {
  const items = useFiles((s) => s.items);
  const setContent = useFiles((s) => s.setContent);
  const create = useFiles((s) => s.create);
  const rename = useFiles((s) => s.rename);
  const remove = useFiles((s) => s.remove);

  const myFiles = useMemo(
    () => Object.values(items)
      .filter((i) => i.kind === "file" && i.trashedAt === undefined)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  );

  const [openTabs, setOpenTabs] = useState<string[]>(fileId ? [fileId] : []);
  const [tab, setTab] = useState<string>(fileId ?? myFiles[0]?.id ?? "welcome");
  const [output, setOutput] = useState<string[] | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const editRef = useRef<HTMLTextAreaElement>(null);
  const lineRef = useRef<HTMLPreElement>(null);
  const hlRef = useRef<HTMLPreElement>(null);

  const item: DeskItem | undefined = items[tab];
  const source = item?.content ?? "";
  const lines = source.split("\n").length;

  // Keep the tab strip in sync with files that still exist.
  useEffect(() => {
    setOpenTabs((tabs) => tabs.filter((id) => items[id] && items[id].trashedAt === undefined));
  }, [items]);

  useEffect(() => {
    if (tab !== "welcome" && !items[tab]) {
      const next = openTabs.find((id) => id !== tab && items[id]) ?? myFiles[0]?.id ?? "welcome";
      setTab(next);
    }
  }, [items, tab, openTabs, myFiles]);

  const openFile = (id: string) => {
    setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
    setTab(id);
    setOutput(null);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rest = openTabs.filter((t) => t !== id);
    setOpenTabs(rest);
    if (tab === id) setTab(rest[rest.length - 1] ?? "welcome");
  };

  const newFile = () => {
    const id = create("file", null);
    openFile(id);
    setRenamingId(id);
    setNameDraft("untitled.js");
  };

  const commitRename = () => {
    if (renamingId && nameDraft.trim()) rename(renamingId, nameDraft.trim());
    setRenamingId(null);
  };

  const deleteFile = (id: string) => {
    remove(id);
    closeTab(id, { stopPropagation: () => {} } as React.MouseEvent);
    if (tab === id) setOutput(null);
  };

  const run = () => {
    if (!item || !isRunnable(item.name)) return;
    setOutput(runCode(source));
  };

  // Scroll-sync between the textarea (source of truth) and the two pre layers.
  const syncScroll = () => {
    const t = editRef.current;
    if (!t) return;
    if (lineRef.current) lineRef.current.scrollTop = t.scrollTop;
    if (hlRef.current) { hlRef.current.scrollTop = t.scrollTop; hlRef.current.scrollLeft = t.scrollLeft; }
  };

  const highlighted = useMemo(() => highlight(source), [source]);

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] text-[#cccccc]">
      <div className="flex min-h-0 flex-1">
        {/* Activity bar */}
        <div className="flex w-12 shrink-0 flex-col items-center justify-between bg-[#333333] py-1">
          <div className="flex flex-col">
            <ActivityBtn active label="Explorer"><FilesIcon size={22} /></ActivityBtn>
            <ActivityBtn label="Search"><MagnifyingGlass size={22} /></ActivityBtn>
            <ActivityBtn label="Source Control"><GitMerge size={22} /></ActivityBtn>
            <ActivityBtn label="Run" onClick={run}><Play size={22} /></ActivityBtn>
          </div>
          <div className="flex flex-col">
            <ActivityBtn label="Accounts"><Circle size={22} weight="fill" /></ActivityBtn>
            <ActivityBtn label="Manage"><GearIcon size={22} /></ActivityBtn>
          </div>
        </div>

        {/* Explorer */}
        <div className="flex w-52 shrink-0 flex-col bg-[#252526] text-[13px]">
          <div className="flex items-center justify-between px-4 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#858585]">Explorer</p>
            <button
              onClick={newFile}
              aria-label="New file"
              className="rounded p-0.5 text-[#858585] hover:bg-[#3a3a3a] hover:text-white"
            >
              <FilePlus size={15} />
            </button>
          </div>
          <div className="min-h-0 flex-1 px-2">
            <p className="flex items-center gap-1 px-2 py-1 font-semibold text-[#cccccc]">▾ DIWAKAR-OS</p>
            <div className="os-scroll overflow-y-auto">
              {myFiles.map((f) => (
                <div
                  key={f.id}
                  className={`group flex w-full items-center gap-1.5 rounded px-2 py-[3px] ${
                    tab === f.id ? "bg-[#37373d] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
                  }`}
                >
                  {renamingId === f.id ? (
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="min-w-0 flex-1 rounded bg-[#3c3c3c] px-1 text-[13px] text-white outline-none ring-1 ring-[#007acc]"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => openFile(f.id)}
                        onDoubleClick={() => { setRenamingId(f.id); setNameDraft(f.name); }}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                      >
                        <span className="text-[#519aba]">{isRunnable(f.name) ? "JS" : "TX"}</span>
                        <span className="truncate">{f.name}</span>
                      </button>
                      <button
                        onClick={() => deleteFile(f.id)}
                        aria-label={`Delete ${f.name}`}
                        className="hidden shrink-0 rounded p-0.5 text-[#858585] hover:bg-[#4a4a4a] hover:text-white group-hover:block"
                      >
                        <Trash size={13} />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {myFiles.length === 0 && (
                <p className="px-2 py-2 text-[12px] text-[#6e6e6e]">
                  No files yet. Use the + above, or right-click the desktop.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Editor column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Tab strip */}
          <div className="flex shrink-0 overflow-x-auto bg-[#252526] text-[12.5px]">
            {openTabs.filter((id) => items[id]).map((id) => (
              <button
                key={id}
                onClick={() => { setTab(id); setOutput(null); }}
                className={`group flex items-center gap-1.5 border-t-2 px-3 py-1.5 ${
                  tab === id
                    ? "border-t-[#007acc] bg-[#1e1e1e] text-white"
                    : "border-t-transparent bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a]"
                }`}
              >
                <span className="text-[#519aba]">{isRunnable(items[id].name) ? "JS" : "TX"}</span>
                <span className="max-w-32 truncate">{items[id].name}</span>
                <span
                  role="button"
                  aria-label={`Close ${items[id].name}`}
                  onClick={(e) => closeTab(id, e)}
                  className="rounded p-0.5 opacity-0 hover:bg-[#4a4a4a] group-hover:opacity-100"
                >
                  <X size={11} />
                </span>
              </button>
            ))}
          </div>

          {/* Editor */}
          {tab === "welcome" || !item ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[#858585]">
              <p className="text-[22px] font-light text-[#5a5a5a]">diwakar-os</p>
              <p className="text-[12.5px]">Create a file to start coding</p>
              <button
                onClick={newFile}
                className="mt-1 rounded bg-[#007acc] px-3 py-1.5 text-[12.5px] text-white hover:bg-[#1a8ad4]"
              >
                New File
              </button>
            </div>
          ) : (
            <>
              <div className="relative min-h-0 flex-1">
                {/* Line numbers */}
                <pre
                  ref={lineRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-12 select-none overflow-hidden border-r border-[#2b2b2b] bg-[#1e1e1e] px-2 py-4 text-right font-mono text-[13px] leading-[1.55] text-[#6e7681]"
                >
                  {Array.from({ length: lines }, (_, i) => i + 1).join("\n")}
                </pre>
                {/* Highlight layer: sits under the transparent textarea. */}
                <pre
                  ref={hlRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words py-4 pl-14 pr-4 font-mono text-[13px] leading-[1.55] text-[#d4d4d4] [&_.tk-c]:text-[#6a9955] [&_.tk-k]:text-[#569cd6] [&_.tk-n]:text-[#b5cea8] [&_.tk-s]:text-[#ce9178]"
                  dangerouslySetInnerHTML={{ __html: highlighted + "\n" }}
                />
                {/* Editing surface: transparent text over the highlight layer. */}
                <textarea
                  ref={editRef}
                  value={source}
                  onChange={(e) => setContent(tab, e.target.value)}
                  onScroll={syncScroll}
                  className="os-scroll absolute inset-0 resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent py-4 pl-14 pr-4 font-mono text-[13px] leading-[1.55] text-transparent caret-[#aeafad] outline-none selection:bg-[#264f78]"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label={`Editing ${item.name}`}
                />
              </div>

              {/* Output panel */}
              {output !== null && (
                <div className="flex h-40 shrink-0 flex-col border-t border-[#2b2b2b] bg-[#1a1a1a]">
                  <div className="flex items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#858585]">
                    <span>Output</span>
                    <button
                      onClick={() => setOutput(null)}
                      aria-label="Close output"
                      className="rounded p-0.5 hover:bg-[#3a3a3a] hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <div className="os-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-2 font-mono text-[12.5px] leading-[1.5] text-[#d4d4d4]">
                    {output.map((line, i) => (
                      <p key={i} className={line.startsWith("✕") ? "text-[#f48771]" : line.startsWith("⚠") ? "text-[#e8c07d]" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
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
          {item && isRunnable(item.name) && (
            <button onClick={run} className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-white/15" aria-label="Run file">
              <Play size={12} weight="fill" /> Run
            </button>
          )}
          <span>Ln {lines}, Col 1</span>
          <span>UTF-8</span>
          <span>{item ? languageOf(item.name) : "Plain Text"}</span>
          <Bell size={13} />
        </div>
      </div>
    </div>
  );
}
