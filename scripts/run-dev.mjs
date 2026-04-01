import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const rootDir = resolve(import.meta.dirname, "..");
const nextCacheDir = resolve(rootDir, ".next");

// Clear stale dev artifacts before boot so localhost always serves the latest code.
rmSync(nextCacheDir, { recursive: true, force: true });

const child = process.platform === "win32"
  ? spawn(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "next dev"], {
      cwd: rootDir,
      stdio: "inherit",
    })
  : spawn(resolve(rootDir, "node_modules", ".bin", "next"), ["dev"], {
      cwd: rootDir,
      stdio: "inherit",
    });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
