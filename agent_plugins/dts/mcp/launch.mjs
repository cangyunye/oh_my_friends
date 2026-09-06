#!/usr/bin/env node
// dts MCP server 启动器(纯 JS,任何 Node ≥ 18 可跑):选择能执行 TypeScript 的运行时
// 后拉起 mcp/server.ts,stdio 透传。选择顺序:
//   1. Node ≥ 22.18(默认开启 type stripping) → node server.ts
//   2. Bun 存在 → bun server.ts
//   3. Node ≥ 22.6 → node --experimental-strip-types server.ts
//   4. 否则报错退出
import { spawn, spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const server = path.join(here, "server.ts")

function versionAtLeast(v, min) {
  const a = v.split(".").map(Number)
  for (let i = 0; i < min.length; i++) {
    if ((a[i] ?? 0) > min[i]) return true
    if ((a[i] ?? 0) < min[i]) return false
  }
  return true
}

function nodeVersion() {
  return process.versions.node || "0.0.0"
}

function hasCommand(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "ignore" })
  return !r.error && r.status === 0
}

function start(cmd, args) {
  const child = spawn(cmd, args, { stdio: "inherit" })
  child.on("error", (e) => {
    console.error(`[dts-mcp] 无法启动 ${cmd}: ${e.message}`)
    process.exit(1)
  })
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal)
    process.exit(code ?? 1)
  })
}

const node = nodeVersion()
if (versionAtLeast(node, [22, 18, 0])) {
  start(process.execPath, [server])
} else if (hasCommand("bun", ["--version"])) {
  start("bun", [server])
} else if (versionAtLeast(node, [22, 6, 0])) {
  start(process.execPath, ["--experimental-strip-types", server])
} else {
  console.error(
    `[dts-mcp] 运行时过旧(node ${node})。MCP server 需要 Node ≥ 22.18 或 Bun 才能直接执行 TypeScript;请安装其中之一后重试。`,
  )
  process.exit(1)
}
