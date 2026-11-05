"use client";

import { useEffect, useRef, useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { MESSAGE_MAX, getTurnstileToken, postMessage } from "@/lib/contact";

const NOTES_KEY = "dios-notes";
const NOTES_DATE_KEY = "dios-notes-date";

type SendState = "idle" | "sending" | "sent" | "error" | "limited" | "too-long";

/**
 * A small Notes pad. Whatever the visitor writes auto-saves to their browser
 * and is right there the next time they open the app. "Send to Diwakar"
 * sends the note to the same Worker as the contact form.
 */
export default function NotesApp() {
  const checkRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [send, setSend] = useState<SendState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendToDiwakar = async () => {
    if (!text.trim() || send === "sending" || !checkRef.current) return;
    if (text.trim().length > MESSAGE_MAX) return setSend("too-long");
    setSend("sending");
    try {
      const turnstile = await getTurnstileToken(checkRef.current);
      const result = await postMessage({ source: "os-note", message: text.trim(), turnstile });
      setSend(result === "ok" ? "sent" : result === "rate_limited" ? "limited" : "error");
    } catch {
      setSend("error");
    }
  };

  // Load the stored note once on mount.
  useEffect(() => {
    setText(localStorage.getItem(NOTES_KEY) ?? "");
    setSavedAt(localStorage.getItem(NOTES_DATE_KEY));
  }, []);

  const onChange = (value: string) => {
    setText(value);
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const stamp = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date());
      localStorage.setItem(NOTES_KEY, value);
      localStorage.setItem(NOTES_DATE_KEY, stamp);
      setSavedAt(stamp);
      setStatus("saved");
    }, 400);
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#1f1e1a]/60">
      <div className="flex h-8 shrink-0 items-center justify-center border-b border-white/[0.06] px-4">
        <span className="text-[11.5px] text-white/40">
          {status === "saving"
            ? "Saving..."
            : savedAt
              ? `Edited ${savedAt} · saved on this device`
              : "Auto-saves on this device"}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          onChange(e.target.value);
          if (send !== "idle" && send !== "sending") setSend("idle");
        }}
        placeholder="Leave a note. It stays right here for your next visit."
        aria-label="Notes"
        spellCheck={false}
        className="min-h-0 flex-1 resize-none bg-transparent p-4 text-[13.5px] leading-relaxed text-[#f5e6a8] outline-none placeholder:text-white/30"
      />
      <div ref={checkRef} className="shrink-0 border-t border-white/[0.06] px-4 py-2.5 empty:hidden" />
      <div className="flex shrink-0 items-center gap-3 border-t border-white/[0.06] px-4 py-2.5">
        <span className="text-[11.5px] text-white/40">
          {send === "sent"
            ? "Sent to Diwakar"
            : send === "error"
              ? "Couldn't send. Check the connection and try again."
              : send === "limited"
                ? "Too many notes from this network. Try again in an hour."
                : send === "too-long"
                  ? `Too long to send. The limit is ${MESSAGE_MAX} characters.`
                  : "Notes stay private unless you send one."}
        </span>
        <button
          onClick={sendToDiwakar}
          disabled={!text.trim() || send === "sending"}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-(--accent-btn) px-3 py-1.5 text-[12.5px] font-semibold text-(--accent-contrast) transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
        >
          <PaperPlaneTilt size={13} weight="fill" />
          {send === "sending" ? "Sending..." : "Send to Diwakar"}
        </button>
      </div>
    </div>
  );
}
