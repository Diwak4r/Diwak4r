"use client";

import { useState, useRef, useEffect } from "react";
import { PaperPlaneTilt, Smiley, UserCircle } from "@phosphor-icons/react";
import { useWindows } from "@/lib/store";

const BOT: Record<string, string[]> = {
  hi: ["Hey! I'm Diwakar. What brings you here? 👋"],
  hey: ["Hey! I'm Diwakar. What brings you here? 👋"],
  hello: ["Hey! I'm Diwakar. What brings you here? 👋"],
  projects: ["I've built Nepal AI Gateway (LLM proxy for Nepal), Pryzmira (AI writing voice), Police Exam Prep, and this desktop! Check 'em under Projects in the dock."],
  work: ["I've built Nepal AI Gateway (LLM proxy for Nepal), Pryzmira (AI writing voice), Police Exam Prep, and this desktop! Check 'em under Projects in the dock."],
  hire: ["Want to work together? The best way is email: diwak4r.comp@gmail.com. I'm open to AI roles — Nepal companies first, then remote."],
  job: ["Want to work together? The best way is email: diwak4r.comp@gmail.com. I'm open to AI roles — Nepal companies first, then remote."],
  social: ["GitHub: @Diwak4r, LinkedIn: /in/diwak4r/, X: @Norwakar, Instagram: @diwak4r. I'm everywhere."],
  socials: ["GitHub: @Diwak4r, LinkedIn: /in/diwak4r/, X: @Norwakar, Instagram: @diwak4r. I'm everywhere."],
  skills: ["AI & LLMs, prompt engineering, browser agents, Claude Code, workflow design, HTML/CSS/JS, C/C++/Java, prototyping, SEO/AEO. All practical — I learn by shipping."],
  about: ["BIT student in Kathmandu, AI Growth Strategist at The Mindsnack, building AI infrastructure for people the industry skips. Built this whole desktop with Claude Code."],
  who: ["BIT student in Kathmandu, AI Growth Strategist at The Mindsnack, building AI infrastructure for people the industry skips. Built this whole desktop with Claude Code."],
  thanks: ["Anytime! ✌️"],
  ok: ["👌"],
  bye: ["Later! ✌️ If you want to reach me for real, the email button is right there →"],
};

const chips = ["projects", "hire", "socials", "skills", "about"];

function reply(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, replies] of Object.entries(BOT)) {
    if (lower.includes(key)) return replies[Math.floor(Math.random() * replies.length)];
  }
  return "👋 Try asking about projects, hiring, skills, socials, or who I am!";
}

export default function WhatsAppApp() {
  const [msgs, setMsgs] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hey! This is Diwakar. Ask me anything about my work, socials, or skills. I'm a bot, but the real me is one email away. 👇" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const openApp = useWindows(s => s.openApp);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs(p => [...p, { from: "user", text }]);
    setInput("");
    setTimeout(() => setMsgs(p => [...p, { from: "bot", text: reply(text) }]), 400 + Math.random() * 400);
  };

  return (
    <div className="flex h-full flex-col bg-[#111b21] text-white">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.04] bg-[#202c33] px-3">
        <UserCircle size={38} weight="fill" className="text-[#25d366]" />
        <div>
          <p className="text-[14.5px] font-medium">Diwakar Yadav</p>
          <p className="text-[11px] text-[#8696a0]">online</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="os-scroll min-h-0 flex-1 overflow-y-auto p-3"
        style={{
          backgroundColor: "#0b141a",
          backgroundImage:
            "radial-gradient(circle at 18px 18px, rgba(255,255,255,0.025) 1.5px, transparent 1.6px), radial-gradient(circle at 54px 46px, rgba(37,211,102,0.03) 1px, transparent 1.2px)",
          backgroundSize: "72px 72px",
        }}
      >
        <div className="space-y-1.5">
          <p className="mb-2 rounded-lg bg-[#182229] px-3 py-1.5 text-center text-[11px] text-white/40">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-1.5 text-[13px] leading-relaxed ${m.from === "user" ? "bg-[#005c4b]" : "bg-[#202c33]"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        {/* Quick reply chips */}
        {msgs.length === 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map(c => (
              <button key={c} onClick={() => send(c)} className="rounded-full bg-[#025144] px-2.5 py-1 text-[11.5px] text-[#e9edef] transition-colors hover:bg-[#025c4b]">{c}</button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="flex shrink-0 items-center gap-1.5 bg-[#202c33] px-2.5 py-2">
        <Smiley size={22} className="shrink-0 text-white/50" />
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Message" className="min-w-0 flex-1 rounded-full bg-[#2a3942] px-3 py-2 text-[13.5px] text-white outline-none placeholder:text-[#8696a0]" />
        {input.trim() ? (
          <button onClick={() => send(input)} className="shrink-0 rounded-full p-1.5 text-[#25d366]"><PaperPlaneTilt size={22} weight="fill" /></button>
        ) : (
          <button onClick={() => openApp("contact")} title="Email Diwakar" className="shrink-0 rounded-full bg-[#25d366] px-3 py-1.5 text-[12px] font-semibold text-black">Email</button>
        )}
      </div>
    </div>
  );
}
