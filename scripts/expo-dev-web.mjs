/**
 * Cross-platform dev server for Expo web. package.json cannot use bash
 * ${EXPO_PORT:-8081} on Windows (PowerShell/cmd), which breaks --port (NaN).
 */
import { spawn } from "node:child_process";

const raw = process.env.EXPO_PORT;
const port =
  raw && String(raw).trim() !== ""
    ? Number.parseInt(String(raw), 10)
    : 8081;

if (!Number.isFinite(port) || port < 1 || port > 65535) {
  console.error("[expo-dev-web] Invalid EXPO_PORT:", raw);
  process.exit(1);
}

const env = { ...process.env, EXPO_USE_METRO_WORKSPACE_ROOT: "1" };
const cmd = `npx expo start --web --port ${port}`;

const child = spawn(cmd, { stdio: "inherit", env, shell: true });
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
