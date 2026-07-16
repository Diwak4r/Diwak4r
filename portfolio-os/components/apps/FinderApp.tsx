"use client";

import { useEffect, useState } from "react";
import { CaretLeft, FileText, Folder, House, Image, MusicNotes, ProjectorScreen, SquaresFour, GridFour, List } from "@phosphor-icons/react";
import { childrenOf, useFiles, type DeskItem } from "@/lib/files";
import { openLink } from "@/lib/system";
import { useWindows } from "@/lib/store";
import { WALLPAPERS } from "@/lib/system";
import { projects } from "@/lib/content";
import ContextMenu, { type MenuEntry, type MenuPosition } from "../ContextMenu";

interface FinderRoute {
  label: string; icon: typeof House; parentId: string | null;
}

const sidebar: FinderRoute[] = [
  { label: "Desktop", icon: House, parentId: null },
  { label: "Documents", icon: FileText, parentId: "documents" },
  { label: "Projects", icon: SquaresFour, parentId: "projects" },
  { label: "Pictures", icon: Image, parentId: "pictures" },
  { label: "Music", icon: MusicNotes, parentId: "music" },
];

export default function FinderApp({ path }: { path?: string }) {
  const items = useFiles((s) => s.items);
  const hydrate = useFiles((s) => s.hydrate);
  const remove = useFiles((s) => s.remove);
  const duplicate = useFiles((s) => s.duplicate);
  const openApp = useWindows((s) => s.openApp);
  const newAppWindow = useWindows((s) => s.newAppWindow);

  const [route, setRoute] = useState<string | null>(path ?? null);
  const [menu, setMenu] = useState<{ pos: MenuPosition; entries: MenuEntry[] } | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (path) setRoute(path); }, [path]);

  const isSpecial = route ? route === "documents" || route === "projects" || route === "pictures" || route === "music" : false;
  const folder = !isSpecial ? items[route ?? ""] : null;
  const title = folder?.name ?? sidebar.find(s => s.parentId === route)?.label ?? "Desktop";

  const ctxMenu = (item: DeskItem, client: { x: number; y: number }) => {
    const entries: MenuEntry[] = [
      {
        label: item.kind === "folder" ? "Open" : "Open in Code",
        action: () => { if (item.kind === "folder") setRoute(item.id); else openApp("code", { fileId: item.id }); },
      },
      ...(item.kind === "folder" ? [{ label: "Open in New Window", action: () => newAppWindow("finder", { path: item.id }) }] : []),
      { label: "Duplicate", action: () => duplicate(item.id), divider: true },
      { label: "Delete", danger: true, action: () => remove(item.id), divider: true },
    ];
    setMenu({ pos: { x: client.x, y: client.y }, entries });
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e22] text-white">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-white/[0.06] px-2.5 text-white/65">
        <button onClick={() => setRoute(null)} disabled={!route} className="rounded p-1 hover:bg-white/10 disabled:opacity-30"><CaretLeft size={14} weight="bold" /></button>
        <span className="flex-1 pl-2 text-[12.5px] font-medium text-white/80 truncate">{title}</span>
        <button onClick={() => setView("grid")} className={`rounded p-1.5 ${view === "grid" ? "bg-white/12" : "hover:bg-white/10"}`}><GridFour size={14} /></button>
        <button onClick={() => setView("list")} className={`rounded p-1.5 ${view === "list" ? "bg-white/12" : "hover:bg-white/10"}`}><List size={14} /></button>
      </div>

      <div className="flex min-h-0 flex-1">
        <nav className="w-40 shrink-0 border-r border-white/[0.04] p-2" aria-label="Finder sidebar">
          {sidebar.map((s) => (
            <button key={s.parentId ?? "desktop"} onClick={() => setRoute(s.parentId)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-[5px] text-[12.5px] transition-colors hover:bg-white/[0.06] ${(route ?? null) === s.parentId ? "bg-white/[0.08] text-white/90" : "text-white/60"}`}>
              <s.icon size={15} weight="fill" /><span className="truncate">{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="os-scroll min-h-0 flex-1 overflow-y-auto p-3">
          {route === "projects" ? (
            <div className="grid grid-cols-2 gap-2.5">
              {projects.map(p => (
                <button key={p.name} onClick={() => openLink(p.href)} className="flex flex-col items-center rounded-lg p-3 transition-colors hover:bg-white/[0.06]">
                  <ProjectorScreen size={28} weight="fill" className="text-[#f7a94b]" />
                  <span className="mt-1.5 text-[12px] text-white/80 text-center leading-tight">{p.name}</span>
                  {p.live && <span className="text-[10.5px] text-white/35">live</span>}
                </button>
              ))}
            </div>
          ) : route === "pictures" ? (
            <div className="grid grid-cols-2 gap-2.5">
              {WALLPAPERS.filter(w => w.image).map(w => (
                <button key={w.id} onClick={() => openApp("photos")} className="group overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.image} alt={w.label} className="block aspect-video w-full object-cover" loading="lazy" />
                  <span className="block px-2 py-1 text-[11.5px] text-white/70 group-hover:text-white">{w.label}</span>
                </button>
              ))}
            </div>
          ) : route === "music" ? (
            <div className="pt-8 text-center">
              <MusicNotes size={44} weight="fill" className="mx-auto mb-3 text-[#1ed760]" />
              <p className="text-[13px] text-white/60">Open Spotify to browse the playlist</p>
              <button onClick={() => openApp("spotify")} className="mt-3 rounded-lg bg-[#1ed760] px-4 py-1.5 text-[12.5px] font-semibold text-black transition hover:brightness-110">Open Spotify</button>
            </div>
          ) : (
            (() => {
              const kids = childrenOf(items, route);
              if (kids.length === 0) return <p className="mt-8 text-center text-[12.5px] text-white/35">{route === null ? "Desktop is empty. Right-click the desktop to create a folder or file." : "Empty folder."}</p>;
              return (
                <div className={view === "grid" ? "grid grid-cols-3 gap-3 @xl:grid-cols-4" : "space-y-px"}>
                  {kids.map((item) => (
                    <button key={item.id}
                      onClick={() => item.kind === "folder" ? setRoute(item.id) : openApp("code", { fileId: item.id })}
                      onDoubleClick={() => item.kind === "folder" && newAppWindow("finder", { path: item.id })}
                      onContextMenu={(e) => { e.preventDefault(); ctxMenu(item, { x: e.clientX, y: e.clientY }); }}
                      className={view === "grid"
                        ? "group flex flex-col items-center rounded-lg p-2.5 transition-colors hover:bg-white/[0.07]"
                        : "flex w-full items-center gap-3 rounded-md px-3 py-1.5 transition-colors hover:bg-white/[0.07]"}>
                      {item.kind === "folder"
                        ? <Folder size={view === "grid" ? 40 : 18} weight="fill" className="shrink-0 text-[#57a8f4]" />
                        : <FileText size={view === "grid" ? 40 : 18} className="shrink-0 text-white/70" />}
                      <span className={view === "grid" ? "mt-1.5 max-w-[80px] truncate text-[11.5px] text-white/80" : "text-[12.5px] text-white/80"}>{item.name}</span>
                    </button>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>
      {menu && <ContextMenu pos={menu.pos} entries={menu.entries} onClose={() => setMenu(null)} />}
    </div>
  );
}
