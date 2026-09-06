#!/usr/bin/env node
// dts SessionStart 共享钩子(reasonix 与 zcode 的 manifest 引用同一条):
// 把 RULES.md 输出到 stdout,由 agent 在会话启动时注入上下文
// (等价 opencode 的全局 instructions 注入)。
// 规则文件缺失时静默退出,不影响会话启动。
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))

// 位置无关:从脚本所在目录逐级向上找 RULES.md(插件根下),最多 5 级
let rules
let dir = here
for (let i = 0; i < 5 && !rules; i++) {
  const candidate = path.join(dir, "RULES.md")
  if (fs.existsSync(candidate)) rules = candidate
  dir = path.dirname(dir)
}
if (rules) {
  try {
    process.stdout.write(`${fs.readFileSync(rules, "utf8").trimEnd()}\n`)
  } catch {
    // 静默:读取失败不注入
  }
}
