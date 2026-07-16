// Renders original macOS-style wallpaper art (Big Sur-like flowing waves +
// aurora glows) to JPEG files via Playwright. Run from the repo root:
//   node scripts/gen-wallpapers.js
const { chromium } = require("playwright");
const path = require("path");

const W = 2560;
const H = 1600;
const OUT = path.join(__dirname, "..", "portfolio-os", "public", "images", "wallpapers");

// Each scene: base gradient, aurora glows, and three wave layers
const SCENES = {
  sequoia: {
    base: ["#2b2f8f", "#0c1038"],
    glows: [
      ["#4a8dff", 0.55, "22%", "18%", 1400],
      ["#b45af2", 0.42, "82%", "8%", 1200],
      ["#22d3ee", 0.2, "55%", "45%", 900],
    ],
    waves: [
      ["#3b57d6", "#1b2a80", 0.9],
      ["#26399e", "#131c56", 0.95],
      ["#12173f", "#080b26", 1],
    ],
  },
  horizon: {
    base: ["#2a1240", "#7a2030"],
    glows: [
      ["#ff9a3c", 0.55, "24%", "30%", 1400],
      ["#ff4d7e", 0.42, "78%", "12%", 1200],
      ["#ffd08a", 0.22, "50%", "55%", 800],
    ],
    waves: [
      ["#ff8a3c", "#c2481f", 0.85],
      ["#c23a52", "#7e1e3c", 0.92],
      ["#40102c", "#22081a", 1],
    ],
  },
  emerald: {
    base: ["#06322a", "#0b4a3a"],
    glows: [
      ["#34d77b", 0.5, "20%", "20%", 1400],
      ["#52c8fa", 0.3, "80%", "10%", 1100],
      ["#a7f3d0", 0.15, "55%", "50%", 800],
    ],
    waves: [
      ["#1f9d6c", "#0d5c42", 0.9],
      ["#127350", "#093f2e", 0.95],
      ["#062e22", "#031710", 1],
    ],
  },
  rose: {
    base: ["#331040", "#7a1e56"],
    glows: [
      ["#ff5c8f", 0.5, "26%", "18%", 1400],
      ["#b06cff", 0.4, "78%", "10%", 1200],
      ["#ffb3d0", 0.16, "50%", "52%", 800],
    ],
    waves: [
      ["#d63d84", "#8a1e5c", 0.88],
      ["#93275f", "#571238", 0.94],
      ["#3a0d2c", "#1d0616", 1],
    ],
  },
  "graphite-sky": {
    base: ["#3a3c46", "#131418"],
    glows: [
      ["#ffffff", 0.16, "25%", "16%", 1300],
      ["#9aa0b0", 0.18, "80%", "12%", 1100],
    ],
    waves: [
      ["#5a5d6a", "#33353e", 0.9],
      ["#3c3e48", "#22242b", 0.95],
      ["#1b1c22", "#0c0d10", 1],
    ],
  },
};

// Three flowing S-curves across the lower half of the frame
const WAVE_PATHS = [
  `M0,860 C420,740 880,1020 1380,900 C1880,780 2220,980 ${W},870 L${W},${H} L0,${H} Z`,
  `M0,1090 C520,960 1080,1240 1640,1100 C2120,980 2360,1160 ${W},1080 L${W},${H} L0,${H} Z`,
  `M0,1320 C640,1210 1260,1440 1920,1310 C2260,1245 2440,1350 ${W},1300 L${W},${H} L0,${H} Z`,
];

function sceneHtml(s) {
  const glows = s.glows
    .map(
      ([c, a, x, y, r]) =>
        `<div style="position:absolute;left:${x};top:${y};width:${r * 2}px;height:${r * 1.5}px;transform:translate(-50%,-50%);background:radial-gradient(closest-side,${c}${Math.round(a * 255)
          .toString(16)
          .padStart(2, "0")},transparent 72%);"></div>`,
    )
    .join("");

  const defs = s.waves
    .map(
      ([from, to], i) =>
        `<linearGradient id="w${i}" x1="0" y1="0" x2="0.6" y2="1">
           <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
         </linearGradient>`,
    )
    .join("");

  const paths = s.waves
    .map(([, , op], i) => `<path d="${WAVE_PATHS[i]}" fill="url(#w${i})" opacity="${op}"/>`)
    .join("");

  return `<!doctype html><html><body style="margin:0">
    <div style="position:relative;width:${W}px;height:${H}px;overflow:hidden;
                background:linear-gradient(168deg,${s.base[0]} 0%,${s.base[1]} 100%)">
      ${glows}
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
           style="position:absolute;inset:0"><defs>${defs}</defs>${paths}</svg>
      <div style="position:absolute;inset:0;background:radial-gradient(130% 100% at 50% 35%,transparent 55%,rgba(0,0,0,0.35) 100%)"></div>
    </div></body></html>`;
}

(async () => {
  require("fs").mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const [id, scene] of Object.entries(SCENES)) {
    await page.setContent(sceneHtml(scene));
    await page.waitForTimeout(150);
    const file = path.join(OUT, `${id}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 84 });
    console.log("rendered", file);
  }
  await browser.close();
})();
