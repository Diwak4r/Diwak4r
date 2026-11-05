/* Shared pieces for the newsletter app and the notification nudge.
   The Worker lives in ../worker (repo root). Turnstile guards the form. */

export const SUBSCRIBE_ENDPOINT = "https://subscribe.diwakaryadav.com.np/subscribe";
export const TURNSTILE_SITEKEY = "0x4AAAAAAFywZ_VCouN43PnL";
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const STORE_KEY = "dios-subscribe-v1";
const DISMISS_DAYS = 21;
const DAY_MS = 86_400_000;

interface TurnstileApi {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      theme: "light" | "dark" | "auto";
      appearance?: "always" | "execute" | "interaction-only";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type SavedState = "subscribed" | "dismissed";

function readSaved(): { state: SavedState; at: number } | null {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "null");
  } catch {
    return null;
  }
}

/** A dismissal never replaces a saved subscription. */
export function markSaved(state: SavedState) {
  if (state === "dismissed" && readSaved()?.state === "subscribed") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ state, at: Date.now() }));
  } catch {
    // Private mode: ask again next visit.
  }
}

export function shouldAsk(): boolean {
  const saved = readSaved();
  if (!saved) return true;
  if (saved.state === "subscribed") return false;
  return Date.now() - saved.at > DISMISS_DAYS * DAY_MS;
}

let turnstileLoad: Promise<void> | null = null;

export function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  turnstileLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      turnstileLoad = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(script);
  });
  return turnstileLoad;
}

export type SubscribeResult = "ok" | "rate_limited" | "failed";

export async function postSubscribe(payload: {
  name: string;
  email: string;
  website: string;
  source: string;
  turnstile: string;
}): Promise<SubscribeResult> {
  try {
    const res = await fetch(SUBSCRIBE_ENDPOINT, {
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
