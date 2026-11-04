/* Subscribe panel for diwakaryadav.com.np.
   Opens by itself once per visit after a read, or on demand from the footer link.
   Posts to the subscribe Worker (worker/). Turnstile guards the form. */
(function () {
    "use strict";

    var ENDPOINT = "https://subscribe.diwakaryadav.com.np/subscribe";
    var SITEKEY = "0x4AAAAAAFywZ_VCouN43PnL";
    var TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    var STORE_KEY = "sub.v1";
    var DISMISS_DAYS = 21;
    var AUTO_DELAY_MS = 25000;
    var AUTO_SCROLL_RATIO = 0.5;
    var NO_AUTO_PATHS = ["/thank-you/", "/contact/", "/privacy/", "/404.html"];

    var script = document.currentScript;
    var panel = null;
    var opener = null;
    var autoDone = false;

    function loadStyles() {
        if (!script) return;
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = new URL("../css/subscribe.css", script.src).href;
        document.head.appendChild(link);
    }

    // Sends an analytics event only if the visitor accepted analytics (see consent.js).
    function track(name, params) {
        if (window.diwakarTrack) window.diwakarTrack(name, params);
    }

    function readState() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; } catch (e) { return null; }
    }

    function writeState(state) {
        try { localStorage.setItem(STORE_KEY, JSON.stringify({ state: state, at: Date.now() })); } catch (e) { /* private mode: ask again next visit */ }
    }

    function mayAutoOpen() {
        var path = location.pathname;
        if (NO_AUTO_PATHS.some(function (p) { return path.indexOf(p) === 0 || path.endsWith(p); })) return false;
        var saved = readState();
        if (!saved) return true;
        if (saved.state === "subscribed") return false;
        return Date.now() - saved.at > DISMISS_DAYS * 86400000;
    }

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (k) {
            if (k === "text") node.textContent = attrs[k];
            else node.setAttribute(k, attrs[k]);
        });
        (children || []).forEach(function (c) { node.appendChild(c); });
        return node;
    }

    function field(label, input) {
        return el("label", { class: "sub-field" }, [el("span", { text: label }), input]);
    }

    function close(remember) {
        if (!panel) return;
        panel.remove();
        panel = null;
        document.removeEventListener("keydown", onKey);
        if (remember) writeState("dismissed");
        if (opener) { opener.focus(); opener = null; }
    }

    function onKey(event) {
        if (event.key === "Escape") close(true);
    }

    function setStatus(node, message, kind) {
        node.textContent = message;
        node.setAttribute("data-kind", kind || "info");
    }

    function open(fromUser) {
        if (panel) {
            if (fromUser) panel.querySelector("input[name=name]").focus();
            return;
        }
        autoDone = true;

        var nameInput = el("input", { type: "text", name: "name", required: "", maxlength: "100", autocomplete: "name" });
        var emailInput = el("input", { type: "email", name: "email", required: "", maxlength: "254", autocomplete: "email", spellcheck: "false" });
        var trap = el("input", { type: "text", name: "website", tabindex: "-1", autocomplete: "off" });
        var check = el("div", { class: "sub-check" });
        var submit = el("button", { type: "submit", class: "sub-submit", text: "Notify me" });
        var status = el("p", { class: "sub-status", role: "status", "aria-live": "polite" });
        var later = el("button", { type: "button", class: "sub-later", text: "Not now" });
        var form = el("form", { novalidate: "" }, [
            field("Name", nameInput),
            field("Email", emailInput),
            el("div", { class: "sub-trap", "aria-hidden": "true" }, [trap]),
            check,
            submit,
            status,
            el("p", { class: "sub-note", text: "I store your name and email only. Every email has an unsubscribe link." }),
        ]);

        panel = el("section", { class: "sub-panel", role: "dialog", "aria-labelledby": "sub-title" }, [
            el("h2", { class: "sub-title", id: "sub-title", text: "New posts by email" }),
            el("p", { class: "sub-text", text: "I write about testing new AI models by building with them. Leave your name and email and I will write to you when a new post is up." }),
            form,
            later,
        ]);
        document.body.appendChild(panel);
        document.addEventListener("keydown", onKey);
        track("subscribe_open", { source: location.pathname, trigger: fromUser ? "footer" : "auto" });
        if (fromUser) { opener = document.activeElement; nameInput.focus(); }
        later.addEventListener("click", function () { close(true); });

        var token = "";
        var widgetId = null;
        submit.disabled = true;
        setStatus(status, "Loading the human check.", "info");

        loadTurnstile().then(function () {
            if (!panel) return;
            widgetId = window.turnstile.render(check, {
                sitekey: SITEKEY,
                theme: "auto",
                callback: function (t) { token = t; submit.disabled = false; setStatus(status, "", "info"); },
                "expired-callback": function () { token = ""; submit.disabled = true; },
                "error-callback": function () { token = ""; setStatus(status, "The human check failed. Reload the page and try again.", "error"); },
            });
        }).catch(function () {
            setStatus(status, "The human check could not load. Try again later.", "error");
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var name = nameInput.value.trim();
            var email = emailInput.value.trim();
            if (!name) { setStatus(status, "Please write your name.", "error"); nameInput.focus(); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus(status, "That email does not look right.", "error"); emailInput.focus(); return; }
            if (!token) { setStatus(status, "Wait for the human check to finish.", "error"); return; }

            submit.disabled = true;
            setStatus(status, "Sending.", "info");
            fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, email: email, website: trap.value, source: location.pathname, turnstile: token }),
            }).then(function (res) {
                if (res.ok) return showThanks(name);
                var message = res.status === 429
                    ? "Too many tries from this network. Please try again in an hour."
                    : "That did not go through. Please try again.";
                setStatus(status, message, "error");
                resetCheck();
            }).catch(function () {
                setStatus(status, "No connection. Please try again.", "error");
                resetCheck();
            });
        });

        function resetCheck() {
            token = "";
            if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
        }

        function showThanks(name) {
            writeState("subscribed");
            track("newsletter_signup", { source: location.pathname });
            var done = el("button", { type: "button", class: "sub-later", text: "Close" });
            done.addEventListener("click", function () { close(false); });
            panel.replaceChildren(
                el("h2", { class: "sub-title", id: "sub-title", text: "Thank you, " + name + "." }),
                el("p", { class: "sub-text", text: "I will write to you when a new post is up." }),
                done
            );
            done.focus();
        }
    }

    var turnstilePromise = null;
    function loadTurnstile() {
        if (window.turnstile) return Promise.resolve();
        if (!turnstilePromise) {
            turnstilePromise = new Promise(function (resolve, reject) {
                var s = document.createElement("script");
                s.src = TURNSTILE_SRC;
                s.async = true;
                s.onload = resolve;
                s.onerror = function () { turnstilePromise = null; reject(new Error("turnstile")); };
                document.head.appendChild(s);
            });
        }
        return turnstilePromise;
    }

    function addFooterLink() {
        var box = document.querySelector(".footer .container");
        if (!box) return;
        var button = el("button", { type: "button", class: "sub-footer-link", text: "Get new posts by email" });
        button.addEventListener("click", function () { open(true); });
        box.appendChild(el("p", { class: "sub-footer-line" }, [button]));
    }

    function scheduleAuto() {
        if (!mayAutoOpen()) return;
        function fire() {
            if (autoDone || panel) return;
            if (document.hidden) { document.addEventListener("visibilitychange", fire, { once: true }); return; }
            // One question at a time: wait until the analytics choice is made.
            if (window.diwakarConsent && window.diwakarConsent.pending()) { document.addEventListener("diwakar:consent", fire, { once: true }); return; }
            var active = document.activeElement;
            if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) return;
            cleanup();
            open(false);
        }
        function onScroll() {
            var scrollable = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollable > 600 && window.scrollY / scrollable >= AUTO_SCROLL_RATIO) fire();
        }
        var timer = setTimeout(fire, AUTO_DELAY_MS);
        function cleanup() { clearTimeout(timer); window.removeEventListener("scroll", onScroll); }
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    loadStyles();
    addFooterLink();
    scheduleAuto();
})();
