import { spawnSync, execSync } from "child_process";

// Resolve a working Python interpreter once at startup.
//
// Bare "python3" doesn't exist on most Windows installs, and bare "python"
// often resolves first to the Microsoft Store execution-alias stub under
// %LOCALAPPDATA%\Microsoft\WindowsApps\python.exe — a reparse point that
// fails with `spawn ENOENT` when launched without a shell. So on Windows we
// ask `where` for every candidate, drop the WindowsApps stub, and pick the
// first one that actually runs `--version`. Override anytime with PYTHON_BIN.

function probe(bin: string): boolean {
  try {
    return spawnSync(bin, ["--version"], { stdio: "ignore" }).status === 0;
  } catch {
    return false;
  }
}

function whereIs(name: string): string[] {
  try {
    return execSync(`where ${name}`, { encoding: "utf-8" })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function resolvePythonBin(): string {
  if (process.env.PYTHON_BIN) return process.env.PYTHON_BIN;

  if (process.platform === "win32") {
    const candidates = [...whereIs("python"), ...whereIs("python3")].filter(
      (p) => !/[\\/]WindowsApps[\\/]/i.test(p),
    );
    for (const candidate of candidates) {
      if (probe(candidate)) return candidate;
    }
    return "python"; // last resort — let the spawn fail with a clear error
  }

  for (const candidate of ["python3", "python"]) {
    if (probe(candidate)) return candidate;
  }
  return "python3";
}

export const pythonExecutable = resolvePythonBin();
