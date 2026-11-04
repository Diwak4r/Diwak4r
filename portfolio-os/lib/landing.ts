/* Counts a visit that arrives from outside: by campaign tag (?utm_...) or by the
   site that sent the visitor. Cookieless: it stores nothing in the browser, sends
   no address and no id. The Worker adds one to a daily total (worker/src/index.js).
   The classic site has the same logic in js/landing.js. */

const ENDPOINT = "https://subscribe.diwakaryadav.com.np/hit";
const OWN_SITES = /(^|\.)diwakaryadav\.com\.np$/;

let sent = false;

export function recordLanding() {
  if (sent) return;
  sent = true;

  const nav = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav && nav.type !== "navigate") return; // reloads and back/forward are not new visits
  if (navigator.webdriver) return; // automated browsers

  let referrerHost = "";
  try {
    referrerHost = new URL(document.referrer).hostname.replace(/^www\./, "");
  } catch {
    // no referrer
  }
  if (OWN_SITES.test(referrerHost) || referrerHost === location.hostname.replace(/^www\./, "")) return; // moving between my own pages

  const params = new URLSearchParams(location.search);
  const data = {
    source: params.get("utm_source") || referrerHost,
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    path: location.pathname,
  };
  navigator.sendBeacon?.(ENDPOINT, new Blob([JSON.stringify(data)], { type: "text/plain" }));
}
