"use client";

import { useRef, useState } from "react";
import {
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  PaperPlaneTilt,
  XLogo,
} from "@phosphor-icons/react";
import { profile, socials } from "@/lib/content";
import { openLink } from "@/lib/system";
import { CONTACT_EMAIL, MESSAGE_MAX, getTurnstileToken, postMessage } from "@/lib/contact";

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
 * Mail-compose style contact window. Posts to the Worker, which stores the
 * message. A Turnstile check runs when the visitor presses Send.
 */
export default function ContactApp() {
  const checkRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ text: "", error: false });
  const [doneName, setDoneName] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !checkRef.current) return;
    const data = new FormData(event.currentTarget);
    const field = (key: string) => String(data.get(key) ?? "");

    setBusy(true);
    setStatus({ text: "Checking that you are human.", error: false });
    try {
      const turnstile = await getTurnstileToken(checkRef.current);
      setStatus({ text: "Sending.", error: false });
      const result = await postMessage({
        source: "os-contact",
        name: field("name"),
        email: field("email"),
        purpose: field("purpose"),
        subject: field("subject"),
        message: field("message"),
        website: field("website"),
        turnstile,
      });
      if (result === "ok") return setDoneName(field("name").trim());
      setStatus({
        text:
          result === "rate_limited"
            ? "Too many messages from this network. Try again in an hour."
            : "The message did not go through.",
        error: true,
      });
    } catch {
      setStatus({ text: "The message did not go through.", error: true });
    }
    setBusy(false);
  };

  if (doneName !== null) {
    return (
      <div role="status" className="flex min-h-full flex-col justify-center px-8 py-10">
        <p className="text-[17px] font-semibold text-white/90">Thank you{doneName ? `, ${doneName}` : ""}.</p>
        <p className="mt-2 text-[13px] leading-5 text-white/55">Your message is with Diwakar. He will write back to you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex min-h-full flex-col">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

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
        maxLength={MESSAGE_MAX}
        placeholder="Write your message"
        className="min-h-[140px] flex-1 resize-none border-t border-white/[0.07] bg-transparent px-5 py-4 text-[13.5px] leading-relaxed text-white/90 outline-none placeholder:text-white/30"
      />

      <div ref={checkRef} className="border-t border-white/[0.07] px-5 py-3 empty:hidden" />
      <p
        role="status"
        aria-live="polite"
        className={`border-t border-white/[0.07] px-5 py-2 text-[12px] leading-4 empty:hidden ${status.error ? "text-red-300" : "text-white/55"}`}
      >
        {status.text}
        {status.error && (
          <>
            {" "}Or email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            .
          </>
        )}
      </p>
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
          disabled={busy}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-(--accent-btn) px-4 py-2 text-[13px] font-semibold text-(--accent-contrast) transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          <PaperPlaneTilt size={14} weight="fill" />
          {busy ? "Sending" : "Send Message"}
        </button>
      </div>
    </form>
  );
}
