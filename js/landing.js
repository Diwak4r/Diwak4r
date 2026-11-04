/* Counts a visit that arrives from outside: by campaign tag (?utm_...) or by the
   site that sent the visitor. Cookieless: it stores nothing in the browser, sends
   no address and no id. The Worker adds one to a daily total (worker/src/index.js).
   Skipped: reloads, back/forward, moves between my own pages, automated browsers. */
(function () {
    "use strict";

    var ENDPOINT = "https://subscribe.diwakaryadav.com.np/hit";
    var OWN_SITES = /(^|\.)diwakaryadav\.com\.np$/;

    var nav = window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    if (nav && nav.type !== "navigate") return;
    if (navigator.webdriver) return;

    var referrerHost = "";
    try { referrerHost = new URL(document.referrer).hostname.replace(/^www\./, ""); } catch (e) { /* no referrer */ }
    if (OWN_SITES.test(referrerHost) || referrerHost === location.hostname.replace(/^www\./, "")) return;

    var params = new URLSearchParams(location.search);
    var data = {
        source: params.get("utm_source") || referrerHost,
        medium: params.get("utm_medium") || "",
        campaign: params.get("utm_campaign") || "",
        path: location.pathname,
    };
    if (navigator.sendBeacon) navigator.sendBeacon(ENDPOINT, new Blob([JSON.stringify(data)], { type: "text/plain" }));
})();
