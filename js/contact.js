/* Contact form for diwakaryadav.com.np.
   Sends the message to the Worker (worker/), which stores it. It replaced formsubmit.co.
   Turnstile runs when the visitor presses Send. It stays invisible unless Cloudflare needs a click. */
(function () {
    "use strict";

    var ENDPOINT = "https://subscribe.diwakaryadav.com.np/contact";
    var SITEKEY = "0x4AAAAAAFywZ_VCouN43PnL";
    var TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    var THANKS_URL = "/thank-you/";
    var MAIL = "Diwak4r.comp@gmail.com";
    var CHECK_TIMEOUT_MS = 30000;

    var form = document.getElementById("contact-form");
    if (!form) return;
    var check = document.getElementById("contact-check");
    var status = document.getElementById("contact-status");
    var button = form.querySelector('button[type="submit"]');
    var idleLabel = button.textContent;
    var busy = false;

    function setStatus(text, kind, withMail) {
        status.textContent = text;
        status.setAttribute("data-kind", kind || "");
        if (withMail) {
            var link = document.createElement("a");
            link.href = "mailto:" + MAIL;
            link.textContent = MAIL;
            status.appendChild(document.createTextNode(" Or email me at "));
            status.appendChild(link);
            status.appendChild(document.createTextNode("."));
        }
    }

    function setBusy(on) {
        busy = on;
        button.disabled = on;
        button.textContent = on ? "Sending" : idleLabel;
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

    function getToken() {
        return loadTurnstile().then(function () {
            return new Promise(function (resolve, reject) {
                var widgetId = null;
                var timer = setTimeout(function () { finish(new Error("timeout")); }, CHECK_TIMEOUT_MS);
                function finish(err, token) {
                    clearTimeout(timer);
                    try { if (widgetId !== null && window.turnstile.remove) window.turnstile.remove(widgetId); } catch (e) { /* widget already gone */ }
                    check.textContent = "";
                    if (err) reject(err); else resolve(token);
                }
                widgetId = window.turnstile.render(check, {
                    sitekey: SITEKEY,
                    theme: "auto",
                    appearance: "interaction-only", // stays invisible unless Cloudflare needs a click
                    callback: function (token) { finish(null, token); },
                    "error-callback": function () { finish(new Error("check")); },
                });
            });
        });
    }

    function send(token) {
        var data = new FormData(form);
        return fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                source: "site-contact",
                name: data.get("name"),
                email: data.get("email"),
                purpose: data.get("purpose"),
                subject: data.get("subject"),
                message: data.get("message"),
                website: data.get("website"),
                turnstile: token,
            }),
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setStatus("Checking that you are human.", "info");

        getToken()
            .then(function (token) {
                setStatus("Sending.", "info");
                return send(token);
            })
            .then(function (res) {
                if (res.ok) {
                    window.location.assign(THANKS_URL);
                    return;
                }
                setBusy(false);
                if (res.status === 429) return setStatus("Too many messages from this network. Please try again in an hour.", "error", true);
                setStatus("The message did not go through.", "error", true);
            })
            .catch(function () {
                setBusy(false);
                setStatus("The message did not go through.", "error", true);
            });
    });
})();
