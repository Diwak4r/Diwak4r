"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Briefcase,
  Cpu,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  UserCircle,
  XLogo,
} from "@phosphor-icons/react";
import { education, experience, profile, skillGroups, socials } from "@/lib/content";
import { openLink } from "@/lib/system";

const TABS = [
  { id: "story", label: "Story", icon: UserCircle },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Cpu },
] as const;

type TabId = (typeof TABS)[number]["id"];

const socialIcons = {
  GitHub: GithubLogo,
  LinkedIn: LinkedinLogo,
  X: XLogo,
  Instagram: InstagramLogo,
} as const;

function Story() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/diwakar-portrait.jpg"
          alt="Portrait of Diwakar Ray Yadav"
          className="h-24 w-24 shrink-0 rounded-2xl border border-white/10 object-cover object-top"
        />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            {profile.name}
          </h1>
          <p className="text-[13.5px] text-accent-300">{profile.role}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-white/55">
            <MapPin size={13} weight="fill" /> {profile.location}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {socials.map((s) => {
          const Icon = socialIcons[s.label];
          return (
            <button
              key={s.label}
              onClick={() => openLink(s.href)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.04] px-2.5 py-1.5 text-[12.5px] text-white/75 transition-colors hover:bg-white/[0.09] hover:text-white"
            >
              <Icon size={14} weight="fill" /> {s.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-prose space-y-3 text-[13.5px] leading-relaxed text-white/70">
        {profile.story.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <div>
        <h2 className="mb-2 text-[12.5px] font-semibold text-white/55">
          Currently exploring
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {profile.exploring.map((item) => (
            <span
              key={item}
              className="rounded-full border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-[12px] text-accent-200"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid max-w-sm grid-cols-2 gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/diwakar-casual-300.webp"
          alt="Diwakar, casual"
          className="aspect-square w-full rounded-xl border border-white/10 object-cover"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/diwakar-new-300.webp"
          alt="Diwakar"
          className="aspect-square w-full rounded-xl border border-white/10 object-cover"
        />
      </div>
    </div>
  );
}

function Experience() {
  return (
    <div className="space-y-8">
      <div className="space-y-6 border-l border-white/10 pl-4">
        {experience.map((job) => (
          <div key={job.role}>
            <h2 className="text-[14px] font-semibold text-white/90">{job.role}</h2>
            <p className="text-[13px] text-accent-300">{job.org}</p>
            <p className="mt-0.5 text-[12px] text-white/45">{job.period}</p>
            <p className="mt-1.5 max-w-prose text-[13px] leading-relaxed text-white/65">
              {job.detail}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-[12.5px] font-semibold text-white/55">Education</h2>
        <div className="space-y-4 border-l border-white/10 pl-4">
          {education.map((e) => (
            <div key={e.degree}>
              <h3 className="text-[13.5px] font-medium text-white/85">{e.degree}</h3>
              <p className="text-[12.5px] text-white/55">{e.school}</p>
              <p className="mt-0.5 text-[12px] text-white/45">{e.period}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Skills() {
  return (
    <div className="space-y-5">
      {skillGroups.map((g) => (
        <div key={g.group}>
          <h2 className="mb-2 text-[12.5px] font-semibold text-white/55">{g.group}</h2>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map((item) => (
              <span
                key={item}
                className="rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 text-[12px] text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutApp() {
  const [tab, setTab] = useState<TabId>("story");

  return (
    <div className="@container min-h-full">
      <div className="flex min-h-full flex-col @2xl:flex-row">
        {/* Sidebar on wide windows, segmented tabs otherwise */}
        <nav
          className="flex gap-1 border-b border-white/[0.06] p-2.5 @2xl:sticky @2xl:top-0 @2xl:w-44 @2xl:shrink-0 @2xl:flex-col @2xl:self-start @2xl:border-b-0 @2xl:p-3"
          aria-label="About sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors @2xl:flex-none @2xl:justify-start ${
                tab === id
                  ? "bg-accent-500/15 text-accent-200"
                  : "text-white/60 hover:bg-white/[0.06] hover:text-white/85"
              }`}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon size={16} weight={tab === id ? "fill" : "regular"} />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 p-5 @2xl:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {tab === "story" && <Story />}
              {tab === "experience" && <Experience />}
              {tab === "skills" && <Skills />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
