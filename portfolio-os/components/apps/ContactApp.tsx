"use client";

import {
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  PaperPlaneTilt,
  XLogo,
} from "@phosphor-icons/react";
import { profile, socials } from "@/lib/content";
import { openLink } from "@/lib/system";

const socialIcons = {
  GitHub: GithubLogo,
  LinkedIn: LinkedinLogo,
  X: XLogo,
  Instagram: InstagramLogo,
} as const;

const fieldRow = "flex items-center gap-3 py-2.5";
const fieldLabel = "w-16 shrink-0 text-[13px] text-white/55";
const fieldInput =
  "min-w-0 flex-1 bg-transparent text-[13.5px] text-white/90 outline-none placeholder:text-white/30";

/**
 * Mail-compose style contact window. Posts to the same formsubmit.co
 * endpoint as the previous site, with identical field names and settings,
 * so the existing email pipeline keeps working untouched.
 */
export default function ContactApp() {
  return (
    <form
      action="https://formsubmit.co/diwak4r.comp@gmail.com"
      method="POST"
      className="flex min-h-full flex-col"
    >
      <input type="hidden" name="_captcha" value="true" />
      <input type="hidden" name="_subject" value="New Contact Form Submission - Portfolio" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_next" value="https://diwakaryadav.com.np/thank-you/" />
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="divide-y divide-white/[0.07] px-5 pt-1.5">
        <div className={fieldRow}>
          <span className={fieldLabel}>To</span>
          <span className="rounded-full border border-accent-500/25 bg-accent-500/15 px-2.5 py-0.5 text-[12.5px] text-accent-200">
            {profile.name}
          </span>
        </div>

        <div className={fieldRow}>
          <label htmlFor="contact-name" className={fieldLabel}>
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className={fieldInput}
          />
        </div>

        <div className={fieldRow}>
          <label htmlFor="contact-email" className={fieldLabel}>
            From
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={fieldInput}
          />
        </div>

        <div className={fieldRow}>
          <label htmlFor="contact-purpose" className={fieldLabel}>
            Purpose
          </label>
          <select
            id="contact-purpose"
            name="purpose"
            required
            defaultValue=""
            className={`${fieldInput} cursor-pointer`}
          >
            <option value="" disabled>
              Select a purpose
            </option>
            <option>Collaboration on AI Projects</option>
            <option>Hiring / Job Opportunity</option>
            <option>Freelance Work</option>
            <option>General Inquiry</option>
          </select>
        </div>

        <div className={fieldRow}>
          <label htmlFor="contact-subject" className={fieldLabel}>
            Subject
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            placeholder="What is this about?"
            className={fieldInput}
          />
        </div>
      </div>

      <label htmlFor="contact-message" className="sr-only">
        Message
      </label>
      <textarea
        id="contact-message"
        name="message"
        required
        placeholder="Write your message"
        className="min-h-[140px] flex-1 resize-none border-t border-white/[0.07] bg-transparent px-5 py-4 text-[13.5px] leading-relaxed text-white/90 outline-none placeholder:text-white/30"
      />

      <div className="flex items-center gap-3 border-t border-white/[0.07] px-5 py-3">
        {socials.map((s) => {
          const Icon = socialIcons[s.label];
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => openLink(s.href)}
              aria-label={s.label}
              className="text-white/50 transition-colors hover:text-white"
            >
              <Icon size={17} weight="fill" />
            </button>
          );
        })}
        <button
          type="submit"
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-(--accent-btn) px-4 py-2 text-[13px] font-semibold text-(--accent-contrast) transition hover:brightness-110 active:scale-[0.98]"
        >
          <PaperPlaneTilt size={14} weight="fill" />
          Send Message
        </button>
      </div>
    </form>
  );
}
