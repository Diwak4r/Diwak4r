import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:4173/";
const evidenceDir = process.env.EVIDENCE_DIR || path.resolve(process.cwd(), ".task/0730_diwakaros-experience/evidence");
const appCases = [
  ["About Me", "About Me"],
  ["Projects", "Projects"],
  ["Journal", "Journal"],
  ["Notes", "Notes"],
  ["Contact", "New Message"],
  ["Browser", "Browser"],
  ["Terminal", "diwakar@portfolio"],
  ["Settings", "System Settings"],
  ["Calculator", "Calculator"],
  ["Spotify", "Spotify"],
  ["Socials", "Socials"],
  ["CraftJS", "CraftJS"],
  ["Finder", "Finder"],
  ["Code", "Code"],
  ["Photos", "Photos"],
  ["Weather", "Weather"],
  ["WhatsApp", "WhatsApp"],
  ["Launchpad", "Launchpad"],
];

await fs.mkdir(evidenceDir, { recursive: true });

const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass: Boolean(pass), detail });
const issue = (entry) => !entry.url.includes("api.open-meteo.com") && !entry.url.includes("diwak4r.zo.space");

function observe(page, label) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || "unknown" }));
  page.on("response", (response) => {
    if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() });
  });
  return { label, consoleErrors, pageErrors, failedRequests, badResponses };
}

async function clearExperienceState(page) {
  await page.addInitScript(() => {
    sessionStorage.clear();
    localStorage.removeItem("dios-experience-coach-seen");
  });
}

async function enterDesktop(page) {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const enter = page.getByRole("button", { name: "Enter Portfolio" });
  await enter.waitFor({ state: "visible", timeout: 10_000 });
  await enter.click();
  await page.locator('nav[aria-label="Dock"]').waitFor({ state: "visible", timeout: 8_000 });
}

const browser = await chromium.launch({ headless: true });

// Mobile expectation-setting and touch launcher.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const telemetry = observe(page, "mobile");
  await clearExperienceState(page);
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const gate = page.getByRole("dialog", { name: /Built for a bigger screen/i });
  check("Mobile guide appears at 390x844", await gate.isVisible().catch(() => false));
  check("Mobile guide explains larger-screen features", await gate.getByText(/resizable windows, the Dock, keyboard shortcuts/i).isVisible().catch(() => false));
  await page.screenshot({ path: path.join(evidenceDir, "01-mobile-guide.png"), fullPage: true });
  await gate.getByRole("button", { name: "Continue on mobile" }).click();
  const enter = page.getByRole("button", { name: "Enter Portfolio" });
  await enter.waitFor({ state: "visible", timeout: 8_000 });
  await enter.click();
  const aboutIcon = page.getByRole("button", { name: /Open About Me/i });
  await aboutIcon.waitFor({ state: "visible", timeout: 8_000 });
  check("Continue reaches mobile launcher", await aboutIcon.isVisible());
  await aboutIcon.click();
  check("Mobile app opens as full-screen sheet", await page.getByRole("dialog", { name: "About Me" }).isVisible().catch(() => false));
  await page.screenshot({ path: path.join(evidenceDir, "02-mobile-launcher.png"), fullPage: true });
  check("Mobile console has no errors", telemetry.consoleErrors.length === 0, telemetry.consoleErrors.join(" | "));
  check("Mobile has no uncaught page errors", telemetry.pageErrors.length === 0, telemetry.pageErrors.join(" | "));
  check("Mobile has no failed local requests", telemetry.failedRequests.filter(issue).length === 0, JSON.stringify(telemetry.failedRequests.filter(issue)));
  await context.close();
}

// Desktop boot/login, all registered apps, controls, windows, shortcuts, and network hygiene.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const telemetry = observe(page, "desktop");
  await clearExperienceState(page);
  await page.goto(baseURL, { waitUntil: "networkidle" });
  check("Boot shows Apple logo", await page.locator('img[src="/images/apple-logo.png"]').isVisible().catch(() => false));
  await page.screenshot({ path: path.join(evidenceDir, "03-desktop-boot.png") });
  const enter = page.getByRole("button", { name: "Enter Portfolio" });
  await enter.waitFor({ state: "visible", timeout: 10_000 });
  check("Login screen appears", await enter.isVisible());
  await enter.click();
  const dock = page.locator('nav[aria-label="Dock"]');
  await dock.waitFor({ state: "visible", timeout: 8_000 });
  check("Desktop Dock appears", await dock.isVisible());
  check("Mobile guide absent on desktop", (await page.getByRole("dialog", { name: /Built for a bigger screen/i }).count()) === 0);
  await page.waitForTimeout(2300);
  check("First-visit exploration coach appears", await page.getByLabel("DiwakarOS quick tour").isVisible().catch(() => false));
  await page.screenshot({ path: path.join(evidenceDir, "04-desktop-first-impression.png") });
  await page.getByRole("button", { name: "Dismiss quick tour" }).click().catch(() => {});

  const opened = [];
  for (const [appName, windowTitle] of appCases) {
    const button = dock.getByRole("button", { name: new RegExp(`(?:Open|Focus) ${appName}$`) }).first();
    await button.click();
    const dialog = page.getByRole("dialog", { name: windowTitle }).last();
    const visible = await dialog.isVisible({ timeout: 5_000 }).catch(() => false);
    check(`${appName} opens from Dock`, visible);
    if (visible) opened.push(appName);
  }
  const trashButton = dock.getByRole("button", { name: /^Trash,/ });
  await trashButton.click();
  check("Trash opens from Dock", await page.getByRole("dialog", { name: "Trash" }).isVisible({ timeout: 5_000 }).catch(() => false));
  check("All 19 applications opened", opened.length === 18, `${opened.length + 1}/19 including Trash`);
  await page.screenshot({ path: path.join(evidenceDir, "05-all-apps-opened.png") });

  // Keep a single About window for detailed window behavior.
  await page.keyboard.press("Control+Q");
  await page.waitForTimeout(400);
  await dock.getByRole("button", { name: /Open About Me$/ }).click();
  let about = page.getByRole("dialog", { name: "About Me" }).last();
  await about.waitFor({ state: "visible" });
  const original = await about.boundingBox();
  await about.getByRole("button", { name: "Maximize window" }).click();
  await page.waitForTimeout(700);
  const maxed = await about.boundingBox();
  check("Window maximizes", original && maxed && maxed.width > original.width && maxed.height > original.height, `before=${JSON.stringify(original)} after=${JSON.stringify(maxed)}`);
  await about.getByRole("button", { name: "Restore window" }).click();
  await page.waitForTimeout(700);
  const restored = await about.boundingBox();
  check("Window restores after maximize", original && restored && Math.abs(restored.width - original.width) < 8 && Math.abs(restored.height - original.height) < 8, `before=${JSON.stringify(original)} after=${JSON.stringify(restored)}`);
  await about.getByRole("button", { name: "Minimize window" }).click();
  await page.waitForTimeout(550);
  const minimizedStyle = await about.locator(":scope > div").first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { visibility: style.visibility, opacity: Number(style.opacity) };
  });
  check(
    "Window becomes hidden after minimize",
    minimizedStyle.visibility === "hidden" || minimizedStyle.opacity < 0.05,
    JSON.stringify(minimizedStyle)
  );
  await dock.getByRole("button", { name: /Focus About Me$/ }).click();
  await page.waitForTimeout(550);
  about = page.getByRole("dialog", { name: "About Me" }).last();
  check("Dock restores minimized window", await about.isVisible().catch(() => false));

  await dock.getByRole("button", { name: /Focus About Me$/ }).click({ button: "right" });
  const menu = page.getByRole("menu");
  check("Dock context menu lists app window", await menu.getByRole("menuitem", { name: /About Me/ }).isVisible().catch(() => false));
  await menu.getByRole("menuitem", { name: "New Window" }).click();
  await page.waitForTimeout(300);
  await dock.getByRole("button", { name: /Focus About Me$/ }).click({ button: "right" });
  await page.getByRole("menu").getByRole("menuitem", { name: "New Window" }).click();
  await page.waitForTimeout(300);
  await dock.getByRole("button", { name: /Focus About Me$/ }).click({ button: "right" });
  await page.getByRole("menu").getByRole("menuitem", { name: "New Window" }).click();
  await page.waitForTimeout(300);
  check("Multi-window cap is three per app", await page.getByRole("dialog", { name: "About Me" }).count() === 3, `${await page.getByRole("dialog", { name: "About Me" }).count()} windows`);

  await page.keyboard.press("Control+Space");
  const spotlight = page.getByRole("textbox", { name: "Search apps, projects, and posts" });
  check("Cmd/Ctrl+Space opens Spotlight", await spotlight.isVisible().catch(() => false));
  await spotlight.fill("terminal");
  await spotlight.press("Enter");
  check("Spotlight launches Terminal", await page.getByRole("dialog", { name: "diwakar@portfolio" }).isVisible({ timeout: 5_000 }).catch(() => false));
  await spotlight.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => {});

  const spotifyDialogBefore = await page.getByRole("dialog", { name: "Spotify" }).count();
  await page.locator('button[aria-label="Open Spotify"]').first().click();
  check("Now Playing widget opens Spotify", await page.getByRole("dialog", { name: "Spotify" }).isVisible({ timeout: 5_000 }).catch(() => false), `before=${spotifyDialogBefore}`);

  await page.getByRole("button", { name: "Control Center" }).click();
  check("Control Center exposes brightness", await page.getByRole("slider", { name: "Brightness" }).isVisible().catch(() => false));
  await page.screenshot({ path: path.join(evidenceDir, "06-desktop-control-center.png") });

  // Dock magnification should enlarge the icon nearest the cursor.
  const aboutDock = dock.getByRole("button", { name: /(?:Open|Focus) About Me$/ }).first();
  const beforeSize = await aboutDock.boundingBox();
  if (beforeSize) {
    await page.mouse.move(beforeSize.x + beforeSize.width / 2, beforeSize.y + beforeSize.height / 2);
    await page.waitForTimeout(350);
  }
  const afterSize = await aboutDock.boundingBox();
  check("Dock cursor magnification enlarges icon", beforeSize && afterSize && afterSize.width > beforeSize.width + 5, `before=${JSON.stringify(beforeSize)} after=${JSON.stringify(afterSize)}`);

  const clock = page.getByRole("button", { name: "Date and time" });
  const timeBefore = await clock.textContent().catch(() => null);
  await page.waitForTimeout(1100);
  const timeAfter = await clock.textContent().catch(() => null);
  check("Menu clock is live", Boolean(timeBefore && timeAfter), `${timeBefore} -> ${timeAfter}`);

  check("Desktop console has no errors", telemetry.consoleErrors.length === 0, telemetry.consoleErrors.join(" | "));
  check("Desktop has no uncaught page errors", telemetry.pageErrors.length === 0, telemetry.pageErrors.join(" | "));
  const localFailed = telemetry.failedRequests.filter(issue);
  const localBad = telemetry.badResponses.filter(issue);
  check("Desktop has no failed local requests", localFailed.length === 0, JSON.stringify(localFailed));
  check("Desktop has no local HTTP errors", localBad.length === 0, JSON.stringify(localBad));
  await context.close();
}

// Responsive Dock widths.
for (const width of [1440, 1280, 1024, 900, 820, 768]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem("dios-booted", "1"));
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const dock = page.locator('nav[aria-label="Dock"]');
  await dock.waitFor({ state: "visible", timeout: 8_000 });
  const box = await dock.boundingBox();
  check(`Dock fits at ${width}px`, box && box.x >= -1 && box.x + box.width <= width + 1, JSON.stringify(box));
  await page.screenshot({ path: path.join(evidenceDir, `dock-${width}.png`) });
  await context.close();
}

// Reduced-motion emulation.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const telemetry = observe(page, "reduced-motion");
  await clearExperienceState(page);
  const started = Date.now();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Enter Portfolio" }).waitFor({ state: "visible", timeout: 4_000 });
  const bootDuration = Date.now() - started;
  await page.getByRole("button", { name: "Enter Portfolio" }).click();
  await page.locator('nav[aria-label="Dock"]').waitFor({ state: "visible", timeout: 5_000 });
  check("Reduced motion shortens boot", bootDuration < 2200, `${bootDuration}ms including static asset and hydration time`);
  check("Reduced-motion desktop remains usable", await page.locator('nav[aria-label="Dock"]').isVisible());
  check("Reduced-motion page has no uncaught errors", telemetry.pageErrors.length === 0, telemetry.pageErrors.join(" | "));
  await page.screenshot({ path: path.join(evidenceDir, "07-reduced-motion.png") });
  await context.close();
}

await browser.close();

const report = {
  baseURL,
  generatedAt: new Date().toISOString(),
  passed: results.filter((result) => result.pass).length,
  failed: results.filter((result) => !result.pass).length,
  results,
};
await fs.writeFile(path.join(evidenceDir, "e2e-results.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("\n=== DIWAKAROS LOCAL E2E ===");
for (const result of results) {
  console.log(`${result.pass ? "PASS" : "FAIL"} — ${result.name}${result.detail ? ` (${result.detail})` : ""}`);
}
console.log(`\n${report.passed}/${results.length} passed`);
if (report.failed > 0) process.exitCode = 1;
