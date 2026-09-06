#!/usr/bin/env node
// dts MCP server 自测:拉起 launch.mjs,走一遍 initialize → tools/list →
// tools/call(dts_open/log/case/shot/resolve/list),校验落盘结果后清理临时目录。
// 用法:node mcp/selftest.mjs
import { spawn } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const launch = path.join(here, "launch.mjs")

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dts-mcp-selftest-"))
let failed = false

const child = spawn(process.execPath, [launch], { stdio: ["pipe", "pipe", "pipe"] })
child.stderr.on("data", (d) => process.stderr.write(`[server stderr] ${d}`))

const pending = new Map()
let nextId = 1

child.stdout.setEncoding("utf8")
let buf = ""
child.stdout.on("data", (chunk) => {
  buf += chunk
  let idx
  while ((idx = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, idx).trim()
    buf = buf.slice(idx + 1)
    if (!line) continue
    try {
      const msg = JSON.parse(line)
      if (msg.id !== undefined && pending.has(msg.id)) {
        pending.get(msg.id)(msg)
        pending.delete(msg.id)
      }
    } catch {
      // ignore non-JSON noise
    }
  }
})

function request(method, params, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const id = nextId++
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`timeout waiting for ${method}`))
    }, timeoutMs)
    pending.set(id, (msg) => {
      clearTimeout(timer)
      resolve(msg)
    })
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`)
  })
}

function check(label, cond, extra = "") {
  const ok = Boolean(cond)
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`)
  if (!ok) failed = true
}

const textOf = (msg) => msg?.result?.content?.map((c) => c.text ?? "").join("\n") ?? ""

try {
  const init = await request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "dts-selftest", version: "0.0.0" },
  })
  check("initialize", init?.result?.serverInfo?.name === "dts", JSON.stringify(init?.result?.serverInfo ?? {}))
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`)

  const list = await request("tools/list", {})
  const names = (list?.result?.tools ?? []).map((t) => t.name)
  check(
    "tools/list",
    ["dts_open", "dts_log", "dts_case", "dts_evidence", "dts_shot", "dts_resolve", "dts_list"].every((n) =>
      names.includes(n),
    ),
    names.join(","),
  )

  const open = await request("tools/call", {
    name: "dts_open",
    arguments: { domain: "Feat Login", slug: "btn-crash", question: "自测:点击按钮崩溃", root: tmp },
  })
  check("tools/call dts_open", textOf(open).includes("已建档: feat-login_btn-crash"), textOf(open).split("\n")[0])
  const recordFile = path.join(tmp, "dts", "feat-login_btn-crash", "dts.md")
  check("dts.md 落盘", fs.existsSync(recordFile))
  check("INDEX.md 生成", fs.existsSync(path.join(tmp, "dts", "INDEX.md")))

  const log = await request("tools/call", {
    name: "dts_log",
    arguments: { id: "feat-login_btn-crash", content: "ECONNREFUSED 127.0.0.1:5432", source: "bash", root: tmp },
  })
  check("tools/call dts_log", textOf(log).includes("已追加日志"), textOf(log))

  const shot = await request("tools/call", {
    name: "dts_shot",
    arguments: { id: "feat-login_btn-crash", text: "SELECT 1; -- 终端文本快照", root: tmp },
  })
  check("tools/call dts_shot(text)", textOf(shot).includes("已保存"), textOf(shot))

  const resolve = await request("tools/call", {
    name: "dts_resolve",
    arguments: { id: "feat-login_btn-crash", fix: "重启数据库容器", lesson: "先查容器状态再查应用", root: tmp },
  })
  check("tools/call dts_resolve", textOf(resolve).includes("已结案"), textOf(resolve))

  const md = fs.readFileSync(recordFile, "utf8")
  check("frontmatter status=resolved", /status: "resolved"/.test(md))
  check("日志与证据已写入", md.includes("ECONNREFUSED") && md.includes("终端文本快照"))

  const list2 = await request("tools/call", { name: "dts_list", arguments: { root: tmp } })
  check("tools/call dts_list", textOf(list2).includes("[resolved]"), textOf(list2).split("\n")[0])

  const bad = await request("tools/call", {
    name: "dts_log",
    arguments: { id: "not-exist", content: "x", source: "bash", root: tmp },
  })
  check("错误工具返回 isError", bad?.result?.isError === true, textOf(bad))
} catch (e) {
  failed = true
  console.error("FAIL  异常中断:", e.message)
} finally {
  child.kill()
  try {
    fs.rmSync(tmp, { recursive: true, force: true })
  } catch {}
}

console.log(failed ? "\nselftest FAILED" : "\nselftest 全部通过")
process.exit(failed ? 1 : 0)
