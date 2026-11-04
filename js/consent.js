/* Analytics consent for diwakaryadav.com.np.
   Nothing from Google loads until the visitor accepts. Cloudflare Web Analytics
   is separate: it sets no cookies and needs no consent.
   Exposes window.diwakarTrack(name, params) and window.diwakarConsent. */
(function () {
    "use strict";

    var GA_ID = "G-VQ46XM74M1"; // GA4 measurement ID
    var STORE_KEY = "consent.v1";
    var PRIVACY_PATH = "/privacy/";
    var ASK_DELAY_MS = 1200;
    var SCROLL_STEPS = [25, 50, 75, 100];
    var SITE_DOMAIN = "diwakaryadav.com.np";

    var configured = /^G-[A-Z0-9]{6,}$/.test(GA_ID);
    var script = document.currentScript;
    var panel = null;
    var gaLoaded = false;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    function readChoice() {
        try { var saved = JSON.parse(localStorage.getItem(STORE_KEY)); return saved ? saved.analytics : null; } catch (e) { return null; }
    }

    function writeChoice(analytics) {
        try { localStorage.setItem(STORE_KEY, JSON.stringify({ analytics: analytics, at: Date.now() })); } catch (e) { /* private mode: ask again next visit */ }
    }

    function announce() {
        document.dispatchEvent(new CustomEvent("diwakar:consent"));
    }

    function loadStyles() {
        if (!script) return;
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = new URL("../css/consent.css", script.src).href;
        document.head.appendChild(link);
    }

    function startAnalytics() {
        window["ga-disable-" + GA_ID] = false;
        if (gaLoaded) return;
        gaLoaded = true;
        gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        gtag("js", new Date());
        gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
        document.head.appendChild(s);
    }

    function cookieDomains() {
        var parts = location.hostname.split(".");
        var list = [location.hostname];
        for (var i = 0; i < parts.length - 1; i++) list.push("." + parts.slice(i).join("."));
        list.push("." + SITE_DOMAIN);
        return list;
    }

    function clearAnalyticsCookies() {
        document.cookie.split(";").forEach(function (pair) {
            var name = pair.split("=")[0].trim();
            if (name.indexOf("_ga") !== 0) return;
            cookieDomains().forEach(function (domain) {
                document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + domain;
            });
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        });
    }

    function stopAnalytics() {
        window["ga-disable-" + GA_ID] = true;
        clearAnalyticsCookies();
    }

    function allowed() { return configured && readChoice() === true && gaLoaded; }

    function track(name, params) {
        if (allowed()) gtag("event", name, params || {});
    }

    function choose(analytics) {
        writeChoice(analytics);
        if (analytics) startAnalytics(); else stopAnalytics();
        closePanel();
        announce();
    }

    function closePanel() {
        if (panel) { panel.remove(); panel = null; }
    }

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (k) {
            if (k === "text") node.textContent = attrs[k]; else node.setAttribute(k, attrs[k]);
        });
        (children || []).forEach(function (c) { node.appendChild(c); });
        return node;
    }

    function openPanel(focus) {
        if (panel) return;
        var accept = el("button", { type: "button", class: "cns-btn", text: "Accept analytics" });
        var decline = el("button", { type: "button", class: "cns-btn", text: "No thanks" });
        accept.addEventListener("click", function () { choose(true); });
        decline.addEventListener("click", function () { choose(false); });
        panel = el("section", { class: "cns-panel", role: "dialog", "aria-labelledby": "cns-title" }, [
            el("h2", { class: "cns-title", id: "cns-title", text: "Analytics cookies" }),
            el("p", { class: "cns-text", text: "May I use Google Analytics to learn how people use this site? It sets cookies and records the pages you open, your clicks, your device and your country. I do not use it for ads." }),
            el("p", { class: "cns-text" }, [el("a", { href: PRIVACY_PATH, text: "Read the privacy note" })]),
            el("div", { class: "cns-actions" }, [accept, decline]),
        ]);
        document.body.appendChild(panel);
        if (focus) accept.focus();
    }

    function addFooterLinks() {
        var box = document.querySelector(".footer .container");
        if (!box) return;
        var line = el("p", { class: "cns-footer-line" }, [el("a", { class: "cns-footer-link", href: PRIVACY_PATH, text: "Privacy note" })]);
        if (configured) {
            var settings = el("button", { type: "button", class: "cns-footer-link", text: "Cookie settings" });
            settings.addEventListener("click", function () { openPanel(true); });
            line.appendChild(settings);
        }
        box.appendChild(line);
    }

    function watchScrollDepth() {
        if (!/^\/blog\/.+/.test(location.pathname)) return;
        var sent = {};
        function onScroll() {
            var target = document.querySelector("article") || document.body;
            var rect = target.getBoundingClientRect();
            if (rect.height < 1) return;
            var seen = Math.min(Math.max(window.innerHeight - rect.top, 0), rect.height) / rect.height * 100;
            SCROLL_STEPS.forEach(function (step) {
                if (seen >= step - 1 && !sent[step]) { sent[step] = true; track("scroll_depth", { percent: step, page_path: location.pathname }); }
            });
        }
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    function watchLinkClicks() {
        document.addEventListener("click", function (event) {
            var a = event.target.closest && event.target.closest("a[href]");
            if (!a) return;
            var url;
            try { url = new URL(a.href, location.href); } catch (e) { return; }
            var external = url.origin !== location.origin;
            if (!external && url.protocol !== "mailto:" && url.protocol !== "tel:") return;
            track("link_click", {
                link_url: a.href,
                link_domain: url.hostname || url.protocol,
                link_text: (a.textContent || a.getAttribute("aria-label") || "").trim().slice(0, 80),
                page_path: location.pathname,
            });
        });
    }

    window.diwakarTrack = track;
    window.diwakarConsent = {
        configured: configured,
        pending: function () { return configured && (readChoice() === null || !!panel); },
    };

    loadStyles();
    addFooterLinks();
    if (!configured) return;
    watchScrollDepth();
    watchLinkClicks();
    if (readChoice() === true) startAnalytics();
    else if (readChoice() === null) setTimeout(function () { openPanel(false); }, ASK_DELAY_MS);
})();
