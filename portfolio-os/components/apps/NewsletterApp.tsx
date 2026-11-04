"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/consent";
import {
  EMAIL_RE,
  TURNSTILE_SITEKEY,
  loadTurnstile,
  markSaved,
  postSubscribe,
} from "@/lib/subscribe";

const fieldRow = "flex items-center gap-3 py-2.5";
const fieldLabel = "w-16 shrink-0 text-[13px] text-white/55";
const fieldInput =
  "min-w-0 flex-1 bg-transparent text-[13.5px] text-white/90 outline-none placeholder:text-white/30";
const NOTE = "I store your name and email only. Every email has an unsubscribe link.";

/** Mail-compose style window, built on the same rows as the Contact app.
 *  Posts to the subscribe Worker; Turnstile runs before the button unlocks. */
export default function NewsletterApp() {
  const checkRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ text: "Loading the human check.", error: false });
  const [doneName, setDoneName] = useState<string | null>(null);

  useEffect(() => {
    track("subscribe_open", { source: "os" });
    let alive = true;
    loadTurnstile()
      .then(() => {
        if (!alive || !checkRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(checkRef.current, {
          sitekey: TURNSTILE_SITEKEY,
          theme: "dark",
          callback: (t) => {
            setToken(t);
            setStatus({ text: "", error: false });
          },
          "expired-callback": () => setToken(""),
          "error-callback": () => {
            setToken("");
            setStatus({ text: "The human check failed. Close this window and open it again.", error: true });
          },
        });
      })
      .catch(() => {
        if (alive) setStatus({ text: "The human check could not load. Try again later.", error: true });
      });
    return () => {
      alive = false;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName) return setStatus({ text: "Please write your name.", error: true });
    if (!EMAIL_RE.test(cleanEmail)) return setStatus({ text: "That email does not look right.", error: true });
    if (!token) return setStatus({ text: "Wait for the human check to finish.", error: true });

    setBusy(true);
    setStatus({ text: "Sending.", error: false });
    const result = await postSubscribe({
      name: cleanName,
      email: cleanEmail,
      website: trap,
      source: "os",
      turnstile: token,
    });

    if (result === "ok") {
      markSaved("subscribed");
      track("newsletter_signup", { source: "os" });
      setDoneName(cleanName);
      return;
    }
    setStatus({
      text:
        result === "rate_limited"
          ? "Too many tries from this network. Please try again in an hour."
          : "That did not go through. Please try again.",
      error: true,
    });
    setToken("");
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
    setBusy(false);
  };

  if (doneName) {
    return (
      <div role="status" className="flex min-h-full flex-col justify-center px-8 py-10">
        <p className="text-[17px] font-semibold text-white/90">Thank you, {doneName}.</p>
        <p className="mt-2 text-[13px] leading-5 text-white/55">I will write to you when a new post is up.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="px-5 pb-3 pt-4">
        <h2 className="text-[15px] font-semibold text-white/90">New posts by email</h2>
        <p className="mt-1.5 text-[13px] leading-5 text-white/55">
          I write about testing new AI models by building with them. Leave your name and email and I will write
          to you when a new post is up.
        </p>
      </div>

      <div className="divide-y divide-white/[0.07] border-y border-white/[0.07] px-5">
        <div className={fieldRow}>
          <label htmlFor="newsletter-name" className={fieldLabel}>
            Name
          </label>
          <input
            id="newsletter-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            className={fieldInput}
          />
        </div>
        <div className={fieldRow}>
          <label htmlFor="newsletter-email" className={fieldLabel}>
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            autoComplete="email"
            spellCheck={false}
            className={fieldInput}
          />
        </div>
      </div>

      <input
        type="text"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      />

      <div ref={checkRef} className="px-5 pt-4" />

      <div className="mt-auto flex items-center gap-3 border-t border-white/[0.07] px-5 py-3">
        <p
          role="status"
          aria-live="polite"
          className={`min-w-0 flex-1 text-[12px] leading-4 ${status.error ? "text-red-300" : "text-white/55"}`}
        >
          {status.text || NOTE}
        </p>
        <button
          type="submit"
          disabled={busy || !token}
          className="shrink-0 rounded-lg bg-(--accent-btn) px-4 py-2 text-[13px] font-semibold text-(--accent-contrast) transition hover:brightness-110 disabled:opacity-50"
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}
