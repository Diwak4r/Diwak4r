import { create } from "zustand";

/** User-created desktop items: folders and text files, persisted locally. */
export interface DeskItem {
  id: string;
  kind: "folder" | "file";
  name: string;
  /** null = sits on the desktop; otherwise the parent folder's id */
  parentId: string | null;
  /** Text files only */
  content?: string;
  /** Desktop position (desktop-level items only) */
  pos?: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
}

const STORE_KEY = "dios-files";

const load = (): Record<string, DeskItem> => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DeskItem>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const save = (items: Record<string, DeskItem>) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: the desktop still works, it just won't persist.
  }
};

/** "untitled folder", "untitled folder 2", … the macOS way. */
function nextName(items: Record<string, DeskItem>, kind: DeskItem["kind"], parentId: string | null): string {
  const base = kind === "folder" ? "untitled folder" : "untitled.txt";
  const siblings = new Set(
    Object.values(items)
      .filter((i) => i.parentId === parentId)
      .map((i) => i.name),
  );
  if (!siblings.has(base)) return base;
  for (let n = 2; ; n++) {
    const name = kind === "folder" ? `${base} ${n}` : `untitled ${n}.txt`;
    if (!siblings.has(name)) return name;
  }
}

/** A fresh desktop spot that doesn't sit on an existing item. */
function nextPos(items: Record<string, DeskItem>): { x: number; y: number } {
  const taken = Object.values(items).filter((i) => i.parentId === null && i.pos);
  const col = taken.length % 6;
  const row = Math.floor(taken.length / 6) % 4;
  return { x: 140 + col * 100, y: 90 + row * 110 };
}

interface FilesStore {
  items: Record<string, DeskItem>;
  hydrated: boolean;
  hydrate: () => void;
  create: (kind: DeskItem["kind"], parentId: string | null, pos?: { x: number; y: number }) => string;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => string;
  setPos: (id: string, pos: { x: number; y: number }) => void;
  setContent: (id: string, content: string) => void;
}

let seq = 0;

export const useFiles = create<FilesStore>((set, get) => ({
  items: {},
  hydrated: false,

  hydrate: () => set({ items: load(), hydrated: true }),

  create: (kind, parentId, pos) => {
    const items = { ...get().items };
    const id = `${kind}-${Date.now()}-${++seq}`;
    const now = Date.now();
    items[id] = {
      id,
      kind,
      name: nextName(items, kind, parentId),
      parentId,
      ...(kind === "file" ? { content: "" } : {}),
      ...(parentId === null ? { pos: pos ?? nextPos(items) } : {}),
      createdAt: now,
      updatedAt: now,
    };
    save(items);
    set({ items });
    return id;
  },

  rename: (id, name) =>
    set((s) => {
      const trimmed = name.trim();
      if (!trimmed || !s.items[id]) return s;
      const items = { ...s.items, [id]: { ...s.items[id], name: trimmed, updatedAt: Date.now() } };
      save(items);
      return { items };
    }),

  remove: (id) =>
    set((s) => {
      const items = { ...s.items };
      // Folders take their contents with them.
      const doomed = [id];
      while (doomed.length) {
        const cur = doomed.pop()!;
        for (const it of Object.values(items)) {
          if (it.parentId === cur) doomed.push(it.id);
        }
        delete items[cur];
      }
      save(items);
      return { items };
    }),

  duplicate: (id) => {
    const src = get().items[id];
    if (!src) return "";
    const items = { ...get().items };
    const copyId = `${src.kind}-${Date.now()}-${++seq}`;
    const now = Date.now();
    const dot = src.kind === "file" ? src.name.lastIndexOf(".") : -1;
    const copyName =
      dot > 0 ? `${src.name.slice(0, dot)} copy${src.name.slice(dot)}` : `${src.name} copy`;
    items[copyId] = {
      ...src,
      id: copyId,
      name: copyName,
      ...(src.pos ? { pos: { x: src.pos.x + 30, y: src.pos.y + 30 } } : {}),
      createdAt: now,
      updatedAt: now,
    };
    save(items);
    set({ items });
    return copyId;
  },

  setPos: (id, pos) =>
    set((s) => {
      if (!s.items[id]) return s;
      const items = { ...s.items, [id]: { ...s.items[id], pos } };
      save(items);
      return { items };
    }),

  setContent: (id, content) =>
    set((s) => {
      if (!s.items[id]) return s;
      const items = { ...s.items, [id]: { ...s.items[id], content, updatedAt: Date.now() } };
      save(items);
      return { items };
    }),
}));

/** Children of a folder (or the desktop when parentId is null), folders first. */
export function childrenOf(items: Record<string, DeskItem>, parentId: string | null): DeskItem[] {
  return Object.values(items)
    .filter((i) => i.parentId === parentId)
    .sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "folder" ? -1 : 1));
}

export function sizeOf(items: Record<string, DeskItem>, item: DeskItem): string {
  if (item.kind === "file") {
    const bytes = new Blob([item.content ?? ""]).size;
    return bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`;
  }
  const n = Object.values(items).filter((i) => i.parentId === item.id).length;
  return `${n} item${n === 1 ? "" : "s"}`;
}
