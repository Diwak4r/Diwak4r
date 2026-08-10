import { chromium } from "playwright";

const url = process.env.BASE_URL || "https://www.os.diwakaryadav.com.np/";
const sizes = [1440, 1280, 1024, 900, 820, 768];

const browser = await chromium.launch();
for (const width of sizes) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  // Skip boot/login: click Enter Portfolio if present.
  const enterBtn = page.getByRole("button", { name: /enter portfolio/i });
  await enterBtn.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await enterBtn.click().catch(() => {});
  await page.waitForTimeout(1500);
  const dock = page.locator('nav[aria-label="Dock"]');
  const visible = await dock.isVisible().catch(() => false);
  if (!visible) {
    console.log(`width=${width}: dock NOT VISIBLE`);
    await page.close();
    continue;
  }
  const box = await dock.boundingBox();
  const overflowLeft = box ? box.x < 0 : null;
  const overflowRight = box ? box.x + box.width > width : null;
  console.log(
    `width=${width}: dock box x=${box?.x.toFixed(1)} w=${box?.width.toFixed(1)} overflowLeft=${overflowLeft} overflowRight=${overflowRight}`
  );
  await page.screenshot({ path: `../.qa-screens/dock-check-${width}.png` });
  await page.close();
}
await browser.close();
