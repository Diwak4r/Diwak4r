"use client";

import { useState } from "react";
import { motion } from "motion/react";
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
import { education, experience, profile, projects, skillGroups, socials } from "@/lib/content";
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

/** A System Settings style group: a rounded inset panel of rows with inset
 *  separators, the way macOS lays out the About pane. */
function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section>
      {title && <h2 className="mb-1.5 px-1 text-[12px] font-semibold text-white/50">{title}</h2>}
      <div className="overflow-hidden rounded-[10px] bg-white/[0.045] [&>*+*]:border-t [&>*+*]:border-white/[0.07]">
        {children}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-3.5 py-2.5 text-[13px]">
      <span className="shrink-0 text-white/85">{label}</span>
      <span className="min-w-0 text-right text-white/55">{children}</span>
    </div>
  );
}

function Story() {
  const current = experience[0];
  const school = education[0];
  const flagship = projects.find((p) => p.flagship)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/diwakar-avatar.webp"
          alt="Portrait of Diwakar Ray Yadav"
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 rounded-2xl border border-white/10 object-cover object-top"
        />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-white">{profile.name}</h1>
          <p className="text-[13.5px] text-accent-300">{profile.role}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-white/55">
            <MapPin size={13} weight="fill" /> {profile.location}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {socials.map((s) => {
              const Icon = socialIcons[s.label];
              return (
                <button
                  key={s.label}
                  onClick={() => openLink(s.href)}
                  aria-label={s.label}
                  className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <Icon size={16} weight="fill" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="max-w-prose text-[15px] leading-relaxed text-white/85">{profile.intro}</p>

      <Group title="Now">
        <Row label="Working">
          {current.role}, {current.org}
        </Row>
        <Row label="Studying">{school.degree}</Row>
        <Row label="Building">
          <button
            onClick={() => openLink(flagship.href, flagship.name)}
            className="text-accent-300 transition-colors hover:text-accent-200"
          >
            {flagship.name}
          </button>
        </Row>
        <Row label="Exploring">{profile.exploring.join(", ")}</Row>
      </Group>

      <div className="max-w-prose space-y-3 text-[13.5px] leading-relaxed text-white/70">
        {profile.story.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
    </div>
  );
}

function Experience() {
  return (
    <div className="space-y-6">
      <Group title="Work">
        {experience.map((job) => (
          <div key={job.role} className="px-3.5 py-3">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[13.5px] font-semibold text-white/90">{job.role}</h3>
              <span className="shrink-0 text-[12px] tabular-nums text-white/45">{job.period}</span>
            </div>
            <p className="text-[12.5px] text-accent-300">{job.org}</p>
            <p className="mt-1 max-w-prose text-[12.5px] leading-relaxed text-white/60">{job.detail}</p>
          </div>
        ))}
      </Group>

      <Group title="Education">
        {education.map((e) => (
          <div key={e.degree} className="px-3.5 py-3">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[13.5px] font-medium text-white/90">{e.degree}</h3>
              <span className="shrink-0 text-[12px] tabular-nums text-white/45">{e.period}</span>
            </div>
            <p className="text-[12.5px] text-white/55">{e.school}</p>
          </div>
        ))}
      </Group>
    </div>
  );
}

function Skills() {
  return (
    <div className="space-y-5">
      {skillGroups.map((g) => (
        <Group key={g.group} title={g.group}>
          <p className="px-3.5 py-2.5 text-[13px] leading-relaxed text-white/75">
            {g.items.join(" · ")}
          </p>
        </Group>
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
          {/* Slide only, never fade from 0: the content is visible even if
              the animation never runs. */}
          <motion.div
            key={tab}
            initial={{ y: 6 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            {tab === "story" && <Story />}
            {tab === "experience" && <Experience />}
            {tab === "skills" && <Skills />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
