"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LinkSimple,
  MagnifyingGlass,
  Notebook,
  SquaresFour,
  UserCircle,
  type Icon,
} from "@phosphor-icons/react";
import { APPS } from "@/lib/apps";
import { useWindows } from "@/lib/store";
import { openLink } from "@/lib/system";
import { posts, projects, socials } from "@/lib/content";

interface Result {
  key: string;
  label: string;
  sub: string;
  icon: Icon;
  action: () => void;
}

export default function Spotlight({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const openApp = useWindows((s) => s.openApp);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const hit = (...fields: string[]) =>
      q === "" || fields.some((f) => f.toLowerCase().includes(q));

    const apps: Result[] = APPS.filter((a) => hit(a.name)).map((a) => ({
      key: `app-${a.id}`,
      label: a.name,
      sub: "Application",
      icon: a.icon ?? UserCircle,
      action: () => openApp(a.id),
    }));

    // Content only surfaces once the visitor starts typing.
    if (q === "") return apps;

    const projectHits: Result[] = projects
      .filter((p) => hit(p.name, p.description, p.tags.join(" ")))
      .map((p) => ({
        key: `project-${p.name}`,
        label: p.name,
        sub: "Project",
        icon: SquaresFour,
        action: () => openLink(p.href),
      }));

    const postHits: Result[] = posts
      .filter((p) => hit(p.title, p.category))
      .map((p) => ({
        key: `post-${p.title}`,
        label: p.title,
        sub: "Journal",
        icon: Notebook,
        action: () => openLink(p.href),
      }));

    const linkHits: Result[] = socials
      .filter((s) => hit(s.label))
      .map((s) => ({
        key: `link-${s.label}`,
        label: s.label,
        sub: "Link",
        icon: LinkSimple,
        action: () => openLink(s.href),
      }));

    return [...apps, ...projectHits, ...postHits, ...linkHits];
  }, [query, openApp]);

  // Reset state each time Spotlight opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setSel(0), [query]);

  const activate = (r: Result | undefined) => {
    if (!r) return;
    r.action();
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      activate(results[sel]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[54]" onClick={onClose} aria-hidden />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.98, x: "-50%", transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="bar-chrome fixed left-1/2 top-[16%] z-[55] w-[560px] max-w-[92vw] overflow-hidden rounded-xl border border-white/[0.12] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            role="dialog"
            aria-label="Spotlight search"
          >
            <div className="flex items-center gap-2.5 px-4">
              <MagnifyingGlass size={19} className="shrink-0 text-white/50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Spotlight Search"
                className="min-w-0 flex-1 bg-transparent py-3.5 text-[16px] text-white/90 outline-none placeholder:text-white/35"
                aria-label="Search apps, projects, and posts"
              />
            </div>

            {results.length > 0 ? (
              <div className="os-scroll max-h-[320px] overflow-y-auto border-t border-white/[0.08] py-1.5">
                {results.map((r, i) => (
                  <button
                    key={r.key}
                    onClick={() => activate(r)}
                    onMouseEnter={() => setSel(i)}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-[7px] text-left text-[13px] ${
                      i === sel
                        ? "bg-(--accent-btn) text-(--accent-contrast)"
                        : "text-white/80"
                    }`}
                  >
                    <r.icon size={16} weight="fill" className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{r.label}</span>
                    <span className={i === sel ? "opacity-70" : "text-white/35"}>
                      {r.sub}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="border-t border-white/[0.08] px-4 py-3 text-[13px] text-white/40">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
