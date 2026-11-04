/* Analytics consent for DiwakarOS. Nothing from Google loads until the visitor
   accepts. Cloudflare Web Analytics is separate: no cookies, no consent needed.
   The classic site has the same logic in js/consent.js. */

const GA_ID = "G-VQ46XM74M1"; // GA4 measurement ID
const STORE_KEY = "dios-consent-v1";
const SITE_DOMAIN = "diwakaryadav.com.np";

export const PRIVACY_URL = "https://www.diwakaryadav.com.np/privacy/";
export const CONSENT_CHANGED = "diwakar:consent";
export const CONSENT_OPEN = "diwakar:consent-open";
export const analyticsConfigured = /^G-[A-Z0-9]{6,}$/.test(GA_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let gaLoaded = false;

function gtag(...args: unknown[]) {
  void args;
  // gtag.js reads an Arguments object from the data layer, not an array.
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer ??= []).push(arguments);
}

export function readChoice(): boolean | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "null");
    return typeof saved?.analytics === "boolean" ? saved.analytics : null;
  } catch {
    return null;
  }
}

/** True while the visitor has not answered yet. */
export function isPending(): boolean {
  return analyticsConfigured && readChoice() === null;
}

function startAnalytics() {
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = false;
  if (gaLoaded) return;
  gaLoaded = true;
  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  gtag("js", new Date());
  gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

function clearAnalyticsCookies() {
  const parts = location.hostname.split(".");
  const domains = [location.hostname, `.${SITE_DOMAIN}`];
  for (let i = 0; i < parts.length - 1; i++) domains.push(`.${parts.slice(i).join(".")}`);
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

function stopAnalytics() {
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
  clearAnalyticsCookies();
}

/** Start Google again on a later visit when the visitor already said yes. */
export function startIfAccepted() {
  if (analyticsConfigured && readChoice() === true) startAnalytics();
}

export function choose(analytics: boolean) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ analytics, at: Date.now() }));
  } catch {
    // Private mode: ask again next visit.
  }
  if (analytics) startAnalytics();
  else stopAnalytics();
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED));
}

export function requestConsentPanel() {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN));
}

/** Sends an event only when the visitor accepted analytics. */
export function track(name: string, params: Record<string, unknown> = {}) {
  if (analyticsConfigured && gaLoaded && readChoice() === true) gtag("event", name, params);
}
