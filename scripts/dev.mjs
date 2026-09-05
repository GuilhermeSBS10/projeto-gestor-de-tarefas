import { spawn } from "node:child_process";

const commands = [
  ["api", ["run", "dev", "--workspace", "@gestor/api"]],
  ["web", ["run", "dev", "--workspace", "@gestor/web"]]
];

const children = commands.map(([name, args]) => {
  const child = spawn("npm", args, {
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`${name} stopped with signal ${signal}`);
      return;
    }

    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exitCode = code ?? 1;
      stopAll();
    }
  });

  return child;
});

function stopAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(130);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(143);
});
