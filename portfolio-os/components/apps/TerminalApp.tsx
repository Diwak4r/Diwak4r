"use client";

import { useEffect, useRef, useState } from "react";
import { profile, projects, skillGroups, socials } from "@/lib/content";
import { APPS } from "@/lib/apps";
import { useWindows, type AppId } from "@/lib/store";
import { TONES, useSystem, type ToneId } from "@/lib/system";

const PROMPT = "diwakar@portfolio ~ %";

const OPENABLE = APPS.map((a) => a.id);

type Line = { kind: "in" | "out"; text: string };

const BANNER: Line[] = [
  { kind: "out", text: "DiwakarOS Terminal" },
  { kind: "out", text: "Type 'help' to see available commands." },
];

/** Commands that would wreck a real machine. Here they just get you roasted. */
const RISKY: RegExp[] = [
  /\brm\s+(-[a-z]*[rf][a-z]*\s+)+/i, // rm -rf and friends
  /\bsudo\s+rm\b/i,
  /\bmkfs(\.\w+)?\b/i,
  /\bdd\s+if=/i,
  /:\(\)\s*\{\s*:\|:&\s*\};:/, // fork bomb
  /\bchmod\s+(-r\s+)?777\s+\//i,
  /\bchown\s+-r\b.*\s\//i,
  /\bmv\s+\/\S*\s+\/dev\/null\b/i,
  />\s*\/dev\/sd[a-z]\b/i,
  /\bformat\s+c:/i,
  /\bdel\s+\/[fsq]/i,
  /\bkill\s+-9\s+1\b/,
  /\bshutdown\b|\breboot\b|\bhalt\b/i,
  /\b(curl|wget)\b.*\|\s*(ba)?sh\b/i,
];

const ROASTS = [
  "bro really typed that on a PORTFOLIO site 💀 the audacity is unmatched",
  "nah that command is giving villain era. blocked and reported to your mom.",
  "you did NOT just try to nuke my desktop 😭 go touch grass bestie",
  "that's a whole crash-out. this ain't your homework folder, chill.",
  "caught in 4k trying to delete everything. sir this is a Wendy's.",
  "the rizz is zero and the permissions are zero-er. denied.",
  "lowkey wild of you. my filesystem said 'ain't no way' fr fr",
  "skill issue detected: this OS is unkillable, no cap.",
];

const HELP = [
  "about            who I am",
  "projects         what I've built",
  "skills           what I work with",
  "social           where to find me",
  "contact          how to reach me",
  "whoami           short answer",
  `open <app>       open a window (${OPENABLE.join(", ")})`,
  "theme <color>    change the accent (blue, purple, pink, red, orange, yellow, green, graphite)",
  "wifi <on|off>    toggle the connection",
  "neofetch         system info",
  "ls, pwd, echo, date, clear (or cls), exit",
  "…the shell also answers to git, npm, python, vim, ipconfig, ollama, ai. try your luck",
];

/** Chatty one-offs: dev-culture commands that answer with personality. */
const CHATTY: Record<string, string[]> = {
  "git status": [
    "On branch main. Working tree clean.",
    "…clean?! screenshot this, it never happens.",
  ],
  "git push": [
    "Pushed to origin/main.",
    "CI is watching. no force pushes on a Friday, we agreed.",
  ],
  "git pull": ["Already up to date. (a miracle, honestly)"],
  "git commit": ["[main 1a2b3c4] 'final fix v2 REAL final (2)'", "we've all been there."],
  "git blame": ["fatal: it was you. it's always you."],
  "git clone": ["Cloning into 'another-side-project-you-will-never-finish'... done."],
  "git": ["usage: git <something>. try 'git status', 'git push', or 'git blame'."],
  "npm install": [
    "added 1,247 packages in 4s",
    "node_modules now weighs more than the wallpaper. classic.",
  ],
  "npm run dev": ["> ready on http://localhost:3000", "wait. you're already here."],
  "npx": ["npx: downloading half the internet to run one command... done."],
  "python": ["Python 3.13.0 (portfolio build)", ">>> import success", ">>> # nice."],
  "node": ["Welcome to Node.js.", "> 0.1 + 0.2", "0.30000000000000004", "> still not fixed."],
  "vim": ["you are now trapped in vim.", "there is no escape. (jk, this terminal is a web page)"],
  "nano": ["real ones use nano and we respect it."],
  "ai": ["you're literally talking to a website built with AI. it's AI all the way down."],
  "gpt": ["ChatGPT is in the dock. tell it Diwakar sent you."],
  "claude code": ["the tool that built this entire desktop. run 'claude' for the lore."],
  "ollama run": ["pulling llama3:70b over Kathmandu hotel wifi...", "ETA: 2027. maybe grab a coffee."],
  "ollama": ["ollama is not installed here, but the vibes are local-first."],
  "dir": ["this is a mac (kind of). try 'ls'. same thing, more expensive."],
  "ipconfig": ["Wireless LAN adapter Wi-Fi:", "  IPv4 Address: 192.168.1.portfolio", "  Vibes: immaculate"],
  "ping": ["Reply from diwakaryadav.com.np: bytes=32 time=1ms TTL=∞", "pong. we good."],
  "tasklist": ["Image Name: creativity.exe   PID: 1   Mem Usage: 100%"],
  "systeminfo": ["try 'neofetch'. same thing, but with drip."],
  "winget install": ["this desktop ships feature-complete. nothing left to install."],
  "notepad": ["opening Notes... (the mac way)"],
  "explorer": ["Finder would like a word. try 'open projects'."],
};

export default function TerminalApp() {
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const openApp = useWindows((s) => s.openApp);
  const closeApp = useWindows((s) => s.closeApp);
  const setTone = useSystem((s) => s.setTone);
  const setWifi = useSystem((s) => s.setWifi);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [lines]);

  const out = (...texts: string[]): Line[] => texts.map((text) => ({ kind: "out", text }));

  const run = (raw: string): Line[] => {
    const trimmed = raw.trim();
    const cmd = trimmed.split(/\s+/)[0]?.toLowerCase() ?? "";
    const rest = trimmed.slice(cmd.length).trim();

    // Dangerous commands get a roast instead of an execution.
    if (RISKY.some((r) => r.test(trimmed))) {
      const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
      return out(roast, "(nothing was harmed. this desktop is indestructible.)");
    }

    // Chatty commands: longest matching prefix wins ("git status" over "git").
    const lower = trimmed.toLowerCase();
    const chattyKey = Object.keys(CHATTY)
      .filter((k) => lower === k || lower.startsWith(k + " "))
      .sort((a, b) => b.length - a.length)[0];
    if (chattyKey) {
      // "notepad" also opens Notes for real, the mac way.
      if (chattyKey === "notepad") openApp("notes");
      return out(...CHATTY[chattyKey]);
    }

    switch (cmd) {
      case "help":
        return out(...HELP);
      case "whoami":
        return out(`${profile.name} · BIT student & AI implementer, ${profile.location}`);
      case "about":
        return out(profile.story[0], profile.story[1]);
      case "projects":
        return projects.map((p) => ({
          kind: "out" as const,
          text: `${p.name}${p.live ? " (live)" : ""}  ->  ${p.href}`,
        }));
      case "skills":
        return skillGroups.map((g) => ({
          kind: "out" as const,
          text: `${g.group}: ${g.items.join(", ")}`,
        }));
      case "social":
        return [
          ...socials.map((s) => ({ kind: "out" as const, text: `${s.label}  ->  ${s.href}` })),
          { kind: "out" as const, text: `Email  ->  ${profile.email}` },
        ];
      case "contact":
        return out(`Email: ${profile.email}`, "Run 'open contact' to compose a message.");
      case "open": {
        const id = rest as AppId;
        if (OPENABLE.includes(id)) {
          openApp(id);
          return out(`Opening ${id}...`);
        }
        return out(`Unknown app '${rest}'. Apps: ${OPENABLE.join(", ")}`);
      }
      case "theme": {
        const tone = rest as ToneId;
        if (TONES.some((t) => t.id === tone)) {
          setTone(tone);
          return out(`Accent changed to ${tone}.`);
        }
        return out(`Unknown tone '${rest}'. Tones: ${TONES.map((t) => t.id).join(", ")}`);
      }
      case "wifi":
        if (rest === "off") {
          setWifi(false);
          return out("Wi-Fi turned off. Good luck out there.");
        }
        if (rest === "on") {
          setWifi(true);
          return out("Wi-Fi turned on.");
        }
        return out(`Wi-Fi is ${useSystem.getState().wifiOn ? "on" : "off"}. Usage: wifi <on|off>`);
      case "ls":
        return out(APPS.map((a) => `${a.name.replace(/\s+/g, "")}.app`).join("   "));
      case "pwd":
        return out("/Users/diwakar/Desktop");
      case "echo":
        return out(rest);
      case "date":
        return out(new Date().toString());
      case "neofetch":
        return out(
          "OS:        DiwakarOS 2.0 (web)",
          "Host:      diwakaryadav.com.np",
          "Shell:     dsh 1.0",
          `Accent:    ${useSystem.getState().tone}`,
          `Owner:     ${profile.name}`,
          `Location:  ${profile.location}`,
        );
      case "claude":
        return out(
          "Claude Code reporting for duty.",
          "This entire desktop was designed and built with Claude Code.",
          "Try 'open projects' to see more of what Diwakar ships with AI.",
        );
      case "sudo":
        return out("diwakar is not in the sudoers file. This incident will be reported.");
      case "exit":
        closeApp("terminal");
        return [];
      case "":
        return [];
      default:
        return out(`command not found: ${cmd}. Try 'help'.`);
    }
  };

  const submit = () => {
    const raw = input;
    setInput("");
    const cmd = raw.trim().toLowerCase();
    if (cmd === "clear" || cmd === "cls") {
      setLines([]);
      return;
    }
    setLines((prev) => [...prev, { kind: "in", text: raw }, ...run(raw)]);
  };

  return (
    <div
      className="flex min-h-full cursor-text flex-col bg-black/40 p-4 font-mono text-[12.5px] leading-relaxed"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 whitespace-pre-wrap break-words">
        {lines.map((line, i) =>
          line.kind === "in" ? (
            <p key={i}>
              <span className="text-accent-300">{PROMPT}</span>{" "}
              <span className="text-white/90">{line.text}</span>
            </p>
          ) : (
            <p key={i} className="text-white/60">
              {line.text}
            </p>
          ),
        )}
        <p className="flex">
          <span className="shrink-0 text-accent-300">{PROMPT}&nbsp;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="min-w-0 flex-1 bg-transparent text-white/90 caret-accent-400 outline-none"
            aria-label="Terminal input"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </p>
        <div ref={endRef} />
      </div>
    </div>
  );
}
