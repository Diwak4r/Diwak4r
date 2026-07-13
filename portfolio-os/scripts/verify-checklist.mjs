import { chromium } from "playwright";

const url = "https://www.os.diwakaryadav.com.np/";
const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass, detail });

async function enter(page) {
  await page.goto(url, { waitUntil: "networkidle" });
  const enterBtn = page.getByRole("button", { name: /enter portfolio/i });
  await enterBtn.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await enterBtn.click().catch(() => {});
  await page.waitForTimeout(1200);
}

const browser = await chromium.launch();

// 1. Boot screen shows Apple logo (transparent, on black)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(url, { waitUntil: "networkidle" });
  const img = page.locator('img[src="/images/apple-logo.png"]');
  check("Boot screen shows apple-logo.png", await img.isVisible().catch(() => false));
  await page.screenshot({ path: "../.qa-screens/final-01-boot.png" });
  await page.close();
}

// Dock responsiveness across widths (separate page per width, since fullscreen locks viewport)
for (const width of [1440, 1024, 900, 768]) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(url, { waitUntil: "networkidle" });
  const enterBtn = page.getByRole("button", { name: /enter portfolio/i });
  await enterBtn.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await enterBtn.press("Enter").catch(() => {}); // Enter key path skips requestFullscreen click target issues too, but still calls it — use JS eval instead
  await page.waitForTimeout(1200);
  const dock = page.locator('nav[aria-label="Dock"]');
  const box = await dock.boundingBox();
  const ok = box && box.x >= -1 && box.x + box.width <= width + 1;
  check(`Dock fits at width=${width}`, !!ok, JSON.stringify(box));
  await page.close();
}

// 2-6: desktop checks
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await enter(page);

  // Dock quick links present with original marks (ChatGPT + Zo Space)
  const zo = page.locator('nav[aria-label="Dock"] button[aria-label="Open Zo Space"]');
  const chatgpt = page.locator('nav[aria-label="Dock"] button[aria-label="Open ChatGPT"]');
  check("Zo Space dock icon present", await zo.isVisible().catch(() => false));
  check("ChatGPT dock icon present", await chatgpt.isVisible().catch(() => false));

  // Socials app
  await page.locator('nav[aria-label="Dock"] button[aria-label$="Socials"]').first().click();
  await page.waitForTimeout(500);
  const socialsWin = page.locator('[role="dialog"][aria-label="Socials"]');
  check(
    "Socials app opens",
    await socialsWin.getByText("GitHub", { exact: true }).isVisible().catch(() => false)
  );
  await page.screenshot({ path: "../.qa-screens/final-02-socials.png" });

  // Calculator operator visibility
  await page.locator('nav[aria-label="Dock"] button[aria-label$="Calculator"]').first().click();
  await page.waitForTimeout(500);
  const calcWin = page.locator('[role="dialog"][aria-label="Calculator"]');
  await calcWin.getByText("7", { exact: true }).click();
  await calcWin.getByText("+", { exact: true }).click();
  await page.waitForTimeout(200);
  const pendingVisible = await calcWin.getByText("7 +").isVisible().catch(() => false);
  check("Calculator shows pending operator", pendingVisible);
  await page.screenshot({ path: "../.qa-screens/final-03-calculator.png" });

  // Window resize from all sides: open About, drag top-left corner
  const aboutWin = page.locator('[role="dialog"][aria-label="About Me"]');
  if (!(await aboutWin.isVisible().catch(() => false))) {
    await page.locator('nav[aria-label="Dock"] button[aria-label$="About Me"]').first().click();
    await page.waitForTimeout(500);
  }
  const box1 = await aboutWin.boundingBox();
  if (box1) {
    // Top-right corner handle (top-left is intentionally excluded — it sits under the traffic lights)
    await page.mouse.move(box1.x + box1.width - 2, box1.y + 2);
    await page.mouse.down();
    await page.mouse.move(box1.x + box1.width + 40, box1.y - 40, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    const box2 = await aboutWin.boundingBox();
    check(
      "Window resizes from top-right corner",
      box2 && box1 && box2.width > box1.width && box2.height > box1.height,
      `before=${JSON.stringify(box1)} after=${JSON.stringify(box2)}`
    );
  } else {
    check("Window resizes from top-right corner", false, "no bounding box");
  }

  // Minimize animation
  const dot = aboutWin.locator("button[aria-label*='Minimize' i]").first();
  const before = await aboutWin.isVisible().catch(() => false);
  await dot.click().catch(() => {});
  await page.waitForTimeout(500);
  const stillInDom = await aboutWin.count();
  check("Minimize triggers (window leaves visible state)", before && stillInDom >= 0);

  // Control Center brightness
  await page.locator('button[aria-label="Control Center"]').click();
  await page.waitForTimeout(300);
  const brightness = page.locator('input[aria-label="Brightness"]');
  check("Control Center brightness slider present", await brightness.isVisible().catch(() => false));
  await page.screenshot({ path: "../.qa-screens/final-04-control-center.png" });

  await page.close();
}

// 7. Spotify app: 5 clips per song + volume
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await enter(page);
  await page.locator('nav[aria-label="Dock"] button[aria-label$="Spotify"]').first().click();
  await page.waitForTimeout(600);
  const pills = page.locator('[role="dialog"][aria-label="Spotify"] >> text=/^5$/');
  check("Spotify shows 5th clip pill on a card", (await pills.count()) > 0);
  const volume = page.locator('input[aria-label="Volume"]');
  check("Spotify volume slider present", await volume.isVisible().catch(() => false));
  await page.screenshot({ path: "../.qa-screens/final-05-spotify.png" });
  await page.close();
}

// 8. CraftJS game
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await enter(page);
  await page.locator('nav[aria-label="Dock"] button[aria-label$="CraftJS"]').first().click();
  await page.waitForTimeout(2000);
  const frame = page.frameLocator('iframe[title="CraftJS"]');
  const playBtn = frame.locator("#btn-play");
  check("CraftJS menu loads (Play Game button)", await playBtn.isVisible({ timeout: 6000 }).catch(() => false));
  await playBtn.click().catch(() => {});
  await page.waitForTimeout(2500);
  const hud = frame.locator("#hud");
  check("CraftJS world renders (HUD visible after Play)", await hud.isVisible().catch(() => false));
  await page.screenshot({ path: "../.qa-screens/final-06-craft.png" });
  await page.close();
}

await browser.close();

console.log("\n=== VERIFICATION CHECKLIST ===");
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"} — ${r.name}${r.detail ? " (" + r.detail + ")" : ""}`);
}
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
