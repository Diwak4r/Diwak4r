// Runs the DiwakarOS E2E against a freshly started local export server,
// then tears the server down. Used by `npm test` in portfolio-os so the
// suite is self-contained (no manual server start needed).
import { spawn } from "node:child_process";
import net from "node:net";
import process from "node:process";

const PORT = 4173;
const waitPort = (port, host = "127.0.0.1") =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("server start timeout")), 20000);
    const attempt = () => {
      const sock = net.connect(port, host);
      sock.on("connect", () => { sock.destroy(); clearTimeout(timeout); resolve(); });
      sock.on("error", () => { sock.destroy(); setTimeout(attempt, 300); });
    };
    attempt();
  });

const server = spawn(process.execPath, ["serve.js"], { cwd: process.cwd(), stdio: "ignore" });
let exitCode = 1;
try {
  await waitPort(PORT);
  const e2e = spawn(process.execPath, ["scripts/e2e-local.mjs"], { cwd: process.cwd(), stdio: "inherit" });
  exitCode = await new Promise((resolve) => e2e.on("exit", (code) => resolve(code ?? 1)));
} catch (err) {
  console.error("E2E runner failed:", err.message);
} finally {
  server.kill("SIGTERM");
}
process.exit(exitCode);
