/* Sends a message to the Worker (../worker, repo root), which stores it.
   It replaced formsubmit.co. Used by the Contact app and the Notes app.
   Turnstile runs when the visitor presses Send and stays invisible unless Cloudflare needs a click. */
import { TURNSTILE_SITEKEY, loadTurnstile } from "@/lib/subscribe";

export const CONTACT_ENDPOINT = "https://subscribe.diwakaryadav.com.np/contact";
export const CONTACT_EMAIL = "Diwak4r.comp@gmail.com";
export const MESSAGE_MAX = 5000;

const CHECK_TIMEOUT_MS = 30_000;

/** Runs one human check inside `container` and resolves with its token. */
export async function getTurnstileToken(container: HTMLElement): Promise<string> {
  await loadTurnstile();
  const turnstile = window.turnstile;
  if (!turnstile) throw new Error("turnstile");

  return new Promise<string>((resolve, reject) => {
    let widgetId: string | null = null;
    const finish = (error: Error | null, token = "") => {
      window.clearTimeout(timer);
      try {
        if (widgetId) turnstile.remove(widgetId);
      } catch {
        // The widget is already gone.
      }
      container.textContent = "";
      if (error) reject(error);
      else resolve(token);
    };
    const timer = window.setTimeout(() => finish(new Error("timeout")), CHECK_TIMEOUT_MS);
    widgetId = turnstile.render(container, {
      sitekey: TURNSTILE_SITEKEY,
      theme: "dark",
      appearance: "interaction-only",
      callback: (token) => finish(null, token),
      "expired-callback": () => {},
      "error-callback": () => finish(new Error("check")),
    });
  });
}

export type MessageResult = "ok" | "rate_limited" | "failed";

export async function postMessage(payload: {
  source: "os-contact" | "os-note";
  name?: string;
  email?: string;
  purpose?: string;
  subject?: string;
  message: string;
  website?: string;
  turnstile: string;
}): Promise<MessageResult> {
  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return "ok";
    return res.status === 429 ? "rate_limited" : "failed";
  } catch {
    return "failed";
  }
}
